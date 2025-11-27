/**
 * Warframe API Service
 * Handles fetching and processing real-time Warframe data
 */

class WarframeAPI {
    constructor() {
        this.baseURL = 'https://api.tenno.tools/worldstate/pc';
        this.fallbackURL = 'https://api.warframestat.us/pc';
        this.lastUpdate = null;
        this.updateInterval = 60000; // Update every minute
        this.data = null;
        this.fallbackData = null;
        this.fetchPromise = null; // Prevent multiple simultaneous fetches
    }

    /**
     * Fetch latest Warframe data from the API
     */
    async fetchData() {
        // If already fetching, return the existing promise
        if (this.fetchPromise) {
            console.log('Fetch already in progress, reusing promise');
            return this.fetchPromise;
        }
        
        // If we have recent data (less than 5 seconds old), return it
        if (this.data && this.lastUpdate) {
            const timeSinceUpdate = Date.now() - this.lastUpdate.getTime();
            if (timeSinceUpdate < 5000) {
                console.log('Using cached data from', Math.floor(timeSinceUpdate / 1000), 'seconds ago');
                return this.data;
            }
        }
        
        this.fetchPromise = (async () => {
            try {
                console.log('Fetching Warframe API data...');
                
                const mainUrl = 'https://api.tenno.tools/worldstate/pc';
                console.log('Fetching from:', mainUrl);
                
                const response = await fetch(mainUrl, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API error response:', errorText);
                    throw new Error(`API returned status ${response.status}: ${errorText}`);
                }
                
                this.data = await response.json();
                this.lastUpdate = new Date();
                console.log('Warframe API data updated successfully');
                console.log('Available API properties:', Object.keys(this.data));
                
                // Try to fetch archon hunt from fallback API if not available
                if (!this.data.archonHunt) {
                    try {
                        console.log('Attempting to fetch archon hunt from fallback API...');
                        const fallbackResponse = await fetch(this.fallbackURL, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (fallbackResponse.ok) {
                            this.fallbackData = await fallbackResponse.json();
                            console.log('Fallback API fetched successfully');
                            if (this.fallbackData.archonHunt) {
                                console.log('Archon hunt found in fallback API');
                            }
                        }
                    } catch (fallbackError) {
                        console.log('Fallback API fetch failed, continuing without archon hunt:', fallbackError.message);
                    }
                }
                
                this.data = await response.json();
                this.lastUpdate = new Date();
                console.log('Warframe API data updated successfully');
                console.log('Available API properties:', Object.keys(this.data));
                
                // Log world cycle data for debugging
                if (this.data.cetusCycle) {
                    console.log('Cetus Cycle:', {
                        isDay: this.data.cetusCycle.isDay,
                        state: this.data.cetusCycle.state,
                        expiry: this.data.cetusCycle.expiry,
                        timeLeft: this.data.cetusCycle.timeLeft
                    });
                }
                if (this.data.vallisCycle) {
                    console.log('Vallis Cycle:', {
                        isWarm: this.data.vallisCycle.isWarm,
                        expiry: this.data.vallisCycle.expiry,
                        timeLeft: this.data.vallisCycle.timeLeft
                    });
                }
                if (this.data.cambionCycle) {
                    console.log('Cambion Cycle:', {
                        active: this.data.cambionCycle.active,
                        state: this.data.cambionCycle.state,
                        expiry: this.data.cambionCycle.expiry
                    });
                }
                console.log('Fissure-related properties:', Object.keys(this.data).filter(key => 
                    key.toLowerCase().includes('fissure') || 
                    key.toLowerCase().includes('void') || 
                    key.toLowerCase().includes('relic')
                ));
                console.log('Hunt-related properties:', Object.keys(this.data).filter(key => 
                    key.toLowerCase().includes('hunt') || 
                    key.toLowerCase().includes('archon') || 
                    key.toLowerCase().includes('weekly') ||
                    key.toLowerCase().includes('boss')
                ));
                return this.data;
            } catch (error) {
                console.error('Error fetching Warframe API data:', error);
                throw error;
            } finally {
                this.fetchPromise = null;
            }
        })();
        
        return this.fetchPromise;
    }



    /**
     * Get processed world cycle data
     */
    async getWorldCycles() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data) {
                console.error('No API data available for world cycles');
                return null;
            }

