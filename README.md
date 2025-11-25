# Eyeframe

A sleek Windows desktop overlay for Warframe world timers.

Stay on top of all Warframe cycles with this beautiful, always-visible overlay featuring a stunning black-to-blue gradient design and simplified controls.

![Platform](https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-39.0.0-lightblue?style=for-the-badge&logo=electron)

---

## Features

### Real-Time API Integration
- **Live Warframe Data** - Connected to api.tenno.tools for real-time game state
- **Accurate Cycle Timers** - Cetus, Fortuna, and Deimos cycles sync with actual game
- **Dynamic Updates** - Fissures, invasions, events, and alerts update automatically
- **Sortie & Archon Hunt** - Daily mission tracking with real countdowns

### Complete Content Coverage
- **World Timers** - Daily/Weekly Reset, Cetus, Fortuna, Deimos, Baro Ki'Teer
- **Void Fissures** - All active fissures with mission types and locations
- **The Circuit** - Current rotation with warframes and weapons
- **Alerts & Arbitrations** - Steel Path arbitrations and game alerts
- **Events & Invasions** - Active events with progress tracking
- **Sortie & Archon Hunt** - Daily mission tracking at the end for easy reference

### Two Beautiful Themes
- **Normal Overlay** - Vertical scrolling layout with all sections visible
- **Director Theme** - Tabbed interface with 7 icon tabs for organized viewing
- **Black-to-Blue Gradient** - Stunning design that blends with Warframe
- **Opacity Control** - Low opacity (0.4) for minimal game obstruction
- **Compact Layout** - Minimal padding, maximum content visibility

### Gaming Optimized
- **Always On Top** - Stays visible during gameplay
- **Draggable Interface** - Position anywhere on screen
- **Resizable Window** - Adjust size to your preference
- **Minimal Resource Usage** - Won't impact game performance
- **No Taskbar Icon** - Clean, unobtrusive presence

### User-Friendly Controls
- **Theme Toggle** - Switch between Normal and Director themes
- **Minimize/Expand** - Hide content but keep access visible
- **Close Button** - Completely close overlay when not needed
- **Persistent Settings** - Your theme and position preferences are saved
- **Portable Executable** - No installation required

---

## Download & Installation

### Option 1: Download Release (Recommended)

