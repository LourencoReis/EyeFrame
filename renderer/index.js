/**
 * Settings Window Renderer Script
 * Handles user interactions in the settings window and communicates with the main process
 */

// DOM elements
let settingsForm;
let statusMessage;
let toggleOverlayBtn;
let resetPositionBtn;
let overlayVisible = true;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Settings window loaded');
    
    // Get DOM elements
    settingsForm = document.getElementById('settingsForm');
    statusMessage = document.getElementById('statusMessage');
    toggleOverlayBtn = document.getElementById('toggleOverlay');
    resetPositionBtn = document.getElementById('resetPosition');
    
    // Load current settings
    await loadSettings();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize overlay button text
    toggleOverlayBtn.innerHTML = overlayVisible ? '👁️ Hide Overlay' : '🚀 Show Overlay';
});

/**
 * Load current settings from storage and update the UI
 */
async function loadSettings() {
    try {
        const settings = await window.electronAPI.getSettings();
        console.log('Loaded settings:', settings);
        
        // Update checkboxes based on saved settings
        document.getElementById('dailyReset').checked = settings.dailyReset !== false;
        document.getElementById('weeklyReset').checked = settings.weeklyReset !== false;
        document.getElementById('cetusCycle').checked = settings.cetusCycle !== false;
        document.getElementById('fortunaCycle').checked = settings.fortunaCycle !== false;
        document.getElementById('arbitrationTimer').checked = settings.arbitrationTimer !== false;
        document.getElementById('voidFissures').checked = settings.voidFissures !== false;
        document.getElementById('circuit').checked = settings.circuit !== false;
        document.getElementById('alerts').checked = settings.alerts !== false;
        document.getElementById('invasions').checked = settings.invasions !== false;
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

/**
 * Set up all event listeners for the settings window
 */
function setupEventListeners() {
    // Form submission
    settingsForm.addEventListener('submit', handleFormSubmit);
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        loadSettings(); // Reset to saved settings
        showStatus('Changes cancelled', 'info');
    });
    
    // Toggle overlay visibility
    toggleOverlayBtn.addEventListener('click', handleToggleOverlay);
    
    // Reset overlay position
    resetPositionBtn.addEventListener('click', handleResetPosition);
    
    // Checkbox change events for live preview (optional)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
}

/**
 * Handle form submission - save settings and update overlay
 */
async function handleFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Collect form data
        const settings = {
            dailyReset: document.getElementById('dailyReset').checked,
            weeklyReset: document.getElementById('weeklyReset').checked,
            cetusCycle: document.getElementById('cetusCycle').checked,
            fortunaCycle: document.getElementById('fortunaCycle').checked,
            arbitrationTimer: document.getElementById('arbitrationTimer').checked,
            voidFissures: document.getElementById('voidFissures').checked,
            circuit: document.getElementById('circuit').checked,
            alerts: document.getElementById('alerts').checked,
            invasions: document.getElementById('invasions').checked
        };
        
        console.log('Saving settings:', settings);
        
        // Save settings via IPC
        const result = await window.electronAPI.saveSettings(settings);
        
        if (result.success) {
            showStatus('Settings saved successfully!', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus('Error saving settings', 'error');
    }
}

/**
 * Handle checkbox changes (for potential live preview)
 */
function handleCheckboxChange(event) {
    const checkbox = event.target;
    console.log(`${checkbox.name} changed to: ${checkbox.checked}`);
    
    // Add visual feedback
    const item = checkbox.closest('.checkbox-item');
    if (checkbox.checked) {
        item.style.borderColor = 'rgba(0, 212, 255, 0.5)';
        item.style.background = 'rgba(0, 212, 255, 0.1)';
    } else {
        item.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        item.style.background = 'rgba(255, 255, 255, 0.05)';
    }
    
    // Reset styles after a short delay
    setTimeout(() => {
        item.style.borderColor = '';
        item.style.background = '';
    }, 300);
}

/**
 * Handle overlay visibility toggle
 */
async function handleToggleOverlay() {
    try {
        overlayVisible = !overlayVisible;
        
        // If we're showing the overlay, also try to restore it from minimize
        if (overlayVisible) {
            // First try to restore from minimize
            if (window.electronAPI.restoreOverlay) {
                await window.electronAPI.restoreOverlay();
            }
            // Then show it
            const result = await window.electronAPI.toggleOverlay(true);
            if (result.success) {
                toggleOverlayBtn.innerHTML = '👁️ Hide Overlay';
                showStatus('Overlay shown', 'success');
            } else {
                throw new Error('Failed to show overlay');
            }
        } else {
            // Hide the overlay
            const result = await window.electronAPI.toggleOverlay(false);
            if (result.success) {
                toggleOverlayBtn.innerHTML = '🚀 Show Overlay';
                showStatus('Overlay hidden', 'success');
            } else {
                throw new Error('Failed to hide overlay');
            }
        }
    } catch (error) {
        console.error('Error toggling overlay:', error);
        showStatus('Error toggling overlay', 'error');
        // Revert the state on error
        overlayVisible = !overlayVisible;
    }
}

/**
 * Handle overlay position reset
 */
async function handleResetPosition() {
    try {
        // Reset to default position (top-right corner)
        const result = await window.electronAPI.setOverlayPosition(window.screen.width - 320, 20);
        
        if (result.success) {
            showStatus('Overlay position reset', 'info');
        } else {
            throw new Error('Failed to reset position');
        }
    } catch (error) {
        console.error('Error resetting position:', error);
        showStatus('Error resetting position', 'error');
    }
}

/**
 * Show status message to user
 * @param {string} message - The message to display
 * @param {string} type - The type of message ('success', 'error', 'info')
 */
function showStatus(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

/**
 * Handle window focus events
 */
window.addEventListener('focus', () => {
    console.log('Settings window focused');
    // Optionally refresh settings when window regains focus
});

window.addEventListener('blur', () => {
    console.log('Settings window blurred');
});