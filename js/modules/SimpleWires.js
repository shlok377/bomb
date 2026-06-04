import { BombState } from '../BombState.js';
import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class SimpleWires {
    constructor(container) {
        this.container = container;
        this.wires = [];
        this.colors = ['red', 'blue', 'yellow', 'white', 'black'];
        this.isDisarmed = false;
    }

    init() {
        try {
            Logger.log("SimpleWires", "Initializing module");
            this.generateWires();
            this.render();
        } catch (err) {
            Logger.error("SimpleWires", "Initialization failed", err);
        }
    }

    generateWires() {
        const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 wires
        this.wires = [];
        for (let i = 0; i < count; i++) {
            this.wires.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
        }
        Logger.log("SimpleWires", "Generated wires", this.wires);
    }

    render() {
        this.container.innerHTML = `
            <div class="module simple-wires">
                <div class="module-status"></div>
                <div class="wire-container"></div>
            </div>
        `;
        
        const wireContainer = this.container.querySelector('.wire-container');
        this.wires.forEach((color, index) => {
            const wire = document.createElement('div');
            wire.className = `wire wire-${color} wire-reveal`;
            wire.style.animationDelay = `${index * 0.1}s`;
            wire.dataset.index = index;
            wire.onclick = () => this.cutWire(index);
            wireContainer.appendChild(wire);
        });
    }

    cutWire(index) {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        const wireEl = this.container.querySelectorAll('.wire')[index];
        if (wireEl.classList.contains('wire-cut')) return;

        AudioManager.playClick();
        Logger.log("SimpleWires", `Wire ${index} (${this.wires[index]}) cut`);
        
        const correctIndex = this.getCorrectWireIndex();
        
        if (index === correctIndex) {
            wireEl.classList.add('wire-cut');
            this.disarm();
        } else {
            wireEl.classList.add('wire-strike');
            setTimeout(() => {
                wireEl.classList.remove('wire-strike');
                wireEl.classList.add('wire-cut');
            }, 200);
            this.strike(index);
        }
    }

    getCorrectWireIndex() {
        const count = this.wires.length;
        const redCount = this.wires.filter(c => c === 'red').length;
        const blueCount = this.wires.filter(c => c === 'blue').length;
        const yellowCount = this.wires.filter(c => c === 'yellow').length;
        const whiteCount = this.wires.filter(c => c === 'white').length;
        const blackCount = this.wires.filter(c => c === 'black').length;
        const serialLastDigitEven = BombState.isSerialLastDigitEven();

        if (count === 3) {
            if (redCount === 0) return 1; // 2nd wire
            if (this.wires[2] === 'white') return 2; // last wire
            if (blueCount > 1) {
                // Last blue wire
                for (let i = 2; i >= 0; i--) if (this.wires[i] === 'blue') return i;
            }
            return 2; // last wire
        } 
        
        if (count === 4) {
            if (redCount > 1 && !serialLastDigitEven) {
                // Last red wire
                for (let i = 3; i >= 0; i--) if (this.wires[i] === 'red') return i;
            }
            if (this.wires[3] === 'yellow' && redCount === 0) return 0; // 1st wire
            if (blueCount === 1) return 0; // 1st wire
            if (yellowCount > 1) return 3; // last wire
            return 1; // 2nd wire
        }

        if (count === 5) {
            if (this.wires[4] === 'black' && !serialLastDigitEven) return 3; // 4th wire
            if (redCount === 1 && yellowCount > 1) return 0; // 1st wire
            if (blackCount === 0) return 1; // 2nd wire
            return 0; // 1st wire
        }

        if (count === 6) {
            if (yellowCount === 0 && !serialLastDigitEven) return 2; // 3rd wire
            if (yellowCount === 1 && whiteCount > 1) return 3; // 4th wire
            if (redCount === 0) return 5; // last wire
            return 3; // 4th wire
        }

        return -1;
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("SimpleWires", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike(index) {
        Logger.warn("SimpleWires", `Incorrect wire cut: ${index}. Correct was ${this.getCorrectWireIndex()}`);
        GameEngine.addStrike();
    }
}
