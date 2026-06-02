import { Viewport } from './viewport.js';
import { State } from './state.js';

export const Player = {
    currentLane: 1,
    visualX: 0,
    targetX: 0,
    y: 0,
    width: 44,
    height: 75,
    speedX: 0.25,
    init() {
        this.y = Viewport.height - 140;
        this.recalculateX(true);
    },
    move(direction) {
        const nextLane = this.currentLane + direction;
        if (nextLane >= 0 && nextLane < Viewport.laneCount) {
            this.currentLane = nextLane;
            this.recalculateX(false);
        }
    },
    recalculateX(snapInstantly = false) {
        this.targetX = (this.currentLane * Viewport.laneWidth) + (Viewport.laneWidth - this.width) / 2;
        if (snapInstantly) this.visualX = this.targetX;
    },
    update(dt) {
        this.y = Viewport.height - 140;
        this.targetX = (this.currentLane * Viewport.laneWidth) + (Viewport.laneWidth - this.width) / 2;
        this.visualX += (this.targetX - this.visualX) * (this.speedX * (dt * 60));
    },
    render(ctx) {
        // Dynamic Chassis Paint Color matching selected faction profile
        const activeFaction = State.faction ? State.factions[State.faction] : { color: '#64748b' };
        ctx.fillStyle = activeFaction.color;
        
        ctx.fillRect(this.visualX, this.y, this.width, this.height);
        ctx.fillStyle = '#e2e8f0'; // Glass Windshield
        ctx.fillRect(this.visualX + 5, this.y + 12, this.width - 10, 14);
        ctx.fillStyle = '#ef4444'; // Taillights
        ctx.fillRect(this.visualX + 4, this.y + this.height - 6, 8, 6);
        ctx.fillRect(this.visualX + this.width - 12, this.y + this.height - 6, 8, 6);
    }
};
