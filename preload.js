const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script that exposes safe APIs to the renderer processes
 * This acts as a bridge between the main process and renderer processes
 * while maintaining security through context isolation
 */

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    /**
     * Settings related APIs
     */
    
    // Get current settings from storage
    getSettings: () => ipcRenderer.invoke('get-settings'),
    
    // Save settings to storage and notify overlay
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    
    /**
     * Overlay control APIs
     */
    
    // Set overlay window position
    setOverlayPosition: (x, y) => ipcRenderer.invoke('set-overlay-position', x, y),
    
    // Toggle overlay visibility
    toggleOverlay: (visible) => ipcRenderer.invoke('toggle-overlay', visible),
    
    // Get overlay window bounds
    getOverlayBounds: () => ipcRenderer.invoke('get-overlay-bounds'),
    
    /**
     * Event listeners for overlay updates
     */
    
    // Listen for settings updates (used by overlay window)
    onSettingsUpdated: (callback) => {
        ipcRenderer.on('settings-updated', (event, settings) => callback(settings));
    },
    
    // Remove settings update listener
    removeSettingsListener: () => {
        ipcRenderer.removeAllListeners('settings-updated');
    },
    
    // Resize overlay window based on timer count
    resizeOverlay: (timerCount) => ipcRenderer.invoke('resize-overlay', timerCount),
    
    // Set overlay size manually
    setOverlaySize: (width, height) => ipcRenderer.invoke('set-overlay-size', { width, height }),
    
    /**
     * Timer data APIs (for future use with real API)
     */
    
    // Placeholder for future timer data fetching
    getTimerData: () => {
        // This will be replaced with actual API calls later
        return Promise.resolve({
            dailyReset: { 
                name: 'Daily Reset', 
                timeLeft: '2h 34m', 
                status: 'Active' 
            },
            cetusCycle: { 
                name: 'Cetus Cycle', 
                timeLeft: '1h 15m', 
                status: 'Day',
                description: 'Day (1h 15m left)'
            },
            fortunaCycle: { 
                name: 'Fortuna Cycle', 
                timeLeft: '45m', 
                status: 'Warm',
                description: 'Warm (45m left)'
            }
        });
    }
});

console.log('Preload script loaded successfully!');