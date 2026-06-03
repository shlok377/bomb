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
        
        // Update Screen Effects based on time
        document.body.classList.remove('time-60', 'time-30', 'time-15');
        if (this.timeLeft <= 15) {
            document.body.classList.add('time-15');
        } else if (this.timeLeft <= 30) {
            document.body.classList.add('time-30');
        } else if (this.timeLeft <= 60) {
            document.body.classList.add('time-60');
        }

        const event = new CustomEvent('game-tick', { detail: { timeLeft: this.timeLeft } });
        window.dispatchEvent(event);
    },

    addStrike() {
        if (this.isGameOver) return;
        
        this.strikes++;
        AudioManager.playStrike();
        Logger.log("GameEngine", `STRIKE! Total: ${this.strikes}. Speeding up!`);

        // Brief Strike Flash
        document.body.classList.add('strike-flash');
        setTimeout(() => document.body.classList.remove('strike-flash'), 300);

        // Persistent Strike Damage Overlay
        document.body.classList.remove('strike-1', 'strike-2');
        if (this.strikes === 1) document.body.classList.add('strike-1');
        if (this.strikes >= 2) document.body.classList.add('strike-2');
        
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
        
        // Clear screen effects
        document.body.classList.remove('time-60', 'time-30', 'time-15', 'strike-1', 'strike-2', 'strike-flash');

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

        // Clear screen effects
        document.body.classList.remove('time-60', 'time-30', 'time-15', 'strike-1', 'strike-2', 'strike-flash');

        AudioManager.playDisarmed(); // Chime for victory
        Logger.log("GameEngine", "Bomb Defused! You Win!");

        const event = new CustomEvent('game-over', { detail: { result: 'win' } });
        window.dispatchEvent(event);
    }
};
