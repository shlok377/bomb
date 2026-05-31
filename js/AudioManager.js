/**
 * AudioManager.js
 * Uses the Web Audio API to synthesize game sounds without external assets.
 */

import { Logger } from './Logger.js';

export const AudioManager = {
    ctx: null,
    isInitialized: false,

    init() {
        if (this.isInitialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            Logger.log("AudioManager", "Web Audio Context Initialized");
        } catch (err) {
            Logger.error("AudioManager", "Failed to initialize Web Audio", err);
        }
    },

    async resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            Logger.log("AudioManager", "Resuming AudioContext...");
            await this.ctx.resume();
            Logger.log("AudioManager", `AudioContext State: ${this.ctx.state}`);
        }
    },

    async playTick() {
        if (!this.isInitialized) {
            Logger.warn("AudioManager", "Attempted to play tick before initialization");
            return;
        }
        await this.resume();
        Logger.log("AudioManager", "Playing Tick");
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime); // Increased volume
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    },

    async playStrike() {
        if (!this.isInitialized) return;
        await this.resume();
        Logger.log("AudioManager", "Playing Strike");
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.5);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime); // Increased volume
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    },

    async playDisarmed() {
        if (!this.isInitialized) return;
        await this.resume();
        Logger.log("AudioManager", "Playing Disarmed Chime");
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime); // Increased volume
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    async playExplosion() {
        if (!this.isInitialized) return;
        await this.resume();
        Logger.log("AudioManager", "Playing Explosion");
        
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.8, this.ctx.currentTime); // Increased volume
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start();
        noise.stop(this.ctx.currentTime + 2);
    },

    async playClick() {
        if (!this.isInitialized) return;
        await this.resume();
        Logger.log("AudioManager", "Playing Click");
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime); // Increased volume
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);
    }
};
