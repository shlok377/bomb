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
            // Start at a random index (not necessarily the correct one)
            this.indices[i] = Math.floor(Math.random() * 6);
        }
        Logger.log("Passwords", "Password Generated", this.selectedWord);
    }

    render() {
        this.container.innerHTML = `
            <div class="module passwords">
                <div class="module-status"></div>
                <div class="pass-columns">
                    ${this.columns.map((col, i) => `
                        <div class="pass-column pass-column-reveal" style="animation-delay: ${i * 0.05}s">
                            <button class="pass-nav up" data-col="${i}">▲</button>
                            <div class="pass-char-container" data-col="${i}">
                                <div class="pass-char">${col[this.indices[i]].toUpperCase()}</div>
                            </div>
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
        
        const container = this.container.querySelector(`.pass-char-container[data-col="${colIdx}"]`);
        const oldCharEl = container.querySelector('.pass-char');
        
        // Setup new character element
        const nextIdx = (this.indices[colIdx] + dir + 6) % 6;
        const newCharEl = document.createElement('div');
        newCharEl.className = 'pass-char';
        newCharEl.textContent = this.columns[colIdx][nextIdx].toUpperCase();
        
        // Apply animation classes
        if (dir > 0) { // Down
            oldCharEl.classList.add('slide-up-out');
            newCharEl.classList.add('slide-up-in');
        } else { // Up
            oldCharEl.classList.add('slide-down-out');
            newCharEl.classList.add('slide-down-in');
        }
        
        container.appendChild(newCharEl);
        
        // Trigger animation
        setTimeout(() => {
            newCharEl.classList.remove('slide-up-in', 'slide-down-in');
            this.indices[colIdx] = nextIdx;
        }, 50);

        // Cleanup old element
        setTimeout(() => {
            if (oldCharEl.parentNode === container) {
                container.removeChild(oldCharEl);
            }
        }, 200);
    }

    submit() {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        const currentWord = this.indices.map((idx, i) => this.columns[i][idx]).join('');
        Logger.log("Passwords", `Submitting: ${currentWord}, Correct: ${this.selectedWord}`);

        if (currentWord === this.selectedWord) {
            this.disarm();
        } else {
            Logger.warn("Passwords", "Strike! Incorrect word.");
            const chars = this.container.querySelectorAll('.pass-char');
            chars.forEach(c => {
                c.classList.add('shiver');
                setTimeout(() => c.classList.remove('shiver'), 300);
            });
            GameEngine.addStrike();
        }
    }

    disarm() {
        this.isDisarmed = true;
        const chars = this.container.querySelectorAll('.pass-char');
        chars.forEach((c, i) => {
            setTimeout(() => {
                c.classList.add('success-pulse');
            }, i * 100);
        });
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Passwords", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
