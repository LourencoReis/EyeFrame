# Circuit Rotation System Guide

## Overview

The Warframe Overlay now features an advanced **12-week rotation system** for The Circuit (Normal Mode) and real-time API integration for Steel Path Circuit rewards.

---

## How It Works

### Normal Circuit (12-Week Rotation)

The Normal Circuit rotates **every Monday at 00:00 UTC** through a 12-week cycle:

- **Week 1-12**: Each week has specific Warframes and Incarnon Weapons
- **After Week 12**: The cycle automatically resets to Week 1
- **Timer**: Shows time remaining until next weekly reset

#### Key Features:
- ✅ Automatic week calculation based on DE's rotation schedule
- ✅ Shows current week number (1-12)
- ✅ Displays all 3 Warframes and 5 Incarnon Weapons for the current week
- ✅ Countdown timer to next rotation
- ✅ Auto-refresh when the week changes

### Steel Path Circuit (API-Based)

The Steel Path Circuit uses **real-time data** from the Warframe API:

- **Current Reward**: Shows what reward is active right now
- **Rotation Queue**: Displays the next 5 upcoming rewards
- **Dynamic Timer**: Counts down to when the reward rotates
- **Auto-Update**: Refreshes automatically when rewards change

---

## Updating the Rotation Data

### When to Update

You need to update the rotation file when:
- 🔄 DE changes the Circuit rotation schedule
- 🆕 New Warframes or Incarnon weapons are added
- 📅 DE resets the cycle start date

### How to Update

1. **Open the rotation file:**
   ```
   data/circuit-rotations.json
   ```

2. **Modify week data:**
   ```json
   {
     "week": 1,
     "warframes": [
       { "name": "Garuda", "image": "garuda2.png" },
       { "name": "Baruuk", "image": "baruuk.png" },
       { "name": "Hildryn", "image": "hildryn.png" }
     ],
     "weapons": [
       { "name": "Dera Incarnon", "image": "DeraIncarnon.png" },
       ...
     ]
   }
   ```

3. **Update images:**
   - Place Warframe images in: `renderer/images/circuit/warframes/`
   - Place weapon images in: `renderer/images/circuit/weapons/`
   - Image format: PNG (transparent background recommended)

4. **If DE resets the cycle:**
   Update the `cycleStartDate` field:
   ```json
   "cycleStartDate": "2024-01-08T00:00:00.000Z"
   ```

5. **Rebuild and distribute:**
   ```powershell
   npm run package
   ```

---

## File Structure

```
Warframe Overlay/
├── data/
│   └── circuit-rotations.json     ← Rotation database
├── renderer/
│   ├── images/
│   │   └── circuit/
│   │       ├── warframes/         ← Warframe images
│   │       └── weapons/           ← Weapon images
│   ├── overlay.js                 ← Circuit logic
│   └── overlay.html               ← Circuit UI
```

---

## Baro Ki'Teer (Void Trader)

The Void Trader system now shows:

### When Active (Every 2 weeks, Fri-Sun):
- 🔴 **ACTIVE NOW** badge
- 📍 Current location (relay)
- ⏰ Time until departure
- 🛍️ Top 5 featured items with prices (Ducats + Credits)
- 📋 Total item count

### When Inactive:
- ⚫ **Not Present** badge  
- ⏳ Countdown to next arrival
- 📅 Reminder about his 2-week schedule

**API Source:** Real-time data from `https://api.warframestat.us/pc/`

---

## Technical Details

### Week Calculation Algorithm

```javascript
// Calculate current week (1-12)
const startDate = new Date(cycleStartDate);
const now = new Date();
const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
const currentWeek = (weeksSinceStart % 12) + 1;
```

### Auto-Refresh System

The overlay automatically refreshes:
- **Normal Circuit**: At every Monday 00:00 UTC
- **Steel Path**: When the API's `expiry` time is reached
- **Void Trader**: Every 30 seconds (with API updates)

### Fallback Handling

If the API fails:
- Normal Circuit continues working (uses local JSON)
- Steel Path shows last known data
- Void Trader retries with alternative endpoints

---

## Troubleshooting

### Circuit not updating?

1. Check console for errors (F12 → Console tab)
2. Verify `circuit-rotations.json` is valid JSON
3. Ensure images exist in correct folders
4. Restart the overlay

### Wrong week showing?

1. Verify `cycleStartDate` in `circuit-rotations.json`
2. Check your system clock is set correctly
3. Confirm you're using the latest rotation data

### Images not showing?

1. Check image filenames match exactly (case-sensitive)
2. Verify images are in correct folders
3. Use PNG format for best compatibility
4. Check browser console for 404 errors

---

## Quick Reference

| Feature | Update Frequency | Data Source |
|---------|------------------|-------------|
| Normal Circuit | Weekly (Monday 00:00 UTC) | Local JSON file |
| Steel Path Circuit | Per API expiry | Warframe API |
| Void Trader | Every 2 weeks (Fri-Sun) | Warframe API |
| Fissures | Real-time | Warframe API |
| World Cycles | Real-time | Warframe API |

---

## Updating Your EXE

After modifying rotation data or images:

1. **Quick rebuild:**
   ```powershell
   npm run package
   ```

2. **Create distribution:**
   ```powershell
   Compress-Archive -Path "dist\eyeframe-win32-x64" -DestinationPath "dist\WarframeOverlay-v1.1.zip" -Force
   ```

3. **Share the new version** with users

---

## Support & Resources

- **Warframe API Docs**: https://docs.warframestat.us/
- **Circuit Wiki**: https://warframe.fandom.com/wiki/Duviri_Circuit
- **Baro Schedule**: https://warframe.fandom.com/wiki/Baro_Ki%27Teer

---

## Credits

- Circuit rotation data maintained by the community
- API provided by WarframeStat.us
- Icons and images property of Digital Extremes
