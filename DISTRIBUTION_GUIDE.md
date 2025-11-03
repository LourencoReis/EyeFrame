# 📦 How to Export & Distribute Your Warframe Overlay App

## 🎯 What You Have vs What Others Need

### **Your Development Setup:**
- ✅ Node.js installed
- ✅ npm packages installed
- ✅ Source code files
- ✅ Can run `npm start`

### **What Regular Users Need:**
- ❌ Don't have Node.js
- ❌ Don't want to install development tools
- ❌ Don't understand npm commands
- ✅ Just want a simple .exe file that works

---

## 🚀 Distribution Methods

### **Method 1: Portable Folder (Recommended)**

This is what you already have! Perfect for most users.

#### **📁 What to Share:**
```
📁 warframe-overlay-win32-x64/
├── 📄 warframe-overlay.exe          ← Main executable
├── 📄 Run Warframe Overlay.bat      ← Easy launcher
├── 📁 locales/                      ← Language files
├── 📁 resources/                    ← Your app code
├── 📄 chrome_100_percent.pak        ← Chromium files
├── 📄 ffmpeg.dll                    ← Media support
├── 📄 libEGL.dll                    ← Graphics
└── ... (other DLL files)            ← Dependencies
```

#### **📤 How to Share:**
1. **Zip the folder:**
   ```
   Right-click "warframe-overlay-win32-x64" → Send to → Compressed folder
   ```

2. **Upload somewhere:**
   - **Google Drive** / **OneDrive** / **Dropbox**
   - **GitHub Releases** (free, recommended)
   - **File sharing sites** (WeTransfer, etc.)
   - **Discord** / **Reddit** (if under 25MB)

3. **User instructions:**
   ```
   1. Download and extract the ZIP file
   2. Double-click "warframe-overlay.exe" or "Run Warframe Overlay.bat"
   3. That's it!
   ```

#### **✅ Pros:**
- Works immediately
- No installation required
- Can run from USB stick
- Easy to update (just replace folder)

#### **❌ Cons:**
- Large file size (~150MB)
- Many files (can be confusing)

---

### **Method 2: Single Executable (Advanced)**

Create one single .exe file that contains everything.

#### **🔧 Setup:**
Add this to your `package.json`:

```json
{
  "scripts": {
    "build-single": "electron-builder --win --config.nsis.oneClick=false --config.win.target=portable --config.portable.artifactName=\"WarframeOverlay-${version}.exe\""
  },
  "build": {
    "compression": "maximum",
    "win": {
      "target": {
        "target": "portable",
        "arch": ["x64"]
      }
    },
    "portable": {
      "artifactName": "WarframeOverlay-${version}.exe"
    }
  }
}
```

#### **🏗️ Build Command:**
```bash
npm run build-single
```

#### **✅ Pros:**
- Single file download
- Looks more professional
- Easier to share

#### **❌ Cons:**
- Larger single file (~150MB)
- Slower startup (needs to extract)
- More complex build process

---

### **Method 3: Installer Package**

Create a Windows installer like commercial software.

#### **🔧 Setup:**
Update your `package.json`:

```json
{
  "scripts": {
    "build-installer": "electron-builder --win --config.nsis.oneClick=false"
  },
  "build": {
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Warframe Overlay",
      "uninstallDisplayName": "Warframe Overlay"
    }
  }
}
```

#### **🏗️ Build Command:**
```bash
npm run build-installer
```

#### **✅ Pros:**
- Professional installation experience
- Adds to Start Menu/Desktop
- Proper uninstaller
- Auto-updater support (advanced)

#### **❌ Cons:**
- Requires admin rights to install
- More complex for users
- Larger download

---

## 🌐 Best Distribution Platforms

### **GitHub Releases (Recommended)**

#### **Why GitHub:**
- ✅ Free hosting
- ✅ Unlimited downloads
- ✅ Professional appearance
- ✅ Version management
- ✅ Download statistics

