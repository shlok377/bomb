import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class WhosOnFirst {
    constructor(container) {
        this.container = container;
        this.displayWord = "";
        this.buttonWords = [];
        this.isDisarmed = false;

        this.displayMappings = {
            "YES": 2, "FIRST": 1, "DISPLAY": 5, "OKAY": 1, "SAYS": 5, "NOTHING": 2,
            "": 4, "BLANK": 3, "NO": 5, "LED": 2, "LEAD": 5, "READ": 3, "RED": 3,
            "REED": 4, "LEED": 4, "HOLD ON": 5, "YOU": 3, "YOU ARE": 5, "YOUR": 3,
            "YOU'RE": 3, "UR": 0, "THERE": 5, "THEY'RE": 4, "THEIR": 3, "THEY ARE": 2,
            "SEE": 5, "C": 1, "CEE": 5
        };

        this.buttonLists = {
            "READY": ["YES", "OKAY", "WHAT", "MIDDLE", "LEFT", "PRESS", "RIGHT", "BLANK", "READY", "NO", "FIRST", "UHHH", "NOTHING", "WAIT"],
            "FIRST": ["LEFT", "OKAY", "YES", "MIDDLE", "NO", "RIGHT", "NOTHING", "UHHH", "WAIT", "READY", "BLANK", "WHAT", "PRESS", "FIRST"],
            "NO": ["BLANK", "UHHH", "WAIT", "FIRST", "WHAT", "READY", "RIGHT", "YES", "NOTHING", "LEFT", "PRESS", "OKAY", "NO", "MIDDLE"],
            "BLANK": ["WAIT", "RIGHT", "OKAY", "MIDDLE", "BLANK", "NO", "PRESS", "LEFT", "WHAT", "UHHH", "YES", "READY", "FIRST", "NOTHING"],
            "NOTHING": ["UHHH", "RIGHT", "OKAY", "MIDDLE", "YES", "BLANK", "NO", "PRESS", "LEFT", "WHAT", "WAIT", "FIRST", "NOTHING", "READY"],
            "YES": ["OKAY", "RIGHT", "UHHH", "MIDDLE", "FIRST", "WHAT", "PRESS", "READY", "NOTHING", "YES", "LEFT", "BLANK", "NO", "WAIT"],
            "WHAT": ["UHHH", "WHAT", "LEFT", "NOTHING", "READY", "BLANK", "MIDDLE", "NO", "OKAY", "FIRST", "WAIT", "YES", "PRESS", "RIGHT"],
            "UHHH": ["READY", "NOTHING", "LEFT", "WHAT", "OKAY", "YES", "RIGHT", "NO", "PRESS", "BLANK", "UHHH", "MIDDLE", "WAIT", "FIRST"],
            "LEFT": ["RIGHT", "LEFT", "FIRST", "NO", "MIDDLE", "YES", "BLANK", "WHAT", "UHHH", "WAIT", "PRESS", "READY", "OKAY", "NOTHING"],
            "RIGHT": ["YES", "NOTHING", "READY", "PRESS", "NO", "WAIT", "WHAT", "RIGHT", "MIDDLE", "LEFT", "UHHH", "BLANK", "OKAY", "FIRST"],
            "MIDDLE": ["BLANK", "READY", "OKAY", "WHAT", "NOTHING", "PRESS", "NO", "WAIT", "LEFT", "MIDDLE", "RIGHT", "FIRST", "UHHH", "YES"],
            "OKAY": ["MIDDLE", "NO", "FIRST", "YES", "UHHH", "NOTHING", "WAIT", "OKAY", "LEFT", "READY", "BLANK", "RIGHT", "WHAT", "PRESS"],
            "WAIT": ["UHHH", "NO", "BLANK", "OKAY", "YES", "LEFT", "FIRST", "PRESS", "WHAT", "WAIT", "NOTHING", "READY", "RIGHT", "MIDDLE"],
            "PRESS": ["RIGHT", "MIDDLE", "YES", "READY", "PRESS", "OKAY", "NOTHING", "UHHH", "BLANK", "LEFT", "FIRST", "WHAT", "NO", "WAIT"],
            "YOU": ["SURE", "YOU ARE", "YOUR", "YOU'RE", "NEXT", "UH HUH", "UR", "HOLD", "WHAT?", "YOU", "UH UH", "LIKE", "DONE", "U"],
            "YOU ARE": ["YOUR", "NEXT", "LIKE", "UH HUH", "WHAT?", "DONE", "UH UH", "HOLD", "YOU", "U", "YOU'RE", "SURE", "UR", "YOU ARE"],
            "YOUR": ["UH UH", "YOU ARE", "UH HUH", "YOUR", "NEXT", "UR", "SURE", "U", "YOU'RE", "YOU", "WHAT?", "HOLD", "LIKE", "DONE"],
            "YOU'RE": ["YOU", "YOU'RE", "UR", "NEXT", "UH UH", "YOU ARE", "U", "YOUR", "HOLD", "LIKE", "DONE", "WHAT?", "HOLD", "UH HUH"],
            "UR": ["DONE", "U", "UR", "UH HUH", "WHAT?", "SURE", "YOUR", "HOLD", "YOU'RE", "LIKE", "NEXT", "UH UH", "YOU ARE", "YOU"],
            "U": ["UH HUH", "SURE", "NEXT", "WHAT?", "YOU'RE", "UR", "UH UH", "DONE", "U", "YOU", "LIKE", "HOLD", "YOU ARE", "YOUR"],
            "UH HUH": ["UH HUH", "YOUR", "YOU ARE", "YOU", "DONE", "HOLD", "UH UH", "NEXT", "SURE", "LIKE", "YOU'RE", "UR", "U", "WHAT?"],
            "UH UH": ["UR", "U", "YOU ARE", "YOU'RE", "NEXT", "UH HUH", "DONE", "YOU", "UH UH", "LIKE", "YOUR", "SURE", "HOLD", "WHAT?"],
            "WHAT?": ["YOU", "HOLD", "YOU'RE", "YOUR", "U", "DONE", "NEXT", "LIKE", "YOU ARE", "UH UH", "UR", "UH HUH", "WHAT?", "SURE"],
            "DONE": ["SURE", "UH HUH", "NEXT", "WHAT?", "YOUR", "UR", "YOU'RE", "HOLD", "LIKE", "YOU", "U", "YOU ARE", "UH UH", "DONE"],
            "NEXT": ["WHAT?", "UH HUH", "UH UH", "YOUR", "HOLD", "SURE", "NEXT", "LIKE", "DONE", "YOU ARE", "UR", "YOU", "U", "YOU'RE"],
            "HOLD": ["YOU ARE", "U", "DONE", "UH UH", "YOU", "UR", "SURE", "WHAT?", "YOU'RE", "NEXT", "HOLD", "UH HUH", "YOUR", "LIKE"],
            "SURE": ["YOU ARE", "DONE", "LIKE", "YOU'RE", "YOU", "HOLD", "UH HUH", "UR", "SURE", "U", "WHAT?", "NEXT", "YOUR", "UH UH"],
            "LIKE": ["YOU'RE", "NEXT", "U", "UR", "HOLD", "DONE", "UH UH", "WHAT?", "UH HUH", "YOU", "LIKE", "SURE", "YOU ARE", "YOUR"]
        };
    }

    init() {
        try {
            Logger.log("WhosOnFirst", "Initializing module");
            this.generatePuzzle();
            this.render();
        } catch (err) {
            Logger.error("WhosOnFirst", "Initialization failed", err);
        }
    }

    generatePuzzle() {
        const displayWords = Object.keys(this.displayMappings);
        this.displayWord = displayWords[Math.floor(Math.random() * displayWords.length)];

        const buttonPool = Object.keys(this.buttonLists);
        this.buttonWords = [];
        while (this.buttonWords.length < 6) {
            const word = buttonPool[Math.floor(Math.random() * buttonPool.length)];
            if (!this.buttonWords.includes(word)) {
                this.buttonWords.push(word);
            }
        }
        Logger.log("WhosOnFirst", "Puzzle Generated", { display: this.displayWord, buttons: this.buttonWords });
    }

    render() {
        this.container.innerHTML = `
            <div class="module whos-on-first">
                <div class="module-status"></div>
                <div class="wof-display">${this.displayWord}</div>
                <div class="wof-button-grid">
                    ${this.buttonWords.map((word, i) => `<button class="wof-btn" data-index="${i}">${word}</button>`).join('')}
                </div>
            </div>
        `;

        this.container.querySelectorAll('.wof-btn').forEach(btn => {
            btn.onclick = () => this.handlePress(btn.textContent);
        });
    }

    handlePress(pressedWord) {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        AudioManager.playClick();
        Logger.log("WhosOnFirst", `Button pressed: ${pressedWord}`);

        const correctWord = this.getCorrectWord();
        if (pressedWord === correctWord) {
            this.disarm();
        } else {
            this.strike(pressedWord, correctWord);
        }
    }

    getCorrectWord() {
        // Step 1: Find which button position to check
        const posIndex = this.displayMappings[this.displayWord];
        const buttonToLookAt = this.buttonWords[posIndex];
        
        // Step 2: Use that button's word to find the list
        const list = this.buttonLists[buttonToLookAt];
        
        // Step 3: Find the first word in that list that is also on one of our buttons
        for (const word of list) {
            if (this.buttonWords.includes(word)) {
                return word;
            }
        }
        return null;
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("WhosOnFirst", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    strike(pressed, correct) {
        Logger.warn("WhosOnFirst", `Strike! Pressed ${pressed}, Expected ${correct}`);
        GameEngine.addStrike();
        // Regenerate for next attempt as per original game behavior
        this.generatePuzzle();
        this.render();
    }
}
