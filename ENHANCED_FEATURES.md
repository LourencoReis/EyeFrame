# EYEFRAME ENHANCED FEATURES - Complete Implementation Guide

## What Is Implemented

Your Eyeframe app is a fully-featured Warframe overlay with real-time API integration and dual theme system! Here's everything that works:

---

## IMPLEMENTED FEATURES

### 1. Real-Time API Integration
- **Purpose**: Display live Warframe game data
- **API Source**: api.tenno.tools/worldstate/pc
- **Connected Systems**:
  - **Cetus Cycle**: Live day/night status and countdown
  - **Fortuna Cycle**: Live warm/cold status and countdown
  - **Deimos Cycle**: Live Vome/Fass status and countdown
  - **Void Fissures**: Real-time fissure missions with expiry timers
  - **Invasions**: Active invasions with progress tracking
  - **Sortie**: Daily sortie missions with reset timer
  - **Archon Hunt**: Weekly archon hunt tracking
  - **Events**: Active in-game events
  - **Arbitrations**: Steel Path arbitration rotations
- **Update Frequency**: Every 1 second for accurate countdowns
- **Timestamp Handling**: API returns Unix seconds, converted to milliseconds for JavaScript

### 2. Dual Theme System
- **Purpose**: Two distinct viewing modes for different preferences
- **Normal Theme**:
  - Vertical scrolling layout
  - All sections visible at once
  - Lower opacity (0.4) for game transparency
  - Order: Timers → Fissures → Circuit → Alerts → Events → Invasions → Sortie → Archon
- **Director Theme**:
  - Tabbed icon interface
  - 7 clickable tabs with icon navigation
  - Dropdown content areas
  - Control buttons at top-right
  - Minimized state with (+) expand icon
- **Theme Switching**: Controlled via settings window, saved persistently

### 3. Complete Image Support System
- **Purpose**: Visual icons for all content types
- **Image Folders**:
  ```
  images/
  ├── planets/          # Earth, Cetus, Fortuna, Deimos, Baro icons
  ├── fissures/         # Lith, Meso, Neo, Axi, Requiem tier icons
  ├── missions/         # Mission type icons (Defense, Survival, etc.)
  ├── logos/            # App branding and section logos
  └── circuit/
      ├── warframes/    # Warframe portraits for Circuit
      └── weapons/      # Weapon images for Circuit
  ```
- **Fallback Handling**: Images gracefully hide with `onerror="this.style.display='none'"`
- **Icon Sizes**: Optimized at 32x32 pixels for consistent display

### 4. Void Fissures Section
- **Purpose**: Display all active void fissure missions
- **Features**:
  - **Normal/Steel Path Tabs**: Switch between fissure types
  - **Live Countdowns**: Each fissure updates every second
  - **Mission Details**: Shows mission type, node, planet
  - **Tier Icons**: Visual indicators for relic tiers
  - **Tier Grouping**: Organized by Lith, Meso, Neo, Axi order
  - **API-Driven**: Fetches real fissures from Warframe API
- **Display**: Scrollable list with no bottom padding

### 5. The Circuit Section
- **Purpose**: Display current Duviri Circuit rotation
- **Features**:
  - **Normal/Steel Path Tabs**: Different rewards per difficulty
  - **Warframe Display**: Shows available warframes with portraits
  - **Weapon Display**: Shows available weapons with images
  - **Grid Layout**: Organized visual presentation
- **Current Data**: Fetched from API for accurate rotation info

### 6. Alerts & Arbitrations Section
- **Purpose**: Track time-sensitive missions
- **Features**:
  - **Always Visible**: Alerts section never hidden (overrides settings)
  - **Arbitration Timer**: Steel Path arbitration rotation tracking
  - **Alert Missions**: Active in-game alerts when available
  - **API Integration**: Live data from Warframe API
- **Location**: Moved arbitration from World Timers to Alerts for better organization

---

## VISUAL DESIGN SYSTEM

### Normal Theme (Default)
- **Layout**: Vertical scrolling, all sections visible
- **Background**: Black-to-blue gradient with 0.4 opacity
- **Padding**: 15px on top/sides, 0px on bottom for compact fit
- **Scrolling**: Smooth scrolling with custom blue-themed scrollbar
- **Section Order**: Optimized for frequency of use

### Director Theme (Tabbed)
- **Layout**: Icon-based tabs with dropdown content
- **Tab Bar**: Vertical layout with controls at top
- **7 Tabs**: 
  1. **Timers** - World cycles and resets
  2. **Alerts** - Arbitrations and alerts
  3. **Events** - Active game events
  4. **Fissures** - Void fissure missions
  5. **Sortie** - Daily sortie
  6. **Archon** - Weekly archon hunt
  7. **Circuit** - Duviri Circuit rotation
