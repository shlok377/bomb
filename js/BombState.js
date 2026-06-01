/**
 * BombState.js
 * Generates and stores the edgework for a specific bomb instance.
 */

import { Logger } from './Logger.js';

export const BombState = {
    serialNumber: "",
    batteries: 0,
    indicators: [], // Array of objects { label: 'CAR', lit: true }

    generate() {
        try {
            this.serialNumber = this._generateSerialNumber();
            this.batteries = Math.floor(Math.random() * 4); // 0 to 3 batteries
            this.indicators = this._generateIndicators();
            
            Logger.log("BombState", "Bomb State Generated", this);
        } catch (err) {
            Logger.error("BombState", "Failed to generate bomb state", err);
        }
    },

    _generateSerialNumber() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const digits = "0123456789";
        let sn = "";
        for (let i = 0; i < 5; i++) {
            sn += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        sn += digits.charAt(Math.floor(Math.random() * digits.length));
        return sn;
    },

    _generateIndicators() {
        const labels = ["SND", "CLR", "CAR", "IND", "FRK", "MSA", "NSA", "SIG", "TRN", "BOB", "FRQ"];
        const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 indicators
        const selected = [];
        const usedLabels = new Set();

        while (selected.length < count) {
            const label = labels[Math.floor(Math.random() * labels.length)];
            if (!usedLabels.has(label)) {
                selected.push({
                    label: label,
                    lit: Math.random() > 0.5
                });
                usedLabels.add(label);
            }
        }
        return selected;
    },

    // Helper methods for modules
    hasVowel() {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        return this.serialNumber.split('').some(char => vowels.includes(char));
    },

    isSerialLastDigitEven() {
        const digits = this.serialNumber.match(/\d/g);
        if (!digits) return false;
        const lastDigit = parseInt(digits[digits.length - 1]);
        return lastDigit % 2 === 0;
    }
};
