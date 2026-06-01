import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class Memory {
    constructor(container) {
        this.container = container;
        this.stage = 1;
        this.history = []; // Array of { pos, label }
        this.currentDisplay = 0;
        this.currentButtons = [];
        this.isDisarmed = false;
        this.posMap = ['NW', 'NE', 'SW', 'SE']; // Map grid index 0-3 to Compass
    }

    init() {
        try {
            Logger.log("Memory", "Initializing module");
            this.generateStage();
            this.render();
        } catch (err) {
            Logger.error("Memory", "Initialization failed", err);
        }
    }

    generateStage() {
        this.currentDisplay = Math.floor(Math.random() * 4) + 1;
        this.currentButtons = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
        Logger.log("Memory", `Stage ${this.stage} Generated`, { display: this.currentDisplay, buttons: this.currentButtons });
    }

    render() {
        this.container.innerHTML = `
            <div class="module memory">
                <div class="module-status"></div>
                <div class="memory-display">${this.currentDisplay}</div>
                <div class="memory-button-row">
                    ${this.currentButtons.map((label, i) => `<button class="memory-btn" data-pos="${this.posMap[i]}">${label}</button>`).join('')}
                </div>
                <div class="memory-stages">
                    <div class="stage-dot ${this.stage >= 1 ? 'active' : ''}"></div>
                    <div class="stage-dot ${this.stage >= 2 ? 'active' : ''}"></div>
                    <div class="stage-dot ${this.stage >= 3 ? 'active' : ''}"></div>
                    <div class="stage-dot ${this.stage >= 4 ? 'active' : ''}"></div>
                    <div class="stage-dot ${this.stage >= 5 ? 'active' : ''}"></div>
                </div>
            </div>
        `;

        this.container.querySelectorAll('.memory-btn').forEach(btn => {
            btn.onclick = () => this.handlePress(btn.dataset.pos, parseInt(btn.textContent));
        });
    }

    handlePress(pos, label) {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        AudioManager.playClick();
        Logger.log("Memory", `Stage ${this.stage} pressed pos ${pos}, label ${label}`);

        const correct = this.getCorrectButton();
        
        let isCorrect = false;
        if (correct.pos !== undefined) {
            isCorrect = (pos === correct.pos);
        } else if (correct.label !== undefined) {
            isCorrect = (label === correct.label);
        }

        if (isCorrect) {
            this.history.push({ pos, label });
            if (this.stage === 5) {
                this.disarm();
            } else {
                this.stage++;
                this.currentDisplay = 0;
                this.currentButtons = [];
                this.isDisarmed = false;
                this.posMap = ['North-West', 'North-East', 'South-West', 'South-East']; // Map grid index 0-3 to Compass
                }

                init() {
                ...
                getCorrectButton() {
                const d = this.currentDisplay;
                const h = this.history;

                if (this.stage === 1) {
                    if (d === 1) return { pos: 'North-East' };
                    if (d === 2) return { pos: 'North-East' };
                    if (d === 3) return { pos: 'South-West' };
                    if (d === 4) return { pos: 'South-East' };
                }
                if (this.stage === 2) {
                    if (d === 1) return { label: 4 };
                    if (d === 2) return { pos: h[0].pos };
                    if (d === 3) return { pos: 'North-West' };
                    if (d === 4) return { pos: h[0].pos };
                }
                if (this.stage === 3) {
                    if (d === 1) return { label: h[1].label };
                    if (d === 2) return { label: h[0].label };
                    if (d === 3) return { pos: 'South-West' };
                    if (d === 4) return { label: 4 };
                }
                if (this.stage === 4) {
                    if (d === 1) return { pos: h[0].pos };
                    if (d === 2) return { pos: 'North-West' };
                    if (d === 3) return { pos: h[1].pos };
                    if (d === 4) return { pos: h[1].pos };
                }
                if (this.stage === 5) {

            if (d === 1) return { label: h[0].label };
            if (d === 2) return { label: h[1].label };
            if (d === 3) return { label: h[3].label };
            if (d === 4) return { label: h[2].label };
        }
        return {};
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Memory", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike() {
        Logger.warn("Memory", "Incorrect button! Resetting to Stage 1.");
        this.stage = 1;
        this.history = [];
        GameEngine.addStrike();
        this.generateStage();
        this.render();
    }
}
