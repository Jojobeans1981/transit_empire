import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Obstacles } from './obstacles.js';
import { State } from './state.js';
import { AudioFX } from './audio.js';
import { Storage } from './storage.js';
import { Juice } from './juice.js'; // Import custom text engine structures

const Game = {
    lastTime: performance.now(),
    fpsFilter: 50,
    fps: 0,
    roadScrollY: 0,
    speedMultiplier: 1.0,
    isGameOver: false,
    isMenuMode: true,

    init() {
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        Viewport.init(canvas, ctx);
        this.ctx = ctx;
        this.containerEl = document.getElementById('game-container');

        Storage.updateMenuUI();

        document.getElementById('btn-cop').addEventListener('click', () => this.selectFaction('cop'));
        document.getElementById('btn-driver').addEventListener('click', () => this.selectFaction('driver'));
        document.getElementById('btn-evader').addEventListener('click', () => this.selectFaction('evader'));

        document.getElementById('gameover-screen').addEventListener('click', () => {
            if (this.isGameOver) this.showMenu();
        });

        Input.init((dir) => {
            if (!this.isGameOver && !this.isMenuMode) Player.move(dir);
        });

        requestAnimationFrame((time) => this.loop(time));
    },

    selectFaction(factionKey) {
        AudioFX.init();
        State.setFaction(factionKey);
        this.isMenuMode = false;
        document.getElementById('faction-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'flex';
        this.resetGame();
    },

    showMenu() {
        this.isGameOver = false;
        this.isMenuMode = true;
        this.containerEl.classList.remove('shake-active');
        document.getElementById('gameover-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
        document.getElementById('faction-screen').style.display = 'flex';
        Storage.updateMenuUI();
    },

    resetGame() {
        this.isGameOver = false;
        this.speedMultiplier = 1.0;
        this.roadScrollY = 0;
        this.containerEl.classList.remove('shake-active');
        Player.init();
        Obstacles.list = [];
        Juice.popups = []; // Clear old running text nodes out
        Obstacles.lastSpawnTime = performance.now();
    },

    checkCollisions() {
        const pX = Player.visualX;
        const pY = Player.y;
        const pW = Player.width;
        const pH = Player.height;

        for (let i = 0; i < Obstacles.list.length; i++) {
            const obs = Obstacles.list[i];

            if (pX < obs.x + obs.width && pX + pW > obs.x && pY < obs.y + obs.height && pY + pH > obs.y) {
                this.triggerGameOver();
                break;
            }

            if (!obs.passed && obs.y > pY + pH) {
                obs.passed = true;
                
                const baseCash = 10;
                const baseXp = 15;
                const factionConfig = State.factions[State.faction];

                // Calculate modified values to match the floating popup display
                const cashEarned = Math.floor(baseCash * factionConfig.cashMult);
                const xpEarned = Math.floor(baseXp * factionConfig.xpMult);

                State.awardScore(baseCash, baseXp);

                // Spawn floating notifications over the player car's roof
                Juice.spawn(pX + pW / 2, pY, `+$${cashEarned}`, '#22c55e');
                setTimeout(() => {
                    if (!this.isGameOver && !this.isMenuMode) {
                        Juice.spawn(pX + pW / 2, pY - 15, `+${xpEarned} XP`, '#ffcc00');
                    }
                }, 180);
            }
        }
    },

    triggerGameOver() {
        this.isGameOver = true;
        AudioFX.playCrash();
        this.containerEl.classList.add('shake-active');
        Storage.saveProfile(State.cash, State.level);

        document.getElementById('gameover-stats').innerHTML = `
            Faction Profile Run: <strong>${State.factions[State.faction].name}</strong><br>
            Bank Payout Generated: <strong style="color:#ffcc00;">$${Math.floor(State.cash)}</strong><br>
            Final Experience Level Reached: <strong style="color:#00ffcc;">Rank ${State.level}</strong>
        `;
        
        setTimeout(() => {
            document.getElementById('gameover-screen').style.display = 'flex';
        }, 300);
    },

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        if (!this.isGameOver && !this.isMenuMode) {
            this.speedMultiplier += 0.0003 * (dt * 60);
            this.roadScrollY += Obstacles.baseScrollSpeed * this.speedMultiplier;
            if (this.roadScrollY >= 40) this.roadScrollY = 0;

            Player.update(dt);
            Obstacles.update(dt, this.speedMultiplier, currentTime);
            this.checkCollisions();
            Juice.update(dt); // Run particle position drift transitions
        }

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
            Juice.render(this.ctx); // Layer texts neatly on top of the vehicles
        }

        requestAnimationFrame((time) => this.loop(time));
    }
};

Game.init();
