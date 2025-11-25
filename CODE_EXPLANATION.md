# How Your Eyeframe App Works - Complete Code Explanation

## Architecture Overview

Your Eyeframe app uses **Electron**, which combines:
- **Chromium** (for rendering HTML/CSS/JavaScript)
- **Node.js** (for system access and file operations)
- **Warframe API** (for real-time game data from api.tenno.tools)

### App Structure:
```
┌─────────────────┐    ┌─────────────────┐
│   Main Process  │◄──►│  Settings Window │
│   (main.js)     │    │  (renderer)     │
└─────────┬───────┘    └─────────────────┘
          │
          │         ┌─────────────────┐
          └────────►│  Warframe API   │
                    │ api.tenno.tools│
┌─────────────────┐ └────────┬────────┘
│  Overlay Window │        │
│  (Normal/Director) ◄────────┘
│   (renderer)    │
└─────────────────┘
```

### Key Design Features:
- **API Integration**: Live data from api.tenno.tools (cycles, fissures, invasions, etc.)
- **Dual Theme System**: Normal (vertical) and Director (tabbed) layouts
- **Real-Time Updates**: All data refreshes every second
- **Compact Layout**: Minimal padding, zero bottom spacing
- **Minimize/Expand**: Hide content but keep access with (+) icon
- **Always Visible Alerts**: Alerts section (with arbitration) always shown

---

## File-by-File Explanation

### 1. main.js - The Brain of Your App

```javascript
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const Store = require('electron-store');
```

**What this does:**
- **`app`**: Controls the entire Electron application lifecycle
- **`BrowserWindow`**: Creates and manages windows (settings + overlay)
- **`ipcMain`**: Handles communication FROM renderer processes
- **`screen`**: Gets display information for window positioning
- **`Store`**: Saves user settings to disk

#### Settings Window Creation:
```javascript
function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        autoHideMenuBar: true,     // ← Hides File/Edit/View menu
        menuBarVisible: false,     // ← Ensures no menu bar
        resizable: false,          // ← Fixed size window
        title: 'Eyeframe Settings', // ← Updated app name
        webPreferences: {
            nodeIntegration: false,    // ← Security: no Node.js in renderer
            contextIsolation: true,    // ← Security: isolated contexts
            preload: path.join(__dirname, 'preload.js') // ← Safe IPC bridge
        }
    });
}
```

#### **Overlay Window Creation:**
```javascript
function createOverlayWindow() {
    overlayWindow = new BrowserWindow({
        width: 300,
        height: 320,              // ← Increased to fit all 4 timers
        minWidth: 250,
        minHeight: 200,           // ← Ensures timers stay visible
        maxWidth: 500,
        maxHeight: 800,
        x: width - 320,           // ← Top-right corner positioning
        y: 20,
        frame: false,             // ← No window frame
        alwaysOnTop: true,        // ← Stays above all other windows
        transparent: true,        // ← See-through background
        skipTaskbar: true,        // ← Doesn't appear in taskbar
        resizable: true,          // ← User can resize if needed
    });
    
    overlayWindow.show();         // ← Auto-show overlay on startup
}
```

**Key Overlay Features:**
- **Always On Top**: Perfect for gaming - stays visible over Warframe
- **Transparent**: Blends with your desktop/game
- **No Frame**: Clean look without window borders
- **Auto-positioned**: Appears in top-right corner automatically

#### **IPC Handlers (Inter-Process Communication):**
```javascript
// Settings management
ipcMain.handle('get-settings', () => {
    return store.get('timerSettings', {
        dailyReset: true,
        cetusCycle: true,
        fortunaCycle: true,
        arbitrationTimer: true
    });
});

ipcMain.handle('save-settings', (event, settings) => {
    store.set('timerSettings', settings);
    overlayWindow.webContents.send('settings-updated', settings);
    return { success: true };
});

// Overlay controls
ipcMain.handle('close-overlay', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();        // ← Completely closes overlay
        return { success: true };
    }
});

ipcMain.handle('reset-overlay-position', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        const { screen } = require('electron');
        const { width } = screen.getPrimaryDisplay().workAreaSize;
        overlayWindow.setPosition(width - 320, 50); // ← Top-right corner
        return { success: true };
    }
});
```

