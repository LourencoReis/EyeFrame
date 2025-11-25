# Adding New Content - Complete Guide

This guide explains how to add new timers, sections, or features to your Warframe Overlay app with API integration.

## Overview

The app uses **real-time API integration** with api.tenno.tools. To add new content, you typically need to:
1. **Add API function** - Create fetch method in warframe-api.js
2. **Add update function** - Create update function in overlay.js
3. **Add HTML structure** - Create display elements in overlay.html
4. **Add styling** - Style the new content in style.css
5. **Update settings** - Add visibility controls if needed

## Step-by-Step: Adding API-Connected Content

### Step 1: Add API Function (warframe-api.js)

```javascript
// Example: Adding Nightwave tracking
export async function getNightwave() {
    const response = await fetch(`${API_BASE}`);
    const result = await response.json();
    
    // Extract nightwave data
    const nightwave = result.data.nightwave;
    
    return {
        id: nightwave.id,
        activation: nightwave.activation * 1000, // Convert to milliseconds!
        expiry: nightwave.expiry * 1000,         // Always multiply API timestamps by 1000
        currentSeason: nightwave.tag,
        phase: nightwave.phase
    };
}
```

**Critical**: API returns Unix timestamps in **seconds**, multiply by 1000 for JavaScript Date compatibility.

### Step 2: Create Update Function (overlay.js)

```javascript
async function updateNightwave() {
    try {
        const nightwave = await warframeAPI.getNightwave();
        
        // Calculate time remaining
        const now = Date.now();
        const expiry = new Date(nightwave.expiry);
        const timeLeft = Math.floor((expiry - now) / 1000);
        
        // Update display
        const nightwaveElement = document.getElementById('nightwaveTimer');
        if (nightwaveElement) {
            nightwaveElement.querySelector('.timer-countdown').textContent = formatTime(timeLeft);
            nightwaveElement.querySelector('.timer-status').textContent = nightwave.currentSeason;
        }
    } catch (error) {
        console.error('Error updating nightwave:', error);
    }
}

// Add to main update loop
function updateAllTimers() {
    // ... existing updates
    await updateNightwave();
}
```

### Step 3: Add HTML Structure (overlay.html)

Add to appropriate section (e.g., World Timers):

```html
<div class="timer-item" id="nightwaveTimer">
    <img src="images/planets/nightwave.png" class="timer-icon" alt="Nightwave" onerror="this.style.display='none'">
    <div class="timer-info">
        <div class="timer-header">
            <span class="timer-name">Nightwave</span>
            <span class="timer-status">Season Name</span>
        </div>
        <div class="timer-countdown">Calculating...</div>
    </div>
</div>
```

### Step 4: Add Styling (style.css)

```css
/* Nightwave-specific styling */
#nightwaveTimer .timer-status {
    background: linear-gradient(135deg, #9c27b0, #7b1fa2);
    color: #ffffff;
    padding: 4px 12px;
    border-radius: 12px;
}

#nightwaveTimer:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(156, 39, 176, 0.4);
}
```

### Step 5: Update Settings (Optional)

If you want user control over visibility:

**index.html**:
```html
<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="nightwaveTimer" name="nightwaveTimer" checked>
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Nightwave</span>
            <span class="timer-description">Current Nightwave season progress</span>
        </div>
    </label>
</div>
```

**index.js** - Load setting:
```javascript
document.getElementById('nightwaveTimer').checked = settings.nightwaveTimer || false;
```

**index.js** - Save setting:
```javascript
const settings = {
    // ... existing settings
    nightwaveTimer: document.getElementById('nightwaveTimer').checked
};
```

**main.js** - Default value:
```javascript
ipcMain.handle('get-settings', () => {
    return store.get('timerSettings', {
        // ... existing defaults
        nightwaveTimer: true
    });
});
```

## Advanced: Adding Complex Sections

### Example: Adding a New Tabbed Section

**1. Create HTML structure:**
```html
<div class="new-section" id="newSection">
    <h3 class="section-title">
        <img src="images/logos/newsection.png" class="section-icon"> 
        New Section
    </h3>
    <div class="tab-buttons">
        <button class="tab active" data-tab="type-a">Type A</button>
        <button class="tab" data-tab="type-b">Type B</button>
    </div>
    <div class="content-list" id="typeAContent">
        <!-- Type A items will be populated by JavaScript -->
    </div>
    <div class="content-list" id="typeBContent" style="display: none;">
        <!-- Type B items will be populated by JavaScript -->
    </div>
</div>
```

**2. Add tab switching logic:**
```javascript
// In overlay.js
function setupNewSectionTabs() {
    const tabButtons = document.querySelectorAll('.new-section .tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchNewSectionTab(tab);
        });
    });
}

function switchNewSectionTab(tab) {
    // Hide all content
    document.getElementById('typeAContent').style.display = 'none';
    document.getElementById('typeBContent').style.display = 'none';
    
    // Show selected content
    if (tab === 'type-a') {
        document.getElementById('typeAContent').style.display = 'block';
    } else {
        document.getElementById('typeBContent').style.display = 'block';
    }
    
    // Update button states
    const buttons = document.querySelectorAll('.new-section .tab');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
}
```

**3. Add to director theme:**
```javascript
// In convertToTabbedLayout() function
const newTab = createTabElement('new-section', 'images/logos/newsection.png', 'New Section');
tabIcons.appendChild(newTab);

// Create dropdown
const newDropdown = createDropdownElement('new-section');
const newSectionContent = document.getElementById('newSection');
if (newSectionContent) {
    newDropdown.appendChild(newSectionContent.cloneNode(true));
}
directorContent.appendChild(newDropdown);
```

