import { BombState } from '../BombState.js';
import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class ComplicatedWires {
    constructor(container) {
        this.container = container;
        this.wires = [];
        this.isDisarmed = false;
        this.solvedWires = 0;
    }

    init() {
        try {
            Logger.log("ComplicatedWires", "Initializing module");
            this.generateWires();
            this.render();
        } catch (err) {
            Logger.error("ComplicatedWires", "Initialization failed", err);
        }
    }

    generateWires() {
        const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 wires
        this.wires = [];
        for (let i = 0; i < count; i++) {
            this.wires.push({
                red: Math.random() > 0.5,
                blue: Math.random() > 0.5,
                star: Math.random() > 0.5,
                led: Math.random() > 0.5,
                cut: false
            });
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="module complicated-wires">
                <div class="module-status"></div>
                <div class="comp-wire-container">
                    ${this.wires.map((w, i) => `
                        <div class="comp-wire-slot">
                            <div class="comp-led ${w.led ? 'lit' : ''}"></div>
                            <div class="comp-wire ${w.red ? 'red' : ''} ${w.blue ? 'blue' : ''}" data-index="${i}"></div>
                            <div class="comp-star ${w.star ? 'present' : ''}">★</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.comp-wire').forEach(wire => {
            wire.onclick = () => this.handleCut(parseInt(wire.dataset.index));
        });
    }

    handleCut(index) {
        if (this.isDisarmed || GameEngine.isGameOver || this.wires[index].cut) return;

        const wire = this.wires[index];
        wire.cut = true;
        
        const wireEl = this.container.querySelector(`.comp-wire[data-index="${index}"]`);
        wireEl.classList.add('cut');

        if (this.shouldCut(wire)) {
            Logger.log("ComplicatedWires", `Correct cut: wire ${index}`);
            this.checkCompletion();
        } else {
            Logger.warn("ComplicatedWires", `Strike! Incorrect cut: wire ${index}`);
            GameEngine.addStrike();
        }
    }

    shouldCut(w) {
        // Venn Diagram Logic
        // R=Red, B=Blue, S=Star, L=LED
        const { red, blue, star, led } = w;
        
        // Manual Instructions:
        // C = Cut
        // D = Do not cut
        // S = Cut if last digit of serial is even
        // P = Cut if bomb has parallel port (we use: 2+ batteries as substitute)
        // B = Cut if bomb has 2 or more batteries
        
        if (!red && !blue && !star && !led) return true; // White, no star, no LED: C
        if (!red && !blue && star && !led) return true;  // White, star, no LED: C
        if (!red && !blue && !star && led) return false; // White, no star, LED: D
        if (!red && !blue && star && led) return BombState.batteries >= 2; // White, star, LED: B
        
        if (red && !blue && !star && !led) return BombState.isSerialLastDigitEven(); // Red, no star, no LED: S
        if (red && !blue && star && !led) return true; // Red, star, no LED: C
        if (red && !blue && !star && led) return BombState.batteries >= 2; // Red, no star, LED: B
        if (red && !blue && star && led) return BombState.batteries >= 2; // Red, star, LED: B
        
        if (!red && blue && !star && !led) return BombState.isSerialLastDigitEven(); // Blue, no star, no LED: S
        if (!red && blue && star && !led) return false; // Blue, star, no LED: D
        if (!red && blue && !star && led) return BombState.isSerialLastDigitEven(); // Blue, no star, LED: P (sub S)
        if (!red && blue && star && led) return BombState.isSerialLastDigitEven(); // Blue, star, LED: P (sub S)
        
        if (red && blue && !star && !led) return BombState.isSerialLastDigitEven(); // R/B, no star, no LED: S
        if (red && blue && star && !led) return BombState.isSerialLastDigitEven(); // R/B, star, no LED: P (sub S)
        if (red && blue && !star && led) return BombState.isSerialLastDigitEven(); // R/B, no star, LED: S
        if (red && blue && star && led) return false; // R/B, star, LED: D
        
        return false;
    }

    checkCompletion() {
        // In KTANE, Complicated Wires disarms when ALL "should cut" wires are cut
        // and no "should not cut" wires are cut. However, to simplify for MVP:
        // Any incorrect cut is a strike. Disarm if all remaining wires are "should not cut".
        const allCorrectCut = this.wires.every(w => !w.cut || this.shouldCut(w));
        const neededWiresCut = this.wires.filter(w => this.shouldCut(w)).every(w => w.cut);

        if (allCorrectCut && neededWiresCut) {
            this.disarm();
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("ComplicatedWires", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
