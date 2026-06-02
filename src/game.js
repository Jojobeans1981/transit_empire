import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Obstacles } from './obstacles.js';
import { State } from './state.js';

const Game = {
    lastTime: performance.now(),
    fpsFilter: 50,
    fps: 0,
    roadScrollY: 0,
    speedMultiplier: 1.0,
    isGameOver: false,
    isMenuMode: true, // New toggle to halt processing on faction selection windows

    init() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        Viewport.init(canvas, ctx);
        this.ctx = ctx;

        // Map Selection Menu Actions Buttons Click Triggers
        document.getElementById('btn-cop').addEventListener('click', () => this.selectFaction('cop'));
        document.getElementById('btn-driver').addEventListener('click', () => this.selectFaction('driver'));
        document.getElementById('btn-evader').addEventListener('click', () => this.selectFaction('evader'));

        // Handle Restart Triggers
        document.getElementById('gameover-screen').addEventListener('click', () => {
            if (this.isGameOver) this.showMenu();
        });

        Input.init((dir) => {
            if (!this.isGameOver && !this.isMenuMode) Player.move(dir);
        });

        requestAnimationFrame((time) => this.loop(time));
    },

    selectFaction(factionKey) {
        State.setFaction(factionKey);
        this.isMenuMode = false;
        document.getElementById('faction-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'flex';
        this.resetGame();
    },

    showMenu() {
        this.isGameOver = false;
        this.isMenuMode = true;
        document.getElementById('gameover-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('faction-screen').style.display = 'flex';
    },

    resetGame() {
        this.isGameOver = false;
        this.speedMultiplier = 1.0;
        this.roadScrollY = 0;
        Player.init();
        Obstacles.list = [];
        Obstacles.lastSpawnTime = performance.now();
    },

    checkCollisions() {
        const pX = Player.visualX;
        const pY = Player.y;
        const pW = Player.width;
        const pH = Player.height;

        for (let i = 0; i < Obstacles.list.length; i++) {
            const obs = Obstacles.list[i];

            // If car crosses player's visual tracking matrix box layout boundaries
            if (pX < obs.x + obs.width && pX + pW > obs.x && pY < obs.y + obs.height && pY + pH > obs.y) {
                this.triggerGameOver();
                break;
            }

            // SCORE PASS VERIFICATION CHECK: If obstacle has cleared the player car safely
            if (!obs.passed && obs.y > pY + pH) {
                obs.passed = true;
                // Base rewards: $10 and 15 XP points per dodge before modifiers are applied
                State.awardScore(10, 15);
            }
        }
    },

    triggerGameOver() {
        this.isGameOver = true;
        document.getElementById('gameover-stats').innerHTML = `
            Faction Profile Run: <strong>${State.factions[State.faction].name}</strong><br>
            Bank Payout Generated: <strong style="color:#ffcc00;">$${Math.floor(State.cash)}</strong><br>
            Final Experience Level Reached: <strong style="color:#00ffcc;">Rank ${State.level}</strong>
        `;
        document.getElementById('gameover-screen').style.display = 'flex';
    },

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.isGameOver && !this.isMenuMode) {
            const currentFps = 1 / dt;
            if (!isNaN(currentFps) && isFinite(currentFps)) {
                this.fps += (currentFps - this.fps) / this.fpsFilter;
            }

            this.speedMultiplier += 0.0003 * (dt * 60);

            this.roadScrollY += Obstacles.baseScrollSpeed * this.speedMultiplier;
            if (this.roadScrollY >= 40) this.roadScrollY = 0;

            Player.update(dt);
            Obstacles.update(dt, this.speedMultiplier, currentTime);
            this.checkCollisions();
        }

        // DRAW SYSTEMS ROUTINES
        this.ctx.clearRect(0, 0, Viewport.width, Viewport.height);
        this.ctx.fillStyle = '#262626';
        this.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([22, 22]);
        for (let i = 1; i < Viewport.laneCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * Viewport.laneWidth, -40 + this.roadScrollY);
            this.ctx.lineTo(i * Viewport.laneWidth, Viewport.height);
            this.ctx.stroke();
        }

        if (!this.isMenuMode) {
            Obstacles.render(this.ctx);
            Player.render(this.ctx);
        }

        requestAnimationFrame((time) => this.loop(time));
    }
};

Game.init();