#### **Setup Steps:**
1. **Create GitHub repository:**
   ```
   1. Go to github.com
   2. Click "New repository"
   3. Name: "warframe-overlay"
   4. Public repository
   5. Upload your source code
   ```

2. **Create a release:**
   ```
   1. Go to your repository
   2. Click "Releases" → "Create a new release"
   3. Tag: "v1.0.0"
   4. Title: "Warframe Overlay v1.0.0"
   5. Attach your ZIP file
   6. Write release notes
   ```

#### **Release Notes Example:**
```markdown
# Warframe Overlay v1.0.0

A desktop overlay app for Warframe world timers.

## ✨ Features
- Daily Reset timer
- Cetus Day/Night cycle
- Fortuna Temperature cycle  
- Arbitration rotation
- Resizable overlay window
- Always stays on top

## 📥 Download
Download `warframe-overlay-win32-x64.zip`, extract it, and run `warframe-overlay.exe`

## 🖥️ Requirements
- Windows 10/11 (64-bit)
- No additional software needed

## 🐛 Known Issues
- None currently

## 📝 Changelog
- Initial release
```

### **Alternative Platforms:**

#### **Google Drive:**
```
1. Upload ZIP file to Google Drive
2. Right-click → Share → Anyone with link can view
3. Share the link
```

#### **Discord/Reddit:**
```
1. Upload to file sharing site if >25MB
2. Post download link with screenshots
3. Include clear instructions
```

---

## 📋 User Instructions Template

Create a simple README for users:

```markdown
# 🎮 Warframe Overlay - Installation Guide

## 📥 Download
1. Download `warframe-overlay-win32-x64.zip`
2. Extract the ZIP file to your desired location
   (Desktop, Documents, etc.)

## 🚀 Running the App
**Method 1 (Easy):**
- Double-click `Run Warframe Overlay.bat`

**Method 2 (Direct):**
- Double-click `warframe-overlay.exe`

## 🎯 How to Use
1. **Settings Window** opens automatically
2. Check/uncheck timers you want to see
3. Click "Apply Changes"
4. **Overlay** appears in top-right corner
5. Drag overlay to move it around
6. Use ↕ and ↔ buttons to resize

## 🖥️ System Requirements
- Windows 10 or 11 (64-bit)
- No additional software needed
- ~150MB disk space

## ❓ Troubleshooting
**App won't start:**
- Make sure you extracted the ZIP file
- Run as administrator if needed
- Check Windows Defender isn't blocking it

**Overlay not visible:**
- Click "Show Overlay" in settings
- Check if it's minimized (click -)
- Try "Reset Position" button

## 🆘 Support
Post issues on GitHub or Discord with screenshots
```

---

## 🔧 Advanced Distribution

### **Auto-Updates (Future)**
```javascript
// Add to main.js for automatic updates
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
```

### **Code Signing (Professional)**
```bash
# Sign your executable (requires certificate)
electron-builder --win --publish=never --config.win.certificateFile=cert.p12
```

### **Multi-Platform**
```bash
# Build for different platforms
npm run package-win    # Windows
npm run package-mac    # macOS  
npm run package-linux  # Linux
```

---

## 🎯 Recommended Distribution Strategy

### **For Most Users:**
1. ✅ Use **Method 1** (Portable Folder)
2. ✅ Host on **GitHub Releases**
3. ✅ Include clear **user instructions**
4. ✅ Add **screenshots** showing the app

### **For Wide Distribution:**
1. 🚀 Create **GitHub repository**
2. 📝 Write detailed **README.md**
3. 📸 Add **screenshots** and **GIFs**
4. 📦 Release **ZIP file** with version numbers
5. 📢 Share on **Warframe communities**

### **File Naming:**
```
warframe-overlay-v1.0.0-windows-x64.zip     ← Clear version info
WarframeOverlay-Setup-1.0.0.exe             ← If using installer
```

Your app is ready to share with the Warframe community! 🎊

The portable folder approach (`dist/warframe-overlay-win32-x64/`) is perfect for most users - it just works without any installation hassle.