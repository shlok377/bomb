/**
 * AIExpert.js
 * Handles Voice-to-Text, Groq API Uplink, and AI Expert Logic.
 */

import { Logger } from './Logger.js';
import { AudioManager } from './AudioManager.js';
import { CommentatorManager } from './commentator/CommentatorManager.js';

export const AIExpert = {
    apiKey: null,
    recognition: null,
    isRecording: false,
    isCooldown: false,
    cooldownTime: 3000, 
    history: [],
    maxHistory: 4,

    // Base System Prompt (Context will be prepended dynamically)
    systemPromptBase: `You are an automated AI Expert Bomb Defusal System.
ROBOTIC PROTOCOL: 
1. STATUS CONFIRMATION: Briefly repeat key intel received (e.g. "CONFIRMED: 3 WIRES.").
2. INSTRUCTION: Provide the next logical step immediately.
3. CONSTRAINTS: Reply in UNDER 15 WORDS. Use ALL CAPS for emphasis. NO conversational filler. NO 'Hello'. NO 'Good luck'.
4. PERSONALITY: Chatbot-like, logical, sterile, tactical.`,

    contextMap: {
        'button': ['button.md'],
        'keypad': ['keypads.md'],
        'symbol': ['keypads.md'],
        'simon': ['simon.md'],
        'flash': ['simon.md', 'morse.md'],
        'first': ['wof.md'],
        'who': ['wof.md'],
        'memory': ['memory.md'],
        'morse': ['morse.md'],
        'maze': ['mazes.md'],
        'password': ['passwords.md'],
        'letter': ['passwords.md'],
        'serial': ['edgework.md'],
        'battery': ['edgework.md'],
        'batteries': ['edgework.md'],
        'indicator': ['edgework.md'],
        'port': ['edgework.md'],
        // The "Wire" Umbrella
        'simple wire': ['simple_wires.md'],
        'complicated': ['complicated_wires.md'],
        'sequence': ['wire_sequences.md'],
        'wire': ['simple_wires.md', 'complicated_wires.md', 'wire_sequences.md'] 
    },

    init(apiKey) {
        this.apiKey = apiKey;
        this.setupSpeech();
        this.setupPTT();
        Logger.log("AIExpert", "Tactical Uplink Ready.");
    },

    setupSpeech() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            Logger.error("AIExpert", "Speech Recognition not supported in this browser.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false; // Snappier for PTT bursts
        this.recognition.interimResults = true; 
        this.recognition.lang = 'en-US'; 

        this.recognition.onstart = () => {
            Logger.log("AIExpert", "Uplink Active: Listening...");
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript.trim().length > 1) {
                this.handleUserVoice(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech') return;
            if (event.error === 'network') {
                this.addMessage("SYSTEM", "SPEECH NETWORK ERR. RE-TRYING...", "system");
                this.stopRecording();
                setTimeout(() => this.setupSpeech(), 500);
                return;
            }
            Logger.error("AIExpert", `Speech Error: ${event.error}`);
            this.stopRecordingUI();
        };

        this.recognition.onend = () => {
            Logger.log("AIExpert", "Recognition Session Ended");
        };
    },

    setupPTT() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRecording && !this.isCooldown) {
                if (document.activeElement.tagName === 'INPUT') return; 
                e.preventDefault();
                this.startRecording();
            } else if (e.code === 'Space' && this.isCooldown) {
                e.preventDefault();
                this.showCooldownWarning();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this.isRecording) {
                e.preventDefault();
                this.stopRecording();
            }
        });
    },

    startRecording() {
        if (!this.recognition) {
            Logger.error("AIExpert", "Speech engine not initialized.");
            return;
        }
        if (this.isRecording) return;

        this.isRecording = true;
        AudioManager.playRadioStart();
        this.startRecordingUI();
        
        try {
            this.recognition.start();
            Logger.log("AIExpert", "Recognition Started");
        } catch (e) {
            Logger.warn("AIExpert", "Failed to start recognition", e);
            this.isRecording = false;
            this.stopRecordingUI();
        }
    },

    stopRecording() {
        if (!this.recognition || !this.isRecording) return;
        
        Logger.log("AIExpert", "Recognition Stopping...");
        try {
            this.recognition.stop();
        } catch (e) {
            Logger.error("AIExpert", "Error stopping recognition", e);
        }
        
        this.isRecording = false;
        this.stopRecordingUI();
        AudioManager.playRadioStop();
    },

    startRecordingUI() {
        const box = document.getElementById('landing-comms-box') || document.querySelector('.comms-box');
        if (box) {
            box.classList.add('active', 'recording');
            const header = box.querySelector('.comms-header');
            if (header) header.innerText = "TRANSMITTING...";
        }
    },

    stopRecordingUI() {
        const box = document.getElementById('landing-comms-box') || document.querySelector('.comms-box');
        if (box) {
            box.classList.remove('recording');
            const header = box.querySelector('.comms-header');
            if (header) header.innerText = "INCOMING TRANSMISSION...";
        }
    },

    showCooldownWarning() {
        this.addMessage("SYSTEM", "CHANNEL BUSY - PLEASE WAIT", "system");
    },

    async handleUserVoice(text) {
        if (!text || text.trim().length < 2) return;
        this.addMessage("YOU", text, "user");
        this.startCooldown();
        await this.getAIResponse(text);
    },

    startCooldown() {
        this.isCooldown = true;
        setTimeout(() => {
            this.isCooldown = false;
        }, this.cooldownTime);
    },

    async getAIResponse(userInput) {
        if (!this.apiKey) {
            this.addMessage("SYSTEM", "NO API KEY FOUND. RE-LOG IN.", "system");
            return;
        }

        try {
            const relevantFiles = this.identifyContext(userInput);
            const manualContext = await this.loadManualContext(relevantFiles);
            const systemPrompt = `${this.systemPromptBase}\n\nRELEVANT MANUAL SECTION:\n${manualContext}`;

            const messages = [
                { role: "system", content: systemPrompt },
                ...this.history,
                { role: "user", content: userInput }
            ];

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: messages,
                    temperature: 0.3,
                    max_tokens: 100
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMsg = errorData.error?.message || "Unknown API Error";
                Logger.error("AIExpert", `API Error ${response.status}: ${errorMsg}`);
                this.addMessage("SYSTEM", `UPLINK ERR ${response.status}: ${errorMsg.substring(0, 30)}...`, "system");
                return;
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content;

            this.history.push({ role: "user", content: userInput });
            this.history.push({ role: "assistant", content: aiText });
            if (this.history.length > this.maxHistory * 2) {
                this.history.splice(0, 2);
            }

            this.addMessage("EXPERT", aiText, "ai");
            CommentatorManager.speak(aiText);

        } catch (err) {
            Logger.error("AIExpert", "Fetch Operation Failed", err);
            this.addMessage("SYSTEM", "NETWORK FAILURE: CHECK CONSOLE", "system");
        }
    },

    identifyContext(input) {
        const historyText = this.history.map(m => m.content).join(' ').toLowerCase();
        const text = (input + ' ' + historyText).toLowerCase();
        const filesToLoad = new Set();
        filesToLoad.add('edgework.md');

        for (const [keyword, files] of Object.entries(this.contextMap)) {
            if (text.includes(keyword)) {
                files.forEach(f => filesToLoad.add(f));
            }
        }
        return Array.from(filesToLoad);
    },

    async loadManualContext(files) {
        if (files.length === 0) return "No specific module detected. Ask defuser for more details.";
        try {
            const contents = await Promise.all(files.map(async (file) => {
                const response = await fetch(`AI_docs/${file}`);
                if (response.ok) return await response.text();
                return '';
            }));
            return contents.join('\n\n');
        } catch (err) {
            Logger.error("AIExpert", "Failed to load manual context", err);
            return "ERROR LOADING MANUAL.";
        }
    },

    addMessage(sender, text, type) {
        const box = document.getElementById('landing-comms-box') || document.querySelector('.comms-box');
        const commsText = document.getElementById('comms-text');
        if (box && commsText) {
            box.classList.add('active');
            const msgDiv = document.createElement('div');
            msgDiv.className = `comms-msg ${type}`;
            msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
            commsText.appendChild(msgDiv);
            box.scrollTop = box.scrollHeight;
        }
    }
};
