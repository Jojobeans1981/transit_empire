// src/game.js
import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Obstacles } from './obstacles.js';

const Game = {
    lastTime: performance.now(),
    fpsFilter: 50,
    fps: 0,
    roadScrollY: 0,
    speedMultiplier: 1.0,

    init() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');

        // Init modular dependencies
        Viewport.init(canvas, ctx);
        Player.init();
        Input.init((dir) => Player.move(dir));

        this.ctx = ctx;
        requestAnimationFrame((time) => this.loop(time));
    },

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // FPS Calculations
        const currentFps = 1 / dt;
        if (!isNaN(currentFps) && isFinite(currentFps)) {
            this.fps += (currentFps - this.fps) / this.fpsFilter;
            document.getElementById('debug-fps').innerText = Math.round(this.fps);
        }

        // Progression Multiplier Accelerations
        this.speedMultiplier += 0.0002 * (dt * 60);
        document.getElementById('debug-speed').innerText = this.speedMultiplier.toFixed(2);

        // --- UPDATE ---
        this.roadScrollY += Obstacles.baseScrollSpeed * this.speedMultiplier;
        if (this.roadScrollY >= 40) this.roadScrollY = 0;

        Player.update(dt);
        Obstacles.update(dt, this.speedMultiplier, currentTime);

        // --- RENDER ---
        this.ctx.clearRect(0, 0, Viewport.width, Viewport.height);

        // Draw Road Base
        this.ctx.fillStyle = '#262626';
        this.fillRectScaled(0, 0, Viewport.width, Viewport.height);

        // Draw Lanes
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([22, 22]);
        for (let i = 1; i < Viewport.laneCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * Viewport.laneWidth, -40 + this.roadScrollY);
            this.ctx.lineTo(i * Viewport.laneWidth, Viewport.height);
            this.ctx.stroke();
        }

        Obstacles.render(this.ctx);
        Player.render(this.ctx);

        requestAnimationFrame((time) => this.loop(time));
    },

    fillRectScaled(x, y, w, h) {
        this.ctx.fillRect(x, y, w, h);
    }
};

// Initialize the master engine game loop execution immediately upon script parsing
Game.init();