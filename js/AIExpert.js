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
    cooldownTime: 3000, // 3 seconds between transmissions
    history: [],
    maxHistory: 4,

    // Compressed Manual for System Prompt
    systemPrompt: `You are an automated AI Expert Bomb Defusal System.
ROBOTIC PROTOCOL: 
1. STATUS CONFIRMATION: Briefly repeat key intel received (e.g. "CONFIRMED: 3 WIRES.").
2. INSTRUCTION: Provide the next logical step immediately.
3. CONSTRAINTS: Reply in UNDER 15 WORDS. Use ALL CAPS for emphasis. NO conversational filler. NO 'Hello'. NO 'Good luck'.
4. PERSONALITY: Chatbot-like, logical, sterile, tactical.

MANUAL:
WIRES: 
3: no red=cut 2nd, last wht=cut last, mult blu=cut last blu, else=cut last.
4: mult red+odd sn=cut last red, last yel+no red=cut 1st, 1 blu=cut 1st, mult yel=cut last, else=cut 2nd.
5: last blk+odd sn=cut 4th, 1 red+mult yel=cut 1st, no blk=cut 2nd, else=cut 1st.
6: no yel+odd sn=cut 3rd, 1 yel+mult wht=cut 4th, no red=cut last, else=cut 4th.

BUTTON: 
Blu+Abort=Hold. Mult batt+Detonate=Tap. Wht+Lit CAR=Hold. 3+ batt+Lit FRK=Tap. Yel=Hold. Red+Hold=Tap. Else=Hold. 
HOLD RELEASE: Blu strip=4, Wht=1, Yel=5, Else=1 (in any timer pos).

SIMON(strikes 0,1,2): 
Vowel: R>B,B>R,G>Y,Y>G | R>Y,B>G,G>B,Y>R | R>G,B>R,G>Y,Y>B. 
NoVowel: R>B,B>Y,G>G,Y>R | R>R,B>B,G>Y,Y>G | R>Y,B>G,G>B,Y>R.

WHO'S ON FIRST:
Step 1: YES=mid-L, FIRST=top-R, DISPLAY=bot-R, OKAY=top-R, SAYS=bot-R, NOTHING=mid-L, BLANK=mid-R, NO=bot-R, LED=mid-L, LEAD=bot-R, READ=mid-R, RED=mid-R, REED=bot-L, LEED=bot-L, THEY'RE=bot-L, THERE=bot-R, THEY ARE=mid-L, SEE=bot-R, C=top-R, CEE=bot-R.
Step 2: 
READY: YES, OKAY, WHAT, MIDDLE, LEFT, PRESS, RIGHT, BLANK, READY.
FIRST: LEFT, OKAY, YES, MIDDLE, NO, RIGHT, NOTHING, UHHH, WAIT, READY, BLANK, WHAT, PRESS, FIRST.
NO: BLANK, UHHH, WAIT, FIRST, WHAT, READY, RIGHT, YES, NOTHING, LEFT, OKAY, NO.
BLANK: WAIT, RIGHT, OKAY, MIDDLE, BLANK.
NOTHING: UHHH, RIGHT, OKAY, MIDDLE, YES, BLANK, NO, PRESS, LEFT, WHAT, WAIT, FIRST, NOTHING.
YES: OKAY, RIGHT, UHHH, MIDDLE, WHAT, PRESS, READY, NOTHING, YES.
WHAT: UHHH, WHAT.
UHHH: READY, NOTHING, LEFT, WHAT, OKAY, YES, RIGHT, NO, PRESS, BLANK, UHHH.
LEFT: RIGHT, LEFT.
RIGHT: YES, NOTHING, READY, PRESS, NO, WAIT, WHAT, RIGHT.
MIDDLE: BLANK, READY, OKAY, WHAT, NOTHING, PRESS, NO, WAIT, LEFT, MIDDLE.
OKAY: MIDDLE, NO, FIRST, YES, UHHH, NOTHING, WAIT, OKAY.
WAIT: UHHH, NO, BLANK, OKAY, YES, LEFT, FIRST, PRESS, WHAT, NOTHING, READY, RIGHT, MIDDLE, WAIT.
PRESS: RIGHT, MIDDLE, YES, READY, PRESS.
YOU: SURE, YOU ARE, YOUR, YOU'RE, NEXT, UH HUH, UR, HOLD, WHAT?, YOU.
YOU ARE: YOUR, NEXT, LIKE, UH HUH, WHAT?, DONE, UH UH, HOLD, YOU, YOU'RE, SURE, UR, YOU ARE.
YOUR: UH UH, YOU ARE, UH HUH, YOUR.
YOU'RE: YOU, YOU'RE.
UR: DONE, U, UR.
U: UH HUH, SURE, NEXT, WHAT?, YOU'RE, UR, UH UH, DONE, U.
UH HUH: UH HUH.
UH UH: UR, U, DONE, UH UH.
WHAT?: YOU, HOLD, YOU'RE, YOUR, U, DONE, UH UH, LIKE, WHAT?.
DONE: SURE, UH HUH, NEXT, WHAT?, YOUR, UR, YOU'RE, HOLD, LIKE, YOU, U, YOU ARE, UH UH, DONE.
NEXT: WHAT?, UH HUH, UH UH, YOUR, HOLD, SURE, NEXT.
HOLD: YOU ARE, U, DONE, UH UH, YOU, LIKE, SURE, WHAT?, YOUR, NEXT, HOLD.
SURE: YOU ARE, DONE, LIKE, YOU'RE, YOU, NEXT, UH HUH, UR, HOLD, WHAT?, YOUR, UH UH, IT, U, SURE.
LIKE: YOU'RE, NEXT, U, UR, HOLD, DONE, IT, WHAT?, UH HUH, YOU, LIKE.`,

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
            // Logic moved to stopRecording for snappiness
            Logger.log("AIExpert", "Recognition Session Ended");
        };
    },

    setupPTT() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isRecording && !this.isCooldown) {
                if (document.activeElement.tagName === 'INPUT') return; // Don't trigger if typing in input
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
            const messages = [
                { role: "system", content: this.systemPrompt },
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
                    temperature: 0.5,
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

            // Update History (Sliding Window)
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

    addMessage(sender, text, type) {
        const box = document.getElementById('landing-comms-box') || document.querySelector('.comms-box');
        const commsText = document.getElementById('comms-text');
        
        if (box && commsText) {
            box.classList.add('active');
            const msgDiv = document.createElement('div');
            msgDiv.className = `comms-msg ${type}`;
            msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
            commsText.appendChild(msgDiv);
            
            // Auto-scroll
            box.scrollTop = box.scrollHeight;
        }
    }
};
