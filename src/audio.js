export const AudioFX = {
    ctx: null,

    init() {
        // Audio contexts must initialize lazily following a user tap event 
        // to bypass browser autoplay security blocks
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },

    playCrash() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const now = this.ctx.currentTime;
        
        // 1. Instantiate an oscillator for the low-end thumb impact thud
        const osc = this.ctx.createOscillator();
        const gainOsc = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.4);
        
        gainOsc.gain.setValueAtTime(0.4, now);
        gainOsc.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.connect(gainOsc);
        gainOsc.connect(this.ctx.destination);
        
        // 2. Build a white-noise buffer array to simulate metallic crumple friction
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4 seconds duration
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        // Filter out extreme high frequencies for a meatier crunch sound profile
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 0.4);
        
        const gainNoise = this.ctx.createGain();
        gainNoise.gain.setValueAtTime(0.5, now);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        noiseNode.connect(filter);
        filter.connect(gainNoise);
        gainNoise.connect(this.ctx.destination);
        
        // Execute simultaneous playback
        osc.start(now);
        osc.stop(now + 0.4);
        noiseNode.start(now);
        noiseNode.stop(now + 0.4);
    }
};
