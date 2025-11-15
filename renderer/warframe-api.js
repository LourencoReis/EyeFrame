/**
 * Warframe API Service
 * Handles fetching and processing real-time Warframe data
 */

class WarframeAPI {
    constructor() {
        this.baseURL = 'https://api.warframestat.us/pc/';
        this.lastUpdate = null;
        this.updateInterval = 60000; // Update every minute
        this.data = null;
    }

    /**
     * Fetch latest Warframe data from the API
     */
    async fetchData() {
        try {
            console.log('Fetching Warframe API data...');
            
            // Try the main API first
            let response = await fetch(this.baseURL);
            
            if (!response.ok) {
                // Try alternative endpoints
                console.log('Primary endpoint failed, trying alternatives...');
                const alternatives = [
                    'https://api.warframestat.us/pc',
                    'https://api.tenno.tools/worldstate/pc',
                    'https://ws.warframestat.us/pc'
                ];
                
                for (const url of alternatives) {
                    try {
                        console.log('Trying:', url);
                        response = await fetch(url);
                        if (response.ok) {
                            console.log('Success with:', url);
                            break;
                        }
                    } catch (e) {
                        console.log('Failed:', url, e.message);
                    }
                }
            }
            
            if (!response.ok) {
                console.log('API unavailable, using mock data for demonstration');
                // Fallback to mock data for demonstration
                this.data = this.getMockData();
                this.lastUpdate = new Date();
                console.log('Using mock Warframe data for demonstration, fissures:', this.data.fissures?.length);
                return this.data;
            }
            
            this.data = await response.json();
            this.lastUpdate = new Date();
            console.log('Warframe API data updated successfully');
            console.log('Available API properties:', Object.keys(this.data));
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
            console.log('Using mock data as fallback');
            this.data = this.getMockData();
            this.lastUpdate = new Date();
            console.log('Mock data loaded, fissures:', this.data.fissures?.length);
            return this.data;
        }
    }

    /**
     * Get mock data for demonstration when API is unavailable
     */
    getMockData() {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        const twoHours = 2 * oneHour;
        
        return {
            cetusCycle: {
                id: "cetusCycle",
                isDay: true,
                state: "day",
                expiry: new Date(now + oneHour).toISOString(),
                timeLeft: "1h 0m 0s",
                isCetus: true,
                shortString: "1h to Night"
            },
            vallisCycle: {
                id: "vallisCycle",
                isWarm: false,
                state: "cold",
                expiry: new Date(now + 45 * 60 * 1000).toISOString(),
                timeLeft: "45m 0s",
                shortString: "45m to Warm"
            },
            arbitration: {
                id: "arbitration",
                activation: new Date(now - oneHour).toISOString(),
                expiry: new Date(now + oneHour + 30 * 60 * 1000).toISOString(),
                node: "Olympus (Mars)",
                enemy: "Infested",
                type: "Disruption",
                archwing: false,
                sharkwing: false
            },
            alerts: [
                {
                    id: "alert1",
                    activation: new Date(now - 30 * 60 * 1000).toISOString(),
                    expiry: new Date(now + 45 * 60 * 1000).toISOString(),
                    description: "Alert on Lua",
                    mission: {
                        node: "Lua/Tycho",
                        type: "Capture",
                        faction: "Sentient",
                        reward: {
                            itemString: "15,000 Credits + Neurodes",
                            credits: 15000
                        }
                    }
                }
            ],
            events: [
                {
                    id: "event1",
                    description: "Nightwave: Nora's Mix Tape III",
                    tooltip: "Complete challenges to earn Nightwave Cred",
                    node: null,
                    activation: new Date(now - 7 * 24 * oneHour).toISOString(),
                    expiry: new Date(now + 30 * 24 * oneHour).toISOString(),
                    health: 0.75
                }
            ],
            invasions: [
                {
                    id: "invasion1",
                    node: "Tolstoj (Mercury)",
                    activation: new Date(now - 2 * oneHour).toISOString(),
                    expiry: new Date(now + 4 * oneHour).toISOString(),
                    attackingFaction: "Corpus",
                    defendingFaction: "Grineer",
                    attackerReward: { itemString: "Mutagen Mass" },
                    defenderReward: { itemString: "Detonite Injector" },
                    completion: 25.5,
                    completed: false,
                    vsInfestation: false
                }
            ],
            fissures: [
                {
                    id: "fissure1",
                    activation: new Date(now - 30 * 60 * 1000).toISOString(),
                    expiry: new Date(now + 50 * 60 * 1000).toISOString(),
                    node: "Tessera (Venus)",
                    missionType: "Defense",
                    enemy: "Corpus",
                    tier: "Lith",
                    tierNum: 1,
                    isStorm: false,
                    isHard: false
                },
                {
                    id: "fissure2",
                    activation: new Date(now - 15 * 60 * 1000).toISOString(),
                    expiry: new Date(now + 65 * 60 * 1000).toISOString(),
                    node: "Elara (Jupiter)",
                    missionType: "Survival",
                    enemy: "Corpus",
                    tier: "Meso",
                    tierNum: 2,
                    isStorm: false,
                    isHard: false
                },
                {
                    id: "fissure3",
                    activation: new Date(now - 10 * 60 * 1000).toISOString(),
                    expiry: new Date(now + oneHour + 15 * 60 * 1000).toISOString(),
                    node: "Hydron (Sedna)",
                    missionType: "Defense",
                    enemy: "Grineer",
                    tier: "Neo",
                    tierNum: 3,
                    isStorm: false,
                    isHard: false
                },
                {
                    id: "fissure4",
                    activation: new Date(now - 5 * 60 * 1000).toISOString(),
                    expiry: new Date(now + oneHour + 25 * 60 * 1000).toISOString(),
                    node: "Mot (Void)",
                    missionType: "Survival",
                    enemy: "Corrupted",
                    tier: "Axi",
                    tierNum: 4,
                    isStorm: false,
                    isHard: false
                },
                {
                    id: "fissure5",
                    activation: new Date(now - 20 * 60 * 1000).toISOString(),
                    expiry: new Date(now + 40 * 60 * 1000).toISOString(),
                    node: "Steel Path - Mot (Void)",
                    missionType: "Survival",
                    enemy: "Corrupted",
                    tier: "Requiem",
                    tierNum: 5,
                    isStorm: false,
                    isHard: true
                }
            ],
            sortie: {
                id: "sortie1",
                activation: new Date(now - 12 * oneHour).toISOString(),
                expiry: new Date(now + 12 * oneHour).toISOString(),
                boss: "The Sergeant",
                faction: "Corpus",
                variants: [
                    {
                        missionType: "Exterminate",
                        modifier: "Augmented Enemy Armor",
                        modifierDescription: "Enemies have significantly more armor.",
                        node: "Phobos/Zeugma"
                    },
                    {
                        missionType: "Mobile Defense",
                        modifier: "Energy Reduction",
                        modifierDescription: "Player Warframes have reduced energy capacity.",
                        node: "Phobos/Sharpless"
                    },
                    {
                        missionType: "Assassination",
                        modifier: "Weapon Restrictions",
                        modifierDescription: "Players may only use Bow weapons.",
                        node: "Phobos/Zeugma"
                    }
                ]
            },
            nightwave: {
                id: "nightwave1",
                activation: new Date(now - 15 * 24 * oneHour).toISOString(),
                expiry: new Date(now + 45 * 24 * oneHour).toISOString(),
                season: 3,
                tag: "Nora's Mix Tape III",
                phase: 15,
                params: new Array(30).fill(null),
                activeChallenges: [
                    {
                        id: "challenge1",
                        title: "Crack 10 Relics",
                        description: "Open 10 Void Relics in Void Fissure missions",
                        standing: 7000,
                        active: true
                    }
                ]
            },
            voidTrader: {
                id: "voidTrader1",
                activation: new Date(now + 2 * 24 * oneHour).toISOString(),
                expiry: new Date(now + 4 * 24 * oneHour).toISOString(),
                character: "Baro Ki'Teer",
                location: "Larunda Relay (Mercury)",
                active: false,
                inventory: [
                    {
                        item: "Primed Continuity",
                        ducats: 350,
                        credits: 100000
                    },
                    {
                        item: "Prisma Gorgon",
                        ducats: 600,
                        credits: 50000
                    }
                ]
            },
            steelPath: {
                activation: new Date(now - 7 * 24 * oneHour).toISOString(),
                expiry: new Date(now + 7 * 24 * oneHour).toISOString(),
                currentReward: {
                    name: "Steel Essence",
                    cost: 0
                },
                rotation: [
                    { name: "Steel Essence" },
                    { name: "Kuva" },
                    { name: "Riven Sliver" }
                ]
            }
        };
    }

