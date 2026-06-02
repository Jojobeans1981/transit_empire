export const State = {
    cash: 0,
    level: 1,
    xp: 0,
    xpNeeded: 100,
    faction: 'driver',
    
    // Global Power-up states
    activeShield: false,
    nitroTimer: 0,

    factions: {
        cop: { name: "NYPD Transit Cop", cashMult: 1.0, xpMult: 2.0, color: "#3b82f6" },
        driver: { name: "MTA Bus Driver", cashMult: 1.5, xpMult: 1.0, color: "#eab308" },
        evader: { name: "Fare Evader", cashMult: 2.5, xpMult: 0.5, color: "#22c55e" }
    },

    setFaction(factionKey) {
        if (this.factions[factionKey]) {
            this.faction = factionKey;
        }
    },

    awardScore(baseCash, baseXp) {
        const modifier = this.factions[this.faction];
        
        // If burning through nitro, triple cash intake
        const nitroBonus = this.nitroTimer > 0 ? 3.0 : 1.0;

        this.cash += Math.floor(baseCash * modifier.cashMult * nitroBonus);
        this.xp += Math.floor(baseXp * modifier.xpMult);

        if (this.xp >= this.xpNeeded) {
            this.level++;
            this.xp -= this.xpNeeded;
            this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
        }

        this.updateHUD();
    },

    updateHUD() {
        const elCash = document.getElementById('hud-cash');
        const elFaction = document.getElementById('hud-faction');
        const elLvl = document.getElementById('hud-lvl');

        if (elCash) elCash.innerText = `$${Math.floor(this.cash)}`;
        if (elFaction) {
            elFaction.innerText = this.factions[this.faction].name.toUpperCase();
            elFaction.style.color = this.factions[this.faction].color;
        }
        if (elLvl) elLvl.innerText = this.level;
    }
};
