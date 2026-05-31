import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class Keypads {
    constructor(container) {
        this.container = container;
        this.selectedSymbols = [];
        this.correctOrder = [];
        this.pressedCount = 0;
        this.isDisarmed = false;

        // Symbols represented by unicode or descriptive labels
        // In a real game, these would be image assets.
        this.columns = [
            ['balloon', 'at', 'lambda', 'lightning', 'squid', 'h', 'backwards-c'],
            ['euro', 'balloon', 'backwards-c', 'cursive-q', 'hollow-star', 'h', 'question-mark'],
            ['copyright', 'wavy-w', 'cursive-q', 'k', 'r', 'lambda', 'hollow-star'],
            ['six', 'paragraph', 'b', 'squid', 'k', 'question-mark', 'smiley'],
            ['trident', 'smiley', 'b', 'c-dot', 'paragraph', 'dragon', 'solid-star'],
            ['six', 'euro', 'puzzle', 'ae', 'trident', 'n', 'omega']
        ];
    }

    init() {
        try {
            Logger.log("Keypads", "Initializing module");
            this.generatePuzzle();
            this.render();
        } catch (err) {
            Logger.error("Keypads", "Initialization failed", err);
        }
    }

    generatePuzzle() {
        // Pick a random column
        const column = this.columns[Math.floor(Math.random() * this.columns.length)];
        
        // Pick 4 random symbols from that column
        const indices = [];
        while (indices.length < 4) {
            const idx = Math.floor(Math.random() * column.length);
            if (!indices.includes(idx)) indices.push(idx);
        }
        
        // Correct order is based on their original order in the column
        indices.sort((a, b) => a - b);
        this.correctOrder = indices.map(i => column[i]);
        
        // Shuffle for display
        this.selectedSymbols = [...this.correctOrder].sort(() => Math.random() - 0.5);
        
        Logger.log("Keypads", "Puzzle generated", { symbols: this.selectedSymbols, order: this.correctOrder });
    }

    render() {
        this.container.innerHTML = `
            <div class="module keypads">
                <div class="module-status"></div>
                <div class="keypad-grid"></div>
            </div>
        `;
        
        const grid = this.container.querySelector('.keypad-grid');
        this.selectedSymbols.forEach((symbol, index) => {
            const btn = document.createElement('button');
            btn.className = 'keypad-btn';
            btn.dataset.symbol = symbol;
            // For now, just display the name. In production, this would be an icon.
            btn.innerHTML = `<span class="symbol-icon">${this.getSymbolIcon(symbol)}</span>`;
            btn.onclick = () => this.onKeyClick(btn, symbol);
            grid.appendChild(btn);
        });
    }

    getSymbolIcon(symbol) {
        // Mapping names to simple characters or icons for 2D UI
        const icons = {
            'balloon': 'Ϙ', 'at': 'Ѧ', 'lambda': 'λ', 'lightning': 'Ϟ', 'squid': 'Ѭ', 'h': 'ϗ', 'backwards-c': 'Ͽ',
            'euro': 'Ӭ', 'cursive-q': 'Ҩ', 'hollow-star': '☆', 'question-mark': '¿', 'copyright': '©', 'wavy-w': 'Ѽ',
            'k': 'Ϗ', 'r': 'Ѵ', 'six': 'б', 'paragraph': '¶', 'b': 'Ѣ', 'smiley': 'ت', 'trident': 'Ψ',
            'c-dot': 'Ͼ', 'dragon': 'Ѯ', 'solid-star': '★', 'puzzle': 'ѩ', 'ae': 'æ', 'n': 'Ҋ', 'omega': 'Ω'
        };
        return icons[symbol] || symbol;
    }

    onKeyClick(btn, symbol) {
        if (this.isDisarmed || GameEngine.isGameOver || btn.classList.contains('pressed')) return;

        Logger.log("Keypads", `Clicked symbol: ${symbol}`);

        if (symbol === this.correctOrder[this.pressedCount]) {
            btn.classList.add('pressed');
            this.pressedCount++;
            Logger.log("Keypads", `Correct! ${this.pressedCount}/4`);
            
            if (this.pressedCount === 4) {
                this.disarm();
            }
        } else {
            this.strike();
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Keypads", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike() {
        Logger.warn("Keypads", "Incorrect symbol order!");
        this.pressedCount = 0;
        this.container.querySelectorAll('.keypad-btn').forEach(b => b.classList.remove('pressed'));
        GameEngine.addStrike();
    }
}