**The Communication Flow:**
1. **User Action** → Settings window detects checkbox change
2. **Settings Window** → Sends `save-settings` to main process  
3. **Main Process** → Saves to disk + forwards to overlay
4. **Overlay Window** → Receives `settings-updated` and refreshes display

---

### 2. preload.js - The Security Bridge

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Settings API
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    // Overlay Controls
    closeOverlay: () => ipcRenderer.invoke('close-overlay'),
    resetOverlayPosition: () => ipcRenderer.invoke('reset-overlay-position'),
    
    // Event Listeners
    onSettingsUpdated: (callback) => {
        ipcRenderer.on('settings-updated', (event, settings) => callback(settings));
    },
    removeSettingsListener: () => {
        ipcRenderer.removeAllListeners('settings-updated');
    }
});
```

**What this does:**
- **`contextBridge`**: Safely exposes functions to renderer processes
- **`ipcRenderer`**: Sends messages TO the main process
- **`invoke`**: Sends a message and waits for a response (async)
- **`on`**: Listens for messages FROM the main process

**Security Model:**
```
Renderer Process          Preload.js          Main Process
┌─────────────┐          ┌──────────┐          ┌──────────┐
│ Can't access│   Safe   │  Bridge  │   Full   │ Node.js  │
│   Node.js   │◄────────►│          │◄────────►│  Access  │
│ (Sandboxed) │          │Functions │          │          │
└─────────────┘          └──────────┘          └──────────┘
```

**Why this matters:**
- Renderer processes can't directly access file system or system APIs
- All communication goes through the secure preload bridge
- Main process has full system access but is isolated from web content

---

### 3. renderer/index.html - Settings Window Structure

```html
<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="dailyReset" name="dailyReset" checked>
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Daily Reset</span>
            <span class="timer-description">Daily login rewards and missions reset</span>
        </div>
    </label>
</div>
```

**Structure Breakdown:**
- **`checkbox-item`**: Container for entire checkbox
- **`checkmark`**: Custom-styled checkbox (hides default ugly checkbox)
- **`timer-info`**: Description area with name and details
- **Form submission**: Triggers JavaScript to save settings

---

### 4. renderer/index.js - Settings Window Logic

#### Loading Settings:
```javascript
async function loadSettings() {
    const settings = await window.electronAPI.getSettings(); // ← Calls preload.js
    document.getElementById('dailyReset').checked = settings.dailyReset || false;
    // ... repeat for other timers
}
```

**The Flow:**
1. `window.electronAPI.getSettings()` calls preload.js
2. Preload.js sends IPC message to main.js
3. Main.js reads settings from electron-store
4. Settings flow back through the same chain
5. JavaScript updates checkbox states

#### Saving Settings:
```javascript
async function handleFormSubmit(event) {
    event.preventDefault(); // ← Prevent page reload
    
    const settings = {
        dailyReset: document.getElementById('dailyReset').checked,
        // ... collect all checkbox states
    };
    
    const result = await window.electronAPI.saveSettings(settings);
    if (result.success) {
        showStatus('Settings saved successfully!', 'success');
    }
}
```

---

### 5. **renderer/overlay.html** - Overlay Window Structure

```html
<div class="overlay-header">
    <span class="overlay-title">Eyeframe</span>
    <div class="overlay-controls">
        <button class="control-btn" id="minimizeBtn" title="Minimize">−</button>
        <button class="control-btn close-btn" id="closeBtn" title="Close">✕</button>
    </div>
</div>

<div class="overlay-content">
    <!-- All 4 timers are always visible -->
    <div class="timer-item" id="dailyResetTimer">
        <div class="timer-header">
            <span class="timer-name">Daily Reset</span>
            <span class="timer-status">Active</span>
        </div>
        <div class="timer-countdown">3h 48m remaining</div>
    </div>
    
    <div class="timer-item" id="cetusTimer">
        <div class="timer-header">
            <span class="timer-name">Cetus Cycle</span>
            <span class="timer-status day">Day</span>
        </div>
        <div class="timer-countdown">1h 28m remaining</div>
    </div>
    
    <!-- Fortuna and Arbitration timers always shown too -->
