import { Viewport } from './viewport.js';
import { State } from './state.js';

export const Player = {
    lane: 1,
    targetX: 0,
    visualX: 0,
    y: 0,
    width: 38,
    height: 68,
    speedX: 16,

    init() {
        this.lane = 1;
        this.targetX = (this.lane * Viewport.laneWidth) + (Viewport.laneWidth - this.width) / 2;
        this.visualX = this.targetX;
        this.y = Viewport.height - this.height - 50;
    },

    move(direction) {
        this.lane = Math.min(Math.max(this.lane + direction, 0), Viewport.laneCount - 1);
        this.targetX = (this.lane * Viewport.laneWidth) + (Viewport.laneWidth - this.width) / 2;
    },

    update(dt) {
        // Smooth interpolation lane glide handling
        this.visualX += (this.targetX - this.visualX) * this.speedX * dt;
    },

    render(ctx) {
        const x = this.visualX;
        const y = this.y;

        ctx.save();
        // 1. Draw Tail Engine Exhaust Fire if Nitro is active
        if (State.nitroTimer > 0) {
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(x + 6, y + this.height, 6, Math.random() * 15 + 5);
            ctx.fillRect(x + this.width - 12, y + this.height, 6, Math.random() * 15 + 5);
        }

        // 2. Cyberpunk Chassis Body Vector Design
        ctx.fillStyle = '#1e1b4b'; // Deep carbon fiber hull
        ctx.fillRect(x, y, this.width, this.height);
        
        ctx.fillStyle = '#fbbf24'; // High-vis racing body stripe line accents
        ctx.fillRect(x + 2, y, 4, this.height);
        ctx.fillRect(x + this.width - 6, y, 4, this.height);

        // Cockpit canopy window layout
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 6, y + 15, this.width - 12, 16);

        // Rear Wing Spoiler element
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 3, y + this.height - 6, this.width + 6, 6);

        // 3. Ambient Pulsing Force Field (Draw if Shield Buff is Active)
        if (State.activeShield) {
            ctx.beginPath();
            ctx.arc(x + this.width / 2, y + this.height / 2, this.height * 0.65, 0, Math.PI * 2);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#38bdf8';
            ctx.stroke();
        }
        ctx.restore();
    }
};
