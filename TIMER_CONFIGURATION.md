# Timer & Content Configuration Guide

This guide explains how timers and content work in your Warframe Overlay app with real API integration.

## Understanding Content Types

### 1. **API-Driven Timers**
- **Example:** Cetus/Fortuna/Deimos cycles, Fissures, Invasions
- **Behavior:** Fetched from api.tenno.tools in real-time
- **Configuration:** No manual calculation needed, API provides expiry timestamps

```javascript
// API-driven timer example
async function updateWorldTimers() {
    const worldState = await warframeAPI.getWorldCycles();
    
    // Cetus cycle from API
    const cetusCycle = worldState.cetusCycle;
    const expiry = new Date(cetusCycle.expiry * 1000); // Convert seconds to milliseconds
    const timeLeft = Math.floor((expiry - Date.now()) / 1000);
    
    updateTimerItem('cetusTimer', {
        name: 'Cetus',
        status: cetusCycle.isDay ? 'Day' : 'Night',
        timeLeft: formatTime(timeLeft)
    });
}
```

**Critical**: API returns timestamps in **seconds**, always multiply by 1000 for JavaScript Date objects.

### 2. **Calculated Timers**
- **Example:** Daily Reset, Weekly Reset
- **Behavior:** Calculated based on fixed UTC times
- **Configuration:** Uses Date arithmetic for precise timing

```javascript
// Calculated timer example
function updateResetTimers() {
    const now = new Date();
    const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0);
    const dailyReset = utc + 86400000; // Next midnight UTC
    const timeLeft = Math.floor((dailyReset - Date.now()) / 1000);
}
```

### 3. **Event-Based Content**
- **Example:** Alerts, Events, Limited-Time Operations
- **Behavior:** Appears/disappears based on API data availability
- **Configuration:** Fetched from API with optional empty state handling

```javascript
// Event-based content example
async function updateEvents() {
    const events = await warframeAPI.getEvents();
    
    if (events && events.length > 0) {
        displayEvents(events);
        document.getElementById('eventsSection').style.display = 'block';
    } else {
        document.getElementById('eventsSection').style.display = 'none';
    }
}
```

## API Integration Patterns

### World Cycles (Cetus, Fortuna, Deimos)

```javascript
async function updateWorldTimers() {
    const worldState = await warframeAPI.getWorldCycles();
    
    // Cetus Cycle
    const cetusCycle = worldState.cetusCycle;
    const cetusExpiry = new Date(cetusCycle.expiry * 1000);
    const cetusTimeLeft = Math.floor((cetusExpiry - Date.now()) / 1000);
    
    // Fortuna/Vallis Cycle
    const vallisCycle = worldState.vallisCycle;
    const vallisExpiry = new Date(vallisCycle.expiry * 1000);
    const vallisTimeLeft = Math.floor((vallisExpiry - Date.now()) / 1000);
    
    // Deimos/Cambion Cycle
    const cambionCycle = worldState.cambionCycle;
    const cambionExpiry = new Date(cambionCycle.expiry * 1000);
    const cambionTimeLeft = Math.floor((cambionExpiry - Date.now()) / 1000);
}
```

**States**:
- Cetus: `isDay` (boolean) - true = Day, false = Night
- Fortuna: `isWarm` (boolean) - true = Warm, false = Cold
- Deimos: `active` (string) - "vome" or "fass"

### Void Fissures

```javascript
async function updateFissures() {
    const fissures = await warframeAPI.getFissures();
    
    // Filter by type
    const normalFissures = fissures.filter(f => !f.isStorm && !f.isHard);
    const steelPathFissures = fissures.filter(f => f.isHard);
    
    // Sort by tier
    const tierOrder = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];
    normalFissures.sort((a, b) => 
        tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    );
    
    // Display with countdown
    normalFissures.forEach(fissure => {
        const expiry = new Date(fissure.expiry * 1000);
        const timeLeft = Math.floor((expiry - Date.now()) / 1000);
        // Update display
    });
}
```

