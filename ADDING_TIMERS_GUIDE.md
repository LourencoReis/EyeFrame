# 📋 Adding New Timers - Complete Guide

This guide explains how to add new timers to your Warframe Overlay app, step by step.

## 🎯 Overview

To add a new timer, you need to update 4 main files:
1. **Settings HTML** - Add checkbox in settings window
2. **Settings JavaScript** - Handle the new setting
3. **Overlay HTML** - Add timer display element
4. **Overlay JavaScript** - Add timer logic
5. **Main Process** - Update default settings

## 📝 Step-by-Step Instructions

### Step 1: Add Timer to Settings Window

**File:** `renderer/index.html`

Add a new checkbox group after the existing ones:

```html
<div class="checkbox-group">
    <label class="checkbox-item">
        <input type="checkbox" id="arbitrationTimer" name="arbitrationTimer" checked>
        <span class="checkmark"></span>
        <div class="timer-info">
            <span class="timer-name">Arbitration</span>
            <span class="timer-description">Steel Path Arbitration rotation</span>
        </div>
    </label>
</div>
```

### Step 2: Update Settings JavaScript

**File:** `renderer/index.js`

In the `loadSettings()` function, add:
```javascript
document.getElementById('arbitrationTimer').checked = settings.arbitrationTimer || false;
```

In the `handleFormSubmit()` function, add:
```javascript
const settings = {
    dailyReset: document.getElementById('dailyReset').checked,
    cetusCycle: document.getElementById('cetusCycle').checked,
    fortunaCycle: document.getElementById('fortunaCycle').checked,
    arbitrationTimer: document.getElementById('arbitrationTimer').checked  // Add this line
};
```

### Step 3: Add Timer to Overlay HTML

**File:** `renderer/overlay.html`

Add a new timer item in the overlay content:

```html
<div class="timer-item" id="arbitrationTimer">
    <div class="timer-header">
        <span class="timer-name">Arbitration</span>
        <span class="timer-status">Active</span>
    </div>
    <div class="timer-countdown">1h 30m remaining</div>
</div>
```

### Step 4: Update Overlay JavaScript

**File:** `renderer/overlay.js`

In the `simulateTimeProgression()` function, add timer logic:

```javascript
// Add this to the timeOffsets object
const timeOffsets = {
    dailyReset: (baseTime % 86400),
    cetusCycle: (baseTime % 9000),
    fortunaCycle: (baseTime % 1600),
    arbitrationTimer: (baseTime % 3600)  // 1 hour cycle
};

// Add this timer calculation
const arbitrationRemaining = 3600 - timeOffsets.arbitrationTimer;
timerData.arbitrationTimer = {
    name: 'Arbitration',
    timeLeft: formatTime(arbitrationRemaining),
    status: 'Active',
    description: `Ends in ${formatTime(arbitrationRemaining)}`
};
```

In the `updateTimerDisplay()` function, add:
```javascript
if (currentSettings.arbitrationTimer && timerData.arbitrationTimer) {
    updateTimerItem('arbitrationTimer', timerData.arbitrationTimer);
    visibleTimers++;
}
```

### Step 5: Update Default Settings

**File:** `main.js`

In the `get-settings` IPC handler, update the default settings:

```javascript
ipcMain.handle('get-settings', () => {
    return store.get('timerSettings', {
        dailyReset: true,
        cetusCycle: true,
        fortunaCycle: true,
        arbitrationTimer: false  // Add this line
    });
});
```

## 🎨 Advanced Timer Configurations

### Custom Timer Status Styling

**File:** `renderer/style.css`

Add custom status styles:

```css
.timer-status.arbitration {
    background: #ff6b35;
    color: #ffffff;
}

.timer-status.nightwave {
    background: #9c27b0;
    color: #ffffff;
}

.timer-status.invasion {
    background: #f44336;
    color: #ffffff;
}
```

### Real API Integration Example

When you're ready to connect to real Warframe API data, replace the mock data in `preload.js`:

```javascript
// Replace the getTimerData function in preload.js
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