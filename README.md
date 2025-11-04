# 🎮 Eyeframe

> **A sleek Windows desktop overlay for Warframe world timers**

Stay on top of all Warframe cycles with this beautiful, always-visible overlay featuring a stunning black-to-blue gradient design and simplified controls.

![Platform](https://img.shields.io/badge/Platform-Windows-blue?style=for-the-badge&logo=windows)
![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-ISC-yellow?style=for-the-badge)
![Electron](https://img.shields.io/badge/Electron-39.0.0-lightblue?style=for-the-badge&logo=electron)

---

## ✨ Features

### 🕐 **Complete Timer Coverage**
- **Daily Reset Timer** - Track daily missions and login rewards
- **Cetus Day/Night Cycle** - Plains of Eidolon hunting windows
- **Fortuna Warm/Cold Cycle** - Orb Vallis temperature phases  
- **Arbitration Rotation** - Steel Path Arbitration missions

### 🎨 **Beautiful Design**
- **Black-to-Blue Gradient** - Stunning main interface
- **Compact Overlay** - Minimal padding, maximum visibility
- **Always Show All Timers** - No more hidden or missing timers
- **Game-Friendly Transparency** - Blends seamlessly with Warframe

### 🎮 **Gaming Optimized**
- **Always On Top** - Stays visible during gameplay
- **Top-Right Positioning** - Out of the way, always accessible
- **Draggable Interface** - Position anywhere on screen
- **Minimal Resource Usage** - Won't impact game performance

### 🔧 **User-Friendly Controls**
- **Two-Button Simplicity** - Just Minimize (−) and Close (✕)
- **Instant Startup** - Overlay appears immediately
- **Persistent Settings** - Your preferences are remembered
- **Portable Executable** - No installation required

---

## 🚀 Download & Installation

### 📦 **Option 1: Download Release (Recommended)**

1. **Download**: Go to [Releases](https://github.com/LourencoReis/EyeFrame/releases)
2. **Get the ZIP**: Download `eyeframe-win32-x64.zip` from the latest release
3. **Extract**: Unzip anywhere on your computer
4. **Run**: Double-click `eyeframe.exe` to start
5. **Enjoy**: Settings window and overlay appear automatically!

**✅ No installation required!** The app is completely portable.

### 👩‍💻 **Option 2: Build from Source**

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

## 🎯 How to Use

### **Quick Start**
1. **Launch Eyeframe** - Double-click the executable
2. **Two windows appear**:
   - **Settings Window** (black-to-blue gradient) - Configure preferences
   - **Overlay Window** (top-right) - Shows all 4 timers automatically

### **Overlay Controls**
- **Minimize (−)**: Hide timer content, show restore (+)
- **Close (✕)**: Completely close the overlay
- **Drag**: Click and drag the title bar to reposition

### **Settings Window**
- **Timer Selection**: Enable/disable specific timers (for future features)
- **Save Settings**: Click "Save Settings" to apply changes
- **Show Overlay**: Click "Show Overlay" if you've closed it

---

## 🏗️ Project Structure

```
eyeframe/
├── 📄 main.js              # Main Electron process & window management
├── 🔐 preload.js           # Secure IPC bridge
├── 📦 package.json         # Project config & dependencies
├── 📁 renderer/            # UI components
│   ├── 🏠 index.html       # Settings window
│   ├── 🎯 overlay.html     # Timer overlay
│   ├── 🎨 style.css        # Complete styling (gradient themes)
│   ├── ⚙️ index.js         # Settings window logic
│   └── ⏱️ overlay.js       # Timer calculations & display
├── 📁 dist/               # Built executables (after npm run package)
├── 📄 README.md           # This file
├── 📄 LICENSE             # ISC License
└── 📄 .gitignore          # Git exclusions
```

---

## 🛠️ Technical Details

### **Built With**
- **[Electron 39.0.0](https://electronjs.org/)** - Cross-platform desktop framework
- **[electron-store](https://github.com/sindresorhus/electron-store)** - Persistent settings storage
- **Vanilla JavaScript** - No frameworks, maximum performance
- **Modern CSS** - Gradients, animations, responsive design

### **Architecture**
- **Multi-Process**: Secure main process + isolated renderer processes  
- **IPC Communication**: Safe message passing between windows
- **Real-Time Updates**: 1-second timer refresh cycle
- **Memory Efficient**: Cleanup on window close, optimized DOM updates

### **Timer Simulation**
```javascript
// Example: Cetus cycle calculation
const cetusCycleTime = baseTime % 9000; // 150 minutes total
const cetusIsDay = cetusCycleTime < 6000; // First 100 minutes = day
```

**Math-based accuracy** ensures timers stay synchronized with actual Warframe cycles.

---

## 🔧 Build Options

### **Development Mode**
```bash
npm start          # Launch with DevTools
npm run dev        # Same as above
```

### **Production Build**
```bash
npm run package    # Creates dist/eyeframe-win32-x64/
npm run build      # Alternative build command
```

**Build Output**: Self-contained folder with executable and all dependencies.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### **Ideas for Contributions**
- 🌐 Add real Warframe API integration
- 🎨 Create new themes and color schemes  
- 📱 Add more timer types (Nightwave, Events, etc.)
- 🔊 Sound notifications for cycle changes
- ⚙️ Advanced positioning and size options

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Digital Extremes** - For creating the amazing Warframe universe
- **Electron Team** - For the fantastic desktop app framework
- **Warframe Community** - For inspiration and feedback
- **Open Source Contributors** - For making this possible

---

## 📞 Support & Feedback

- **🐛 Bug Reports**: [Open an Issue](https://github.com/LourencoReis/EyeFrame/issues)
- **💡 Feature Requests**: [Start a Discussion](https://github.com/LourencoReis/EyeFrame/discussions)
- **📧 Contact**: Create an issue for any questions

---

<div align="center">

**Made with ❤️ for the Warframe community**

⭐ **Star this repo** if Eyeframe helps your Warframe experience! ⭐

</div>