1. **Download**: Go to [Releases](https://github.com/LourencoReis/EyeFrame/releases)
2. **Get the ZIP**: Download `eyeframe-win32-x64.zip` from the latest release
3. **Extract**: Unzip anywhere on your computer
4. **Run**: Double-click `eyeframe.exe` to start
5. **Enjoy**: Settings window and overlay appear automatically!

**Note:** No installation required - the app is completely portable.

### Option 2: Build from Source

Perfect for developers who want to customize or contribute:

```bash
# Clone the repository
git clone https://github.com/LourencoReis/EyeFrame.git
cd EyeFrame

# Install dependencies
npm install

# Run in development mode
npm start

# Build your own executable
npm run package
```

**Requirements**: Node.js 16+ and npm

---

## How to Use

### Quick Start
1. **Launch Eyeframe** - Double-click the executable
2. **Two windows appear**:
   - **Settings Window** - Configure preferences and theme
   - **Overlay Window** - Shows all Warframe timers and events

### Overlay Themes
- **Normal Theme**: Vertical scrolling layout showing all sections at once
  - World Timers, Fissures, Circuit, Alerts, Events, Invasions, Sortie, Archon Hunt
- **Director Theme**: Tabbed interface with icon navigation
  - 7 Tabs: Timers, Alerts, Events, Fissures, Sortie, Archon, Circuit
  - Click icons to switch between sections

### Overlay Controls
- **Minimize**: Hide content, show minimized tab with + icon to expand
- **Close**: Completely close the overlay
- **Drag**: Click and drag anywhere to reposition
- **Resize**: Drag edges to adjust window size

### Settings Window
- **Theme Selection**: Choose between Normal and Director themes
- **Content Visibility**: Enable/disable specific sections
- **Save Settings**: Click "Save Settings" to apply changes
- **Open/Close Overlay**: Button to show overlay if closed

---

## Project Structure

```
eyeframe/
├── main.js                    # Main Electron process & window management
├── preload.js                 # Secure IPC bridge
├── package.json               # Project config & dependencies
├── renderer/                  # UI components
│   ├── index.html             # Settings window
│   ├── overlay.html           # Main overlay structure
│   ├── style.css              # Complete styling (2400+ lines)
│   ├── index.js               # Settings window logic
│   ├── overlay.js             # Timer logic & API integration (1760+ lines)
│   ├── warframe-api.js        # API wrapper for api.tenno.tools
│   └── images/                # Image assets
│       ├── planets/           # Timer and world icons
│       ├── fissures/          # Relic tier icons
│       ├── missions/          # Mission type icons
│       ├── logos/             # Branding and section icons
│       └── circuit/           # Circuit rewards
│           ├── warframes/     # Warframe portraits
│           └── weapons/       # Weapon images
├── dist/                      # Built executables (after npm run package)
├── README.md                  # This file
├── CODE_EXPLANATION.md        # Technical documentation
├── ENHANCED_FEATURES.md       # Feature guide
├── ADDING_TIMERS_GUIDE.md     # Developer guide
├── TIMER_CONFIGURATION.md     # Timer configuration reference
├── LICENSE                    # ISC License
└── .gitignore                 # Git exclusions
```

---

## Technical Details

### Built With
- **[Electron 39.0.0](https://electronjs.org/)** - Cross-platform desktop framework
- **[electron-store](https://github.com/sindresorhus/electron-store)** - Persistent settings storage
- **Vanilla JavaScript** - No frameworks, maximum performance (1760+ lines overlay logic)
- **Modern CSS** - Gradients, animations, responsive design (2400+ lines styling)
- **Warframe API** - Real-time integration with api.tenno.tools

### Architecture
- **Multi-Process**: Secure main process + isolated renderer processes  
- **IPC Communication**: Safe message passing between windows
- **Real-Time Updates**: 1-second timer refresh cycle
- **API Integration**: Fetches live Warframe data every update
- **Memory Efficient**: Cleanup on window close, optimized DOM updates
- **Dual Theme System**: Normal and Director themes with dynamic switching

### API Integration
```javascript
// Real Warframe API connection
const API_BASE = 'https://api.tenno.tools/worldstate/pc';

// Fetch live cycle data
const worldState = await warframeAPI.getWorldCycles();
const cetusCycle = worldState.cetusCycle;
const isDay = cetusCycle.isDay;
const expiry = new Date(cetusCycle.expiry * 1000); // Convert to milliseconds
```

**Live API data** ensures timers are synchronized with actual Warframe game state.

---

## Build Options

### Development Mode
```bash
npm start          # Launch with DevTools
npm run dev        # Same as above
```

### Production Build
```bash
npm run package    # Creates dist/eyeframe-win32-x64/
npm run build      # Alternative build command
```

**Build Output**: Self-contained folder with executable and all dependencies.

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Ideas for Contributions
- Add additional Warframe API integrations
- Create new themes and color schemes  
- Add more content types (Nightwave, special events, etc.)
- Sound notifications for cycle changes
- Advanced positioning and size options

---

## License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Digital Extremes** - For creating the amazing Warframe universe
- **Electron Team** - For the fantastic desktop app framework
- **Warframe Community** - For inspiration and feedback
- **Open Source Contributors** - For making this possible

---

## Support & Feedback

- **Bug Reports**: [Open an Issue](https://github.com/LourencoReis/EyeFrame/issues)
- **Feature Requests**: [Start a Discussion](https://github.com/LourencoReis/EyeFrame/discussions)
- **Contact**: Create an issue for any questions

---

<div align="center">

**Made for the Warframe community**

Star this repo if Eyeframe helps your Warframe experience!

</div>