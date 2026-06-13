/**
 * js/commentator/CommentatorManager.js
 * Central logic for the "Nervous Commander" TTS system.
 */

import { SpeechLibrary } from './speeches.js';
import { Logger } from '../Logger.js';

export const CommentatorManager = {
    isMuted: localStorage.getItem('commentator_muted') === 'true',
    voiceProfile: {
        pitch: 1.4,
        rate: 1.15,
        volume: 1.0
    },

    currentUtterance: null,

    /**
     * Triggers a randomized speech from the library.
     * @param {string} triggerId - The ID of the speech category.
     */
    speak(triggerId) {
        if (this.isMuted) return;

        if (!window.speechSynthesis) {
            Logger.warn("CommentatorManager", "Speech Synthesis not supported in this browser.");
            return;
        }

        const category = SpeechLibrary[triggerId];
        if (!category) {
            Logger.error("CommentatorManager", `Speech triggerId not found: ${triggerId}`);
            return;
        }

        // Workaround for some browsers getting stuck
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        // Randomly select 1 of 3 variations
        const variations = category.variations || category.text; // Support both keys
        const randomIndex = Math.floor(Math.random() * variations.length);
        const text = variations[randomIndex];

        Logger.log("CommentatorManager", `Speaking (${triggerId} #${randomIndex}): "${text}"`);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = this.voiceProfile.pitch;
        utterance.rate = this.voiceProfile.rate;
        utterance.volume = this.voiceProfile.volume;

        // Try to find a suitable English voice
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                const enVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
                utterance.voice = enVoice;
            }
        };

        setVoice();
        if (!utterance.voice && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }

        // Visual signaling via events
        utterance.onstart = () => {
            window.dispatchEvent(new CustomEvent('comms-start'));
        };

        utterance.onend = () => {
            window.dispatchEvent(new CustomEvent('comms-stop'));
            this.currentUtterance = null;
        };

        utterance.onerror = (event) => {
            if (event.error !== 'interrupted' && event.error !== 'canceled') {
                Logger.error("CommentatorManager", "Speech Synthesis Error", event);
            }
            window.dispatchEvent(new CustomEvent('comms-stop'));
            this.currentUtterance = null;
        };

        this.currentUtterance = utterance;
        
        // Final sanity check/kickstart
        setTimeout(() => {
            // Some browsers need a second cancel/resume right before speak
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        }, 50);
    },

    /**
     * Immediately stops any current speech.
     */
    stop() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            window.dispatchEvent(new CustomEvent('comms-stop'));
            this.currentUtterance = null;
        }
    }
};