</div>
```

**Key Design Features:**
- **Dual Themes**: Normal vertical OR director tabbed layout (dynamically switched)
- **API Integration**: Fissures, invasions, events fetch from live Warframe API
- **Minimize/Expand**: Director theme has collapsible interface with (+) restore
- **Always Visible Alerts**: Alerts section (with arbitration) never hidden
- **Section Icons**: Images for all timer types, fissure tiers, missions
- **No Bottom Padding**: All sections use `padding: 15px 15px 0 15px`

**Director Theme Structure** (created dynamically by JavaScript):
- **7 Tab Icons**: Timers, Alerts, Events, Fissures, Sortie, Archon, Circuit
- **Dropdown Content**: Click tabs to show/hide content sections
- **Control Buttons**: Positioned at top-right above tab icons
- **Minimized State**: Collapses to small (+) tab in corner

**Key Elements:**
- **`timer-item`**: Individual timer display boxes with icons
- **`fissure-item`**: Live fissure missions from API with countdowns
- **`invasion-item`**: Invasion progress bars with faction info
- **`circuit-section`**: Current rotation rewards display
- **`director-tab`**: Clickable icon tabs for section navigation
- **`timer-status`**: Color-coded status (Day/Night/Warm/Cold)

---

### 6. renderer/overlay.js - Overlay Window Logic (1760+ lines)

#### API Integration:
```javascript
// Import Warframe API wrapper
import warframeAPI from './warframe-api.js';

// Fetch real-time world cycles
async function updateWorldTimers() {
    const worldState = await warframeAPI.getWorldCycles();
    
    // Cetus cycle from API
    const cetusCycle = worldState.cetusCycle;
    const isDay = cetusCycle.isDay;
    const expiry = new Date(cetusCycle.expiry * 1000); // Multiply by 1000 for JS Date
    const timeLeft = expiry - Date.now();
    
    // Update display
    updateTimerItem('cetusTimer', {
        name: 'Cetus',
        status: isDay ? 'Day' : 'Night',
        timeLeft: formatTime(Math.floor(timeLeft / 1000))
    });
}

// Fetch live fissures
async function updateFissures() {
    const fissures = await warframeAPI.getFissures();
    const normalFissures = fissures.filter(f => !f.isStorm && !f.isHard);
    const steelFissures = fissures.filter(f => f.isHard);
    
    // Populate fissure lists with real data
    displayFissures('normalFissures', normalFissures);
    displayFissures('steelFissures', steelFissures);
}
```

**Critical API Note**: API returns timestamps in **seconds**, must multiply by 1000 for JavaScript Date objects.

#### **Director Theme Creation:**
```javascript
function convertToTabbedLayout() {
    // Restructure DOM to create tabbed interface
    const overlayContent = document.getElementById('overlayContent');
    
    // Create tab structure
    const tabs = document.createElement('div');
    tabs.className = 'director-tabs';
    
    // Add control buttons at top
    const tabBar = document.createElement('div');
    tabBar.className = 'director-tab-bar';
    tabBar.style.flexDirection = 'column'; // Controls above tabs
    
    // 7 icon tabs: Timers, Alerts, Events, Fissures, Sortie, Archon, Circuit
    const sections = ['timers', 'alerts', 'events', 'fissures', 'sortie', 'archon', 'circuit'];
    sections.forEach(section => {
        const tab = createTabIcon(section);
        tab.addEventListener('click', () => switchTab(section));
    });
    
    // Create dropdown content areas
    sections.forEach(section => {
        const dropdown = document.createElement('div');
        dropdown.id = `${section}-dropdown`;
        dropdown.className = 'director-dropdown-content';
        // Move existing section content into dropdown
    });
}
```
```

**How Timer Cycles Work:**
- **Modulo Operation**: `time % cycle_length` gives position in cycle
- **State Calculation**: Compare position to determine current state
- **Remaining Time**: Subtract current position from next state change

