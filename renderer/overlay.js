// EYEFRAME - Enhanced Overlay JavaScript
let updateInterval;
let minimized = false;
let warframeAPI;
let circuitRotations = null;
let circuitRefreshTimeout = null;

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

        const alertsSection = document.getElementById('alertsSection');
        if (alertsSection) {
            alertsSection.style.display = settings.alerts !== false ? 'block' : 'none';
            console.log(`Alerts & Events: ${settings.alerts !== false ? 'shown' : 'hidden'}`);
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
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide content
    document.getElementById('normalFissures').style.display = tabType === 'normal' ? 'block' : 'none';
    document.getElementById('steelFissures').style.display = tabType === 'steel' ? 'block' : 'none';

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
        await updateWorldTimers();
        await updateFissureTimers();
        await updateAlertsAndEvents();
        await updateInvasions();
        await updateSortie();
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
                const timeRemaining = new Date(worldState.cetusCycle.expiry) - Date.now();
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
                const timeRemaining = new Date(worldState.vallisCycle.expiry) - Date.now();
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
                const timeRemaining = new Date(worldState.cambionCycle.expiry) - Date.now();
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
                            boostInfo += `<div class="arb-boost-item"><span class="arb-boost-icon">👤</span> ${arbitrationData.warframe}: Strength +300%, Health +500</div>`;
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
                    arbitrationElement.style.display = 'none';
                }
            } else {
                // No arbitration data, hide the element
                console.log('No arbitration active, hiding timer');
                arbitrationElement.style.display = 'none';
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
        
        if (alerts && alerts.length > 0) {
            alertsSection.style.display = 'block';
            alertsList.innerHTML = alerts.map(alert => `
                <div class="alert-item">
                    <div class="alert-mission">${alert.mission?.node || alert.node || 'Unknown'} - ${alert.mission?.type || alert.missionType || 'Alert'}</div>
                    <div class="alert-reward">${alert.mission?.reward?.itemString || alert.reward?.itemString || 'Credits'}</div>
                    <div class="alert-timer">${formatTime(new Date(alert.expiry) - Date.now())}</div>
                </div>
            `).join('');
        } else {
            alertsSection.style.display = 'none';
        }
        
        // Update events
        const events = await warframeAPI.getEvents();
        const eventsSection = document.getElementById('eventsSection');
        const eventsList = document.getElementById('eventsList');
        
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
        
    } catch (error) {
        console.error('Error updating alerts and events:', error);
    }
}

// Update invasions
async function updateInvasions() {
    try {
        const invasions = await warframeAPI.getInvasions();
        const invasionsSection = document.getElementById('invasionsSection');
        const invasionsList = document.getElementById('invasionsList');
        
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
        
    } catch (error) {
        console.error('Error updating invasions:', error);
    }
}

// Update sortie
async function updateSortie() {
    try {
        const sortie = await warframeAPI.getSortie();
        const sortieSection = document.getElementById('sortieSection');
        const sortieContent = document.getElementById('sortieContent');
        
        if (sortie) {
            sortieSection.style.display = 'block';
            sortieContent.innerHTML = `
                <div class="sortie-info">
                    <div class="sortie-boss">${sortie.boss}</div>
                    <div class="sortie-faction">${sortie.faction}</div>
                    <div class="sortie-timer">${formatTime(new Date(sortie.expiry) - Date.now())} remaining</div>
                </div>
                <div class="sortie-missions">
                    ${sortie.variants.map((mission, index) => `
                        <div class="sortie-mission">
                            <span class="mission-number">${index + 1}.</span>
                            <span class="mission-type">${mission.missionType}</span>
                            <span class="mission-node">${mission.node}</span>
                            <span class="mission-modifier">${mission.modifier}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            sortieSection.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error updating sortie:', error);
    }
}

// Update nightwave
async function updateNightwave() {
    try {
        const nightwave = await warframeAPI.getNightwave();
        const nightwaveSection = document.getElementById('nightwaveSection');
        const nightwaveContent = document.getElementById('nightwaveContent');
        
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
        
    } catch (error) {
        console.error('Error updating nightwave:', error);
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
        
    } catch (error) {
        console.error('Error updating void trader:', error);
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

    const alertsSection = document.getElementById('alertsSection');
    if (alertsSection) {
        alertsSection.style.display = settings.alerts !== false ? 'block' : 'none';
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