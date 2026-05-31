import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class Passwords {
    constructor(container) {
        this.container = container;
        this.selectedWord = "";
        this.columns = [[], [], [], [], []];
        this.indices = [0, 0, 0, 0, 0];
        this.isDisarmed = false;

        this.wordList = [
            "about", "after", "again", "below", "could",
            "every", "first", "found", "great", "house",
            "large", "learn", "never", "other", "place",
            "plant", "point", "right", "small", "sound",
            "spell", "still", "study", "their", "there",
            "these", "thing", "think", "three", "water",
            "where", "which", "world", "would", "write"
        ];
    }

    init() {
        try {
            Logger.log("Passwords", "Initializing module");
            this.generatePuzzle();
            this.render();
        } catch (err) {
            Logger.error("Passwords", "Initialization failed", err);
        }
    }

    generatePuzzle() {
        this.selectedWord = this.wordList[Math.floor(Math.random() * this.wordList.length)];
        
        for (let i = 0; i < 5; i++) {
            const char = this.selectedWord[i];
            const column = [char];
            const alphabet = "abcdefghijklmnopqrstuvwxyz";
            while (column.length < 6) {
                const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
                if (!column.includes(randChar)) {
                    column.push(randChar);
                }
            }
            this.columns[i] = column.sort(() => Math.random() - 0.5);
            this.indices[i] = this.columns[i].indexOf(char);
        }
        Logger.log("Passwords", "Password Generated", this.selectedWord);
    }

    render() {
        this.container.innerHTML = `
            <div class="module passwords">
                <div class="module-status"></div>
                <div class="pass-columns">
                    ${this.columns.map((col, i) => `
                        <div class="pass-column">
                            <button class="pass-nav up" data-col="${i}">▲</button>
                            <div class="pass-char">${col[this.indices[i]].toUpperCase()}</div>
                            <button class="pass-nav down" data-col="${i}">▼</button>
                        </div>
                    `).join('')}
                </div>
                <button class="pass-submit">Submit</button>
            </div>
        `;

        this.container.querySelectorAll('.pass-nav').forEach(btn => {
            btn.onclick = () => this.cycle(parseInt(btn.dataset.col), btn.classList.contains('up') ? -1 : 1);
        });

        this.container.querySelector('.pass-submit').onclick = () => this.submit();
    }

    cycle(colIdx, dir) {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        this.indices[colIdx] = (this.indices[colIdx] + dir + 6) % 6;
        this.render();
    }

    submit() {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        const currentWord = this.indices.map((idx, i) => this.columns[i][idx]).join('');
        Logger.log("Passwords", `Submitting: ${currentWord}, Correct: ${this.selectedWord}`);

        if (currentWord === this.selectedWord) {
            this.disarm();
        } else {
            Logger.warn("Passwords", "Strike! Incorrect word.");
            GameEngine.addStrike();
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Passwords", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
