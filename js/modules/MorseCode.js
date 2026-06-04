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
        this.flashSequenceId = 0;
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
                <button class="morse-replay" title="Replay Pattern">↻</button>
                <div class="morse-light"></div>
                <div class="morse-controls">
                    <button class="morse-nav prev morse-reveal" style="animation-delay: 0.1s"><</button>
                    <div class="morse-freq-display morse-reveal" style="animation-delay: 0.2s">
                        <span class="morse-freq-val">${this.frequencies[this.currentFreqIndex].freq} MHz</span>
                    </div>
                    <button class="morse-nav next morse-reveal" style="animation-delay: 0.3s">></button>
                </div>
                <button class="morse-tx morse-reveal" style="animation-delay: 0.4s">TX</button>
            </div>
        `;

        this.container.querySelector('.prev').onclick = () => this.changeFreq(-1);
        this.container.querySelector('.next').onclick = () => this.changeFreq(1);
        this.container.querySelector('.morse-tx').onclick = () => this.submit();
        this.container.querySelector('.morse-replay').onclick = () => this.replay();
    }

    changeFreq(dir) {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        
        const displayVal = this.container.querySelector('.morse-freq-val');
        const animClass = dir > 0 ? 'slide-up' : 'slide-down';
        
        displayVal.classList.remove('slide-up', 'slide-down');
        void displayVal.offsetWidth; // Trigger reflow
        displayVal.classList.add(animClass);
        
        this.currentFreqIndex = (this.currentFreqIndex + dir + this.frequencies.length) % this.frequencies.length;
        
        setTimeout(() => {
            displayVal.textContent = `${this.frequencies[this.currentFreqIndex].freq} MHz`;
        }, 100);
    }

    replay() {
        if (this.isDisarmed || GameEngine.isGameOver) return;
        
        Logger.log("MorseCode", "Replaying sequence");
        const light = this.container.querySelector('.morse-light');
        if (light) {
            light.classList.remove('sync-pulse', 'lit', 'dot', 'dash');
        }
        this.startFlashing();
    }

    async startFlashing() {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        this.flashSequenceId++;
        const currentSeqId = this.flashSequenceId;

        const dotTime = 250;
        const dashTime = 750;
        const letterGap = 750;
        const wordGap = 2000;

        const light = this.container.querySelector('.morse-light');
        
        const flashSequence = async () => {
            if (this.isDisarmed || GameEngine.isGameOver || this.flashSequenceId !== currentSeqId) return;

            // GREEN SYNC PULSE: Signals the start of the word
            light.classList.add('sync-pulse');
            await this.sleep(1000);
            if (this.flashSequenceId !== currentSeqId) return;
            light.classList.remove('sync-pulse');
            await this.sleep(1000);
            if (this.flashSequenceId !== currentSeqId) return;

            for (const char of this.word) {
                if (this.isDisarmed || GameEngine.isGameOver || this.flashSequenceId !== currentSeqId) return;
                const code = this.morseMap[char];
                for (const symbol of code) {
                    if (this.flashSequenceId !== currentSeqId) return;
                    const isDot = symbol === '.';
                    light.classList.add('lit');
                    light.classList.add(isDot ? 'dot' : 'dash');
                    
                    await this.sleep(isDot ? dotTime : dashTime);
                    if (this.flashSequenceId !== currentSeqId) return;
                    
                    light.classList.remove('lit', 'dot', 'dash');
                    await this.sleep(dotTime); // Gap between symbols
                }
                await this.sleep(letterGap);
            }
            await this.sleep(wordGap);
            if (!this.isDisarmed && !GameEngine.isGameOver && this.flashSequenceId === currentSeqId) flashSequence();
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