#### **Simplified Button Controls:**
```javascript
function setupEventListeners() {
    // Only two buttons now
    minimizeBtn.addEventListener('click', toggleMinimize);
    closeBtn.addEventListener('click', closeOverlay);
}

function toggleMinimize() {
    isMinimized = !isMinimized;
    
    if (isMinimized) {
        overlayContent.style.display = 'none';  // Hide content
        minimizeBtn.textContent = '+';          // Show restore icon
        minimizeBtn.title = 'Restore';
    } else {
        overlayContent.style.display = 'block'; // Show content
        minimizeBtn.textContent = '−';          // Show minimize icon
        minimizeBtn.title = 'Minimize';
    }
}

function closeOverlay() {
    window.electronAPI.closeOverlay(); // Call main process to close window
}
```
    try {
        const result = await window.electronAPI.resizeOverlay(timerCount);
        // This calls main.js which calculates: headerHeight + (timerCount * itemHeight) + padding
    } catch (error) {
        console.error('Error resizing overlay:', error);
    }
}
```

---

### 7. **renderer/style.css** - Visual Design

#### **Overlay Window Styling:**
```css
.overlay-window {
    background: rgba(26, 26, 46, 0.95);    /* Semi-transparent dark blue */
    backdrop-filter: blur(10px);           /* Blur background behind overlay */
    border: 1px solid rgba(0, 212, 255, 0.3); /* Cyan border */
    border-radius: 12px;                   /* Rounded corners */
    -webkit-app-region: drag;              /* Make window draggable */
}
### 7. **renderer/style.css** - Complete Visual Design

#### **Main App: Black-to-Blue Gradient:**
```css
.settings-window {
    background: linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #1e3a8a 100%);
    height: 100vh;
    overflow-y: auto;
}
```

**Gradient Breakdown:**
- **#000000**: Pure black at top-left
- **#1a1a2e**: Dark navy in middle  
- **#1e3a8a**: Dark blue at bottom-right
- **135deg**: Diagonal gradient direction

#### **Compact Overlay Design:**
```css
.overlay-content {
    padding: 8px;                       /* Reduced from 15px */
    min-height: 40px;                   /* Reduced from 60px */
    max-height: calc(100vh - 60px);     /* Reduced header space */
}

.timer-item {
    padding: 8px;                       /* Reduced from 12px */
    margin-bottom: 4px;                 /* Reduced from 8px */
    min-height: 45px;                   /* Reduced from 60px */
    border-radius: 6px;                 /* Slightly smaller radius */
}

.overlay-header {
    padding: 6px 10px;                  /* Reduced from 8px 12px */
}
```

**Space Optimization:**
- **7px saved** from content padding
- **15px saved** per timer item
- **4px saved** from margins
- **2px saved** from header = **~30px total saved**

#### **Enhanced Button Styling:**
```css
.control-btn {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.2s ease;
}

.close-btn {
    background: rgba(220, 38, 38, 0.8) !important;  /* Red background */
}

.close-btn:hover {
    background: rgba(220, 38, 38, 0.9) !important;
    transform: scale(1.1);                          /* Grow on hover */
}
```

#### **Timer Status Colors:**
```css
.timer-status.day { background: #ffd700; }         /* Gold for day */
.timer-status.night { background: #4a4a8a; }       /* Purple for night */
.timer-status.warm { background: #ff6b35; }        /* Orange for warm */
.timer-status.cold { background: #00a8cc; }        /* Blue for cold */
.timer-status.arbitration { background: #9c27b0; } /* Purple for arbitration */
.timer-status.loading { 
    background: #6b7280; 
    animation: pulse 2s infinite;                   /* Pulsing loading state */
}
```

#### **Blue Theme Consistency:**
```css
.header h1 {
    color: #60a5fa;                                 /* Light blue headers */
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
}

.checkmark {
    border: 2px solid #3b82f6;                      /* Blue checkbox border */
}

.checkbox-item input[type="checkbox"]:checked + .checkmark {
    background: #3b82f6;                            /* Blue when checked */
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}

.btn-primary {
    background: linear-gradient(45deg, #3b82f6, #1d4ed8); /* Blue gradient buttons */
}
```

---

## 🔄 How Everything Works Together

### **App Startup Sequence:**
1. **main.js** starts Electron app
2. Creates settings window and overlay window
3. Both windows load their HTML files
4. HTML files load their respective JavaScript files
5. JavaScript files set up event listeners
6. Settings are loaded from disk and applied

### **Settings Change Flow:**
```
User clicks checkbox
        ↓
index.js collects form data
        ↓
Sends to preload.js via electronAPI
        ↓
preload.js forwards to main.js via IPC
        ↓
main.js saves to electron-store
        ↓
main.js sends update to overlay.js
        ↓
overlay.js updates timer display
        ↓
Window resizes if needed
```

### **Timer Update Flow:**
```
overlay.js timer interval (every 1 second)
        ↓
simulateTimeProgression() calculates new times
        ↓
updateTimerDisplay() applies current settings
        ↓
Only visible timers are shown/updated
        ↓
Window resizes only if timer count changed
```

