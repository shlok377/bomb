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
        const globalCounts = { red: 0, blue: 0, black: 0 };
        
        for (let p = 0; p < 4; p++) {
            const panelWires = [];
            const wireCount = Math.floor(Math.random() * 3) + 1;
            for (let w = 0; w < wireCount; w++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const occurrence = globalCounts[color];
                globalCounts[color]++;

                const to = letters[Math.floor(Math.random() * letters.length)];
                const rule = this.rules[color][occurrence];
                const shouldCut = rule.includes(to);

                panelWires.push({
                    color,
                    to,
                    occurrence,
                    shouldCut,
                    cut: false
                });
            }
            this.panels.push(panelWires);
        }
    }

    render(isSlideIn = false, slideDir = 'right') {
        const panel = this.panels[this.currentPanel];
        this.container.innerHTML = `
            <div class="module wire-sequences">
                <div class="module-status ${this.isDisarmed ? 'disarmed' : ''}"></div>
                <div class="ws-panel-label">Panel ${this.currentPanel + 1}/4</div>
                <div class="ws-wire-container ${isSlideIn ? 'slide-in-' + slideDir : ''}">
                    ${panel.map((w, i) => `
                        <div class="ws-wire-row">
                            <div class="ws-wire ${w.color} ${w.cut ? 'cut' : ''} ${!isSlideIn ? 'ws-reveal' : ''}" style="animation-delay: ${i * 0.1}s" data-index="${i}"></div>
                            <div class="ws-to-label">${w.to}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="ws-controls">
                    <button class="ws-nav-btn prev-btn" ${this.currentPanel === 0 ? 'disabled' : ''}>◀</button>
                    <button class="ws-nav-btn next-btn">${this.currentPanel === 3 ? '✔' : '▶'}</button>
                </div>
            </div>
        `;

        if (isSlideIn) {
            const label = this.container.querySelector('.ws-panel-label');
            label.classList.add('pulse');
        }

        this.container.querySelectorAll('.ws-wire').forEach(wire => {
            wire.onclick = () => this.handleCut(parseInt(wire.dataset.index));
        });

        this.container.querySelector('.prev-btn').onclick = () => this.prevPanel();
        this.container.querySelector('.next-btn').onclick = () => this.nextPanel();
    }

    handleCut(index) {
        if (this.isDisarmed || GameEngine.isGameOver || this.panels[this.currentPanel][index].cut) return;

        const wire = this.panels[this.currentPanel][index];
        wire.cut = true;
        this.container.querySelector(`.ws-wire[data-index="${index}"]`).classList.add('cut');

        if (!wire.shouldCut) {
            Logger.warn("WireSequences", `Strike! Incorrect cut: ${wire.color} to ${wire.to} at occurrence ${wire.occurrence + 1}`);
            GameEngine.addStrike();
        } else {
            Logger.log("WireSequences", `Correct cut: ${wire.color} to ${wire.to}`);
        }
    }

    prevPanel() {
        if (this.isDisarmed || GameEngine.isGameOver || this.currentPanel === 0) return;

        const container = this.container.querySelector('.ws-wire-container');
        container.classList.add('slide-out-right');
        
        setTimeout(() => {
            this.currentPanel--;
            this.render(true, 'left');
        }, 400);
    }

    nextPanel() {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        if (this.currentPanel < 3) {
            const container = this.container.querySelector('.ws-wire-container');
            container.classList.add('slide-out-left');
            
            setTimeout(() => {
                this.currentPanel++;
                this.render(true, 'right');
            }, 400);
        } else {
            // Check if all wires that should have been cut are cut
            const allRequiredCut = this.panels.every(panel => 
                panel.every(wire => !wire.shouldCut || wire.cut)
            );

            if (allRequiredCut) {
                this.disarm();
            } else {
                Logger.warn("WireSequences", "Strike! Not all required wires were cut.");
                GameEngine.addStrike();
            }
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("WireSequences", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
