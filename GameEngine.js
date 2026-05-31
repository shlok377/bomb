/**
 * GameEngine.js
 * Manages the global game loop, timer, strikes, and win/loss conditions.
 */

import { BombState } from './BombState.js';
import { Logger } from './Logger.js';

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
            
            this.timerInterval = setInterval(() => {
                this.timeLeft--;
                this.onTimerTick();

                if (this.timeLeft <= 0) {
                    this.explode("TIME RAN OUT");
                }
            }, 1000);
            Logger.log("GameEngine", "Timer started");
        } catch (err) {
            Logger.error("GameEngine", "Timer failure", err);
        }
    },

    onTimerTick() {
        // This will be overridden or called by UIManager
        const event = new CustomEvent('game-tick', { detail: { timeLeft: this.timeLeft } });
        window.dispatchEvent(event);
    },

    addStrike() {
        if (this.isGameOver) return;
        
        this.strikes++;
        console.log(`STRIKE! Total: ${this.strikes}`);
        
        const event = new CustomEvent('game-strike', { detail: { strikes: this.strikes } });
        window.dispatchEvent(event);

        if (this.strikes >= this.maxStrikes) {
            this.explode("TOO MANY STRIKES");
        }
    },

    moduleSolved() {
        if (this.isGameOver) return;

        this.modulesDisarmed++;
        console.log(`Module Solved: ${this.modulesDisarmed}/${this.modulesTotal}`);

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
        console.log("Bomb Defused! You Win!");

        const event = new CustomEvent('game-over', { detail: { result: 'win' } });
        window.dispatchEvent(event);
    }
};
