import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';

export class MorseCode {
    constructor(container) {
        this.container = container;
        this.word = "";
        this.frequency = 0;
        this.currentIndex = 0;
        this.frequencies = [
            { word: "shell", freq: "3.505" },
            { word: "halls", freq: "3.515" },
            { word: "slick", freq: "3.522" },
            { word: "trick", freq: "3.532" },
            { word: "boxes", freq: "3.535" },
            { word: "leaks", freq: "3.542" },
            { word: "strobe", freq: "3.545" },
            { word: "bistro", freq: "3.552" },
            { word: "flick", freq: "3.555" },
            { word: "bombs", freq: "3.565" },
            { word: "break", freq: "3.572" },
            { word: "brick", freq: "3.575" },
            { word: "steak", freq: "3.582" },
            { word: "sting", freq: "3.592" },
            { word: "vector", freq: "3.595" },
            { word: "beats", freq: "3.600" }
        ];
        this.morseMap = {
            'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.', 'g': '--.', 'h': '....',
            'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---', 'p': '.--.',
            'q': '--.-', 'r': '.-.', 's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
            'y': '-.--', 'z': '--..'
        };
        this.isDisarmed = false;
        this.currentFreqIndex = 0;
        this.flashInterval = null;
    }

    init() {
        try {
            Logger.log("MorseCode", "Initializing module");
            const choice = this.frequencies[Math.floor(Math.random() * this.frequencies.length)];
            this.word = choice.word;
            this.frequency = choice.freq;
            this.render();
            this.startFlashing();
        } catch (err) {
            Logger.error("MorseCode", "Initialization failed", err);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="module morse-code">
                <div class="module-status"></div>
                <div class="morse-light"></div>
                <div class="morse-controls">
                    <button class="morse-nav prev"><</button>
                    <div class="morse-freq-display">${this.frequencies[this.currentFreqIndex].freq} MHz</div>
                    <button class="morse-nav next">></button>
                </div>
                <button class="morse-tx">TX</button>
            </div>
        `;

        this.container.querySelector('.prev').onclick = () => this.changeFreq(-1);
        this.container.querySelector('.next').onclick = () => this.changeFreq(1);
        this.container.querySelector('.morse-tx').onclick = () => this.submit();
    }

    changeFreq(dir) {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        this.currentFreqIndex = (this.currentFreqIndex + dir + this.frequencies.length) % this.frequencies.length;
        this.container.querySelector('.morse-freq-display').textContent = `${this.frequencies[this.currentFreqIndex].freq} MHz`;
    }

    async startFlashing() {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        const dotTime = 250;
        const dashTime = 750;
        const letterGap = 750;
        const wordGap = 2000;

        const light = this.container.querySelector('.morse-light');
        
        const flashSequence = async () => {
            for (const char of this.word) {
                if (this.isDisarmed || GameEngine.isGameOver) return;
                const code = this.morseMap[char];
                for (const symbol of code) {
                    light.classList.add('lit');
                    await this.sleep(symbol === '.' ? dotTime : dashTime);
                    light.classList.remove('lit');
                    await this.sleep(dotTime); // Gap between symbols
                }
                await this.sleep(letterGap);
            }
            await this.sleep(wordGap);
            if (!this.isDisarmed && !GameEngine.isGameOver) flashSequence();
        };

        flashSequence();
    }

    submit() {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        
        const selectedFreq = this.frequencies[this.currentFreqIndex].freq;
        Logger.log("MorseCode", `Submitted frequency: ${selectedFreq}, Correct: ${this.frequency}`);

        if (selectedFreq === this.frequency) {
            this.disarm();
        } else {
            GameEngine.addStrike();
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("MorseCode", "Module Disarmed");
        GameEngine.moduleSolved();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
