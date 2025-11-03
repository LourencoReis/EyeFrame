const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Initialize electron-store for persistent settings
const store = new Store();

// Keep references to windows to prevent garbage collection
let settingsWindow;
let overlayWindow;

/**
 * Create the settings window where users can configure which timers to display
 */
function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'), // Optional: add an icon later
        title: 'Eyeframe Settings',
        resizable: false,
        maximizable: false,
        autoHideMenuBar: true, // Hide the menu bar (File, Edit, View, etc.)
        menuBarVisible: false  // Ensure menu bar is not visible
    });

    settingsWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

    // Optional: Open DevTools in development
    if (process.argv.includes('--dev')) {
        settingsWindow.webContents.openDevTools();
    }

    // Handle window closed
    settingsWindow.on('closed', () => {
        settingsWindow = null;
    });
}

/**
 * Create the transparent overlay window that displays the timers
 */
function createOverlayWindow() {
    // Get primary display dimensions
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    overlayWindow = new BrowserWindow({
        width: 300,
        height: 280,
        minWidth: 250,
        minHeight: 120,
        maxWidth: 500,
        maxHeight: 800,
        x: width - 320, // Position near top-right corner
        y: 20,
        frame: false,
        alwaysOnTop: true,
        transparent: true,
        skipTaskbar: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    overlayWindow.loadFile(path.join(__dirname, 'renderer', 'overlay.html'));

    // Make window draggable
    overlayWindow.setIgnoreMouseEvents(false);

    // Optional: Open DevTools in development
    if (process.argv.includes('--dev')) {
        overlayWindow.webContents.openDevTools();
    }

    // Handle window closed
    overlayWindow.on('closed', () => {
        overlayWindow = null;
    });
}

/**
 * Initialize the application
 */
app.whenReady().then(() => {
    createSettingsWindow();
    createOverlayWindow();

    // Handle app activation (macOS specific, but good practice)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createSettingsWindow();
            createOverlayWindow();
        }
    });
});

/**
 * Handle all windows closed
 */
app.on('window-all-closed', () => {
    // On Windows and Linux, quit when all windows are closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * IPC Handlers for communication between renderer processes
 */

// Handle settings retrieval from renderer
ipcMain.handle('get-settings', () => {
    return store.get('timerSettings', {
        dailyReset: true,
        cetusCycle: true,
        fortunaCycle: true,
        arbitrationTimer: true
    });
});

// Handle settings update from settings window
ipcMain.handle('save-settings', (event, settings) => {
    console.log('Saving settings:', settings);
    store.set('timerSettings', settings);
    
    // Send updated settings to overlay window
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.webContents.send('settings-updated', settings);
    }
    
    return { success: true };
});

// Handle overlay window positioning requests
ipcMain.handle('set-overlay-position', (event, x, y) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.setPosition(x, y);
        return { success: true };
    }
    return { success: false };
});

// Handle overlay window visibility toggle
ipcMain.handle('toggle-overlay', (event, visible) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        if (visible) {
            overlayWindow.show();
        } else {
            overlayWindow.hide();
        }
        return { success: true };
    }
    return { success: false };
});

// Handle getting overlay window bounds
ipcMain.handle('get-overlay-bounds', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        return overlayWindow.getBounds();
    }
    return null;
});

// Handle overlay window resizing based on timer count
ipcMain.handle('resize-overlay', (event, timerCount) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
        // Calculate height based on number of timers
        const headerHeight = 35; // Header height
        const timerItemHeight = 65; // Each timer item height
        const padding = 30; // Top and bottom padding
        const minHeight = 120; // Minimum height when no timers
        
        let newHeight;
        if (timerCount === 0) {
            newHeight = minHeight; // Show "no timers" message
        } else {
            newHeight = headerHeight + (timerCount * timerItemHeight) + padding;
        }
        
        // Get current position to maintain it
        const currentBounds = overlayWindow.getBounds();
        
        // Resize the window
        overlayWindow.setSize(currentBounds.width, newHeight);
        
        console.log(`Overlay resized for ${timerCount} timers: height = ${newHeight}`);
        return { success: true, height: newHeight };
    }
    return { success: false };
});

// Handle manual overlay size setting
ipcMain.handle('set-overlay-size', (event, { width, height }) => {
    try {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.setSize(width, height);
            return { success: true };
        }
        return { success: false, error: 'Overlay window not available' };
    } catch (error) {
        console.error('Error setting overlay size:', error);
        return { success: false, error: error.message };
    }
});

// Handle overlay hide
ipcMain.handle('hide-overlay', () => {
    try {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
            return { success: true };
        }
        return { success: false, error: 'Overlay window not available' };
    } catch (error) {
        console.error('Error hiding overlay:', error);
        return { success: false, error: error.message };
    }
});

// Handle overlay close
ipcMain.handle('close-overlay', () => {
    try {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.close();
            return { success: true };
        }
        return { success: false, error: 'Overlay window not available' };
    } catch (error) {
        console.error('Error closing overlay:', error);
        return { success: false, error: error.message };
    }
});

// Handle overlay position reset
ipcMain.handle('reset-overlay-position', () => {
    try {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
            const { screen } = require('electron');
            const primaryDisplay = screen.getPrimaryDisplay();
            const { width, height } = primaryDisplay.workAreaSize;
            
            // Position in top-right corner
            const x = width - 320; // 320px from right edge
            const y = 50; // 50px from top
            
            overlayWindow.setPosition(x, y);
            return { success: true };
        }
        return { success: false, error: 'Overlay window not available' };
    } catch (error) {
        console.error('Error resetting overlay position:', error);
        return { success: false, error: error.message };
    }
});

console.log('Eyeframe Overlay App started successfully!');