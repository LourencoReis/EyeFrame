// EYEFRAME - Horizontal Overlay JavaScript
let updateInterval;
let warframeAPI;

// Initialize Warframe API
function initializeWarframeAPI() {
    warframeAPI = new WarframeAPI();
    console.log('Warframe API initialized');
}

// Initialize overlay
async function initializeOverlay() {
    console.log('Starting horizontal overlay initialization...');
    
    initializeWarframeAPI();
    setupEventListeners();
    await updateAllMissions();
    updateInterval = setInterval(() => updateAllMissions(), 30000); // Update every 30 seconds
    
    console.log('Horizontal Eyeframe overlay initialized successfully');
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    const minimizeBtn = document.getElementById('minimizeBtn');
    const closeBtn = document.getElementById('closeBtn');
    const overlayHeader = document.getElementById('overlayHeader');

    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', minimizeOverlay);
        console.log('Minimize button listener added');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeOverlay);
        console.log('Close button listener added');
    }

    // Make window draggable
    if (overlayHeader) {
        let isDragging = false;
        let startX, startY;

        overlayHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            overlayHeader.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            if (window.electronAPI && window.electronAPI.moveWindow) {
                window.electronAPI.moveWindow(deltaX, deltaY);
            }
            
            startX = e.clientX;
            startY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            overlayHeader.style.cursor = 'grab';
        });

        overlayHeader.style.cursor = 'grab';
        console.log('Dragging functionality added');
    }
}

// Update all missions
async function updateAllMissions() {
    console.log('updateAllMissions called at:', new Date().toLocaleTimeString());
    try {
        await updateResetTimers();
        await updateWorldCycles();
        await updateArbitration();
        await updateArchonHunt();
        await updateSortie();
        await updateFissureCounts();
        await updateAlerts();
        await updateEvents();
        await updateVoidTrader();
    } catch (error) {
        console.error('Error updating missions:', error);
    }
}

// Update reset timers
function updateResetTimers() {
    // Daily reset
    const now = new Date();
    const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const timeRemaining = nextReset.getTime() - Date.now();
    
    const dailyCount = document.getElementById('dailyResetCount');
    if (dailyCount) {
        dailyCount.textContent = formatShortTime(timeRemaining);
    }
    
    // Weekly reset
    const currentDay = now.getUTCDay();
    let daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
    if (currentDay === 1 && now.getUTCHours() < 0) daysUntilMonday = 0;
    
    const nextWeeklyReset = new Date(Date.UTC(
        now.getUTCFullYear(), 
        now.getUTCMonth(), 
        now.getUTCDate() + daysUntilMonday, 
        0, 0, 0, 0
    ));
    
    const weeklyTimeRemaining = nextWeeklyReset.getTime() - Date.now();
    const weeklyCount = document.getElementById('weeklyResetCount');
    if (weeklyCount) {
        weeklyCount.textContent = formatShortTime(weeklyTimeRemaining);
    }
}

// Update world cycles
async function updateWorldCycles() {
    try {
        const worldState = await warframeAPI.getWorldCycles();
        
        // Update Cetus
        const cetusItem = document.getElementById('cetusItem');
        const cetusIcon = document.querySelector('.cetus-icon');
        const cetusCount = document.getElementById('cetusCount');
        
        if (worldState && worldState.cetusCycle && cetusIcon && cetusCount) {
            const timeRemaining = new Date(worldState.cetusCycle.expiry) - Date.now();
            cetusCount.textContent = formatShortTime(timeRemaining);
            
            cetusIcon.classList.remove('day', 'night');
            cetusIcon.classList.add(worldState.cetusCycle.isDay ? 'day' : 'night');
            cetusIcon.textContent = worldState.cetusCycle.isDay ? '🌅' : '🌙';
        }
        
        // Update Fortuna
        const fortunaIcon = document.querySelector('.fortuna-icon');
        const fortunaCount = document.getElementById('fortunaCount');
        
        if (worldState && worldState.vallisCycle && fortunaIcon && fortunaCount) {
            const timeRemaining = new Date(worldState.vallisCycle.expiry) - Date.now();
            fortunaCount.textContent = formatShortTime(timeRemaining);
            
            fortunaIcon.classList.remove('warm', 'cold');
            fortunaIcon.classList.add(worldState.vallisCycle.isWarm ? 'warm' : 'cold');
            fortunaIcon.textContent = worldState.vallisCycle.isWarm ? '🔥' : '❄️';
        }
        
    } catch (error) {
        console.error('Error updating world cycles:', error);
    }
}