### **Window Communication:**
```
Settings Window ←─── IPC ───→ Main Process ←─── IPC ───→ Overlay Window
     ↑                                                        ↑
     │                                                        │
   User Input                                            Timer Display
```

---

## � How Everything Works Together

### **App Startup Sequence:**
1. **main.js** starts Electron app
2. Creates settings window and overlay window  
3. **Overlay automatically shows** in top-right corner
4. Both windows load their HTML files
5. HTML files load their respective JavaScript files
6. JavaScript files set up event listeners
7. Settings are loaded from disk and applied
8. **All 4 timers display immediately** with simulated data

### **Simplified User Flow:**
```
User opens Eyeframe
        ↓
Settings window appears (black-to-blue gradient)
        ↓  
Overlay appears automatically (top-right, showing all timers)
        ↓
User can minimize overlay content (− button)
        ↓
User can close overlay completely (✕ button)
        ↓
Settings still control preferences but don't hide timers
```

### **Timer Update Cycle:**
```
Every 1 second (UPDATE_INTERVAL):
        ↓
simulateTimeProgression() calculates current time
        ↓
Updates all timer states (Day/Night, Warm/Cold, etc.)
        ↓
updateTimerDisplay() refreshes all 4 timer items
        ↓
UI shows latest countdown and status
```

---

## �🛡️ Security Features

### **Process Isolation:**
- **Main Process**: Full system access, handles file I/O and IPC
- **Renderer Processes**: Sandboxed, can only access what's explicitly allowed
- **Preload Script**: Secure bridge that exposes only specific functions

### **Context Isolation:**
```javascript
// Renderer can ONLY access what's explicitly exposed:
window.electronAPI.getSettings()     // ✅ Allowed
require('fs')                        // ❌ Blocked
process.exit()                       // ❌ Blocked
```

---

## 🎯 Performance Optimizations

### **Simplified Logic:**
- **No Dynamic Resizing**: Fixed window size eliminates complexity
- **Always Show All**: No conditional rendering reduces CPU usage
- **Minimal DOM Updates**: Only update timer text, not visibility

### **CSS Transitions:**
```css
.timer-item {
    transition: all 0.3s ease;  /* Smooth animations without JavaScript */
}

.control-btn:hover {
    transform: scale(1.1);      /* Hardware-accelerated hover effects */
}
```

### **Memory Management:**
```javascript
// Clean up when window closes
window.addEventListener('beforeunload', () => {
    if (updateTimer) {
        clearInterval(updateTimer);  // Stop timer updates
    }
    window.electronAPI.removeSettingsListener(); // Remove IPC listeners
});
```

---

## 🔧 Why This Architecture Works

### **Key Technical Achievements:**

1. **Security**: Proper IPC bridge prevents direct Node.js access from renderers
2. **Performance**: Efficient timer updates with minimal DOM manipulation  
3. **UX**: Always-on-top overlay perfect for gaming
4. **Design**: Cohesive blue theme with compact, space-efficient layout
5. **Simplicity**: Reduced from 6 buttons to 2 essential controls
6. **Reliability**: All timers always visible - no confusing hide/show logic

### **Professional Software Practices:**

- **Separation of Concerns**: Each file has a specific responsibility
- **Event-Driven Architecture**: Changes propagate through IPC messages automatically
- **Persistent Storage**: Settings saved to disk survive app restarts  
- **Modular Design**: Easy to add new timers by following existing patterns
- **Cross-Platform**: Electron ensures compatibility across Windows, Mac, Linux
- **User-Centered**: Simplified interface prioritizes essential functions

---

## 🎯 **Summary: Your Eyeframe App**

You've built a **professional-grade desktop application** with:

- **Dual-window architecture** (settings + overlay)
- **Secure IPC communication** between processes
- **Persistent settings storage** with electron-store  
- **Real-time timer simulation** with mathematical precision
- **Beautiful UI design** with gradients and animations
- **Game-friendly overlay** that stays on top
- **Simplified, intuitive controls** for end users

**Total lines of code: ~1000+** across 8 main files, showcasing modern JavaScript, Electron APIs, advanced CSS, and software architecture best practices! 

This architecture makes your Eyeframe app professional-grade and ready for real-world distribution! 🚀✨