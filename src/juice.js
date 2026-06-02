import { Viewport } from './viewport.js';

export const Juice = {
    popups: [],
    particles: [],
    items: [],
    lastItemSpawn: 0,

    spawn(x, y, text, color) {
        this.popups.push({ x, y, text, color, alpha: 1.0, scale: 1.2 });
    },

    spawnExplosion(x, y, color) {
        for(let i=0; i<30; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                radius: Math.random() * 4 + 2,
                color,
                alpha: 1.0
            });
        }
    },

    spawnItem() {
        const lane = Math.floor(Math.random() * Viewport.laneCount);
        const type = Math.random() > 0.5 ? 'shield' : 'nitro';
        const radius = 14;
        this.items.push({
            x: (lane * Viewport.laneWidth) + Viewport.laneWidth / 2,
            y: -40,
            radius,
            type,
            color: type === 'shield' ? '#38bdf8' : '#f43f5e'
        });
    },

    update(dt, speedMultiplier, currentTime) {
        // Handle Item spawning loops
        if (currentTime - this.lastItemSpawn > 4000) {
            this.spawnItem();
            this.lastItemSpawn = currentTime;
        }

        // Update active collectible items dropping down the screen
        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].y += 5 * speedMultiplier * (dt * 60);
            if (this.items[i].y > Viewport.height + 40) this.items.splice(i, 1);
        }

        // Update floaters
        for (let i = this.popups.length - 1; i >= 0; i--) {
            let p = this.popups[i];
            p.y -= 50 * dt;
            p.alpha -= 1.5 * dt;
            if (p.alpha <= 0) this.popups.splice(i, 1);
        }

        // Update shattered crash fragments
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 2.0 * dt;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }
    },

    render(ctx) {
        // Draw Power-ups on the road
        for (let item of this.items) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.color;
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.type === 'shield' ? 'S' : 'N', item.x, item.y);
            ctx.restore();
        }

        // Draw Float text
        ctx.save();
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        for (let p of this.popups) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillText(p.text, p.x+1, p.y+1);
            ctx.fillStyle = p.color;
            ctx.fillText(p.text, p.x, p.y);
        }
        ctx.restore();

        // Draw shards
        ctx.save();
        for (let p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
};