    /**
     * Get processed world cycle data
     */
    async getWorldCycles() {
        try {
            if (!this.data) {
                await this.fetchData();
            }
            
            if (!this.data) return null;

            return {
                cetusCycle: this.data.cetusCycle ? {
                    isDay: this.data.cetusCycle.isDay,
                    expiry: this.data.cetusCycle.expiry
                } : null,
                vallisCycle: this.data.vallisCycle ? {
                    isWarm: this.data.vallisCycle.isWarm,
                    expiry: this.data.vallisCycle.expiry
                } : null,
                cambionCycle: this.data.cambionCycle ? {
                    active: this.data.cambionCycle.active,
                    expiry: this.data.cambionCycle.expiry
                } : null,
                earthCycle: this.data.earthCycle ? {
                    isDay: this.data.earthCycle.isDay,
                    expiry: this.data.earthCycle.expiry
                } : null
            };
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
            
            if (!this.data || !this.data.sortie) return null;

            const sortie = this.data.sortie;
            return {
                id: sortie.id,
                activation: sortie.activation,
                expiry: sortie.expiry,
                rewardPool: sortie.rewardPool,
                variants: sortie.variants,
                boss: sortie.boss,
                faction: sortie.faction,
                expired: sortie.expired,
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
            
            if (!this.data) return null;

            // Check different possible property names for archon hunt
            const archonData = this.data.archonHunt || 
                             this.data.archon || 
                             this.data.hunts ||
                             this.data.weeklyArchon ||
                             this.data.sortie; // Sorties sometimes contain archon hunts

            console.log('Archon hunt debug:', JSON.stringify({
                archonHunt: !!this.data.archonHunt,
                archon: !!this.data.archon,
                hunts: !!this.data.hunts,
                weeklyArchon: !!this.data.weeklyArchon,
                sortie: !!this.data.sortie
            }, null, 2));

            if (!archonData) {
                console.log('No archon hunt data found');
                return null;
            }

            return {
                id: archonData.id || 'archon-hunt',
                activation: archonData.activation,
                expiry: archonData.expiry,
                boss: archonData.boss,
                faction: archonData.faction || 'Archon',
                missions: archonData.missions || [],
                rewards: archonData.rewards || [{ itemString: 'Archon Shard' }],
                isArchon: true
            };
        } catch (error) {
            console.error('Error getting archon hunt:', error);
            return null;
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