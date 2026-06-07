/**
 * js/commentator/CommentatorManager.js
 * Central logic for the "Nervous Commander" TTS system.
 */

import { SpeechLibrary } from './speeches.js';
import { Logger } from '../Logger.js';

export const CommentatorManager = {
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
        if (!window.speechSynthesis) {
            Logger.warn("CommentatorManager", "Speech Synthesis not supported in this browser.");
            return;
        }

        const category = SpeechLibrary[triggerId];
        if (!category) {
            Logger.error("CommentatorManager", `Speech triggerId not found: ${triggerId}`);
            return;
        }

        // Stop current speech
        this.stop();

        // Randomly select 1 of 3 variations
        const randomIndex = Math.floor(Math.random() * category.variations.length);
        const text = category.variations[randomIndex];

        Logger.log("CommentatorManager", `Speaking (${triggerId} #${randomIndex}): "${text}"`);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = this.voiceProfile.pitch;
        utterance.rate = this.voiceProfile.rate;
        utterance.volume = this.voiceProfile.volume;

        // Visual signaling via events
        utterance.onstart = () => {
            window.dispatchEvent(new CustomEvent('comms-start'));
        };

        utterance.onend = () => {
            window.dispatchEvent(new CustomEvent('comms-stop'));
            this.currentUtterance = null;
        };

        utterance.onerror = (event) => {
            Logger.error("CommentatorManager", "Speech Synthesis Error", event);
            window.dispatchEvent(new CustomEvent('comms-stop'));
            this.currentUtterance = null;
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
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
