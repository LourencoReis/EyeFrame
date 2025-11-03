/**
 * Overlay Window Renderer Script
 * Handles the display and updating of timer information in the overlay
 */

// Timer update interval (in milliseconds)
const UPDATE_INTERVAL = 1000; // Update every second

// DOM elements
let overlayContent;
let noTimersMessage;
let loadingIndicator;
let minimizeBtn;

// Current settings and timer data
let currentSettings = {};
let timerData = {};
let updateTimer;
let isMinimized = false;
let lastTimerCount = -1; // Track previous timer count to avoid unnecessary resizing
let expandBtn;
let collapseBtn;
let isExpanded = false;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Overlay window loaded');
    
    // Get DOM elements
    overlayContent = document.getElementById('overlayContent');
    noTimersMessage = document.getElementById('noTimersMessage');
    loadingIndicator = document.getElementById('loadingIndicator');
    minimizeBtn = document.getElementById('minimizeBtn');
    expandBtn = document.getElementById('expandBtn');
    collapseBtn = document.getElementById('collapseBtn');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial settings and start timer updates
    await loadInitialData();
    startTimerUpdates();
});

/**
 * Set up event listeners for the overlay window
 */
function setupEventListeners() {
    // Listen for settings updates from main process
    window.electronAPI.onSettingsUpdated((settings) => {
        console.log('Settings updated in overlay:', settings);
        currentSettings = settings;
        updateTimerDisplay();
    });
    
    // Minimize button
    minimizeBtn.addEventListener('click', toggleMinimize);
    
    // Expand/Collapse buttons
    expandBtn.addEventListener('click', expandOverlay);
    collapseBtn.addEventListener('click', collapseOverlay);
    
    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Handle window unload
    window.addEventListener('beforeunload', () => {
        if (updateTimer) {
            clearInterval(updateTimer);
        }
        window.electronAPI.removeSettingsListener();
    });
}

/**
 * Load initial settings and timer data
 */
async function loadInitialData() {
    try {
        showLoading(true);
        
        // Load current settings
        currentSettings = await window.electronAPI.getSettings();
        console.log('Initial settings loaded:', currentSettings);
        
        // Load initial timer data
        await updateTimerData();
        
        // Update display
        updateTimerDisplay();
        
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showLoading(false);
    }
}

/**
 * Start the timer update loop
 */
function startTimerUpdates() {
    // Update immediately
    updateTimerData();
    
    // Set up interval for regular updates
    updateTimer = setInterval(async () => {
        await updateTimerData();
        updateTimerDisplay();
    }, UPDATE_INTERVAL);
    
    console.log('Timer updates started');
}

/**
 * Update timer data from API (currently using mock data)
 */
async function updateTimerData() {
    try {
        // Get timer data (currently mock data, will be replaced with real API)
        timerData = await window.electronAPI.getTimerData();
        
        // Add some time simulation for demo purposes
        simulateTimeProgression();
        
    } catch (error) {
        console.error('Error updating timer data:', error);
    }
}

/**
 * Simulate time progression for demo purposes
 * This will be removed when real API integration is added
 */
function simulateTimeProgression() {
    const now = Date.now();
    const baseTime = Math.floor(now / 1000); // Current time in seconds
    
    // Simulate different timer states based on current time
    const timeOffsets = {
        dailyReset: (baseTime % 86400), // 24 hour cycle
        cetusCycle: (baseTime % 9000), // 150 minute cycle (100m day + 50m night)
        fortunaCycle: (baseTime % 1600), // ~26 minute cycle
        arbitrationTimer: (baseTime % 3600) // 1 hour cycle
    };
    
    // Update daily reset
    const dailyResetRemaining = 86400 - timeOffsets.dailyReset;
    timerData.dailyReset = {
        name: 'Daily Reset',
        timeLeft: formatTime(dailyResetRemaining),
        status: 'Active',
        description: `Resets in ${formatTime(dailyResetRemaining)}`
    };
    
    // Update Cetus cycle (100m day, 50m night)
    const cetusIsDay = timeOffsets.cetusCycle < 6000; // First 100 minutes
    const cetusRemaining = cetusIsDay ? 
        (6000 - timeOffsets.cetusCycle) : 
        (9000 - timeOffsets.cetusCycle);
    
    timerData.cetusCycle = {
        name: 'Cetus Cycle',
        timeLeft: formatTime(cetusRemaining),
        status: cetusIsDay ? 'Day' : 'Night',
        description: `${cetusIsDay ? 'Day' : 'Night'} (${formatTime(cetusRemaining)} left)`
    };
    
    // Update Fortuna cycle
    const fortunaIsWarm = timeOffsets.fortunaCycle < 800; // First ~13 minutes
    const fortunaRemaining = fortunaIsWarm ? 
        (800 - timeOffsets.fortunaCycle) : 
        (1600 - timeOffsets.fortunaCycle);
    
    timerData.fortunaCycle = {
        name: 'Fortuna Cycle',
        timeLeft: formatTime(fortunaRemaining),
        status: fortunaIsWarm ? 'Warm' : 'Cold',
        description: `${fortunaIsWarm ? 'Warm' : 'Cold'} (${formatTime(fortunaRemaining)} left)`
    };
    
    // Update Arbitration cycle
    const arbitrationRemaining = 3600 - timeOffsets.arbitrationTimer;
    timerData.arbitrationTimer = {
        name: 'Arbitration',
        timeLeft: formatTime(arbitrationRemaining),
        status: 'Active',
        description: `Ends in ${formatTime(arbitrationRemaining)}`
    };
}

