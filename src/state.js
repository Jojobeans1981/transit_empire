export const State = {
    faction: null, // "cop", "driver", or "evader"
    cash: 0,
    xp: 0,
    level: 1,

    factions: {
        cop: {
            name: "NYPD Transit Cop",
            color: "#1e40af",
            hudColor: "#3b82f6",
            cashMult: 1.0,
            xpMult: 2.0, // Perk: Fast Leveling
            description: "Enforce fare compliance. Earns double career XP."
        },
        driver: {
            name: "MTA Bus Driver",
            color: "#eab308",
            hudColor: "#eab308",
            cashMult: 1.5, // Perk: High stable pay
            xpMult: 1.0,
            description: "Maintain schedule accuracy. Stronger, stable union cash payouts."
        },
        evader: {
            name: "Fare Evader",
            color: "#22c55e",
            hudColor: "#22c55e",
            cashMult: 2.5, // Perk: High Risk, High Reward
            xpMult: 0.5,
            description: "Dodge transit authority. Maximum cash returns, slow progression."
        }
    },

    setFaction(type) {
        this.faction = type;
        this.cash = 0;
        this.xp = 0;
        this.level = 1;
        this.updateHUD();
    },

    awardScore(baseCash, baseXp) {
        if (!this.faction) return;
        const config = this.factions[this.faction];
        
        this.cash += baseCash * config.cashMult;
        this.xp += baseXp * config.xpMult;

        // Dynamic XP Level-Up Calculation Equation
        const nextLevelXp = this.level * 100;
        if (this.xp >= nextLevelXp) {
            this.xp -= nextLevelXp;
            this.level += 1;
            this.triggerLevelUpAnimation();
        }

        this.updateHUD();
    },

    updateHUD() {
        if (!this.faction) return;
        const config = this.factions[this.faction];
        
        document.getElementById('hud-faction').innerText = config.name.toUpperCase();
        document.getElementById('hud-faction').style.color = config.hudColor;
        document.getElementById('hud-cash').innerText = `$${Math.floor(this.cash)}`;
        document.getElementById('hud-lvl').innerText = this.level;
    },

    triggerLevelUpAnimation() {
        const hudLvl = document.getElementById('hud-lvl');
        hudLvl.style.transform = 'scale(1.5)';
        hudLvl.style.color = '#00ffcc';
        setTimeout(() => {
            hudLvl.style.transform = 'scale(1)';
            hudLvl.style.color = '#ffcc00';
        }, 300);
    }
};
