# 🧠 How Your Warframe Overlay App Works - Complete Code Explanation

## 🏗️ Architecture Overview

Your app uses **Electron**, which combines:
- **Chromium** (for rendering HTML/CSS/JavaScript)
- **Node.js** (for system access and file operations)

### 📊 App Structure:
```
┌─────────────────┐    ┌─────────────────┐
│   Main Process  │◄──►│  Settings Window │
│   (main.js)     │    │  (renderer)     │
└─────────┬───────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│  Overlay Window │◄──►│   Preload.js    │
│   (renderer)    │    │  (IPC Bridge)   │
└─────────────────┘    └─────────────────┘
```

---

## 🎯 File-by-File Explanation

### 1. **main.js** - The Brain of Your App

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

#### **Window Creation:**
```javascript
function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        autoHideMenuBar: true,     // ← Hides File/Edit/View menu
        menuBarVisible: false,     // ← Ensures no menu bar
        resizable: false,          // ← Fixed size window
        webPreferences: {
            nodeIntegration: false,    // ← Security: no Node.js in renderer
            contextIsolation: true,    // ← Security: isolated contexts
            preload: path.join(__dirname, 'preload.js') // ← Safe IPC bridge
        }
    });
}
```

**Why these settings matter:**
- **Security**: `nodeIntegration: false` prevents renderer from directly accessing Node.js
- **Communication**: `preload.js` provides a safe bridge between main and renderer
- **UI**: `autoHideMenuBar` removes clutter from your app

#### **IPC Handlers (Inter-Process Communication):**
```javascript
// When renderer asks "get-settings", respond with saved data
ipcMain.handle('get-settings', () => {
    return store.get('timerSettings', {
        dailyReset: true,
        cetusCycle: true,
        fortunaCycle: true,
        arbitrationTimer: true
    });
});

// When renderer says "save-settings", store them and notify overlay
ipcMain.handle('save-settings', (event, settings) => {
    store.set('timerSettings', settings);              // Save to disk
    overlayWindow.webContents.send('settings-updated', settings); // Tell overlay
    return { success: true };
});
```

**The Flow:**
1. User changes settings in settings window
2. Settings window sends IPC message to main process
3. Main process saves settings to disk
4. Main process forwards settings to overlay window
5. Overlay window updates its display

---

### 2. **preload.js** - The Security Bridge

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getSettings: () => ipcRenderer.invoke('get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    // ... more functions
});
```

**What this does:**
- **`contextBridge`**: Safely exposes functions to renderer processes
- **`ipcRenderer`**: Sends messages TO the main process
- **`invoke`**: Sends a message and waits for a response
- **`on`**: Listens for messages FROM the main process

**Security Model:**
```
Renderer Process          Preload.js          Main Process
┌─────────────┐          ┌──────────┐          ┌──────────┐
│ Can't access│   Safe   │  Bridge  │   Full   │ Node.js  │
│   Node.js   │◄────────►│          │◄────────►│  Access  │
│ (Sandboxed) │          │          │          │          │
└─────────────┘          └──────────┘          └──────────┘
```

---

### 3. **renderer/index.html** - Settings Window Structure

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

### 4. **renderer/index.js** - Settings Window Logic

#### **Loading Settings:**
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

#### **Saving Settings:**
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
    <span class="overlay-title">Warframe Timers</span>
    <div class="overlay-controls">
        <button class="control-btn" id="expandBtn" title="Expand">↕</button>
        <button class="control-btn" id="collapseBtn" title="Collapse">↔</button>
        <button class="control-btn" id="minimizeBtn" title="Minimize">−</button>
    </div>
</div>

<div class="timer-item" id="dailyResetTimer">
    <div class="timer-header">
        <span class="timer-name">Daily Reset</span>
        <span class="timer-status">Active</span>
    </div>
    <div class="timer-countdown">2h 34m remaining</div>
</div>
```

**Key Elements:**
- **`overlay-header`**: Draggable title bar with controls
- **`timer-item`**: Individual timer display boxes
- **`timer-status`**: Color-coded status (Day/Night/Warm/Cold/Active)
- **`timer-countdown`**: Live updating time display

---

### 6. **renderer/overlay.js** - Overlay Window Logic

#### **Timer Data Simulation:**
```javascript
function simulateTimeProgression() {
    const baseTime = Math.floor(Date.now() / 1000); // Current time in seconds
    
    // Cetus cycle: 150 minutes total (100 day + 50 night)
    const cetusCycleTime = baseTime % 9000; // 9000 seconds = 150 minutes
    const cetusIsDay = cetusCycleTime < 6000; // First 100 minutes = day
    const cetusRemaining = cetusIsDay ? 
        (6000 - cetusCycleTime) : // Time left in day
        (9000 - cetusCycleTime);  // Time left in night
}
```

**How Timer Cycles Work:**
- **Modulo Operation**: `time % cycle_length` gives position in cycle
- **State Calculation**: Compare position to determine current state
- **Remaining Time**: Subtract current position from next state change

#### **Dynamic Updates:**
```javascript
function updateTimerDisplay() {
    let visibleTimers = 0;
    
    // Show/hide based on user settings
    if (currentSettings.dailyReset && timerData.dailyReset) {
        updateTimerItem('dailyResetTimer', timerData.dailyReset);
        visibleTimers++;
    }
    
    // Only resize if timer count changed (performance optimization)
    if (visibleTimers !== lastTimerCount) {
        resizeOverlayWindow(visibleTimers);
        lastTimerCount = visibleTimers;
    }
}
```

#### **Window Resizing:**
```javascript
async function resizeOverlayWindow(timerCount) {
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
```

#### **Timer Status Colors:**
```css
.timer-status.day { background: #ffd700; }     /* Gold for day */
.timer-status.night { background: #4a4a8a; }   /* Purple for night */
.timer-status.warm { background: #ff6b35; }    /* Orange for warm */
.timer-status.cold { background: #00a8cc; }    /* Blue for cold */
.timer-status.arbitration { background: #9c27b0; } /* Purple for arbitration */
```

#### **Responsive Design:**
```css
.overlay-content {
    overflow-y: auto;                    /* Scroll if content too tall */
    max-height: calc(100vh - 100px);    /* Never exceed screen height */
}

.timer-item {
    min-height: 60px;                   /* Consistent timer height */
    margin-bottom: 8px;                 /* Space between timers */
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

## 🛡️ Security Features

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

### **Efficient Updates:**
```javascript
// Only resize when timer count actually changes
if (visibleTimers !== lastTimerCount) {
    resizeOverlayWindow(visibleTimers);
    lastTimerCount = visibleTimers;
}
```

### **CSS Transitions:**
```css
.timer-item {
    transition: all 0.3s ease;  /* Smooth animations without JavaScript */
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

1. **Separation of Concerns**: Each file has a specific job
2. **Security**: Renderer processes can't access system directly
3. **Maintainability**: Easy to modify individual components
4. **Performance**: Optimized updates and memory usage
5. **User Experience**: Responsive UI with smooth animations
6. **Reliability**: Proper error handling and cleanup

This architecture makes your app professional-grade and ready for real-world use! 🚀