- **Minimize State**: Collapses to small (+) tab in top-right corner
- **Control Buttons**: Minimize (−) and Close (✕) above tabs

### Enhanced Styling Features
- **Gradient Theme**: Consistent blue accent throughout
- **Section Headers**: Blue left border with title and icon
- **Item Cards**: Subtle gradients with hover lift effects
- **Tab Buttons**: Active state blue highlight
- **Status Indicators**: Color-coded (Green=Day, Blue=Night, etc.)
- **Progress Bars**: Invasion completion with faction colors
- **Fissure Tiers**: Color-coded borders (Bronze→Silver→Gold→Platinum)

---

## TECHNICAL IMPLEMENTATION

### API Integration (warframe-api.js)
```javascript
const API_BASE = 'https://api.tenno.tools/worldstate/pc';

// Fetch world cycles (Cetus, Fortuna, Deimos)
async function getWorldCycles() {
    const response = await fetch(`${API_BASE}`);
    const result = await response.json();
    return {
        cetusCycle: result.data.cetusCycle,
        vallisCycle: result.data.vallisCycle,
        cambionCycle: result.data.cambionCycle
    };
}
```
**Critical**: API returns timestamps in seconds, multiply by 1000 for JavaScript Date objects.

### Enhanced JavaScript (overlay.js - 1760+ lines)
- **updateAllTimers()**: Main loop calling all update functions every second
- **updateWorldTimers()**: Fetches and displays cycle data with proper timestamp conversion
- **updateFissures()**: Populates fissure lists from API, sorts by tier
- **updateInvasions()**: Shows invasion progress with faction info
- **updateAlertsAndEvents()**: Always displays alerts section (overrides settings)
- **convertToTabbedLayout()**: Dynamically restructures DOM for director theme
- **Minimize/Expand Logic**: Handles collapsed state with (+) tab restoration

### Comprehensive CSS (style.css - 2400+ lines)
- **Lines 1-500**: Base overlay styling, normal theme
- **Lines 500-1000**: Section-specific styles (fissures, circuit, invasions)
- **Lines 1000-1500**: Tab systems, buttons, interactive elements
- **Lines 1500-2000**: Director theme structure and controls
- **Lines 2000-2400**: Director-specific overrides and responsive design
- **Key Classes**:
  - `.director-theme`: Applied when director mode active
  - `.director-tab`: Icon tabs for navigation
  - `.director-dropdown-content`: Collapsible section content
  - `.director-minimized-tab`: Restoration button when minimized
  - `.fissure-item`, `.invasion-item`: Content cards with hover effects

### Window Management (main.js)
- **Dynamic Sizing**: Adjusts window bounds based on theme
- **Position Persistence**: Saves and restores window location
- **Always On Top**: Ensures overlay stays visible during gameplay
- **IPC Handlers**: Manages settings, theme switching, overlay controls

---

## 🖼️ **IMAGE SYSTEM USAGE**

### **How to Add Images**
1. **Planet/Timer Icons** → `images/planets/`
   - `earth.png`, `cetus.png`, `fortuna.png`, `arbitration.png`

2. **Fissure Relic Icons** → `images/fissures/`
   - `lith.png`, `meso.png`, `neo.png`, `axi.png`, `requiem.png`

3. **Warframe Portraits** → `images/circuit/warframes/`
   - `garuda.png`, `baruuk.png`, `hildryn.png`, `wisp.png`, `protea.png`

4. **Weapon Images** → `images/circuit/weapons/`
   - `dera.png`, `cestra.png`, `okina.png`, `sybaris.png`, `sicarus.png`
   - `kuva-bramma.png`, `tenet-cycron.png`

### **Image Requirements**
- **Format**: PNG recommended (transparent backgrounds supported)
- **Size**: 32x32 pixels optimal (auto-scaled)
- **Quality**: Clear, recognizable Warframe assets
- **Fallback**: Images gracefully hide if not found

---

## HOW EVERYTHING WORKS

### World Timers Section 
- **Real-Time API**: Fetches live Cetus/Fortuna/Deimos cycle data
- **Status Display**: Shows current state (Day/Night, Warm/Cold, Vome/Fass)
- **Accurate Countdowns**: Synced with actual game cycles via API timestamps
- **Static Timers**: Daily/Weekly resets, Baro Ki'Teer calculated locally

### Void Fissures Section
- **API-Driven**: Fetches all active fissures from api.tenno.tools
- **Tab Switching**: Click "Normal" or "Steel Path" tabs to filter
- **Live Countdowns**: Each fissure timer updates independently  
- **Mission Details**: Shows node, planet, mission type
- **Tier Organization**: Sorted Lith → Meso → Neo → Axi for easy scanning

