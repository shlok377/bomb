import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class WireSequences {
    constructor(container) {
        this.container = container;
        this.panels = [];
        this.currentPanel = 0;
        this.counts = { red: 0, blue: 0, black: 0 };
        this.isDisarmed = false;

        this.rules = {
            red: [
                'C', 'B', 'A', 'A or C', 'B', 'A or C', 'A, B, or C', 'A or B', 'B'
            ],
            blue: [
                'B', 'A or C', 'B', 'A', 'B', 'B or C', 'C', 'A or C', 'A'
            ],
            black: [
                'A, B, or C', 'A or C', 'B', 'A or C', 'B', 'B or C', 'A or B', 'C', 'C'
            ]
        };
    }

    init() {
        try {
            Logger.log("WireSequences", "Initializing module");
            this.generatePanels();
            this.render();
        } catch (err) {
            Logger.error("WireSequences", "Initialization failed", err);
        }
    }

    generatePanels() {
        const colors = ['red', 'blue', 'black'];
        const letters = ['A', 'B', 'C'];
        
        for (let p = 0; p < 4; p++) { // 4 panels
            const panelWires = [];
            const wireCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 wires
            for (let w = 0; w < wireCount; w++) {
                panelWires.push({
                    color: colors[Math.floor(Math.random() * colors.length)],
                    to: letters[Math.floor(Math.random() * letters.length)],
                    cut: false
                });
            }
            this.panels.push(panelWires);
        }
    }

    render(isSlideIn = false) {
        const panel = this.panels[this.currentPanel];
        this.container.innerHTML = `
            <div class="module wire-sequences">
                <div class="module-status"></div>
                <div class="ws-panel-label">Panel ${this.currentPanel + 1}/4</div>
                <div class="ws-wire-container ${isSlideIn ? 'slide-in' : ''}">
                    ${panel.map((w, i) => `
                        <div class="ws-wire-row">
                            <div class="ws-wire ${w.color} ${w.cut ? 'cut' : ''} ${!isSlideIn ? 'ws-reveal' : ''}" style="animation-delay: ${i * 0.1}s" data-index="${i}"></div>
                            <div class="ws-to-label">${w.to}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="ws-next-btn">${this.currentPanel === 3 ? 'Finish' : 'Next'}</button>
            </div>
        `;

        if (isSlideIn) {
            const label = this.container.querySelector('.ws-panel-label');
            label.classList.add('pulse');
        }

        this.container.querySelectorAll('.ws-wire').forEach(wire => {
            wire.onclick = () => this.handleCut(parseInt(wire.dataset.index));
        });

        this.container.querySelector('.ws-next-btn').onclick = () => this.nextPanel();
    }

    handleCut(index) {
        if (this.isDisarmed || GameEngine.isGameOver || this.panels[this.currentPanel][index].cut) return;

        const wire = this.panels[this.currentPanel][index];
        const color = wire.color;
        const currentCount = this.counts[color];
        
        const rule = this.rules[color][currentCount];
        const shouldCut = rule.includes(wire.to);

        wire.cut = true;
        this.container.querySelector(`.ws-wire[data-index="${index}"]`).classList.add('cut');
        this.counts[color]++;

        if (!shouldCut) {
            Logger.warn("WireSequences", `Strike! Incorrect cut: ${color} to ${wire.to} at occurrence ${currentCount + 1}`);
            GameEngine.addStrike();
        } else {
            Logger.log("WireSequences", `Correct cut: ${color} to ${wire.to}`);
        }
    }

    nextPanel() {
        if (this.currentPanel < 3) {
            const container = this.container.querySelector('.ws-wire-container');
            container.classList.add('slide-out');
            
            setTimeout(() => {
                this.currentPanel++;
                this.render(true);
            }, 400);
        } else {
            this.disarm();
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("WireSequences", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
