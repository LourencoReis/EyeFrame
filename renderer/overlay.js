// EYEFRAME - Enhanced Overlay JavaScript
let updateInterval;
let minimized = false;
let warframeAPI;
let circuitRotations = null;
let circuitRefreshTimeout = null;
let directorTheme = false;
let activeDirectorTab = null;

// Initialize Warframe API
function initializeWarframeAPI() {
    warframeAPI = new WarframeAPI();
    console.log('Warframe API initialized');
}

// Load circuit rotation data
async function loadCircuitRotations() {
    try {
        const response = await fetch('../data/circuit-rotations.json');
        circuitRotations = await response.json();
        console.log('Circuit rotations loaded successfully');
        return circuitRotations;
    } catch (error) {
        console.error('Error loading circuit rotations:', error);
        return null;
    }
}

// Calculate current circuit week for normal (1-12) or steel path (1-9)
function getCurrentCircuitWeek(circuitType = 'normal') {
    if (!circuitRotations) return 1;
    
    const now = new Date();
    
    if (circuitType === 'steel') {
        const startDate = new Date(circuitRotations.steelPathStartDate);
        const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        const currentWeek = (weeksSinceStart % circuitRotations.steelPathCircuit.cycleWeeks) + 1;
        return currentWeek;
    } else {
        const startDate = new Date(circuitRotations.normalCircuitStartDate);
        const weeksSinceStart = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
        const currentWeek = (weeksSinceStart % circuitRotations.normalCircuit.cycleWeeks) + 1;
        return currentWeek;
    }
}

// Get next Monday 00:00 UTC
function getNextCircuitReset() {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay);
    
    const nextMonday = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + daysUntilMonday,
        0, 0, 0, 0
    ));
    
    return nextMonday;
}

// Current active tabs
let activeTab = {
    fissures: 'normal',
    circuit: 'normal'
};

// Initialize overlay
async function initializeOverlay() {
    console.log('Starting overlay initialization...');
    
    initializeWarframeAPI();
    await loadCircuitRotations();
    setupEventListeners();
    await loadInitialSettings();
    await updateAllTimers();
    updateInterval = setInterval(() => updateAllTimers(), 1000); // Update every second for live countdown
    initializeTabSwitching();
    
    console.log('Enhanced Eyeframe overlay initialized successfully');
}

// Load initial settings and apply them
async function loadInitialSettings() {
    try {
        console.log('Loading initial settings...');
        const settings = await window.electronAPI.getSettings();
        console.log('Initial settings loaded:', settings);
        
        // Apply theme setting
        if (settings.directorTheme !== undefined) {
            directorTheme = settings.directorTheme;
            if (directorTheme) {
                // Give DOM time to load before converting
                setTimeout(() => applyTheme(), 100);
            }
        }
        
        // Apply settings to timer visibility
        const timerElements = {
            dailyResetTimer: document.getElementById('dailyResetTimer'),
            weeklyResetTimer: document.getElementById('weeklyResetTimer'),
            cetusTimer: document.getElementById('cetusTimer'),
            fortunaTimer: document.getElementById('fortunaTimer'),
            deimosTimer: document.getElementById('deimosTimer'),
            arbitrationTimer: document.getElementById('arbitrationTimer'),
            baroTimer: document.getElementById('baroTimer')
        };
        
        console.log('Timer elements found:', Object.keys(timerElements).map(key => ({ [key]: !!timerElements[key] })));
        
        // Show/hide timers based on settings
        if (timerElements.dailyResetTimer) {
            timerElements.dailyResetTimer.style.display = settings.dailyReset ? 'flex' : 'none';
            console.log(`Daily Reset timer: ${settings.dailyReset ? 'shown' : 'hidden'}`);
        }
        if (timerElements.weeklyResetTimer) {
            timerElements.weeklyResetTimer.style.display = settings.weeklyReset ? 'flex' : 'none';
            console.log(`Weekly Reset timer: ${settings.weeklyReset ? 'shown' : 'hidden'}`);
        }
        if (timerElements.cetusTimer) {
            timerElements.cetusTimer.style.display = settings.cetusCycle ? 'flex' : 'none';
            console.log(`Cetus timer: ${settings.cetusCycle ? 'shown' : 'hidden'}`);
        }
        if (timerElements.fortunaTimer) {
            timerElements.fortunaTimer.style.display = settings.fortunaCycle ? 'flex' : 'none';
            console.log(`Fortuna timer: ${settings.fortunaCycle ? 'shown' : 'hidden'}`);
        }
        if (timerElements.deimosTimer) {
            timerElements.deimosTimer.style.display = settings.deimosCycle !== false ? 'flex' : 'none';
            console.log(`Deimos timer: ${settings.deimosCycle !== false ? 'shown' : 'hidden'}`);
        }
        if (timerElements.arbitrationTimer) {
            timerElements.arbitrationTimer.style.display = settings.arbitrationTimer ? 'flex' : 'none';
            console.log(`Arbitration timer: ${settings.arbitrationTimer ? 'shown' : 'hidden'}`);
        }
        if (timerElements.baroTimer) {
            timerElements.baroTimer.style.display = settings.baroTimer !== false ? 'flex' : 'none';
            console.log(`Baro Ki'Teer timer: ${settings.baroTimer !== false ? 'shown' : 'hidden'}`);
        }

        // Show/hide new sections based on settings
        const fissuresSection = document.getElementById('fissuresSection');
        if (fissuresSection) {
            fissuresSection.style.display = settings.voidFissures !== false ? 'block' : 'none';
            console.log(`Void Fissures: ${settings.voidFissures !== false ? 'shown' : 'hidden'}`);
        }

        const circuitSection = document.getElementById('circuitSection');
        if (circuitSection) {
            circuitSection.style.display = settings.circuit !== false ? 'block' : 'none';
            console.log(`Duviri Circuit: ${settings.circuit !== false ? 'shown' : 'hidden'}`);
        }

        // Always show alerts section since it contains arbitration
        const alertsSection = document.getElementById('alertsSection');
        if (alertsSection) {
            alertsSection.style.display = 'block';
            console.log('Alerts section: shown (contains arbitration)');
        }

        const invasionsSection = document.getElementById('invasionsSection');
        if (invasionsSection) {
            invasionsSection.style.display = settings.invasions !== false ? 'block' : 'none';
            console.log(`Invasions: ${settings.invasions !== false ? 'shown' : 'hidden'}`);
        }
    } catch (error) {
        console.error('Error loading initial settings:', error);
    }
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
        let lastX, lastY;

        overlayHeader.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.screenX;
            startY = e.screenY;
            lastX = e.screenX;
            lastY = e.screenY;
            overlayHeader.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.screenX - lastX;
            const deltaY = e.screenY - lastY;
            
            // Only move if there's actual movement
            if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
                if (window.electronAPI && window.electronAPI.moveWindow) {
                    window.electronAPI.moveWindow(deltaX, deltaY);
                }
                lastX = e.screenX;
                lastY = e.screenY;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                overlayHeader.style.cursor = 'grab';
            }
        });

        // Handle mouse leave to stop dragging
        document.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                overlayHeader.style.cursor = 'grab';
            }
        });

        overlayHeader.style.cursor = 'grab';
        overlayHeader.style.userSelect = 'none'; // Prevent text selection during drag
        console.log('Dragging functionality added');
    }
}

// Initialize tab switching functionality
function initializeTabSwitching() {
    // Fissure tabs
    const fissureTabs = document.querySelectorAll('.fissure-tabs .tab');
    fissureTabs.forEach(tab => {
        tab.addEventListener('click', () => switchFissureTab(tab.dataset.tab));
    });

    // Circuit tabs
    const circuitTabs = document.querySelectorAll('.circuit-tabs .tab');
    circuitTabs.forEach(tab => {
        tab.addEventListener('click', () => switchCircuitTab(tab.dataset.tab));
    });
}

