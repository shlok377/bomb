import { BombState } from '../BombState.js';
import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class SimonSays {
    constructor(container) {
        this.container = container;
        this.sequence = [];
        this.userInput = [];
        this.isDisarmed = false;
        this.isFlashing = false;
        this.flashInterval = null;
        this.colors = ['red', 'blue', 'green', 'yellow'];
    }

    init() {
        try {
            Logger.log("SimonSays", "Initializing module");
            this.generateNextInSequence();
            this.render();
            this.startFlashing();
        } catch (err) {
            Logger.error("SimonSays", "Initialization failed", err);
        }
    }

    generateNextInSequence() {
        this.sequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
        Logger.log("SimonSays", "Current Sequence", this.sequence);
    }

    render() {
        this.container.innerHTML = `
            <div class="module simon-says">
                <div class="module-status"></div>
                <div class="simon-grid">
                    <div class="simon-btn red" data-color="red"></div>
                    <div class="simon-btn blue" data-color="blue"></div>
                    <div class="simon-btn green" data-color="green"></div>
                    <div class="simon-btn yellow" data-color="yellow"></div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.simon-btn').forEach(btn => {
            btn.onclick = () => this.handlePress(btn.dataset.color);
        });
    }

    async startFlashing() {
        if (this.isDisarmed || GameEngine.isGameOver || this.isFlashing) return;
        this.isFlashing = true;

        const flashSequence = async () => {
            for (const color of this.sequence) {
                if (this.isDisarmed || GameEngine.isGameOver) break;
                await this.flashColor(color);
                await this.sleep(300);
            }
            if (!this.isDisarmed && !GameEngine.isGameOver) {
                this.flashInterval = setTimeout(flashSequence, 2000);
            }
            this.isFlashing = false;
        };

        flashSequence();
    }

    async flashColor(color) {
        const btn = this.container.querySelector(`.simon-btn.${color}`);
        if (btn) {
            btn.classList.add('active');
            await this.sleep(500);
            btn.classList.remove('active');
        }
    }

    handlePress(color) {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        AudioManager.playClick();
        // Stop current flashing if any
        clearTimeout(this.flashInterval);
        this.isFlashing = false;

        const expectedColor = this.getMappedColor(this.sequence[this.userInput.length]);
        Logger.log("SimonSays", `Pressed ${color}, Expected ${expectedColor}`);

        if (color === expectedColor) {
            this.userInput.push(color);
            this.flashColor(color); // Visual feedback

            if (this.userInput.length === this.sequence.length) {
                if (this.sequence.length === 5) { // Win after 5 stages
                    this.disarm();
                } else {
                    Logger.log("SimonSays", "Sequence complete, next stage...");
                    this.userInput = [];
                    this.generateNextInSequence();
                    setTimeout(() => this.startFlashing(), 1000);
                }
            }
        } else {
            this.strike();
        }
    }

    getMappedColor(originalColor) {
        const hasVowel = BombState.hasVowel();
        const strikes = Math.min(GameEngine.strikes, 2);

        const map = {
            vowel: [
                { red: 'blue', blue: 'red', green: 'yellow', yellow: 'green' }, // 0 strikes
                { red: 'yellow', blue: 'green', green: 'blue', yellow: 'red' }, // 1 strike
                { red: 'green', blue: 'red', green: 'yellow', yellow: 'blue' }  // 2 strikes
            ],
            noVowel: [
                { red: 'blue', blue: 'yellow', green: 'green', yellow: 'red' }, // 0 strikes
                { red: 'red', blue: 'blue', green: 'yellow', yellow: 'green' }, // 1 strike
                { red: 'yellow', blue: 'green', green: 'blue', yellow: 'red' }  // 2 strikes
            ]
        };

        const currentMap = hasVowel ? map.vowel[strikes] : map.noVowel[strikes];
        return currentMap[originalColor];
    }

    disarm() {
        this.isDisarmed = true;
        clearTimeout(this.flashInterval);
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("SimonSays", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike() {
        Logger.warn("SimonSays", "Incorrect color pressed!");
        this.userInput = [];
        GameEngine.addStrike();
        setTimeout(() => this.startFlashing(), 1000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
