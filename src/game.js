import { Viewport } from './viewport.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Obstacles } from './obstacles.js';
import { State } from './state.js';
import { AudioFX } from './audio.js';
import { Storage } from './storage.js';
import { Juice } from './juice.js';

const Game = {
    lastTime: performance.now(),
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

        // Main Menu Button Handlers
        document.getElementById('btn-cop').addEventListener('click', () => this.selectFaction('cop'));
        document.getElementById('btn-driver').addEventListener('click', () => this.selectFaction('driver'));
        document.getElementById('btn-evader').addEventListener('click', () => this.selectFaction('evader'));

        // Garage Store Upgrades Handlers
        document.getElementById('buy-engine').addEventListener('click', (e) => {
            e.stopPropagation();
            Storage.purchaseUpgrade('engine');
        });
        document.getElementById('buy-shield').addEventListener('click', (e) => {
            e.stopPropagation();
            Storage.purchaseUpgrade('shield');
        });

        document.getElementById('gameover-screen').addEventListener('click', () => {
            if (this.isGameOver) this.showMenu();
        });

        Input.init((dir) => {
            if (!this.isGameOver && !this.isMenuMode) Player.move(dir);
        });

        requestAnimationFrame((time) => this.loop(time));
    },

    selectFaction(factionKey) {
        try { AudioFX.init(); } catch(e){}
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
        const profile = Storage.loadProfile();
        
        // Inject permanent engine tier multiplier modifications directly from disk stats
        this.speedMultiplier = 0.6 + (profile.engineTier * 0.15);
        this.roadScrollY = 0;
        this.containerEl.classList.remove('shake-active');
        
        // Grant dynamic initial shields if player purchased tiers in garage store
        State.activeShield = profile.shieldTier > 0;
        State.nitroTimer = 0;
        State.cash = 0;
        State.xp = 0;
        State.level = 1;
        State.updateHUD();

        Player.init();
        Obstacles.list = [];
        Juice.popups = [];
        Juice.items = [];
        Juice.particles = [];
        Obstacles.lastSpawnTime = performance.now();
        Juice.lastItemSpawn = performance.now();
    },

    checkCollisions() {
        const pX = Player.visualX;
        const pY = Player.y;
        const pW = Player.width;
        const pH = Player.height;

        // 1. Power-up Item Collisions Intersection Maps
        for (let i = Juice.items.length - 1; i >= 0; i--) {
            let item = Juice.items[i];
            if (item.x > pX && item.x < pX + pW && item.y > pY && item.y < pY + pH) {
                if (item.type === 'shield') {
                    State.activeShield = true;
                    Juice.spawn(pX + pW/2, pY, "SHIELD ARMED", "#38bdf8");
                } else if (item.type === 'nitro') {
                    State.nitroTimer = 3.5; // Trigger 3.5 seconds of high-velocity burst action
                    Juice.spawn(pX + pW/2, pY, "NITRO BOOST OVERDRIVE", "#f43f5e");
                }
                Juice.items.splice(i, 1);
            }
        }

        // 2. Oncoming Obstacle Traffic Collisions Check
        for (let i = 0; i < Obstacles.list.length; i++) {
            const obs = Obstacles.list[i];

            if (pX < obs.x + obs.width && pX + pW > obs.x && pY < obs.y + obs.height && pY + pH > obs.y) {
                if (State.activeShield) {
                    // Shield Absorbs the Crash Impact Node cleanly!
                    State.activeShield = false;
                    Obstacles.list.splice(i, 1);
                    Juice.spawnExplosion(obs.x + obs.width/2, obs.y + obs.height/2, '#38bdf8');
                    Juice.spawn(pX + pW/2, pY, "🛡️ SHIELD SHATTERED", "#38bdf8");
                    this.containerEl.classList.add('shake-active');
                    setTimeout(() => this.containerEl.classList.remove('shake-active'), 200);
                    break;
                } else {
                    this.triggerGameOver();
                    break;
                }
            }

            if (!obs.passed && obs.y > pY + pH) {
                obs.passed = true;
                State.awardScore(10, 15);
            }
        }
    },

    triggerGameOver() {
        this.isGameOver = true;
        try { AudioFX.playCrash(); } catch(e){}
        this.containerEl.classList.add('shake-active');
        Juice.spawnExplosion(Player.visualX + Player.width/2, Player.y + Player.height/2, '#fbbf24');

        Storage.saveProfile(State.cash, State.level);

        document.getElementById('gameover-stats').innerHTML = `
            Run Career Path: <strong>${State.factions[State.faction].name}</strong><br>
            Bank Payout Generated: <strong style="color:#ffcc00;">$${Math.floor(State.cash)}</strong><br>
            Final Rank Reached: <strong style="color:#00ffcc;">Level ${State.level}</strong>
        `;
        
        setTimeout(() => {
            document.getElementById('gameover-screen').style.display = 'flex';
        }, 300);
    },

    loop(currentTime) {
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        let activeSpeed = this.speedMultiplier;
        if (!this.isGameOver && !this.isMenuMode) {
            // Manage dynamic ticking Nitro timers
            if (State.nitroTimer > 0) {
                State.nitroTimer -= dt;
                activeSpeed *= 2.2; // Blast forward at double scroll rates!
            } else {
                this.speedMultiplier += 0.0002 * (dt * 60);
            }

            this.roadScrollY += Obstacles.baseScrollSpeed * activeSpeed;
            if (this.roadScrollY >= 40) this.roadScrollY = 0;

            Player.update(dt);
            Obstacles.update(dt, activeSpeed, currentTime);
            this.checkCollisions();
            Juice.update(dt, activeSpeed, currentTime);
        }

        this.ctx.clearRect(0, 0, Viewport.width, Viewport.height);
        this.ctx.fillStyle = '#1e293b'; // Darker gritty slate highway road surface texture
        this.ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        // Yellow highway safety lane markers paint draw layout pass
        this.ctx.strokeStyle = '#eab308';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([25, 20]);
        for (let i = 1; i < Viewport.laneCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * Viewport.laneWidth, -40 + this.roadScrollY);
            this.ctx.lineTo(i * Viewport.laneWidth, Viewport.height);
            this.ctx.stroke();
        }

        if (!this.isMenuMode) {
            Obstacles.render(this.ctx);
            Player.render(this.ctx);
            Juice.render(this.ctx);
        }

        requestAnimationFrame((time) => this.loop(time));
    }
};

Game.init();