            const cycles = {
                cetusCycle: this.data.cetusCycle ? {
                    isDay: this.data.cetusCycle.isDay,
                    state: this.data.cetusCycle.state,
                    expiry: this.data.cetusCycle.expiry, // ISO string
                    timeLeft: this.data.cetusCycle.timeLeft
                } : null,
                vallisCycle: this.data.vallisCycle ? {
                    isWarm: this.data.vallisCycle.isWarm,
                    expiry: this.data.vallisCycle.expiry, // ISO string
                    timeLeft: this.data.vallisCycle.timeLeft
                } : null,
                cambionCycle: this.data.cambionCycle ? {
                    active: this.data.cambionCycle.active,
                    state: this.data.cambionCycle.state,
                    expiry: this.data.cambionCycle.expiry, // ISO string
                    activation: this.data.cambionCycle.activation
                } : null,
                earthCycle: this.data.earthCycle ? {
                    isDay: this.data.earthCycle.isDay,
                    expiry: this.data.earthCycle.expiry, // ISO string
                    timeLeft: this.data.earthCycle.timeLeft
                } : null
            };

            console.log('World cycles from API:', cycles);
            return cycles;
        } catch (error) {
            console.error('Error getting world cycles:', error);
            return null;
        }
    }

    /**
     * Get arbitration data
     */
    async getArbitration() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            // Check both arbitrations (plural) and arbitration (singular) for compatibility
            const arbitrationData = this.data.arbitrations || this.data.arbitration;
            console.log('Raw arbitration data from API:', JSON.stringify(arbitrationData, null, 2));
            if (!arbitrationData) {
                console.log('No arbitration data found in API response');
                return null;
            }
            
            // Handle the {time, data: []} structure from api.tenno.tools
            let arbitration;
            if (arbitrationData.data && Array.isArray(arbitrationData.data)) {
                arbitration = arbitrationData.data[0]; // Get first item from data array
            } else if (Array.isArray(arbitrationData)) {
                arbitration = arbitrationData[0]; // Direct array
            } else {
                arbitration = arbitrationData; // Direct object
            }
            
            console.log('Parsed arbitration:', JSON.stringify(arbitration, null, 2));
            if (!arbitration) {
                console.log('No active arbitration found');
                return null;
            }

            return {
                id: 'arbitrationTimer',
                name: 'Arbitration',
                node: arbitration.node,
                enemy: arbitration.enemy,
                type: arbitration.type,
                expiry: arbitration.expiry,
                isArchwing: arbitration.archwing,
                isSharkwing: arbitration.sharkwing,
                warframe: arbitration.warframe || null,
                weapon: arbitration.weapon || null,
                icon: 'images/planets/arbitration.png'
            };
        } catch (error) {
            console.error('Error getting arbitration:', error);
            return null;
        }
    }

    /**
     * Get active alerts
     */
    async getAlerts() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data || !this.data.alerts) return [];

            // Handle different data structures
            let alertsData = this.data.alerts;
            if (!Array.isArray(alertsData)) {
                if (typeof alertsData === 'object') {
                    alertsData = Object.values(alertsData);
                } else {
                    return [];
                }
            }

            return alertsData.map(alert => ({
                id: alert.id || Math.random().toString(),
                activation: alert.activation,
                expiry: alert.expiry,
                mission: alert.mission,
                reward: alert.reward,
                description: alert.description
            }));
        } catch (error) {
            console.error('Error getting alerts:', error);
            return [];
        }
    }

    /**
     * Get active events
     */
    async getEvents() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data || !this.data.events) return [];

            return this.data.events.map(event => ({
                id: event.id,
                description: event.description,
                tooltip: event.tooltip,
                node: event.node,
                rewards: event.rewards,
                health: event.health,
                activation: event.activation,
                expiry: event.expiry
            }));
        } catch (error) {
            console.error('Error getting events:', error);
            return [];
        }
    }

    /**
     * Get active invasions
     */
    async getInvasions() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data || !this.data.invasions) return [];

            // Handle different data structures
            let invasionsData = this.data.invasions;
            if (!Array.isArray(invasionsData)) {
                if (typeof invasionsData === 'object') {
                    invasionsData = Object.values(invasionsData);
                } else {
                    return [];
                }
            }

            return invasionsData.map(invasion => ({
                id: invasion.id || Math.random().toString(),
                node: invasion.node,
                activation: invasion.activation,
                expiry: invasion.expiry,
                attackingFaction: invasion.attackingFaction,
                defendingFaction: invasion.defendingFaction,
                attackerReward: invasion.attackerReward,
                defenderReward: invasion.defenderReward,
                completion: invasion.completion || 0,
                vsInfestation: invasion.vsInfestation,
                completed: invasion.completed,
                rewardTypes: invasion.rewardTypes
            }));
        } catch (error) {
            console.error('Error getting invasions:', error);
            return [];
        }
    }

    /**
     * Get void fissures
     */
    async getFissures() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data) {
                console.log('No API data available');
                return [];
            }

            // Check for different possible property names
            let fissuresData = this.data.fissures || 
                             this.data.voidFissures || 
                             this.data.fissureRotations || 
                             this.data.voidTraders || 
                             this.data.relics;

            console.log('Checking fissure properties:');
            console.log('- fissures:', !!this.data.fissures, typeof this.data.fissures, Array.isArray(this.data.fissures));
            console.log('- voidFissures:', !!this.data.voidFissures, this.data.voidFissures?.length);
            console.log('- fissureRotations:', !!this.data.fissureRotations, this.data.fissureRotations?.length);
            
            // Log the actual fissures data structure
            if (this.data.fissures) {
                console.log('Fissures data type:', typeof this.data.fissures);
                console.log('Fissures data keys:', Object.keys(this.data.fissures || {}));
                console.log('Fissures data sample:', this.data.fissures);
            }
            
            if (!fissuresData) {
                console.log('No valid fissures data found in API response');
                return [];
            }

            // Handle different data structures
            if (Array.isArray(fissuresData)) {
                console.log('Raw fissures array:', fissuresData.length, 'fissures found');
                return fissuresData.map(fissure => ({
                    id: fissure.id,
                    activation: fissure.activation,
                    expiry: fissure.expiry,
                    node: fissure.node,
                    missionType: fissure.missionType,
                    enemy: fissure.enemy,
                    tier: fissure.tier,
                    tierNum: fissure.tierNum,
                    isStorm: fissure.isStorm,
                    isHard: fissure.isHard
                }));
            } else if (typeof fissuresData === 'object') {
                // Handle object structure - convert to array
                console.log('Converting fissures object to array');
                
                // Check if it has a 'data' property (common in API responses)
                if (fissuresData.data && Array.isArray(fissuresData.data)) {
                    console.log('Found fissures in data array:', fissuresData.data.length, 'fissures');
                    
                    // Debug timing for first fissure to confirm everything works
                    if (fissuresData.data.length > 0) {
                        const firstFissure = fissuresData.data[0];
                        const expiry = new Date(firstFissure.end * 1000);
                        const timeLeft = expiry.getTime() - Date.now();
                        console.log('Fissure timing verification:', {
                            node: firstFissure.location,
                            tier: firstFissure.tier,
                            expiry: expiry.toISOString(),
                            timeLeftMs: timeLeft,
                            timeLeftMinutes: Math.round(timeLeft / (1000 * 60))
                        });
                    }
                    
                    return fissuresData.data.map(fissure => ({
                        id: fissure.id || Math.random().toString(),
                        activation: fissure.activation || (fissure.start ? new Date(fissure.start * 1000).toISOString() : null),
                        expiry: fissure.expiry || (fissure.end ? new Date(fissure.end * 1000).toISOString() : null),
                        node: fissure.node || fissure.location,
                        missionType: fissure.missionType || fissure.type,
                        enemy: fissure.enemy || fissure.faction,
                        tier: fissure.tier || fissure.relic,
                        tierNum: fissure.tierNum || this.getTierNum(fissure.tier || fissure.relic),
                        isStorm: fissure.isStorm || false,
                        isHard: fissure.isHard || fissure.steelPath || fissure.hard || false
                    }));
                }
                
                // Try to convert object values to array
                const fissuresArray = Object.values(fissuresData).filter(item => 
                    item && typeof item === 'object' && (item.node || item.location)
                );
                console.log('Found fissures in data array:', fissuresData.data.length, 'fissures');
                const processedFissures = fissuresData.data.map(fissure => {
                    const processed = {
                        id: fissure.id || Math.random().toString(),
                        activation: fissure.activation || fissure.start,
                        expiry: fissure.expiry || fissure.end,
                        node: fissure.node || fissure.location,
                        missionType: fissure.missionType || fissure.type,
                        enemy: fissure.enemy || fissure.faction,
                        tier: fissure.tier || fissure.relic,
                        tierNum: fissure.tierNum || this.getTierNum(fissure.tier || fissure.relic),
                        isStorm: fissure.isStorm || false,
                        isHard: fissure.isHard || fissure.steelPath || false
                    };
                    
                    // Debug first few fissures
                    if (fissuresData.data.indexOf(fissure) < 3) {
                        console.log(`Fissure ${fissuresData.data.indexOf(fissure)}:`, {
                            node: processed.node,
                            tier: processed.tier,
                            expiry: processed.expiry,
                            timeLeft: new Date(processed.expiry) - Date.now()
                        });
                    }
                    
                    return processed;
                });
                
                return processedFissures;
            }
        } catch (error) {
            console.error('Error getting fissures:', error);
            return [];
        }
    }

    /**
     * Helper method to get tier number from tier name
     */
    getTierNum(tierName) {
        if (!tierName) return 0;
        const tier = tierName.toLowerCase();
        if (tier.includes('lith')) return 1;
        if (tier.includes('meso')) return 2;
        if (tier.includes('neo')) return 3;
        if (tier.includes('axi')) return 4;
        if (tier.includes('requiem')) return 5;
        return 0;
    }

    /**
     * Get daily sortie
     */
    async getSortie() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            console.log('getSortie - All API properties:', Object.keys(this.data || {}));
            console.log('getSortie - checking data.sortie:', !!this.data?.sortie);
            console.log('getSortie - checking data.sorties:', !!this.data?.sorties);
            
            // The API uses "sorties" (plural)
            const sortieData = this.data?.sorties || this.data?.sortie;
            
            if (!sortieData) {
                console.log('No sortie/sorties data found in API response');
                return null;
            }

            // Handle array format (API returns {time, data: [...]})
            let sortie;
            if (sortieData.data && Array.isArray(sortieData.data)) {
                sortie = sortieData.data[0];
            } else if (Array.isArray(sortieData)) {
                sortie = sortieData[0];
            } else {
                sortie = sortieData;
            }
            
            console.log('Sortie raw data:', JSON.stringify(sortie, null, 2));
            
            // API uses "missions" not "variants"
            // API returns Unix timestamps in seconds, convert to milliseconds
            const activation = sortie.start || sortie.activation;
            const expiry = sortie.end || sortie.expiry;
            
            return {
                id: sortie.id,
                activation: activation * 1000, // Convert to milliseconds
                expiry: expiry * 1000, // Convert to milliseconds
                rewardPool: sortie.rewardPool || sortie.rewards,
                variants: sortie.missions || sortie.variants || [],
                boss: sortie.bossName || sortie.boss,
                faction: sortie.faction,
                expired: sortie.expired || false,
                eta: sortie.eta
            };
        } catch (error) {
            console.error('Error getting sortie:', error);
            return null;
        }
    }

    /**
     * Get nightwave data
     */
    async getNightwave() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data || !this.data.nightwave) return null;

            const nightwave = this.data.nightwave;
            return {
                id: nightwave.id,
                activation: nightwave.activation,
                expiry: nightwave.expiry,
                params: nightwave.params,
                rewardTypes: nightwave.rewardTypes,
                season: nightwave.season,
                tag: nightwave.tag,
                phase: nightwave.phase,
                possibleChallenges: nightwave.possibleChallenges,
                activeChallenges: nightwave.activeChallenges
            };
        } catch (error) {
            console.error('Error getting nightwave:', error);
            return null;
        }
    }

    /**
     * Get void trader (Baro Ki'Teer) data
     */
    async getVoidTrader() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            // Check both voidtraders (plural) and voidTrader (singular)
            const voidTraderData = this.data.voidtraders || this.data.voidTrader;
            console.log('Raw voidTrader data from API:', JSON.stringify(voidTraderData, null, 2));
            
            if (!voidTraderData) {
                console.log('No voidTrader data found');
                return null;
            }

            // Handle if it's wrapped in {time, data} structure
            let voidTrader;
            if (voidTraderData.data && Array.isArray(voidTraderData.data)) {
                voidTrader = voidTraderData.data[0];
            } else if (Array.isArray(voidTraderData)) {
                voidTrader = voidTraderData[0];
            } else {
                voidTrader = voidTraderData;
            }
            
            console.log('Parsed voidTrader:', JSON.stringify(voidTrader, null, 2));
            
            if (!voidTrader) {
                console.log('No active voidTrader found');
                return null;
            }

            return {
                id: voidTrader.id,
                activation: voidTrader.start ? new Date(voidTrader.start * 1000).toISOString() : voidTrader.activation,
                expiry: voidTrader.end ? new Date(voidTrader.end * 1000).toISOString() : voidTrader.expiry,
                character: voidTrader.name || voidTrader.character || "Baro Ki'Teer",
                location: voidTrader.location,
                inventory: voidTrader.items || voidTrader.inventory,
                psId: voidTrader.psId,
                active: voidTrader.active,
                startString: voidTrader.startString,
                endString: voidTrader.endString
            };
        } catch (error) {
            console.error('Error getting void trader:', error);
            return null;
        }
    }

    /**
     * Get steel path data
     */
    async getSteelPath() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data || !this.data.steelPath) return null;

            const steelPath = this.data.steelPath;
            return {
                activation: steelPath.activation,
                expiry: steelPath.expiry,
                currentReward: steelPath.currentReward,
                rotation: steelPath.rotation,
                remaining: steelPath.remaining,
                evergreens: steelPath.evergreens
            };
        } catch (error) {
            console.error('Error getting steel path:', error);
            return null;
        }
    }

    /**
     * Get Archon Hunt data
     */
    async getArchonHunt() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            console.log('getArchonHunt - Searching for archon hunt data...');
            
            // First check the main API
            let archonHunt = this.data?.archonHunt;
            
            // If not found, check the fallback API
            if (!archonHunt && this.fallbackData) {
                console.log('Checking fallback API for archon hunt...');
                archonHunt = this.fallbackData.archonHunt;
            }
            
            if (!archonHunt) {
                console.log('No archon hunt data available in either API');
                console.log('Note: Archon Hunt data may not be currently available');
                return null;
            }
            
            console.log('Archon hunt raw data:', JSON.stringify(archonHunt, null, 2));
            
            // Handle different data structures
            return {
                id: archonHunt.id || 'archon-hunt',
                activation: archonHunt.activation || archonHunt.start || archonHunt.startTime,
                expiry: archonHunt.expiry || archonHunt.end || archonHunt.endTime,
                boss: archonHunt.boss || archonHunt.bossName || archonHunt.enemy || 'Unknown Archon',
                faction: archonHunt.faction || archonHunt.factionKey || archonHunt.enemyFaction || 'Narmer',
                missions: archonHunt.missions || archonHunt.nodes || [],
                rewardPool: archonHunt.rewardPool || archonHunt.rewards || []
            };
        } catch (error) {
            console.error('Error getting archon hunt:', error);
            return null;
        }
    }

    /**
     * Get global upgrades/bonuses
     */
    async getGlobalUpgrades() {
        try {
            if (!this.data) await this.fetchData();
            
            console.log('getGlobalUpgrades - All API properties:', Object.keys(this.data || {}));
            // Check both 'upgrades' and 'globalUpgrades'
            let upgradesData = this.data?.upgrades || this.data?.globalUpgrades;
            
            // If it's wrapped in {time, data:[]}, extract the data
            if (upgradesData && upgradesData.time && upgradesData.data) {
                console.log('Upgrades is wrapped, extracting data array');
                upgradesData = upgradesData.data;
            }
            
            const upgrades = Array.isArray(upgradesData) ? upgradesData : [];
            
            if (!upgrades || upgrades.length === 0) {
                console.log('No global upgrades data found');
                return [];
            }
            
            console.log('Global upgrades raw data:', JSON.stringify(upgrades, null, 2));
            
            return upgrades.map(upgrade => ({
                start: upgrade.start,
                end: upgrade.end,
                upgrade: upgrade.upgrade,
                operation: upgrade.operation,
                operationSymbol: upgrade.operationSymbol,
                upgradeOperationValue: upgrade.upgradeOperationValue,
                eta: upgrade.eta,
                desc: upgrade.desc
            }));
        } catch (error) {
            console.error('Error getting global upgrades:', error);
            return [];
        }
    }

    /**
     * Get invasions data
     */
    async getInvasions() {
        try {
            if (!this.data) await this.fetchData();
            
            console.log('getInvasions - All API properties:', Object.keys(this.data || {}));
            let invasionsData = this.data?.invasions;
            
            // If it's wrapped in {time, data:[]}, extract the data
            if (invasionsData && invasionsData.time && invasionsData.data) {
                console.log('Invasions is wrapped, extracting data array');
                invasionsData = invasionsData.data;
            }
            
            const invasions = Array.isArray(invasionsData) ? invasionsData : [];
            
            if (!invasions || invasions.length === 0) {
                console.log('No invasions data found');
                return [];
            }
            
            console.log('Invasions raw data:', JSON.stringify(invasions, null, 2));
            
            return invasions.map(invasion => {
                // Calculate completion percentage from score
                const score = invasion.score || 0;
                const endScore = invasion.endScore || 30000;
                const completion = ((endScore + score) / (endScore * 2)) * 100;
                
                // Format rewards
                const formatReward = (rewardObj) => {
                    if (!rewardObj || !rewardObj.items || rewardObj.items.length === 0) {
                        return { asString: 'Unknown', itemString: 'Unknown' };
                    }
                    const items = rewardObj.items.map(item => 
                        `${item.count > 1 ? item.count + 'x ' : ''}${item.name}`
                    ).join(', ');
                    return { asString: items, itemString: items };
                };
                
                // Calculate ETA from score history
                let eta = 'Unknown';
                if (invasion.scoreHistory && invasion.scoreHistory.length > 1) {
                    const recent = invasion.scoreHistory.slice(-5);
                    const timeSpan = Math.abs(recent[recent.length - 1][0] - recent[0][0]);
                    const scoreChange = Math.abs(recent[recent.length - 1][1] - recent[0][1]);
                    if (scoreChange > 0) {
                        const secondsPerPoint = timeSpan / scoreChange;
                        const remaining = endScore - Math.abs(score);
                        const etaSeconds = remaining * secondsPerPoint;
                        const hours = Math.floor(etaSeconds / 3600);
                        const minutes = Math.floor((etaSeconds % 3600) / 60);
                        eta = `${hours}h ${minutes}m`;
                    }
                }
                
                return {
                    id: invasion.id,
                    activation: invasion.start ? invasion.start * 1000 : null,
                    expiry: invasion.end ? invasion.end * 1000 : null,
                    node: invasion.location || 'Unknown',
                    attackingFaction: invasion.factionAttacker || 'Unknown',
                    defendingFaction: invasion.factionDefender || 'Unknown',
                    attackerReward: formatReward(invasion.rewardsAttacker),
                    defenderReward: formatReward(invasion.rewardsDefender),
                    completion: Math.round(completion),
                    completed: invasion.completed || false,
                    eta: eta,
                    vsInfestation: invasion.factionAttacker === 'Infestation' || invasion.factionDefender === 'Infestation'
                };
            });
        } catch (error) {
            console.error('Error getting invasions:', error);
            return [];
        }
    }

    /**
     * Get daily reset time
     */
    getDailyReset() {
        const now = new Date();
        const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
        
        return {
            id: 'dailyResetTimer',
            name: 'Daily Reset',
            endTime: nextReset.getTime(),
            timeRemaining: nextReset.getTime() - Date.now(),
            nextReset: nextReset.toISOString(),
            icon: 'images/planets/earth.png'
        };
    }

    /**
     * Get weekly reset time
     */
    getWeeklyReset() {
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
        
        return {
            id: 'weeklyResetTimer',
            name: 'Weekly Reset',
            endTime: nextWeeklyReset.getTime(),
            timeRemaining: nextWeeklyReset.getTime() - Date.now(),
            nextReset: nextWeeklyReset.toISOString(),
            icon: 'images/planets/earth.png'
        };
    }

    /**
     * Get all data at once
     */
    async getAllData() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            return {
                worldCycles: await this.getWorldCycles(),
                arbitration: await this.getArbitration(),
                alerts: await this.getAlerts(),
                events: await this.getEvents(),
                invasions: await this.getInvasions(),
                fissures: await this.getFissures(),
                sortie: await this.getSortie(),
                nightwave: await this.getNightwave(),
                voidTrader: await this.getVoidTrader(),
                steelPath: await this.getSteelPath(),
                dailyReset: this.getDailyReset(),
                weeklyReset: this.getWeeklyReset(),
                lastUpdate: this.lastUpdate
            };
        } catch (error) {
            console.error('Error getting all data:', error);
            return null;
        }
    }
}

// Export for both Node.js and browser environments
if (typeof window !== 'undefined') {
    window.WarframeAPI = WarframeAPI;
}