**Fissure Properties**:
- `tier`: "Lith", "Meso", "Neo", "Axi", "Requiem"
- `missionType`: "Defense", "Survival", "Capture", etc.
- `node`: Mission node name
- `enemy`: Enemy faction
- `expiry`: Unix timestamp (seconds)
- `isHard`: Boolean (Steel Path)
- `isStorm`: Boolean (Void Storm)

### Invasions

```javascript
async function updateInvasions() {
    const invasions = await warframeAPI.getInvasions();
    
    invasions.forEach(invasion => {
        // Calculate completion percentage
        const completion = invasion.completion || 0;
        const percentage = Math.abs(completion).toFixed(1);
        
        // Determine winner
        const attackerWinning = completion > 0;
        
        // Update progress bar
        updateProgressBar(invasion.id, percentage, attackerWinning);
    });
}
```

**Invasion Properties**:
- `attackingFaction`: "Grineer", "Corpus", "Infested"
- `defendingFaction`: Opposing faction
- `completion`: Progress percentage (-100 to 100)
- `node`: Mission location
- `attackerReward`: Reward if attacker wins
- `defenderReward`: Reward if defender wins

## Display Customization

### Status Colors and Styles

Current implementation in `style.css`:

```css
/* Cycle status colors */
.timer-status.day {
    background: linear-gradient(135deg, #4CAF50, #388E3C);
    color: #ffffff;
}

.timer-status.night {
    background: linear-gradient(135deg, #2196F3, #1976D2);
    color: #ffffff;
}

.timer-status.warm {
    background: linear-gradient(135deg, #FF9800, #F57C00);
    color: #ffffff;
}

.timer-status.cold {
    background: linear-gradient(135deg, #00BCD4, #0097A7);
    color: #ffffff;
}

/* Fissure tier colors */
.fissure-item.lith {
    border-left: 3px solid #CD7F32; /* Bronze */
}

.fissure-item.meso {
    border-left: 3px solid #C0C0C0; /* Silver */
}

.fissure-item.neo {
    border-left: 3px solid #FFD700; /* Gold */
}

.fissure-item.axi {
    border-left: 3px solid #E5E4E2; /* Platinum */
}
```

### Hover Effects

```css
/* Timer card hover effect */
.timer-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

/* Fissure item hover effect */
.fissure-item:hover {
    transform: translateX(5px);
    border-left-width: 5px;
}

/* Progress bar animation */
.invasion-progress {
    transition: width 0.3s ease;
    background: linear-gradient(90deg, #1e88e5, #42a5f5);
}
```

### Director Theme Overrides

```css
/* Director theme specific styling */
.director-theme .timer-item {
    margin-bottom: 8px;
    padding: 12px;
}

.director-theme .fissure-item {
    padding: 8px 12px;
    margin-bottom: 6px;
}

.director-theme .section-title {
    font-size: 16px;
    margin-bottom: 12px;
}
```

## Complete Implementation Examples

### Example 1: Daily Reset Timer

```javascript
function updateDailyReset() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const timeLeft = Math.floor((tomorrow - now) / 1000);
    
    updateTimerItem('dailyResetTimer', {
        name: 'Daily Reset',
        timeLeft: formatTime(timeLeft),
        status: 'Active'
    });
}
```

### Example 2: Baro Ki'Teer Timer

```javascript
async function updateBaroTimer() {
    const worldState = await warframeAPI.getWorldCycles();
    const voidTrader = worldState.voidTrader;
    
    if (voidTrader.active) {
        // Baro is here
        const expiry = new Date(voidTrader.expiry * 1000);
        const timeLeft = Math.floor((expiry - Date.now()) / 1000);
        
        updateTimerItem('baroTimer', {
            name: 'Baro Ki\'Teer',
            status: voidTrader.location || 'Present',
            timeLeft: formatTime(timeLeft)
        });
    } else {
        // Baro is away
        const activation = new Date(voidTrader.activation * 1000);
        const timeLeft = Math.floor((activation - Date.now()) / 1000);
        
        updateTimerItem('baroTimer', {
            name: 'Baro Ki\'Teer',
            status: 'Away',
            timeLeft: formatTime(timeLeft)
        });
    }
}
```

