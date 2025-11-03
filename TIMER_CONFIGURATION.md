# ⚙️ Timer Configuration Guide

This guide explains how timers work and how to configure them in your Warframe Overlay app.

## 🎯 Understanding Timer Types

### 1. **Fixed Interval Timers**
- **Example:** Daily Reset (24 hours)
- **Behavior:** Resets at the same time every day
- **Configuration:** Simple countdown from fixed duration

```javascript
// 24 hour cycle (86400 seconds)
const dailyResetTime = 86400 - (currentTime % 86400);
```

### 2. **Alternating Cycle Timers**
- **Example:** Cetus Day/Night (100min day + 50min night)
- **Behavior:** Alternates between two states
- **Configuration:** Different durations for each state

```javascript
// Cetus cycle: 100 minutes day, 50 minutes night
const cetusCycleTime = currentTime % 9000; // Total 150 minutes
const isDay = cetusCycleTime < 6000; // First 100 minutes = day
const timeLeft = isDay ? (6000 - cetusCycleTime) : (9000 - cetusCycleTime);
```

### 3. **Variable/API-Based Timers**
- **Example:** Arbitration, Invasions, Alerts
- **Behavior:** Times vary based on game events
- **Configuration:** Fetched from Warframe API

```javascript
// API-based timer (future implementation)
const response = await fetch('https://api.warframestat.us/pc');
const data = await response.json();
const arbitrationTime = data.arbitrations[0]?.eta;
```

## 🔧 Timer Configuration Options

### **Timer Cycle Patterns**

1. **Simple Countdown:**
```javascript
const simpleTimer = {
    duration: 3600, // 1 hour in seconds
    remaining: 3600 - (currentTime % 3600)
};
```

2. **Multi-State Cycle:**
```javascript
const multiStateTimer = {
    states: [
        { name: 'Day', duration: 6000 },    // 100 minutes
        { name: 'Night', duration: 3000 }   // 50 minutes
    ],
    getCurrentState: function(time) {
        const cycleTime = time % 9000;
        return cycleTime < 6000 ? this.states[0] : this.states[1];
    }
};
```

3. **Random/Event-Based:**
```javascript
const eventTimer = {
    name: 'Special Alert',
    getTimeLeft: async function() {
        const apiData = await fetchFromAPI();
        return apiData.specialEvents[0]?.timeLeft || null;
    }
};
```

## 🎨 Timer Display Customization

### **Status Colors and Styles**

Add custom styling in `renderer/style.css`:

```css
/* Custom timer status colors */
.timer-status.invasion {
    background: #f44336;
    color: #ffffff;
}

.timer-status.sortie {
    background: #ff9800;
    color: #ffffff;
}

.timer-status.nightwave {
    background: #9c27b0;
    color: #ffffff;
}

.timer-status.baro {
    background: #ffd700;
    color: #1a1a2e;
}
```

### **Timer Animation Effects**

```css
/* Pulsing effect for urgent timers */
.timer-item.urgent {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Warning color for timers ending soon */
.timer-countdown.warning {
    color: #ff6b35;
    font-weight: bold;
}
```

## 📊 Complete Timer Examples

### **Example 1: Sortie Timer (24-hour reset)**

```javascript
// In overlay.js - simulateTimeProgression()
const sortieRemaining = 86400 - (baseTime % 86400);
timerData.sortieTimer = {
    name: 'Sortie',
    timeLeft: formatTime(sortieRemaining),
    status: 'Available',
    description: `Resets in ${formatTime(sortieRemaining)}`
};
```

### **Example 2: Baro Ki'Teer (2-week cycle)**

```javascript
// Baro appears every 2 weeks for 2 days
const baroFullCycle = 1209600; // 14 days in seconds
const baroDuration = 172800;   // 2 days in seconds
const baroTime = baseTime % baroFullCycle;
const baroActive = baroTime < baroDuration;

timerData.baroTimer = {
    name: 'Baro Ki\'Teer',
    timeLeft: baroActive ? 
        formatTime(baroDuration - baroTime) : 
        formatTime(baroFullCycle - baroTime),
    status: baroActive ? 'Active' : 'Away',
    description: baroActive ? 
        `Leaves in ${formatTime(baroDuration - baroTime)}` : 
        `Arrives in ${formatTime(baroFullCycle - baroTime)}`
};
```

### **Example 3: Invasion Timer (Variable)**

```javascript
// For future API integration
async function getInvasionData() {
    try {
        const response = await fetch('https://api.warframestat.us/pc');
        const data = await response.json();
        
        const activeInvasions = data.invasions.filter(inv => !inv.completed);
        
        return activeInvasions.map(invasion => ({
            name: `Invasion: ${invasion.node}`,
            timeLeft: invasion.eta || 'Unknown',
            status: invasion.attackingFaction,
            description: `${invasion.desc}`
        }));
    } catch (error) {
        console.error('Failed to fetch invasion data:', error);
        return [];
    }
}
```

## 🔄 Real API Integration

### **Warframe API Endpoints**

- **Main API:** `https://api.warframestat.us/pc`
- **Platform-specific:** Replace `pc` with `ps4`, `xb1`, `swi`

### **Key API Data Points**

```javascript
// Common timer data from API
const apiTimers = {
    // Cetus cycle
    cetusCycle: data.cetusCycle.timeLeft,
    cetusState: data.cetusCycle.isDay ? 'Day' : 'Night',
    
    // Fortuna cycle  
    fortunaCycle: data.vallisCycle.timeLeft,
    fortunaState: data.vallisCycle.isWarm ? 'Warm' : 'Cold',
    
    // Arbitrations
    arbitration: data.arbitrations[0]?.eta,
    arbitrationNode: data.arbitrations[0]?.node,
    
    // Sorties
    sortie: data.sortie?.eta,
    
    // Invasions
    invasions: data.invasions.filter(inv => !inv.completed),
    
    // Baro Ki'Teer
    voidTrader: {
        active: data.voidTrader.active,
        timeLeft: data.voidTrader.endString,
        location: data.voidTrader.location
    }
};
```

### **Implementing Real API Calls**

Replace the `getTimerData()` function in `preload.js`:

```javascript
getTimerData: async () => {
    try {
        const response = await fetch('https://api.warframestat.us/pc');
        const data = await response.json();
        
        return {
            dailyReset: calculateDailyReset(),
            cetusCycle: {
                name: 'Cetus Cycle',
                timeLeft: data.cetusCycle.timeLeft,
                status: data.cetusCycle.isDay ? 'Day' : 'Night'
            },
            fortunaCycle: {
                name: 'Fortuna Cycle', 
                timeLeft: data.vallisCycle.timeLeft,
                status: data.vallisCycle.isWarm ? 'Warm' : 'Cold'
            },
            arbitrationTimer: {
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

## 🚀 Building with New Timers

After adding/modifying timers:

1. **Test in development:**
   ```bash
   npm start
   ```

2. **Build new executable:**
   ```bash
   npm run package
   ```

3. **Your updated app is ready in:**
   ```
   dist/warframe-overlay-win32-x64/warframe-overlay.exe
   ```

## 💡 Best Practices

- **Start Simple:** Begin with mock data, then add API integration
- **Error Handling:** Always have fallback data when API fails
- **Performance:** Limit API calls to avoid rate limiting
- **User Experience:** Show loading states and error messages
- **Testing:** Test all timer states (day/night, active/inactive, etc.)

This configuration system makes it easy to add any type of timer to your Warframe overlay!