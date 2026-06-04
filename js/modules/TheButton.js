import { BombState } from '../BombState.js';
import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class TheButton {
    constructor(container) {
        this.container = container;
        this.color = '';
        this.label = '';
        this.isDisarmed = false;
        this.isHolding = false;
        this.holdStartTime = 0;
        this.stripColor = '';
        this.colors = ['blue', 'white', 'yellow', 'red'];
        this.labels = ['Abort', 'Detonate', 'Hold', 'Press'];
    }

    init() {
        try {
            Logger.log("TheButton", "Initializing module");
            this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.label = this.labels[Math.floor(Math.random() * this.labels.length)];
            this.render();
        } catch (err) {
            Logger.error("TheButton", "Initialization failed", err);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="module the-button">
                <div class="module-status"></div>
                <div class="button-element ${this.color}">
                    <span class="button-label">${this.label.toUpperCase()}</span>
                </div>
                <div class="indicator-strip"></div>
            </div>
        `;

        const btn = this.container.querySelector('.button-element');
        btn.onmousedown = (e) => this.onMouseDown();
        btn.onmouseup = (e) => this.onMouseUp();
        btn.onmouseleave = (e) => { if (this.isHolding) this.onMouseUp(); };
    }

    onMouseDown() {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        
        AudioManager.playClick();
        this.isHolding = true;
        this.holdStartTime = Date.now();
        
        const btn = this.container.querySelector('.button-element');
        btn.classList.add('pressed');
        btn.classList.add('holding');
        
        // After 500ms, assume it's a hold and show the strip
        setTimeout(() => {
            if (this.isHolding) {
                this.showStrip();
            }
        }, 500);
    }

    showStrip() {
        const strip = this.container.querySelector('.indicator-strip');
        const stripColors = ['blue', 'white', 'yellow', 'red'];
        this.stripColor = stripColors[Math.floor(Math.random() * stripColors.length)];
        strip.style.backgroundColor = this.stripColor;
        strip.style.color = this.stripColor; // Used for box-shadow currentColor
        strip.classList.add('show');
        strip.classList.add('glow');
        Logger.log("TheButton", `Button held. Strip color: ${this.stripColor}`);
    }

    onMouseUp() {
        if (!this.isHolding) return;
        this.isHolding = false;
        
        const btn = this.container.querySelector('.button-element');
        btn.classList.remove('pressed');
        btn.classList.remove('holding');
        
        const holdDuration = Date.now() - this.holdStartTime;
        const strip = this.container.querySelector('.indicator-strip');
        strip.classList.remove('show');
        strip.classList.remove('glow');

        if (holdDuration < 500) {
            this.processPress();
        } else {
            this.processHold();
        }
    }

    processPress() {
        Logger.log("TheButton", "Immediate press registered");
        const action = this.getRequiredAction();
        if (action === 'press') {
            this.disarm();
        } else {
            this.strike("Required action was HOLD, but you tapped.");
        }
    }

    processHold() {
        const timerSeconds = GameEngine.timeLeft;
        const timerStr = timerSeconds.toString();
        const requiredDigit = this.getRequiredReleaseDigit();
        
        Logger.log("TheButton", `Hold released at ${timerSeconds}s. Required digit: ${requiredDigit}`);

        if (timerStr.includes(requiredDigit.toString())) {
            this.disarm();
        } else {
            this.strike(`Released at ${timerSeconds}s, but required digit ${requiredDigit} was not present in the timer.`);
        }
    }

    getRequiredAction() {
        const carIndicator = BombState.indicators.find(i => i.label === 'CAR' && i.lit);
        const frkIndicator = BombState.indicators.find(i => i.label === 'FRK' && i.lit);

        if (this.color === 'blue' && this.label === 'Abort') return 'hold';
        if (BombState.batteries > 1 && this.label === 'Detonate') return 'press';
        if (this.color === 'white' && carIndicator) return 'hold';
        if (BombState.batteries > 2 && frkIndicator) return 'press';
        if (this.color === 'yellow') return 'hold';
        if (this.color === 'red' && this.label === 'Hold') return 'press';
        return 'hold';
    }

    getRequiredReleaseDigit() {
        if (this.stripColor === 'blue') return 4;
        if (this.stripColor === 'white') return 1;
        if (this.stripColor === 'yellow') return 5;
        return 1; // For red or other colors
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("TheButton", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike(reason) {
        Logger.warn("TheButton", `Strike: ${reason}`);
        GameEngine.addStrike();
    }
}
