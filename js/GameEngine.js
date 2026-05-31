/**
 * GameEngine.js
 * Manages the global game loop, timer, strikes, and win/loss conditions.
 */

import { BombState } from './BombState.js';
import { Logger } from './Logger.js';
import { AudioManager } from './AudioManager.js';

export const GameEngine = {
    timeLeft: 300, // 5 minutes in seconds
    strikes: 0,
    maxStrikes: 3,
    timerInterval: null,
    isGameOver: false,
    modulesTotal: 0,
    modulesDisarmed: 0,

    init(moduleCount) {
        try {
            Logger.log("GameEngine", `Initializing with ${moduleCount} modules`);
            AudioManager.init();
            
            this.modulesTotal = moduleCount;
            this.modulesDisarmed = 0;
            this.strikes = 0;
            this.timeLeft = 300;
            this.isGameOver = false;

            BombState.generate();
            this.startTimer();
        } catch (err) {
            Logger.error("GameEngine", "Failed to initialize game", err);
        }
    },

    startTimer() {
        try {
            if (this.timerInterval) clearInterval(this.timerInterval);
            
            const interval = this.getTimerInterval();
            Logger.log("GameEngine", `Timer starting with interval: ${interval}ms`);

            this.timerInterval = setInterval(() => {
                if (this.isGameOver) return;
                
                this.timeLeft--;
                this.onTimerTick();

                if (this.timeLeft <= 0) {
                    this.explode("TIME RAN OUT");
                }
            }, interval);
        } catch (err) {
            Logger.error("GameEngine", "Timer failure", err);
        }
    },

    getTimerInterval() {
        // Speed up based on strikes: 0: 1x, 1: 1.5x, 2: 2.25x
        let multiplier = 1.0;
        if (this.strikes === 1) multiplier = 1.5;
        if (this.strikes === 2) multiplier = 2.25;
        
        return Math.floor(1000 / multiplier);
    },

    onTimerTick() {
        // Play tick sound
        AudioManager.playTick();
        
        const event = new CustomEvent('game-tick', { detail: { timeLeft: this.timeLeft } });
        window.dispatchEvent(event);
    },

    addStrike() {
        if (this.isGameOver) return;
        
        this.strikes++;
        AudioManager.playStrike();
        Logger.log("GameEngine", `STRIKE! Total: ${this.strikes}. Speeding up!`);
        
        const event = new CustomEvent('game-strike', { detail: { strikes: this.strikes } });
        window.dispatchEvent(event);

        if (this.strikes >= this.maxStrikes) {
            this.explode("TOO MANY STRIKES");
        } else {
            // Recalculate and restart timer with new speed
            this.startTimer();
        }
    },

    moduleSolved() {
        if (this.isGameOver) return;

        this.modulesDisarmed++;
        AudioManager.playDisarmed();
        Logger.log("GameEngine", `Module Solved: ${this.modulesDisarmed}/${this.modulesTotal}`);

        const event = new CustomEvent('module-disarmed', { detail: { disarmed: this.modulesDisarmed, total: this.modulesTotal } });
        window.dispatchEvent(event);

        if (this.modulesDisarmed >= this.modulesTotal) {
            this.victory();
        }
    },

    explode(reason) {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        try {
            clearInterval(this.timerInterval);
            AudioManager.playExplosion();
            Logger.warn("GameEngine", `BOOM! Explosion triggered. Reason: ${reason}`);
            
            const event = new CustomEvent('game-over', { 
                detail: { 
                    result: 'loss', 
                    reason: reason,
                    strikes: this.strikes,
                    timeLeft: this.timeLeft
                } 
            });
            window.dispatchEvent(event);
        } catch (err) {
            Logger.error("GameEngine", "Error during explode()", err);
        }
    },

    victory() {
        this.isGameOver = true;
        clearInterval(this.timerInterval);
        AudioManager.playDisarmed(); // Chime for victory
        Logger.log("GameEngine", "Bomb Defused! You Win!");

        const event = new CustomEvent('game-over', { detail: { result: 'win' } });
        window.dispatchEvent(event);
    }
};