## Important Notes

### API Timestamp Conversion
**Always multiply API timestamps by 1000:**
```javascript
// WRONG - will create dates in the year 1970
const expiry = new Date(apiData.expiry);

// CORRECT - converts seconds to milliseconds
const expiry = new Date(apiData.expiry * 1000);
```

### Error Handling
Always wrap API calls in try-catch:
```javascript
async function updateSomething() {
    try {
        const data = await warframeAPI.getSomething();
        // Process data
    } catch (error) {
        console.error('Error updating something:', error);
        // Show fallback or "unavailable" message
    }
}
```

### Always Visible Sections
To make a section always visible (like Alerts):
```javascript
// In updateSomething() function
const section = document.getElementById('sectionId');
if (section) {
    section.style.display = 'block'; // Always show, override settings
}
```

### Image Fallback
Always include onerror for images:
```html
<img src="images/path/icon.png" 
     alt="Description" 
     onerror="this.style.display='none'">
```

## Testing Your Changes

1. **Start Development Mode**:
   ```bash
   npm start
   ```

2. **Check Console**: Open DevTools (F12) and check for errors

3. **Test API Connection**: Verify data is fetching correctly

4. **Test Both Themes**: Switch between Normal and Director themes

5. **Test Settings**: Ensure show/hide works if applicable

6. **Test Edge Cases**: What happens when API returns empty data?

## Reference: Existing Sections

Study these implemented sections for examples:

- **World Timers** (updateWorldTimers): API integration with timestamp conversion
- **Void Fissures** (updateFissures): Tabbed content with filtering
- **Invasions** (updateInvasions): Progress bars and dynamic content
- **The Circuit** (updateCircuit): Grid layouts with images
- **Alerts** (updateAlertsAndEvents): Always visible section

## Quick Reference

**Files to Edit**:
- `renderer/warframe-api.js` - Add API fetch functions
- `renderer/overlay.js` - Add update logic (1760+ lines)
- `renderer/overlay.html` - Add HTML structure (320+ lines)
- `renderer/style.css` - Add styling (2400+ lines)
- `renderer/index.html` - Add settings controls (optional)
- `renderer/index.js` - Add settings logic (optional)
- `main.js` - Add default settings (optional)

**Key Functions**:
- `updateAllTimers()` - Main update loop
- `convertToTabbedLayout()` - Director theme conversion
- `formatTime(seconds)` - Format countdown display
- `updateTimerItem(id, data)` - Update timer display

**Key Classes**:
- `.timer-item` - Individual timer cards
- `.section-title` - Section headers
- `.director-theme` - Applied in director mode
- `.director-tab` - Tab icon buttons
- `.director-dropdown-content` - Tab content containers
getTimerData: async () => {
    try {
        const response = await fetch('https://api.warframestat.us/pc');
        const data = await response.json();
        
        return {
            dailyReset: {
                name: 'Daily Reset',
                timeLeft: calculateTimeLeft(data.timestamp),
                status: 'Active'
            },
            cetusCycle: {
                name: 'Cetus Cycle',
                timeLeft: data.cetusCycle.timeLeft,
                status: data.cetusCycle.isDay ? 'Day' : 'Night'
            },
            arbitration: {
                name: 'Arbitration',
                timeLeft: data.arbitrations[0]?.eta || 'Unknown',
                status: 'Active'
            }
        };
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data
        return getMockTimerData();
    }
}
```

## 🔧 Timer Configuration Options

### Timer Cycle Types

You can configure different types of timer cycles:

```javascript
// Fixed interval (e.g., daily reset)
const dailyResetTime = 86400; // 24 hours

// Alternating cycle (e.g., Cetus day/night)
const cetusCycle = {
    day: 6000,    // 100 minutes
    night: 3000   // 50 minutes
};

// Variable cycle (from API)
const arbitrationTime = data.arbitrations[0]?.eta;
```

### Timer Display Formats

```javascript
// Time format options
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    // Option 1: Hours and minutes
    if (hours > 0) return `${hours}h ${minutes}m`;
    
    // Option 2: Minutes and seconds
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    
    // Option 3: Just seconds
    return `${seconds}s`;
}
```

## 📊 Example: Adding Multiple Timers

Here's a complete example of adding 3 new timers (Arbitration, Nightwave, Invasions):

### Settings HTML Addition:
```html
<!-- Add after existing timers -->
<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="arbitrationTimer" name="arbitrationTimer">
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Arbitration</span>
            <span class="timer-description">Steel Path Arbitration missions</span>
        </div>
    </label>
</div>

<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="nightwaveTimer" name="nightwaveTimer">
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Nightwave</span>
            <span class="timer-description">Current Nightwave series progress</span>
        </div>
    </label>
</div>

<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="invasionTimer" name="invasionTimer">
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Invasions</span>
            <span class="timer-description">Active faction invasions</span>
        </div>
    </label>
</div>
```

## 🚀 After Adding Timers

1. **Test in Development:**
   ```bash
   npm start
   ```

2. **Rebuild Executable:**
   ```bash
   npm run package
   ```

3. **The new executable will include all your new timers!**

## 💡 Tips

- **Start Simple:** Add one timer at a time and test it
- **Use Descriptive Names:** Make timer IDs and names clear
- **Test Thoroughly:** Check both settings and overlay windows
- **API Integration:** Replace mock data with real API calls when ready
- **Styling:** Customize colors and styles for different timer types

This modular approach makes it easy to add any number of timers to your overlay app!