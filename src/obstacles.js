import { Viewport } from './viewport.js';

export const Obstacles = {
    list: [],
    lastSpawnTime: 0,
    spawnInterval: 1400, // Spawn an incoming vehicle every 1.4 seconds
    baseScrollSpeed: 5,   // Base movement pixels per frame

    update(dt, speedMultiplier, currentTime) {
        // 1. Spawning Loop Logic
        if (currentTime - this.lastSpawnTime > this.spawnInterval / speedMultiplier) {
            this.spawn();
            this.lastSpawnTime = currentTime;
        }

        // 2. Movement & Deletion Pass
        const currentSpeed = this.baseScrollSpeed * speedMultiplier * (dt * 60);

        for (let i = this.list.length - 1; i >= 0; i--) {
            let obs = this.list[i];
            obs.y += currentSpeed; // Drive down the asphalt screen

            // Remove vehicles once they completely exit the bottom viewport bounds
            if (obs.y > Viewport.height) {
                this.list.splice(i, 1);
            }
        }
    },

    spawn() {
        const lane = Math.floor(Math.random() * Viewport.laneCount);
        const width = 42;
        const height = 75;
        
        // Center the vehicle inside its chosen traffic lane
        const x = (lane * Viewport.laneWidth) + (Viewport.laneWidth - width) / 2;
        const y = -height; // Start just above the top edge out of view

        // Pick an obstacle car variant profile randomly
        const colors = ['#e11d48', '#eab308', '#2563eb', '#9333ea'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        this.list.push({
            x: x,
            y: y,
            width: width,
            height: height,
            color: randomColor,
            passed: false
        });
    },

    render(ctx) {
        for (let obs of this.list) {
            // Draw Car Chassis Box
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Draw Windshield glass panel accents
            ctx.fillStyle = '#334155';
            ctx.fillRect(obs.x + 5, obs.y + obs.height - 24, obs.width - 10, 12);

            // Draw Headlights
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(obs.x + 4, obs.y + obs.height - 6, 6, 6);
            ctx.fillRect(obs.x + obs.width - 10, obs.y + obs.height - 6, 6, 6);
        }
    }
};