### **Example 3: Sortie Display**

```javascript
async function updateSortie() {
    const sortie = await warframeAPI.getSortie();
    
    if (sortie && sortie.missions) {
        // Display sortie missions
        const sortieContainer = document.getElementById('sortieContainer');
        sortieContainer.innerHTML = '';
        
        sortie.missions.forEach((mission, index) => {
            const missionDiv = document.createElement('div');
            missionDiv.className = 'sortie-mission';
            missionDiv.innerHTML = `
                <div class="mission-number">${index + 1}</div>
                <div class="mission-info">
                    <span class="mission-type">${mission.missionType}</span>
                    <span class="mission-node">${mission.node}</span>
                    <span class="mission-modifier">${mission.modifier}</span>
                </div>
            `;
            sortieContainer.appendChild(missionDiv);
        });
        
        // Update countdown to reset
        const expiry = new Date(sortie.expiry * 1000);
        const timeLeft = Math.floor((expiry - Date.now()) / 1000);
        document.getElementById('sortieCountdown').textContent = formatTime(timeLeft);
    }
}
```

## Critical Configuration Notes

### Timestamp Conversion
```javascript
// WRONG - Creates dates in 1970
const expiry = new Date(apiTimestamp);

// CORRECT - Converts seconds to milliseconds
const expiry = new Date(apiTimestamp * 1000);
```

### **Always Visible Sections**
To prevent settings from hiding critical sections:
```javascript
// In update function, force display
const alertsSection = document.getElementById('alertsSection');
if (alertsSection) {
    alertsSection.style.display = 'block'; // Override settings
}
```

### **Empty State Handling**
```javascript
async function updateContent() {
    const data = await warframeAPI.getSomething();
    
    if (!data || data.length === 0) {
        // Show "No active [content]" message
        showEmptyState('No active events');
    } else {
        displayContent(data);
    }
}
```

### **Error Recovery**
```javascript
async function updateWithFallback() {
    try {
        const data = await warframeAPI.getData();
        displayData(data);
    } catch (error) {
        console.error('API error:', error);
        // Show cached data or "Unavailable" message
        displayFallback();
    }
}
```

## Debugging Configuration

### Console Logging
```javascript
// Add debug logging to track data flow
console.log('API Response:', apiData);
console.log('Timestamp:', apiData.expiry, 'Converted:', apiData.expiry * 1000);
console.log('Time Left:', timeLeft, 'Formatted:', formatTime(timeLeft));
```

### Check API Response Structure
```javascript
async function debugAPI() {
    const response = await fetch('https://api.tenno.tools/worldstate/pc');
    const result = await response.json();
    console.log('Full API structure:', JSON.stringify(result, null, 2));
}
```

## Configuration Best Practices

1. **Always multiply API timestamps by 1000**
2. **Use try-catch for all API calls**
3. **Implement empty state handling**
4. **Add onerror handlers to images**
5. **Test both Normal and Director themes**
6. **Validate data before displaying**
7. **Format times consistently with formatTime()**
8. **Use CSS classes for status indicators**
9. **Keep update functions async**
10. **Log errors for debugging**

## Quick Reference

**Key Functions**:
- `formatTime(seconds)` - Formats seconds as "1h 30m" or "45s"
- `updateTimerItem(id, data)` - Updates timer display
- `updateAllTimers()` - Main 1-second update loop

**API Functions** (warframe-api.js):
- `getWorldCycles()` - Cetus, Fortuna, Deimos
- `getFissures()` - All void fissures
- `getInvasions()` - Active invasions
- `getSortie()` - Daily sortie
- `getArchonHunt()` - Weekly archon hunt
- `getEvents()` - Active events
- `getCircuit()` - Circuit rotation

**Common Patterns**:
```javascript
// Fetch → Convert → Calculate → Display
const data = await api.getData();
const expiry = new Date(data.expiry * 1000);
const timeLeft = Math.floor((expiry - Date.now()) / 1000);
updateDisplay(formatTime(timeLeft));
```

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