// Update arbitration
async function updateArbitration() {
    try {
        const arbitration = await warframeAPI.getArbitration();
        const arbitrationCount = document.getElementById('arbitrationCount');
        
        if (arbitration && arbitrationCount) {
            const timeRemaining = new Date(arbitration.expiry) - Date.now();
            arbitrationCount.textContent = formatShortTime(timeRemaining);
        }
    } catch (error) {
        console.error('Error updating arbitration:', error);
    }
}

// Update archon hunt
async function updateArchonHunt() {
    try {
        const archonHunt = await warframeAPI.getArchonHunt();
        const archonCount = document.getElementById('archonHuntCount');
        
        if (archonHunt && archonCount) {
            const timeRemaining = new Date(archonHunt.expiry) - Date.now();
            archonCount.textContent = formatShortTime(timeRemaining);
        }
    } catch (error) {
        console.error('Error updating archon hunt:', error);
    }
}

// Update sortie
async function updateSortie() {
    try {
        const sortie = await warframeAPI.getSortie();
        const sortieCount = document.getElementById('sortieCount');
        
        if (sortie && sortieCount) {
            const timeRemaining = new Date(sortie.expiry) - Date.now();
            sortieCount.textContent = formatShortTime(timeRemaining);
        }
    } catch (error) {
        console.error('Error updating sortie:', error);
    }
}

// Update fissure counts
async function updateFissureCounts() {
    try {
        const fissures = await warframeAPI.getFissures();
        
        // Count fissures by tier
        const counts = {
            lith: 0,
            meso: 0,
            neo: 0,
            axi: 0,
            requiem: 0
        };
        
        if (fissures && Array.isArray(fissures)) {
            fissures.forEach(fissure => {
                const tier = (fissure.tier || '').toLowerCase();
                if (tier.includes('lith')) counts.lith++;
                else if (tier.includes('meso')) counts.meso++;
                else if (tier.includes('neo')) counts.neo++;
                else if (tier.includes('axi')) counts.axi++;
                else if (tier.includes('requiem')) counts.requiem++;
            });
        }
        
        // Update counts
        const lithCount = document.getElementById('lithCount');
        const mesoCount = document.getElementById('mesoCount');
        const neoCount = document.getElementById('neoCount');
        const axiCount = document.getElementById('axiCount');
        const requiemCount = document.getElementById('requiemCount');
        
        if (lithCount) lithCount.textContent = counts.lith;
        if (mesoCount) mesoCount.textContent = counts.meso;
        if (neoCount) neoCount.textContent = counts.neo;
        if (axiCount) axiCount.textContent = counts.axi;
        if (requiemCount) requiemCount.textContent = counts.requiem;
        
    } catch (error) {
        console.error('Error updating fissure counts:', error);
    }
}

// Update alerts
async function updateAlerts() {
    try {
        const alerts = await warframeAPI.getAlerts();
        const alertsCount = document.getElementById('alertsCount');
        
        if (alertsCount) {
            alertsCount.textContent = alerts ? alerts.length : 0;
        }
    } catch (error) {
        console.error('Error updating alerts:', error);
    }
}

// Update events
async function updateEvents() {
    try {
        const events = await warframeAPI.getEvents();
        const eventsCount = document.getElementById('eventsCount');
        
        if (eventsCount) {
            eventsCount.textContent = events ? events.length : 0;
        }
    } catch (error) {
        console.error('Error updating events:', error);
    }
}

// Update void trader
async function updateVoidTrader() {
    try {
        const voidTrader = await warframeAPI.getVoidTrader();
        const voidTraderCount = document.getElementById('voidTraderCount');
        
        if (voidTrader && voidTraderCount) {
            if (voidTrader.active) {
                const timeRemaining = new Date(voidTrader.expiry) - Date.now();
                voidTraderCount.textContent = formatShortTime(timeRemaining);
            } else {
                const timeToArrival = new Date(voidTrader.activation) - Date.now();
                voidTraderCount.textContent = formatShortTime(timeToArrival);
            }
        }
    } catch (error) {
        console.error('Error updating void trader:', error);
    }
}

// Format time function (short format)
function formatShortTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (days > 0) {
        return `${days}d`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${Math.max(0, totalSeconds)}s`;
    }
}

// Minimize overlay
function minimizeOverlay() {
    console.log('minimizeOverlay called');
    if (window.electronAPI && window.electronAPI.minimizeOverlay) {
        console.log('Calling electronAPI.minimizeOverlay');
        window.electronAPI.minimizeOverlay();
    } else {
        console.error('minimizeOverlay API not available');
    }
}

// Close overlay
function closeOverlay() {
    console.log('closeOverlay called');
    if (window.electronAPI && window.electronAPI.closeOverlay) {
        console.log('Calling electronAPI.closeOverlay');
        window.electronAPI.closeOverlay();
    } else {
        console.error('closeOverlay API not available');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
    initializeOverlay();
}

// Handle window cleanup
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});