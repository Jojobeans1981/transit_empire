export const Storage = {
    saveKey: "TransitEmpire_SaveData_v2",

    loadProfile() {
        const defaultProfile = { 
            lifetimeCash: 0, 
            highestLevel: 1,
            engineTier: 1,   // Max speed upgrade level
            shieldTier: 0    // Starting shield counts
        };
        try {
            const data = localStorage.getItem(this.saveKey);
            return data ? JSON.parse(data) : defaultProfile;
        } catch (e) {
            return defaultProfile;
        }
    },

    saveProfile(cashEarned, finalLevel) {
        let profile = this.loadProfile();
        profile.lifetimeCash += cashEarned;
        if (finalLevel > profile.highestLevel) {
            profile.highestLevel = finalLevel;
        }
        localStorage.setItem(this.saveKey, JSON.stringify(profile));
        this.updateMenuUI();
    },

    purchaseUpgrade(type) {
        let profile = this.loadProfile();
        const cost = type === 'engine' ? profile.engineTier * 150 : (profile.shieldTier + 1) * 250;

        if (profile.lifetimeCash >= cost) {
            profile.lifetimeCash -= cost;
            if (type === 'engine') profile.engineTier++;
            if (type === 'shield') profile.shieldTier++;
            localStorage.setItem(this.saveKey, JSON.stringify(profile));
            this.updateMenuUI();
            return true;
        }
        return false;
    },

    updateMenuUI() {
        const profile = this.loadProfile();
        
        const elCash = document.getElementById('career-cash');
        const elLvl = document.getElementById('career-lvl');
        const elEngineBtn = document.getElementById('buy-engine');
        const elShieldBtn = document.getElementById('buy-shield');
        
        if (elCash) elCash.innerText = `$${Math.floor(profile.lifetimeCash)}`;
        if (elLvl) elLvl.innerText = profile.highestLevel;
        
        if (elEngineBtn) {
            elEngineBtn.innerHTML = `⚙️ Boost Engine (Lv ${profile.engineTier})<br><small>Cost: $${profile.engineTier * 150}</small>`;
        }
        if (elShieldBtn) {
            elShieldBtn.innerHTML = `🛡️ Extra Shield (Lv ${profile.shieldTier})<br><small>Cost: $${(profile.shieldTier + 1) * 250}</small>`;
        }
    }
};
