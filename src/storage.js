export const Storage = {
    saveKey: "TransitEmpire_SaveData",

    loadProfile() {
        const blankProfile = { lifetimeCash: 0, highestLevel: 1 };
        try {
            const data = localStorage.getItem(this.saveKey);
            return data ? JSON.parse(data) : blankProfile;
        } catch (e) {
            console.error("Failed to load local storage save states:", e);
            return blankProfile;
        }
    },

    saveProfile(cashEarned, finalLevel) {
        let profile = this.loadProfile();
        
        // Accumulate financial data over career history
        profile.lifetimeCash += cashEarned;
        
        // Check if player broke their record rank milestone
        if (finalLevel > profile.highestLevel) {
            profile.highestLevel = finalLevel;
        }

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(profile));
            this.updateMenuUI();
        } catch (e) {
            console.error("Failed to update disk space allocations:", e);
        }
    },

    updateMenuUI() {
        const profile = this.loadProfile();
        const elCash = document.getElementById('career-cash');
        const elLvl = document.getElementById('career-lvl');
        
        if (elCash && elLvl) {
            elCash.innerText = `$${Math.floor(profile.lifetimeCash)}`;
            elLvl.innerText = profile.highestLevel;
        }
    }
};
