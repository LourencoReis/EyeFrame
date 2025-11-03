# 🎮 Warframe Overlay

A desktop overlay application for displaying Warframe world timers, built with Electron and JavaScript.

![Warframe Overlay](https://via.placeholder.com/600x300?text=Add+Screenshot+Here)

## ✨ Features

- 🕐 **Real-time Timers**: Live countdown for various Warframe cycles
- 🌅 **Cetus Day/Night Cycle**: Plains of Eidolon timer  
- 🌡️ **Fortuna Temperature Cycle**: Orb Vallis warm/cold timer
- ⚔️ **Arbitration Timer**: Steel Path Arbitration rotation
- 📅 **Daily Reset Timer**: Daily missions and rewards reset
- 🎯 **Always On Top**: Overlay stays visible during gaming
- 🖱️ **Draggable & Resizable**: Position and size to your preference
- ⚙️ **Customizable**: Choose which timers to display
- 💾 **Persistent Settings**: Your preferences are saved automatically
- 📦 **Portable**: No installation required

## 🚀 Download & Installation

### Option 1: Download Release (Recommended)
1. Go to [Releases](https://github.com/yourusername/warframe-overlay/releases)
2. Download `warframe-overlay-win32-x64.zip`
3. Extract the ZIP file anywhere you like
4. Run `warframe-overlay.exe` or double-click `Run Warframe Overlay.bat`

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/yourusername/warframe-overlay.git
cd warframe-overlay

# Install dependencies
npm install

# Run in development mode
npm start

# Build executable
npm run package
```

## 🎯 How to Use

1. **Start the app** - Two windows will appear
2. **Configure timers** in the settings window
3. **Control the overlay** with resize buttons
4. **Drag to reposition** the overlay anywhere

```bash
npm run package
```

This will create a `dist/warframe-overlay-win32-x64/` folder containing:
- `warframe-overlay.exe` - Your standalone application
- All necessary DLL files and dependencies
- Everything needed to run the app on any Windows computer

You can then:
1. Copy the entire `warframe-overlay-win32-x64` folder to any Windows computer
2. Run `warframe-overlay.exe` directly - no installation required!
3. Create a desktop shortcut to the .exe file for easy access

## Project Structure

```
project/
│
├─ package.json          # Project configuration and dependencies
├─ main.js              # Main Electron process
├─ preload.js           # IPC bridge for security
├─ renderer/            # UI files
│  ├─ index.html        # Settings window HTML
│  ├─ overlay.html      # Overlay window HTML
│  ├─ style.css         # Shared styles
│  ├─ index.js          # Settings window logic
│  └─ overlay.js        # Overlay window logic
└─ data/                # Auto-created settings storage
   └─ settings.json     # User preferences (auto-created)
```

## Packaging Options

The project includes multiple ways to create distributable versions:

### Option 1: Simple Packaging (Recommended)
```bash
npm run package
```
- Creates a folder with the .exe and all dependencies
- No installer needed - just run the .exe
- Easy to distribute and run on any Windows PC

### Option 2: Advanced Building (Alternative)
```bash
npm run build-portable  # Creates a single portable .exe file
npm run build-win       # Creates Windows installer
```
- Requires more system permissions
- May need code signing certificates for some features
- Creates more polished distribution packages

**Note:** If you encounter permission errors with the advanced build options, use the simple packaging method (`npm run package`) which works reliably on all systems.

### Settings Window
1. **Timer Selection**: Check/uncheck which timers you want to display
2. **Overlay Controls**: 
   - Toggle overlay visibility
   - Reset overlay position to default
3. **Apply Changes**: Click "Apply Changes" to save settings and update overlay

### Overlay Window
- **Always on Top**: Stays above all other windows
- **Draggable**: Click and drag the header to reposition
- **Minimizable**: Click the "−" button to minimize to header only
- **Auto-updating**: Timers update every second

## Configuration

Settings are automatically saved to your user data directory and include:
- Which timers to display
- Window positions (restored on restart)

## Future Enhancements

- [ ] Real API integration with https://api.warframestat.us/pc
- [ ] Additional timer types (Arbitration, Nightwave, etc.)
- [ ] Custom styling options
- [ ] Sound notifications for timer events
- [ ] Multiple overlay themes

## Development

### File Structure Explained

- **main.js**: Main Electron process handling window creation and IPC
- **preload.js**: Secure bridge between main and renderer processes
- **renderer/index.js**: Settings window logic and form handling
- **renderer/overlay.js**: Overlay display logic and timer updates
- **renderer/style.css**: All styling for both windows

### Key Features Implemented

1. **IPC Communication**: Secure message passing between windows
2. **Persistent Storage**: Settings saved using electron-store
3. **Window Management**: Proper window lifecycle and positioning
4. **Timer Simulation**: Mock data with realistic time progression
5. **Modern UI**: CSS Grid, Flexbox, and smooth animations

## Troubleshooting

### Common Issues

1. **Overlay not visible**: Check if it's minimized or hidden behind other windows
2. **Settings not saving**: Ensure the app has write permissions to the data directory
3. **Timers not updating**: Check console for JavaScript errors

### Development Mode

Run with `npm run dev` or `electron . --dev` to enable DevTools for debugging.

## API Integration (Coming Soon)

The app is designed to integrate with the Warframe API:
- Endpoint: `https://api.warframestat.us/pc`
- Current implementation uses mock data
- Timer calculation logic is ready for real data

Replace the `getTimerData()` function in `preload.js` with actual API calls when ready.

## License

ISC License - feel free to modify and distribute.

---

**Note**: This application currently uses simulated timer data for demonstration. Real Warframe API integration will be added in future updates.