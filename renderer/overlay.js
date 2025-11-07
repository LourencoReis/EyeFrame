// EYEFRAME - Enhanced Overlay JavaScript
let updateInterval;
let minimized = false;
let warframeAPI;

// Initialize Warframe API
function initializeWarframeAPI() {
    warframeAPI = new WarframeAPI();
    console.log('Warframe API initialized');
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
    setupEventListeners();
    await loadInitialSettings();
    await updateAllTimers();
    updateInterval = setInterval(() => updateAllTimers(), 30000); // Update every 30 seconds
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
            arbitrationTimer: document.getElementById('arbitrationTimer')
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
        if (timerElements.arbitrationTimer) {
            timerElements.arbitrationTimer.style.display = settings.arbitrationTimer ? 'flex' : 'none';
            console.log(`Arbitration timer: ${settings.arbitrationTimer ? 'shown' : 'hidden'}`);
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
                statusElement.textContent = worldState.cetusCycle.isDay ? 'Day' : 'Night';
                statusElement.className = `timer-status ${worldState.cetusCycle.isDay ? 'day' : 'night'}`;
            }
        }
        
        // Update Fortuna warm/cold cycle
        const fortunaElement = document.getElementById('fortunaTimer');
        if (fortunaElement && worldState.vallisCycle) {
            const countdownElement = fortunaElement.querySelector('.timer-countdown');
            const statusElement = fortunaElement.querySelector('.timer-status');
            
            if (countdownElement) {
                const timeRemaining = new Date(worldState.vallisCycle.expiry) - Date.now();
                countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
            }
            
            if (statusElement) {
                statusElement.textContent = worldState.vallisCycle.isWarm ? 'Warm' : 'Cold';
                statusElement.className = `timer-status ${worldState.vallisCycle.isWarm ? 'warm' : 'cold'}`;
            }
        }
        
        // Update Arbitration
        const arbitrationData = await warframeAPI.getArbitration();
        const arbitrationElement = document.getElementById('arbitrationTimer');
        if (arbitrationElement && arbitrationData) {
            const countdownElement = arbitrationElement.querySelector('.timer-countdown');
            const statusElement = arbitrationElement.querySelector('.timer-status');
            
            if (countdownElement) {
                const timeRemaining = new Date(arbitrationData.expiry) - Date.now();
                countdownElement.textContent = formatTime(timeRemaining) + ' remaining';
            }
            
            if (statusElement) {
                statusElement.textContent = `${arbitrationData.node} (${arbitrationData.type})`;
                statusElement.className = 'timer-status arbitration';
            }
        }
        
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

// Update void trader
async function updateVoidTrader() {
    try {
        const voidTrader = await warframeAPI.getVoidTrader();
        const voidtraderSection = document.getElementById('voidtraderSection');
        const voidtraderContent = document.getElementById('voidtraderContent');
        
        if (voidTrader) {
            voidtraderSection.style.display = 'block';
            
            if (voidTrader.active) {
                voidtraderContent.innerHTML = `
                    <div class="voidtrader-active">
                        <div class="voidtrader-location">${voidTrader.location}</div>
                        <div class="voidtrader-timer">Leaves in ${formatTime(new Date(voidTrader.expiry) - Date.now())}</div>
                        <div class="voidtrader-inventory">
                            ${voidTrader.inventory.slice(0, 3).map(item => `
                                <div class="inventory-item">${item.item} - ${item.ducats} ducats + ${item.credits} credits</div>
                            `).join('')}
                            ${voidTrader.inventory.length > 3 ? `<div class="inventory-more">+${voidTrader.inventory.length - 3} more items</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                voidtraderContent.innerHTML = `
                    <div class="voidtrader-inactive">
                        <div class="voidtrader-status">Not active</div>
                        <div class="voidtrader-timer">Arrives in ${formatTime(new Date(voidTrader.activation) - Date.now())}</div>
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
        const steelPath = await warframeAPI.getSteelPath();
        
        // Update steel path circuit if available
        if (steelPath && steelPath.currentReward) {
            const steelCircuitContainer = document.getElementById('steelCircuit');
            if (steelCircuitContainer) {
                const rotation = steelPath.rotation || [];
                
                steelCircuitContainer.innerHTML = `
                    <div class="circuit-info">
                        <div class="circuit-current">Current: ${steelPath.currentReward.name}</div>
                        <div class="circuit-timer">${formatTime(new Date(steelPath.expiry) - Date.now())} remaining</div>
                    </div>
                    <div class="circuit-rotation">
                        ${rotation.slice(0, 5).map((reward, index) => `
                            <div class="rotation-item ${index === 0 ? 'current' : ''}">
                                ${reward.name}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        // For normal circuit, we'll keep static data since there's no dedicated API endpoint
        // but we can enhance it with any available data
        
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