// Switch fissure tabs
function switchFissureTab(tabName) {
    const tabType = tabName.replace('-fissures', '');
    activeTab.fissures = tabType;

    // Update tab appearance
    document.querySelectorAll('.fissure-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) selectedTab.classList.add('active');

    // Show/hide content
    const normalFissures = document.getElementById('normalFissures');
    const steelFissures = document.getElementById('steelFissures');
    if (normalFissures) normalFissures.style.display = tabType === 'normal' ? 'block' : 'none';
    if (steelFissures) steelFissures.style.display = tabType === 'steel' ? 'block' : 'none';

    updateFissureTimers();
}

// Switch circuit tabs
function switchCircuitTab(tabName) {
    const tabType = tabName.replace('-circuit', '');
    activeTab.circuit = tabType;

    // Update tab appearance
    document.querySelectorAll('.circuit-tabs .tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide content
    document.getElementById('normalCircuit').style.display = tabType === 'normal' ? 'block' : 'none';
    document.getElementById('steelCircuit').style.display = tabType === 'steel' ? 'block' : 'none';
}

// Update all timers
async function updateAllTimers() {
    console.log('updateAllTimers called at:', new Date().toLocaleTimeString());
    try {
        // Force a fresh API fetch to see current data
        await warframeAPI.fetchData();
        
        await updateWorldTimers();
        await updateFissureTimers();
        await updateEvents();
        await updateInvasions();
        await updateGlobalUpgrades();
        await updateSortie();
        await updateArchonHunt();
        await updateNightwave();
        await updateVoidTrader();
        await updateCircuit();
    } catch (error) {
        console.error('Error updating timers:', error);
    }
}

// Update world timers with real API data
async function updateWorldTimers() {
    try {
        const worldState = await warframeAPI.getWorldCycles();
        
        // Update Cetus day/night cycle
        const cetusElement = document.getElementById('cetusTimer');
        if (cetusElement && worldState.cetusCycle) {
            const countdownElement = cetusElement.querySelector('.timer-countdown');
            const statusElement = cetusElement.querySelector('.timer-status');
            
            if (countdownElement) {
                const timeRemaining = new Date(worldState.cetusCycle.expiry * 1000) - Date.now();
                countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
            }
            
            if (statusElement) {
                const timeOfDay = worldState.cetusCycle.isDay ? '☀️ Day' : '🌙 Night';
                const nextTime = worldState.cetusCycle.isDay ? 'Night' : 'Day';
                statusElement.textContent = timeOfDay;
                statusElement.className = `timer-status ${worldState.cetusCycle.isDay ? 'day' : 'night'}`;
                statusElement.title = `Next: ${nextTime}`;
            }
        }
        
        // Update Fortuna warm/cold cycle
        const fortunaElement = document.getElementById('fortunaTimer');
        if (fortunaElement && worldState.vallisCycle) {
            const countdownElement = fortunaElement.querySelector('.timer-countdown');
            const statusElement = fortunaElement.querySelector('.timer-status');
            const timerHeader = fortunaElement.querySelector('.timer-header');
            
            if (countdownElement) {
                const timeRemaining = new Date(worldState.vallisCycle.expiry * 1000) - Date.now();
                countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
            }
            
            if (statusElement) {
                const temp = worldState.vallisCycle.isWarm ? '☀️ Warm' : '❄️ Cold';
                const nextTemp = worldState.vallisCycle.isWarm ? 'Cold' : 'Warm';
                statusElement.textContent = temp;
                statusElement.className = `timer-status ${worldState.vallisCycle.isWarm ? 'warm' : 'cold'}`;
                statusElement.title = `Next: ${nextTemp}`;
            }
        }
        
        // Update Deimos Cambion Drift Vome/Fass cycle
        const deimosElement = document.getElementById('deimosTimer');
        if (deimosElement && worldState.cambionCycle) {
            const countdownElement = deimosElement.querySelector('.timer-countdown');
            const statusElement = deimosElement.querySelector('.timer-status');
            
            if (countdownElement) {
                const timeRemaining = new Date(worldState.cambionCycle.expiry * 1000) - Date.now();
                countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
            }
            
            if (statusElement) {
                const isVome = worldState.cambionCycle.active === 'vome';
                const current = isVome ? '🌙 Vome' : '☀️ Fass';
                const next = isVome ? 'Fass' : 'Vome';
                statusElement.textContent = current;
                statusElement.className = `timer-status ${isVome ? 'vome' : 'fass'}`;
                statusElement.title = `Next: ${next}`;
            }
        }
        
        // Update Arbitration with detailed info
        const arbitrationData = await warframeAPI.getArbitration();
        const arbitrationElement = document.getElementById('arbitrationTimer');
        
        if (arbitrationElement) {
            if (arbitrationData && arbitrationData.node && arbitrationData.expiry) {
                // Show arbitration with real data
                console.log('Arbitration API data:', JSON.stringify(arbitrationData, null, 2));
                const timerInfo = arbitrationElement.querySelector('.timer-info');
                const timeRemaining = new Date(arbitrationData.expiry) - Date.now();
                
                if (timerInfo && timeRemaining > 0) {
                    const modeInfo = [];
                    if (arbitrationData.isArchwing) modeInfo.push('🚀 Archwing');
                    if (arbitrationData.isSharkwing) modeInfo.push('🌊 Sharkwing');
                    const modeText = modeInfo.length > 0 ? ` ${modeInfo.join(' ')}` : '';
                    
                    // Parse node name and extract planet
                    let nodeName = 'Unknown';
                    let planet = '';
                    if (arbitrationData.node) {
                        if (arbitrationData.node.includes('(')) {
                            const parts = arbitrationData.node.split('(');
                            nodeName = parts[0].trim();
                            planet = parts[1] ? parts[1].replace(')', '').trim() : '';
                        } else {
                            nodeName = arbitrationData.node;
                        }
                    }
                    
                    // Get mission type and enemy
                    const missionType = arbitrationData.type || 'Unknown Mission';
                    const enemy = arbitrationData.enemy || 'Unknown Enemy';
                    
                    // Build simplified boost display
                    let boostInfo = '';
                    if (arbitrationData.warframe || arbitrationData.weapon) {
                        boostInfo = '<div class="arb-boosts">';
                        if (arbitrationData.warframe) {
                            boostInfo += `<div class="arb-boost-item"><span class="arb-boost-icon">�</span> ${arbitrationData.warframe}: Strength +300%, Health +500</div>`;
                        }
                        if (arbitrationData.weapon) {
                            boostInfo += `<div class="arb-boost-item"><span class="arb-boost-icon">🗡️</span> ${arbitrationData.weapon}: Damage +300%</div>`;
                        }
                        boostInfo += '</div>';
                    }
                    
                    timerInfo.innerHTML = `
                        <div class="arb-mission-info">
                            <div class="arb-mission-type">${missionType} (60-80) - ${planet}</div>
                            <div class="arb-node">📍 ${nodeName}</div>
                            <div class="arb-details">${enemy}${modeText}</div>
                        </div>
                        ${boostInfo}
                        <div class="timer-countdown">⏱️ ${formatTime(timeRemaining)}</div>
                    `;
                    arbitrationElement.style.display = 'flex';
                } else {
                    // Show "no arbitration" message in director theme, hide in normal mode
                    if (directorTheme) {
                        const timerInfo = arbitrationElement.querySelector('.timer-info');
                        if (timerInfo) {
                            timerInfo.innerHTML = `
                                <div class="timer-name">Arbitration</div>
                                <div class="timer-countdown" style="color: #888;">No active arbitration</div>
                                <div class="timer-details" style="color: #666;">Check back later for new arbitration missions</div>
                            `;
                        }
                        arbitrationElement.style.display = 'flex';
                    } else {
                        arbitrationElement.style.display = 'none';
                    }
                }
            } else {
                // No arbitration data
                console.log('No arbitration active, hiding timer');
                if (directorTheme) {
                    const timerInfo = arbitrationElement.querySelector('.timer-info');
                    if (timerInfo) {
                        timerInfo.innerHTML = `
                            <div class="timer-name">Arbitration</div>
                            <div class="timer-countdown" style="color: #888;">No active arbitration</div>
                            <div class="timer-details" style="color: #666;">Check back later for new arbitration missions</div>
                        `;
                    }
                    arbitrationElement.style.display = 'flex';
                } else {
                    arbitrationElement.style.display = 'none';
                }
            }
        }
        
        // Update Baro Ki'Teer timer
        updateBaroDisplay();
        
        // Update daily/weekly reset timers (keep original calculation)
        updateResetTimers();
        
    } catch (error) {
        console.error('Error updating world timers:', error);
    }
}

// Update reset timers (daily/weekly)
function updateResetTimers() {
    // Daily reset timer
    const dailyElement = document.getElementById('dailyResetTimer');
    if (dailyElement) {
        const countdownElement = dailyElement.querySelector('.timer-countdown');
        if (countdownElement) {
            const now = new Date();
            const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
            const timeRemaining = nextReset.getTime() - Date.now();
            countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
        }
    }
    
    // Weekly reset timer
    const weeklyElement = document.getElementById('weeklyResetTimer');
    if (weeklyElement) {
        const countdownElement = weeklyElement.querySelector('.timer-countdown');
        if (countdownElement) {
            const now = new Date();
            const currentDay = now.getUTCDay();
            let daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
            if (currentDay === 1 && now.getUTCHours() < 0) daysUntilMonday = 0;
            
            const nextWeeklyReset = new Date(Date.UTC(
                now.getUTCFullYear(), 
                now.getUTCMonth(), 
                now.getUTCDate() + daysUntilMonday, 
                0, 0, 0, 0
            ));
            
            const timeRemaining = nextWeeklyReset.getTime() - Date.now();
            countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
        }
    }
}

// Sort fissures by tier priority: Lith, Meso, Neo, Axi, Requiem, Omnia
function sortFissuresByTier(fissures) {
    const tierOrder = {
        'Lith': 1,
        'Meso': 2,
        'Neo': 3,
        'Axi': 4,
        'Requiem': 5,
        'Omnia': 6
    };
    
    return fissures.sort((a, b) => {
        const tierA = tierOrder[a.tier] || 999; // Unknown tiers go to end
        const tierB = tierOrder[b.tier] || 999;
        
        if (tierA !== tierB) {
            return tierA - tierB;
        }
        
        // If same tier, sort by time remaining (soonest expiry first)
        const timeA = new Date(a.expiry) - Date.now();
        const timeB = new Date(b.expiry) - Date.now();
        return timeA - timeB;
    });
}

// Update fissure timers with real API data
async function updateFissureTimers() {
    try {
        const fissures = await warframeAPI.getFissures();
        console.log('updateFissureTimers called, fissures:', fissures?.length || 0, fissures);
        
        // Update normal fissures
        const normalFissuresContainer = document.getElementById('normalFissures');
        if (normalFissuresContainer && fissures) {
            const normalFissures = fissures.filter(f => !f.isStorm && !f.isHard);
            // Sort by tier priority: Lith, Meso, Neo, Axi, Requiem, Omnia
            const sortedNormalFissures = sortFissuresByTier(normalFissures);
            console.log('Normal fissures:', sortedNormalFissures.length, 'displaying all');
            updateFissureContainer(normalFissuresContainer, sortedNormalFissures); // Show all normal fissures
        }

        // Update steel path fissures
        const steelFissuresContainer = document.getElementById('steelFissures');
        if (steelFissuresContainer && fissures) {
            const steelFissures = fissures.filter(f => f.isHard);
            // Sort steel path fissures by tier too
            const sortedSteelFissures = sortFissuresByTier(steelFissures);
            console.log('Steel fissures:', sortedSteelFissures.length, 'displaying all');
            updateFissureContainer(steelFissuresContainer, sortedSteelFissures); // Show all steel path fissures
        }
        
    } catch (error) {
        console.error('Error updating fissure timers:', error);
    }
}

// Helper function to update fissure containers
function updateFissureContainer(container, fissures) {
    const existingItems = container.querySelectorAll('.fissure-item');
    
    fissures.forEach((fissure, index) => {
        let fissureElement = existingItems[index];
        
        if (!fissureElement) {
            // Create new fissure element if it doesn't exist
            fissureElement = document.createElement('div');
            fissureElement.className = 'fissure-item';
            fissureElement.innerHTML = `
                <img class="fissure-icon" src="images/fissures/${fissure.tier.toLowerCase()}.png" alt="${fissure.tier}">
                <div class="fissure-info">
                    <div class="fissure-tier">${fissure.tier}</div>
                    <div class="fissure-mission">${fissure.node} (${fissure.missionType})</div>
                </div>
                <div class="fissure-timer"></div>
            `;
            container.appendChild(fissureElement);
        } else {
            // Update existing element
            const tierElement = fissureElement.querySelector('.fissure-tier');
            const missionElement = fissureElement.querySelector('.fissure-mission');
            const iconElement = fissureElement.querySelector('.fissure-icon');
            
            if (tierElement) tierElement.textContent = fissure.tier;
            if (missionElement) missionElement.textContent = `${fissure.node} (${fissure.missionType})`;
            if (iconElement) {
                iconElement.src = `images/fissures/${fissure.tier.toLowerCase()}.png`;
                iconElement.alt = fissure.tier;
            }
        }
        
        // Update timer
        const timerElement = fissureElement.querySelector('.fissure-timer');
        if (timerElement) {
            const timeRemaining = new Date(fissure.expiry) - Date.now();
            if (timeRemaining > 0) {
                timerElement.textContent = formatTime(timeRemaining);
                timerElement.style.color = '#4ecdc4';
            } else {
                timerElement.textContent = 'Expired';
                timerElement.style.color = '#e74c3c';
            }
        }
    });
    
    // Remove excess elements
    for (let i = fissures.length; i < existingItems.length; i++) {
        existingItems[i].remove();
    }
}

// Update alerts and events
async function updateAlertsAndEvents() {
    try {
        // Update alerts
        const alerts = await warframeAPI.getAlerts();
        const alertsSection = document.getElementById('alertsSection');
        const alertsList = document.getElementById('alertsList');
        
        if (alertsSection && alertsList) {
            // Always show the alerts section since it now contains arbitration
            alertsSection.style.display = 'block';
            
            if (alerts && alerts.length > 0) {
                alertsList.innerHTML = alerts.map(alert => `
                    <div class="alert-item">
                        <div class="alert-mission">${alert.mission?.node || alert.node || 'Unknown'} - ${alert.mission?.type || alert.missionType || 'Alert'}</div>
                        <div class="alert-reward">${alert.mission?.reward?.itemString || alert.reward?.itemString || 'Credits'}</div>
                        <div class="alert-timer">${formatTime(new Date(alert.expiry) - Date.now())}</div>
                    </div>
                `).join('');
            } else {
                alertsList.innerHTML = '<div class="placeholder-message">No active alerts</div>';
            }
        }
        
        // Update events
        const events = await warframeAPI.getEvents();
        const eventsSection = document.getElementById('eventsSection');
        const eventsList = document.getElementById('eventsList');
        
        if (eventsSection && eventsList) {
            if (events && events.length > 0) {
                eventsSection.style.display = 'block';
                eventsList.innerHTML = events.map(event => `
                    <div class="event-item">
                        <div class="event-name">${event.description}</div>
                        <div class="event-progress">${event.health ? `${((1 - event.health) * 100).toFixed(1)}% Complete` : ''}</div>
                        <div class="event-timer">${formatTime(new Date(event.expiry) - Date.now())}</div>
                    </div>
                `).join('');
            } else {
                eventsSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error updating alerts and events:', error);
        // Gracefully handle missing elements
        const eventsSection = document.getElementById('eventsSection');
        if (eventsSection) eventsSection.style.display = 'none';
    }
}

// Update invasions
async function updateInvasions() {
    try {
        const invasions = await warframeAPI.getInvasions();
        const invasionsSection = document.getElementById('invasionsSection');
        const invasionsList = document.getElementById('invasionsList');
        
        if (invasionsSection && invasionsList) {
            if (invasions && invasions.length > 0) {
                invasionsSection.style.display = 'block';
                invasionsList.innerHTML = invasions.map(invasion => `
                    <div class="invasion-item">
                        <div class="invasion-node">${invasion.node}</div>
                        <div class="invasion-factions">
                            <span class="attacker">${invasion.attackingFaction}</span>
                            vs
                            <span class="defender">${invasion.defendingFaction}</span>
                        </div>
                        <div class="invasion-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(invasion.completion + 50)}%"></div>
                            </div>
                            <span>${invasion.completion.toFixed(1)}%</span>
                        </div>
                        <div class="invasion-rewards">
                            ${invasion.attackerReward?.itemString || ''} vs ${invasion.defenderReward?.itemString || ''}
                        </div>
                    </div>
                `).join('');
            } else {
                invasionsSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error updating invasions:', error);
        // Gracefully handle missing elements
        const invasionsSection = document.getElementById('invasionsSection');
        if (invasionsSection) invasionsSection.style.display = 'none';
    }
}

// Update sortie
async function updateSortie() {
    try {
        const sortie = await warframeAPI.getSortie();
        console.log('Sortie data received:', sortie);
        
        const sortieSection = document.getElementById('sortieTimer');
        const sortieCountdown = document.getElementById('sortieCountdown');
        const sortieMissions = document.getElementById('sortieMissions');
        
        if (sortieSection && sortieCountdown && sortieMissions) {
            if (sortie && sortie.variants && sortie.variants.length > 0 && !sortie.expired) {
                sortieSection.style.display = 'block';
                
                // Update countdown
                const timeLeft = new Date(sortie.expiry) - Date.now();
                sortieCountdown.textContent = `⏱${formatTime(timeLeft)}`;
                
                // Update missions
                sortieMissions.innerHTML = sortie.variants.map((mission, index) => {
                    const levelRange = mission.enemyLevel || mission.minEnemyLevel && mission.maxEnemyLevel 
                        ? `(${mission.minEnemyLevel || 50}-${mission.maxEnemyLevel || 100})`
                        : '(50-100)';
                    
                    return `
                        <div class="sortie-mission-item">
                            <img src="images/missions/${(mission.missionType || 'assault').toLowerCase()}.png" 
                                 class="sortie-mission-img" 
                                 alt="${mission.missionType}" 
                                 onerror="this.src='images/planets/warframe.png'">
                            <div class="sortie-mission-details">
                                <div class="sortie-mission-type">${mission.missionType || 'Mission'} ${levelRange}</div>
                                <div class="sortie-mission-location">${mission.node || 'Unknown Location'}</div>
                                <div class="sortie-mission-condition">Conditions: ${mission.modifier || mission.modifierDescription || 'Standard'}</div>
                                ${mission.modifierDescription ? `<div class="sortie-mission-description">${mission.modifierDescription}</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                console.log('No sortie data or expired');
                // Show placeholder instead of hiding
                sortieMissions.innerHTML = `
                    <div class="sortie-mission-item">
                        <img src="images/missions/sortie.png" class="sortie-mission-img" alt="Mission" onerror="this.src='images/planets/warframe.png'">
                        <div class="sortie-mission-details">
                            <div class="sortie-mission-type">No Active Sortie</div>
                            <div class="sortie-mission-location">Check back later for daily missions</div>
                        </div>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('Error updating sortie:', error);
        // Show error message instead of hiding
        const sortieMissions = document.getElementById('sortieMissions');
        if (sortieMissions) {
            sortieMissions.innerHTML = `
                <div class="sortie-mission-item">
                    <img src="images/missions/sortie.png" class="sortie-mission-img" alt="Mission" onerror="this.src='images/planets/warframe.png'">
                    <div class="sortie-mission-details">
                        <div class="sortie-mission-type">Unable to load Sortie</div>
                        <div class="sortie-mission-location">Error: ${error.message}</div>
                    </div>
                </div>
            `;
        }
    }
}

// Update archon hunt
async function updateArchonHunt() {
    try {
        const archon = await warframeAPI.getArchonHunt();
        console.log('Archon hunt data received:', archon);
        
        const archonSection = document.getElementById('archonTimer');
        const archonCountdown = document.getElementById('archonCountdown');
        const archonBanner = document.getElementById('archonBanner');
        const archonMissions = document.getElementById('archonMissions');
        
        if (archonSection && archonCountdown && archonBanner && archonMissions) {
            if (archon && archon.expiry) {
                archonSection.style.display = 'block';
                
                // Update countdown (connected to weekly reset)
                const timeLeft = new Date(archon.expiry) - Date.now();
                archonCountdown.textContent = `⏱${formatTime(timeLeft)}`;
                
                // Update banner with boss name
                const bossName = archon.boss || 'ARCHON HUNT';
                archonBanner.innerHTML = `
                    <div class="archon-boss-name">${bossName.toUpperCase()}</div>
                    <div class="archon-rewards">
                        <div class="archon-rewards-title">REWARDS</div>
                        <div class="archon-reward-text">
                            Crimson Archon Shard<br>
                            Plus 1 Reward Pool item:<br>
                            ${archon.rewards && archon.rewards.length > 0 
                                ? archon.rewards.map(r => r.itemString || r).join(', ')
                                : '20% chance • Various Resources'}
                        </div>
                    </div>
                `;
                
                // Update missions
                if (archon.missions && archon.missions.length > 0) {
                    archonMissions.innerHTML = archon.missions.map((mission, index) => {
                        const levelRange = `(${mission.minEnemyLevel || 130}-${mission.maxEnemyLevel || 150})`;
                        return `
                            <div class="archon-mission-item">
                                <img src="images/missions/${(mission.type || mission.missionType || 'mission').toLowerCase()}.png" 
                                     class="archon-mission-img" 
                                     alt="${mission.type || mission.missionType}" 
                                     onerror="this.src='images/planets/warframe.png'">
                                <div class="archon-mission-details">
                                    <div class="archon-mission-type">Archon Hunt: ${mission.type || mission.missionType || 'Mission'} ${levelRange}</div>
                                    <div class="archon-mission-location">${mission.node || mission.nodeKey || 'Unknown Location'}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    archonMissions.innerHTML = `
                        <div class="archon-mission-item">
                            <img src="images/missions/mission.png" class="archon-mission-img" alt="Mission" onerror="this.src='images/planets/warframe.png'">
                            <div class="archon-mission-details">
                                <div class="archon-mission-type">Archon Hunt: Sabotage (130-135)</div>
                                <div class="archon-mission-location">Awaiting mission data...</div>
                            </div>
                        </div>
                    `;
                }
            } else {
                console.log('No archon hunt data or missing expiry');
                // Show placeholder instead of hiding
                archonBanner.innerHTML = `
                    <div class="archon-boss-name">ARCHON HUNT DATA UNAVAILABLE</div>
                    <div class="archon-rewards">
                        <div class="archon-rewards-title">STATUS</div>
                        <div class="archon-reward-text">Archon Hunts are always active. API may not support this endpoint.</div>
                    </div>
                `;
                archonMissions.innerHTML = `
                    <div class="archon-mission-item">
                        <img src="images/logos/archon.png" class="archon-mission-img" alt="Mission" onerror="this.src='images/planets/warframe.png'">
                        <div class="archon-mission-details">
                            <div class="archon-mission-type">No missions available</div>
                            <div class="archon-mission-location">Resets weekly</div>
                        </div>
                    </div>
                `;
            }
        }
        
    } catch (error) {
        console.error('Error updating archon hunt:', error);
        // Show error message instead of hiding
        const archonMissions = document.getElementById('archonMissions');
        if (archonMissions) {
            archonMissions.innerHTML = `
                <div class="archon-mission-item">
                    <img src="images/logos/archon.png" class="archon-mission-img" alt="Mission" onerror="this.src='images/planets/warframe.png'">
                    <div class="archon-mission-details">
                        <div class="archon-mission-type">Unable to load Archon Hunt</div>
                        <div class="archon-mission-location">Error: ${error.message}</div>
                    </div>
                </div>
            `;
        }
    }
}

// Update nightwave
async function updateNightwave() {
    try {
        const nightwave = await warframeAPI.getNightwave();
        const nightwaveSection = document.getElementById('nightwaveSection');
        const nightwaveContent = document.getElementById('nightwaveContent');
        
        if (nightwaveSection && nightwaveContent) {
            if (nightwave) {
                nightwaveSection.style.display = 'block';
                nightwaveContent.innerHTML = `
                    <div class="nightwave-info">
                        <div class="nightwave-season">${nightwave.tag}</div>
                        <div class="nightwave-timer">${formatTime(new Date(nightwave.expiry) - Date.now())} remaining</div>
                    </div>
                    <div class="nightwave-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(nightwave.phase / nightwave.params.length) * 100}%"></div>
                        </div>
                        <span>Phase ${nightwave.phase}/${nightwave.params.length}</span>
                    </div>
                `;
            } else {
                nightwaveSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error updating nightwave:', error);
        // Gracefully handle missing elements
        const nightwaveSection = document.getElementById('nightwaveSection');
        if (nightwaveSection) nightwaveSection.style.display = 'none';
    }
}

// Baro Ki'Teer state
let baroCache = { data: null, lastFetch: 0 };

// Update Baro Ki'Teer display (called every second from world timers)
function updateBaroDisplay() {
    const now = Date.now();
    
    // Fetch new data only every 2 minutes
    if (!baroCache.data || (now - baroCache.lastFetch > 120000)) {
        fetchBaroData();
    }
    
    // Update countdown using cached data
    if (baroCache.data) {
        const statusEl = document.getElementById('baroStatus');
        const countdownEl = document.getElementById('baroCountdown');
        const locationEl = document.getElementById('baroLocation');
        const inventoryEl = document.getElementById('baroInventory');
        
        if (baroCache.data.active) {
            const timeLeft = new Date(baroCache.data.expiry) - now;
            if (statusEl) {
                statusEl.textContent = '🟢 Here';
                statusEl.className = 'timer-status baro-here';
            }
            if (countdownEl) countdownEl.textContent = `${formatTime(timeLeft)} remaining`;
            if (locationEl && baroCache.data.location) {
                locationEl.textContent = `📍 ${baroCache.data.location}`;
                locationEl.style.display = 'block';
            }
            
            // Display inventory
            if (inventoryEl && baroCache.data.inventory && baroCache.data.inventory.length > 0) {
                const notableItems = baroCache.data.inventory.filter(item => 
                    item.type === 'Mod' || item.type === 'Weapon' || item.ducats >= 400
                ).slice(0, 10); // Show top 10 notable items
                
                if (notableItems.length > 0) {
                    let itemsHTML = '<div class="baro-items-header">Notable Items:</div>';
                    itemsHTML += '<div class="baro-items-list">';
                    notableItems.forEach(item => {
                        const typeIcon = item.type === 'Mod' ? '📜' : item.type === 'Weapon' ? '⚔️' : '💎';
                        itemsHTML += `
                            <div class="baro-item">
                                <span class="baro-item-icon">${typeIcon}</span>
                                <span class="baro-item-name">${item.name}</span>
                                <span class="baro-item-cost">
                                    <img src="images/ducats.png" class="currency-icon" alt="Ducats" onerror="this.style.display='none'; this.nextSibling.textContent='${item.ducats}D '"> ${item.ducats}
                                    <img src="images/credits.png" class="currency-icon" alt="Credits" onerror="this.style.display='none'; this.nextSibling.textContent='${(item.credits / 1000).toFixed(0)}k'"> ${(item.credits / 1000).toFixed(0)}k
                                </span>
                            </div>
                        `;
                    });
                    itemsHTML += '</div>';
                    itemsHTML += `<div class="baro-items-footer">${baroCache.data.inventory.length} total items</div>`;
                    inventoryEl.innerHTML = itemsHTML;
                    inventoryEl.style.display = 'block';
                } else {
                    inventoryEl.style.display = 'none';
                }
            }
        } else {
            const timeUntil = new Date(baroCache.data.activation) - now;
            if (statusEl) {
                statusEl.textContent = '⚫ Away';
                statusEl.className = 'timer-status baro-away';
            }
            if (countdownEl) countdownEl.textContent = `Arrives in ${formatTime(timeUntil)}`;
            if (locationEl) locationEl.style.display = 'none';
            if (inventoryEl) inventoryEl.style.display = 'none';
        }
    }
}

// Fetch Baro data asynchronously (doesn't block rendering)
async function fetchBaroData() {
    try {
        const data = await warframeAPI.getVoidTrader();
        if (data) {
            baroCache.data = data;
            baroCache.lastFetch = Date.now();
        }
    } catch (error) {
        console.error('Error fetching Baro data:', error);
    }
}

// Update void trader
async function updateVoidTrader() {
    try {
        const voidTrader = await warframeAPI.getVoidTrader();
        const voidtraderSection = document.getElementById('voidtraderSection');
        const voidtraderContent = document.getElementById('voidtraderContent');
        
        if (voidtraderSection && voidtraderContent) {
            if (voidTrader) {
                voidtraderSection.style.display = 'block';
                
                if (voidTrader.active) {
                    const timeRemaining = new Date(voidTrader.expiry) - Date.now();
                    voidtraderContent.innerHTML = `
                        <div class="voidtrader-active">
                            <div class="voidtrader-header">
                                <span class="voidtrader-status-badge active">🔴 ACTIVE NOW</span>
                                <div class="voidtrader-location">📍 ${voidTrader.location}</div>
                            </div>
                            <div class="voidtrader-timer">⏰ Leaves in ${formatTime(timeRemaining)}</div>
                            <div class="voidtrader-inventory">
                                <div class="inventory-header">Featured Items (${voidTrader.inventory.length} total):</div>
                                ${voidTrader.inventory.slice(0, 5).map(item => `
                                    <div class="inventory-item">
                                        <span class="item-name">${item.item}</span>
                                        <span class="item-price">${item.ducats}🔶 + ${item.credits.toLocaleString()}cr</span>
                                    </div>
                                `).join('')}
                                ${voidTrader.inventory.length > 5 ? `<div class="inventory-more">+${voidTrader.inventory.length - 5} more items</div>` : ''}
                            </div>
                        </div>
                    `;
                } else {
                    const timeUntilArrival = new Date(voidTrader.activation) - Date.now();
                    voidtraderContent.innerHTML = `
                        <div class="voidtrader-inactive">
                            <div class="voidtrader-header">
                                <span class="voidtrader-status-badge inactive">⚫ Not Present</span>
                            </div>
                            <div class="voidtrader-timer">⏳ Arrives in ${formatTime(timeUntilArrival)}</div>
                            <div class="voidtrader-note">Baro Ki'Teer appears every 2 weeks on Friday and stays until Sunday</div>
                        </div>
                    `;
                }
            } else {
                voidtraderSection.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error updating void trader:', error);
        // Gracefully handle missing elements
        const voidtraderSection = document.getElementById('voidtraderSection');
        if (voidtraderSection) voidtraderSection.style.display = 'none';
    }
}

// Update circuit with real API data
async function updateCircuit() {
    try {
        // Update Normal Circuit with rotation data (Warframes only - 12 weeks)
        if (circuitRotations) {
            const currentWeek = getCurrentCircuitWeek('normal');
            const weekData = circuitRotations.normalCircuit.rotations.find(r => r.week === currentWeek);
            const nextReset = getNextCircuitReset();
            const timeUntilReset = nextReset - Date.now();
            
            if (weekData) {
                const normalCircuitContainer = document.getElementById('normalCircuit');
                if (normalCircuitContainer) {
                    normalCircuitContainer.innerHTML = `
                        <div class="circuit-info">
                            <div class="circuit-week-info">
                                <span class="week-label">Week ${currentWeek} of ${circuitRotations.normalCircuit.cycleWeeks}</span>
                                <span class="circuit-timer">Resets in ${formatTime(timeUntilReset)}</span>
                            </div>
                        </div>
                        <div class="reward-category">
                            <h4>Warframes</h4>
                            <div class="reward-grid">
                                ${weekData.warframes.map(wf => `
                                    <div class="reward-item">
                                        <img src="images/circuit/warframes/${wf.image}" alt="${wf.name}" onerror="this.style.display='none'">
                                        <span>${wf.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
            
            // Update Steel Path Circuit with rotation data (Weapons only - 9 weeks)
            const steelWeek = getCurrentCircuitWeek('steel');
            const steelWeekData = circuitRotations.steelPathCircuit.rotations.find(r => r.week === steelWeek);
            
            if (steelWeekData) {
                const steelCircuitContainer = document.getElementById('steelCircuit');
                if (steelCircuitContainer) {
                    steelCircuitContainer.innerHTML = `
                        <div class="circuit-info">
                            <div class="circuit-week-info">
                                <span class="week-label">Week ${steelWeek} of ${circuitRotations.steelPathCircuit.cycleWeeks}</span>
                                <span class="circuit-timer">Resets in ${formatTime(timeUntilReset)}</span>
                            </div>
                        </div>
                        <div class="reward-category">
                            <h4>Incarnon Weapons</h4>
                            <div class="reward-grid">
                                ${steelWeekData.weapons.map(weapon => `
                                    <div class="reward-item">
                                        <img src="images/circuit/weapons/${weapon.image}" alt="${weapon.name}" onerror="this.style.display='none'">
                                        <span>${weapon.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            }
            
            // Schedule refresh at next weekly reset for both circuits
            if (circuitRefreshTimeout) clearTimeout(circuitRefreshTimeout);
            circuitRefreshTimeout = setTimeout(() => {
                updateCircuit();
            }, timeUntilReset + 2000); // +2s buffer
        }
        
    } catch (error) {
        console.error('Error updating circuit:', error);
    }
}

// Update events
async function updateEvents() {
    try {
        const events = await warframeAPI.getEvents();
        const eventsSection = document.getElementById('eventsSection');
        const eventsList = document.getElementById('eventsList');
        
        if (eventsSection && eventsList) {
            if (events && events.length > 0) {
                eventsSection.style.display = 'block';
                eventsList.innerHTML = events.map(event => {
                    const timeRemaining = new Date(event.expiry) - Date.now();
                    const healthPercent = event.health ? Math.min(100, Math.max(0, event.health)) : 0;
                    const scorePercent = event.maximumScore > 0 ? (event.currentScore / event.maximumScore) * 100 : 0;
                    
                    return `
                        <div class="event-item">
                            <div class="event-header">
                                <span class="event-description">${event.description || event.tooltip}</span>
                                <span class="event-faction">${event.faction}</span>
                            </div>
                            ${event.node ? `<div class="event-node">📍 ${event.node}</div>` : ''}
                            <div class="event-timer">⏰ ${formatTime(timeRemaining)} remaining</div>
                            ${event.health !== undefined ? `
                                <div class="event-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${healthPercent}%"></div>
                                    </div>
                                    <span>Health: ${healthPercent.toFixed(1)}%</span>
                                </div>
                            ` : ''}
                            ${event.maximumScore > 0 ? `
                                <div class="event-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${scorePercent}%"></div>
                                    </div>
                                    <span>Score: ${event.currentScore.toLocaleString()} / ${event.maximumScore.toLocaleString()}</span>
                                </div>
                            ` : ''}
                            ${event.rewards && event.rewards.length > 0 ? `
                                <div class="event-rewards">
                                    <strong>Rewards:</strong> ${event.rewards.map(r => r.asString || r.itemString).filter(Boolean).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                eventsList.innerHTML = '<div class="placeholder-message">No active events</div>';
            }
        }
    } catch (error) {
        console.error('Error updating events:', error);
    }
}

// Update invasions
async function updateInvasions() {
    try {
        const invasions = await warframeAPI.getInvasions();
        const invasionsSection = document.getElementById('invasionsSection');
        const invasionsList = document.getElementById('invasionsList');
        
        if (invasionsSection && invasionsList) {
            if (invasions && invasions.length > 0) {
                invasionsSection.style.display = 'block';
                invasionsList.innerHTML = invasions.filter(inv => !inv.completed).map(invasion => {
                    const completion = invasion.completion || 0;
                    const eta = invasion.eta || 'Unknown';
                    
                    return `
                        <div class="invasion-item">
                            <div class="invasion-header">
                                <span class="invasion-node">${invasion.node}</span>
                                <span class="invasion-eta">⏰ ${eta}</span>
                            </div>
                            <div class="invasion-factions">
                                <div class="invasion-faction attacker">
                                    <strong>${invasion.attackingFaction}</strong>
                                    <div class="invasion-reward">${invasion.attackerReward?.asString || invasion.attackerReward?.itemString || 'Unknown'}</div>
                                </div>
                                <span class="invasion-vs">VS</span>
                                <div class="invasion-faction defender">
                                    <strong>${invasion.defendingFaction}</strong>
                                    <div class="invasion-reward">${invasion.defenderReward?.asString || invasion.defenderReward?.itemString || 'Unknown'}</div>
                                </div>
                            </div>
                            <div class="invasion-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill attacker-progress" style="width: ${completion}%"></div>
                                    <div class="progress-fill defender-progress" style="width: ${100 - completion}%; margin-left: auto;"></div>
                                </div>
                                <span>${completion.toFixed(1)}% - ${(100 - completion).toFixed(1)}%</span>
                            </div>
                            ${invasion.desc ? `<div class="invasion-desc">${invasion.desc}</div>` : ''}
                        </div>
                    `;
                }).join('');
            } else {
                invasionsList.innerHTML = '<div class="placeholder-message">No active invasions</div>';
            }
        }
    } catch (error) {
        console.error('Error updating invasions:', error);
    }
}

// Update global upgrades
async function updateGlobalUpgrades() {
    try {
        const upgrades = await warframeAPI.getGlobalUpgrades();
        const upgradesSection = document.getElementById('upgradesSection');
        const upgradesList = document.getElementById('upgradesList');
        
        if (upgradesSection && upgradesList) {
            if (upgrades && upgrades.length > 0) {
                upgradesSection.style.display = 'block';
                upgradesList.innerHTML = upgrades.map(upgrade => {
                    const timeRemaining = upgrade.eta ? formatTime(parseFloat(upgrade.eta)) : 'Unknown';
                    
                    return `
                        <div class="upgrade-item">
                            <div class="upgrade-header">
                                <span class="upgrade-name">${upgrade.upgrade}</span>
                                <span class="upgrade-value">${upgrade.operationSymbol || ''} ${upgrade.upgradeOperationValue || ''}${upgrade.operation || ''}</span>
                            </div>
                            ${upgrade.desc ? `<div class="upgrade-desc">${upgrade.desc}</div>` : ''}
                            <div class="upgrade-timer">⏰ ${timeRemaining} remaining</div>
                        </div>
                    `;
                }).join('');
            } else {
                upgradesList.innerHTML = '<div class="placeholder-message">No active bonuses</div>';
            }
        }
    } catch (error) {
        console.error('Error updating global upgrades:', error);
    }
}

// Update Alerts and Events (legacy compatibility wrapper)
async function updateAlertsAndEvents() {
    await updateEvents();
}

// Format time function
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
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

// Apply theme based on director theme setting
function applyTheme() {
    const body = document.body;
    const content = document.getElementById('overlayContent');
    
    if (directorTheme) {
        body.classList.add('director-theme');
        convertToTabbedLayout();
    } else {
        body.classList.remove('director-theme');
        convertToVerticalLayout();
    }
}

// Store original layout HTML for restoration
let originalLayoutHTML = null;

// Convert layout to tabbed director-style
function convertToTabbedLayout() {
    const content = document.getElementById('overlayContent');
    if (!content || content.dataset.converted === 'director') return;
    
    // Save original HTML before converting
    if (!originalLayoutHTML) {
        originalLayoutHTML = content.innerHTML;
    }
    
    // Store original content - MOVE not clone to maintain DOM references
    const timersSection = document.querySelector('.timers-section');
    const fissuresSection = document.querySelector('.fissures-section');
    const circuitSection = document.querySelector('.circuit-section');
    const sortieSection = document.getElementById('sortieTimer');
    const archonSection = document.getElementById('archonTimer');
    const baroTimer = document.getElementById('baroTimer');
    const arbitrationTimer = document.getElementById('arbitrationTimer');
    const deimosTimer = document.getElementById('deimosTimer');
    
    console.log('Director theme - Found sections:', {
        timersSection: !!timersSection,
        fissuresSection: !!fissuresSection,
        circuitSection: !!circuitSection,
        sortieSection: !!sortieSection,
        archonSection: !!archonSection,
        eventsSection: !!document.getElementById('eventsSection'),
        invasionsSection: !!document.getElementById('invasionsSection'),
        upgradesSection: !!document.getElementById('upgradesSection')
    });
    
    // Create tab container with icon-only headers (7 tabs: Timers, Alerts, Events, Fissures, Sortie, Archon, Circuit)
    const tabContainer = document.createElement('div');
    tabContainer.className = 'director-tabs';
    tabContainer.innerHTML = `
        <div class="director-tab-bar">
            <div class="director-controls">
                <button class="director-control-btn minimize-btn" title="Minimize">−</button>
                <button class="director-control-btn close-btn" title="Close">✕</button>
            </div>
            <div class="director-tab-icons">
                <div class="director-icon-tab" data-tab="timers">
                    <img src="images/planets/earth.png" class="director-icon" alt="World Timers" onerror="this.src='images/planets/warframe.png'">
                </div>
                <div class="director-icon-tab" data-tab="alerts">
                    <img src="images/logos/arbitrations.png" class="director-icon" alt="Alerts" onerror="this.src='images/logos/arbitration.png'">
                </div>
                <div class="director-icon-tab" data-tab="events">
                    <img src="images/missions/event.png" class="director-icon" alt="Events" onerror="this.src='images/planets/warframe.png'">
                </div>
                <div class="director-icon-tab" data-tab="fissures">
                    <img src="images/fissures/voidfissure.png" class="director-icon" alt="Void Fissures">
                </div>
                <div class="director-icon-tab" data-tab="sortie">
                    <img src="images/missions/sortie.png" class="director-icon" alt="Sortie" onerror="this.src='images/logos/sortie.png'">
                </div>
                <div class="director-icon-tab" data-tab="archon">
                    <img src="images/logos/archon.png" class="director-icon" alt="Archon Hunt" onerror="this.src='images/logos/archonhunt.png'">
                </div>
                <div class="director-icon-tab" data-tab="circuit">
                    <img src="images/logos/circuitlogo.png" class="director-icon" alt="Duviri Circuit">
                </div>
            </div>
        </div>
        
        <div class="director-dropdown-container">
            <div class="director-dropdown-content" id="tab-timers"></div>
            <div class="director-dropdown-content" id="tab-alerts"></div>
            <div class="director-dropdown-content" id="tab-events"></div>
            <div class="director-dropdown-content" id="tab-fissures"></div>
            <div class="director-dropdown-content" id="tab-sortie"></div>
            <div class="director-dropdown-content" id="tab-archon"></div>
            <div class="director-dropdown-content" id="tab-circuit"></div>
        </div>
    `;
    
    // Get tab content containers
    const tabTimers = tabContainer.querySelector('#tab-timers');
    const tabAlerts = tabContainer.querySelector('#tab-alerts');
    const tabEvents = tabContainer.querySelector('#tab-events');
    const tabFissures = tabContainer.querySelector('#tab-fissures');
    const tabSortie = tabContainer.querySelector('#tab-sortie');
    const tabArchon = tabContainer.querySelector('#tab-archon');
    const tabCircuit = tabContainer.querySelector('#tab-circuit');
    
    // Create timers container with specific order: Daily, Weekly, Cetus, Fortuna, Deimos, Baro
    const timersContainer = document.createElement('div');
    timersContainer.className = 'timers-section';
    
    const dailyReset = document.getElementById('dailyResetTimer');
    const weeklyReset = document.getElementById('weeklyResetTimer');
    const cetusTimer = document.getElementById('cetusTimer');
    const fortunaTimer = document.getElementById('fortunaTimer');
    
    if (dailyReset) timersContainer.appendChild(dailyReset);
    if (weeklyReset) timersContainer.appendChild(weeklyReset);
    if (cetusTimer) timersContainer.appendChild(cetusTimer);
    if (fortunaTimer) timersContainer.appendChild(fortunaTimer);
    if (deimosTimer) timersContainer.appendChild(deimosTimer);
    if (baroTimer) timersContainer.appendChild(baroTimer);
    
    tabTimers.appendChild(timersContainer);
    
    // Create alerts container with Arbitration
    const alertsContainer = document.createElement('div');
    alertsContainer.className = 'timers-section';
    if (arbitrationTimer) alertsContainer.appendChild(arbitrationTimer);
    tabAlerts.appendChild(alertsContainer);
    
    // Create events container with Events, Invasions, and Global Upgrades
    const eventsSection = document.getElementById('eventsSection');
    const invasionsSection = document.getElementById('invasionsSection');
    const upgradesSection = document.getElementById('upgradesSection');
    
    if (eventsSection) {
        eventsSection.style.display = 'block';
        const sectionTitle = eventsSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabEvents.appendChild(eventsSection);
    }
    if (invasionsSection) {
        invasionsSection.style.display = 'block';
        const sectionTitle = invasionsSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabEvents.appendChild(invasionsSection);
    }
    if (upgradesSection) {
        upgradesSection.style.display = 'block';
        const sectionTitle = upgradesSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabEvents.appendChild(upgradesSection);
    }
    
    // Move sortie to its own tab
    if (sortieSection) {
        sortieSection.style.display = 'block';
        const sectionTitle = sortieSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabSortie.appendChild(sortieSection);
    }
    
    // Move archon hunt to its own tab
    if (archonSection) {
        archonSection.style.display = 'block';
        const sectionTitle = archonSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabArchon.appendChild(archonSection);
    }
    
    if (fissuresSection) {
        fissuresSection.style.display = 'block';
        const sectionTitle = fissuresSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabFissures.appendChild(fissuresSection);
    }
    
    if (circuitSection) {
        circuitSection.style.display = 'block';
        const sectionTitle = circuitSection.querySelector('.section-title');
        if (sectionTitle) sectionTitle.remove();
        tabCircuit.appendChild(circuitSection);
    }
    
    // Clear content and add tabs
    content.innerHTML = '';
    content.appendChild(tabContainer);
    
    // Create minimized tab
    const minimizedTab = document.createElement('div');
    minimizedTab.className = 'director-minimized-tab';
    minimizedTab.innerHTML = '<div class="expand-icon">+</div>';
    content.appendChild(minimizedTab);
    
    // Set up icon click handlers
    const iconTabs = tabContainer.querySelectorAll('.director-icon-tab');
    iconTabs.forEach(tab => {
        tab.addEventListener('click', () => toggleDirectorTab(tab));
    });
    
    // Set up control button handlers
    const minimizeBtn = tabContainer.querySelector('.minimize-btn');
    const closeBtn = tabContainer.querySelector('.close-btn');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            tabContainer.classList.add('minimized');
            minimizedTab.style.display = 'flex';
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeOverlay();
        });
    }
    
    // Set up minimized tab expand handler
    minimizedTab.addEventListener('click', () => {
        tabContainer.classList.remove('minimized');
        minimizedTab.style.display = 'none';
    });
    
    // Open the first tab (timers) by default
    setTimeout(() => {
        const firstTab = iconTabs[0];
        if (firstTab) {
            console.log('Opening first tab by default');
            toggleDirectorTab(firstTab);
        }
    }, 200);
    
    // Re-initialize tab switching for fissures/circuit after moving to director theme
    setTimeout(() => {
        initializeTabSwitching();
    }, 100);
    
    content.dataset.converted = 'director';
}

// Convert back to vertical layout
function convertToVerticalLayout() {
    const content = document.getElementById('overlayContent');
    if (!content || content.dataset.converted !== 'director') return;
    
    // Restore original HTML
    if (originalLayoutHTML) {
        content.innerHTML = originalLayoutHTML;
        content.dataset.converted = '';
        
        // Re-initialize tab switching and update timers
        setTimeout(() => {
            initializeTabSwitching();
            updateAllTimers();
        }, 100);
    } else {
        // Fallback to reload if original HTML wasn't saved
        location.reload();
    }
}

// Toggle director icon tab
function toggleDirectorTab(iconTab) {
    const tabName = iconTab.dataset.tab;
    const allIconTabs = document.querySelectorAll('.director-icon-tab');
    const allContents = document.querySelectorAll('.director-dropdown-content');
    const targetContent = document.getElementById(`tab-${tabName}`);
    
    console.log('toggleDirectorTab called for:', tabName);
    console.log('Target content found:', !!targetContent);
    if (targetContent) {
        console.log('Target content children:', targetContent.children.length);
        console.log('Target content innerHTML length:', targetContent.innerHTML.length);
    }
    
    // Check if this tab is already active
    const isActive = iconTab.classList.contains('active');
    console.log('Tab currently active:', isActive);
    
    // Close all tabs
    allIconTabs.forEach(tab => tab.classList.remove('active'));
    allContents.forEach(content => content.classList.remove('active'));
    
    // If it wasn't active, open this tab
    if (!isActive) {
        iconTab.classList.add('active');
        if (targetContent) {
            targetContent.classList.add('active');
            console.log('Tab activated:', tabName, 'Content active class added');
        } else {
            console.error('Target content not found for tab:', tabName);
        }
        activeDirectorTab = tabName;
    } else {
        activeDirectorTab = null;
        console.log('Tab closed:', tabName);
    }
}

// Toggle tab open/close (old function kept for compatibility)
function toggleTab(header) {
    const tabName = header.dataset.tab;
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.director-tab-arrow');
    
    // Close other tabs
    const allHeaders = document.querySelectorAll('.director-tab-header');
    allHeaders.forEach(h => {
        if (h !== header) {
            h.classList.remove('active');
            h.nextElementSibling.classList.remove('active');
            const otherArrow = h.querySelector('.director-tab-arrow');
            if (otherArrow) otherArrow.textContent = '▼';
        }
    });
    
    // Toggle this tab
    const isActive = header.classList.contains('active');
    if (isActive) {
        header.classList.remove('active');
        content.classList.remove('active');
        arrow.textContent = '▼';
        activeDirectorTab = null;
    } else {
        header.classList.add('active');
        content.classList.add('active');
        arrow.textContent = '▲';
        activeDirectorTab = tabName;
    }
}

// IPC Communication handlers
if (window.electronAPI) {
    // window.electronAPI.onOverlayVisibilityChange((visible) => {
    //     if (visible) {
    //         if (!updateInterval) {
    //             updateAllTimers();
    //             updateInterval = setInterval(updateAllTimers, 1000);
    //         }
    //     } else {
    //         if (updateInterval) {
    //             clearInterval(updateInterval);
    //             updateInterval = null;
    //         }
    //     }
    // });

    // window.electronAPI.onTimerUpdate((timerData) => {
    //     if (timerData) {
    //         Object.assign(timers, timerData);
    //         updateAllTimers();
    //     }
    // });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOverlay);
} else {
    initializeOverlay();
}

// Listen for settings updates from main process
window.electronAPI.onSettingsUpdated((settings) => {
    console.log('Settings updated in overlay:', settings);
    
    // Update theme
    if (settings.directorTheme !== undefined) {
        directorTheme = settings.directorTheme;
        applyTheme();
    }
    
    // Update timer visibility based on settings
    const timerElements = {
        dailyResetTimer: document.getElementById('dailyResetTimer'),
        weeklyResetTimer: document.getElementById('weeklyResetTimer'),
        cetusTimer: document.getElementById('cetusTimer'),
        fortunaTimer: document.getElementById('fortunaTimer'),
        arbitrationTimer: document.getElementById('arbitrationTimer')
    };
    
    // Show/hide timers based on settings
    if (timerElements.dailyResetTimer) {
        timerElements.dailyResetTimer.style.display = settings.dailyReset ? 'flex' : 'none';
    }
    if (timerElements.weeklyResetTimer) {
        timerElements.weeklyResetTimer.style.display = settings.weeklyReset ? 'flex' : 'none';
    }
    if (timerElements.cetusTimer) {
        timerElements.cetusTimer.style.display = settings.cetusCycle ? 'flex' : 'none';
    }
    if (timerElements.fortunaTimer) {
        timerElements.fortunaTimer.style.display = settings.fortunaCycle ? 'flex' : 'none';
    }
    if (timerElements.arbitrationTimer) {
        timerElements.arbitrationTimer.style.display = settings.arbitrationTimer ? 'flex' : 'none';
    }

    // Show/hide new sections based on settings
    const fissuresSection = document.getElementById('fissuresSection');
    if (fissuresSection) {
        fissuresSection.style.display = settings.voidFissures !== false ? 'block' : 'none';
    }

    const circuitSection = document.getElementById('circuitSection');
    if (circuitSection) {
        circuitSection.style.display = settings.circuit !== false ? 'block' : 'none';
    }

    // Always show alerts section since it contains arbitration
    const alertsSection = document.getElementById('alertsSection');
    if (alertsSection) {
        alertsSection.style.display = 'block';
    }

    const invasionsSection = document.getElementById('invasionsSection');
    if (invasionsSection) {
        invasionsSection.style.display = settings.invasions !== false ? 'block' : 'none';
    }
});

// Handle window cleanup
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});