/**
 * Update the timer display based on current settings and data
 */
function updateTimerDisplay() {
    // Clear existing content
    const timerItems = overlayContent.querySelectorAll('.timer-item');
    timerItems.forEach(item => item.style.display = 'none');
    
    let visibleTimers = 0;
    
    // Show/hide timers based on settings
    if (currentSettings.dailyReset && timerData.dailyReset) {
        updateTimerItem('dailyResetTimer', timerData.dailyReset);
        visibleTimers++;
    }
    
    if (currentSettings.cetusCycle && timerData.cetusCycle) {
        updateTimerItem('cetusTimer', timerData.cetusCycle);
        visibleTimers++;
    }
    
    if (currentSettings.fortunaCycle && timerData.fortunaCycle) {
        updateTimerItem('fortunaTimer', timerData.fortunaCycle);
        visibleTimers++;
    }
    
    if (currentSettings.arbitrationTimer && timerData.arbitrationTimer) {
        updateTimerItem('arbitrationTimer', timerData.arbitrationTimer);
        visibleTimers++;
    }
    
    // Show/hide no timers message
    noTimersMessage.style.display = visibleTimers === 0 ? 'block' : 'none';
    
    // Resize overlay window only if timer count changed
    if (visibleTimers !== lastTimerCount) {
        resizeOverlayWindow(visibleTimers);
        lastTimerCount = visibleTimers;
    }
}

/**
 * Resize overlay window based on number of visible timers
 * @param {number} timerCount - Number of visible timers
 */
async function resizeOverlayWindow(timerCount) {
    try {
        const result = await window.electronAPI.resizeOverlay(timerCount);
        if (result.success) {
            console.log(`Overlay resized for ${timerCount} timers`);
        }
    } catch (error) {
        console.error('Error resizing overlay:', error);
    }
}

/**
 * Update a specific timer item
 * @param {string} itemId - The ID of the timer item element
 * @param {object} data - The timer data
 */
function updateTimerItem(itemId, data) {
    const item = document.getElementById(itemId);
    if (!item) return;
    
    item.style.display = 'block';
    
    // Update timer name
    const nameElement = item.querySelector('.timer-name');
    if (nameElement) nameElement.textContent = data.name;
    
    // Update timer status
    const statusElement = item.querySelector('.timer-status');
    if (statusElement) {
        statusElement.textContent = data.status;
        
        // Update status class for styling
        statusElement.className = 'timer-status';
        if (data.status.toLowerCase() === 'day') {
            statusElement.classList.add('day');
        } else if (data.status.toLowerCase() === 'night') {
            statusElement.classList.add('night');
        } else if (data.status.toLowerCase() === 'warm') {
            statusElement.classList.add('warm');
        } else if (data.status.toLowerCase() === 'cold') {
            statusElement.classList.add('cold');
        }
    }
    
    // Update countdown
    const countdownElement = item.querySelector('.timer-countdown');
    if (countdownElement) {
        countdownElement.textContent = `${data.timeLeft} remaining`;
    }
}

/**
 * Format seconds into readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Toggle minimize state of overlay
 */
function toggleMinimize() {
    isMinimized = !isMinimized;
    
    if (isMinimized) {
        overlayContent.style.display = 'none';
        minimizeBtn.textContent = '+';
        minimizeBtn.title = 'Expand';
    } else {
        overlayContent.style.display = 'block';
        minimizeBtn.textContent = '−';
        minimizeBtn.title = 'Minimize';
    }
}

/**
 * Show/hide loading indicator
 * @param {boolean} show - Whether to show the loading indicator
 */
function showLoading(show) {
    loadingIndicator.style.display = show ? 'flex' : 'none';
    overlayContent.style.display = show ? 'none' : 'block';
}

/**
 * Handle overlay window focus/blur events
 */
window.addEventListener('focus', () => {
    console.log('Overlay window focused');
});

/**
 * Expand the overlay to show more timers
 */
async function expandOverlay() {
    try {
        const currentTimerCount = Object.values(currentSettings).filter(Boolean).length;
        const expandedHeight = Math.max(300, currentTimerCount * 80 + 100); // More space per timer
        
        await window.electronAPI.setOverlaySize(300, expandedHeight);
        isExpanded = true;
        expandBtn.style.opacity = '0.5'; // Show it's active
        collapseBtn.style.opacity = '1';
        
        console.log('Overlay expanded');
    } catch (error) {
        console.error('Error expanding overlay:', error);
    }
}

/**
 * Collapse the overlay to compact view
 */
async function collapseOverlay() {
    try {
        const currentTimerCount = Object.values(currentSettings).filter(Boolean).length;
        const compactHeight = Math.max(150, currentTimerCount * 60 + 80); // Less space per timer
        
        await window.electronAPI.setOverlaySize(300, compactHeight);
        isExpanded = false;
        expandBtn.style.opacity = '1';
        collapseBtn.style.opacity = '0.5'; // Show it's active
        
        console.log('Overlay collapsed');
    } catch (error) {
        console.error('Error collapsing overlay:', error);
    }
}

window.addEventListener('blur', () => {
    console.log('Overlay window blurred');
});

// Cleanup on window close
window.addEventListener('beforeunload', () => {
    console.log('Overlay window closing');
    if (updateTimer) {
        clearInterval(updateTimer);
    }
});