### **The Circuit Section**
- **Current Rotation**: Shows available warframes and weapons
- **Tab Toggle**: Switch between Normal and Steel Path rewards
- **Visual Display**: Grid layout with portrait images
- **API Integration**: Fetches rotation data from Warframe API

### **Alerts & Arbitrations**
- **Always Visible**: Section never hidden by settings (critical for arbitrations)
- **Arbitration Timer**: Shows current arbitration mission and expiry
- **Alert Missions**: Displays active alerts when available
- **Empty State**: Shows message when no alerts/arbitrations active

### **Events & Invasions**
- **Events**: Shows active game events with descriptions and timers
- **Invasions**: Displays all invasions with progress bars
- **Faction Colors**: Grineer (red), Corpus (blue), Infested (green)
- **Completion Progress**: Visual bars show invasion completion percentage

### **Sortie & Archon Hunt**
- **Daily Sortie**: Shows missions, modifiers, and boss
- **Weekly Archon**: Displays archon name and missions
- **Positioned at End**: Easy reference without cluttering main content
- **Reset Timers**: Accurate countdowns to next reset

---

## USER INTERACTION

### Theme Switching
- **Settings Window**: Click theme dropdown to select Normal or Director
- **Persistent**: Theme choice saved and restored on restart
- **Dynamic**: Overlay restructures on-the-fly without restart

### **Director Theme Controls**
- **Tab Navigation**: Click any of 7 icons to switch sections
- **Minimize Button (−)**: Collapses content, shows (+) tab
- **Expand Button (+)**: Restores full interface from minimized state
- **Close Button (✕)**: Completely closes overlay
- **Drag to Move**: Click and drag anywhere to reposition

### **Normal Theme Controls**
- **Scrolling**: Use mouse wheel to scroll through all sections
- **Close Button**: Top-right (✕) to close overlay
- **Drag to Move**: Click and drag to reposition
- **Resize**: Drag window edges to adjust size

### Content Interaction
- **Fissure Tabs**: Toggle Normal/Steel Path fissures
- **Circuit Tabs**: Toggle Normal/Steel Path circuit rewards
- **Hover Effects**: Cards lift and glow on mouse hover
- **Visual Feedback**: Active tabs highlighted in blue

---

## PERFORMANCE & OPTIMIZATION

### Update Cycle
- **1-Second Interval**: All timers and countdowns update smoothly
- **Selective Updates**: Only visible content updates (director theme)
- **API Caching**: Reduces unnecessary API calls
- **Error Handling**: Graceful fallbacks for missing data

### **Memory Management**
- **Cleanup on Close**: Removes event listeners and clears intervals
- **Efficient DOM**: Reuses existing elements instead of recreating
- **Image Lazy Load**: Images only loaded when needed
- **Custom Scrollbars**: Styled without heavy libraries

### **Responsive Design**
- **Auto-scaling**: Content adapts to window size
- **Scroll Support**: Sections scroll if content exceeds height
- **Min/Max Bounds**: Prevents window from being too small/large
- **Text Overflow**: Long names truncate with ellipsis

---

## WHAT YOU CAN DO

### Immediate Usage
1. **Launch App**: Run `npm start` to see all features
2. **Switch Themes**: Use settings to toggle Normal/Director
3. **Watch Live Data**: All timers sync with real Warframe game
4. **Navigate Tabs**: Director theme - click icons to explore
5. **Minimize/Restore**: Test collapse and expand functionality
6. **Monitor Events**: Track invasions, alerts, fissures in real-time

### **Customization Options**
1. **Add Images**: Place Warframe assets in appropriate folders
2. **Adjust Colors**: Modify CSS gradient values and accent colors
3. **Change Opacity**: Edit `.overlay-content` background alpha
4. **Reorder Sections**: Adjust HTML structure in overlay.html
5. **Window Size**: Modify dimensions in main.js createOverlayWindow()

---

## IMPLEMENTATION STATUS

FULLY COMPLETE! Your Eyeframe app has:
- Real-time API integration with api.tenno.tools
- Dual theme system (Normal and Director)
- Complete image support structure
- Void fissures with live data
- The Circuit section with rotation info
- Alerts & arbitrations (always visible)
- Events, invasions, sortie, archon hunt tracking
- Minimize/expand functionality
- Professional design with blue gradient theme
- Responsive layout and hover effects
- Zero bottom padding for compact display
- 1-second update cycle for smooth countdowns
- Persistent settings and window position

**Everything is working and production-ready!**