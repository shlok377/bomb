/**
 * UIManager.js
 * Handles the visual state of the game, including bomb rotation and HUD.
 */

import { BombState } from './BombState.js';
import { Logger } from './Logger.js';

export const UIManager = {
    currentFace: 'front', // front, top, bottom, left, right, back
    
    init() {
        try {
            Logger.log("UIManager", "Initializing UI...");
            this.setupEventListeners();
            this.updateHUD();
            this.renderEdgework();
        } catch (err) {
            Logger.error("UIManager", "Failed to initialize UI", err);
        }
    },

    setupEventListeners() {
        // Keyboard rotation
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') this.rotateTo('top');
            if (e.key === 'ArrowDown') this.rotateTo('bottom');
            if (e.key === 'ArrowLeft') this.rotateTo('left');
            if (e.key === 'ArrowRight') this.rotateTo('right');
            if (e.key === 'Escape') this.rotateTo('front');
        });

        // Game Events
        window.addEventListener('game-tick', (e) => {
            this.updateTimer(e.detail.timeLeft);
        });

        window.addEventListener('game-strike', (e) => {
            this.updateStrikes(e.detail.strikes);
        });

        window.addEventListener('game-over', (e) => {
            this.showGameOver(e.detail);
        });
    },

    rotateTo(face) {
        // Logic for rotation: 
        // If already on left/right/top/bottom, ArrowKeys should probably go back to front or to back.
        // For simplicity, let's make it a hub-and-spoke: 'front' is the center.
        
        if (this.currentFace === face) {
            this.currentFace = 'front'; // Toggle back to front
        } else {
            this.currentFace = face;
        }

        console.log(`Rotating to: ${this.currentFace}`);
        this.updateBombVisibility();
    },

    updateBombVisibility() {
        const faces = ['front', 'top', 'bottom', 'left', 'right', 'back'];
        faces.forEach(f => {
            const el = document.getElementById(`face-${f}`);
            if (el) {
                el.style.display = (f === this.currentFace) ? 'grid' : 'none';
            }
        });

        // Update indicator text
        const indicator = document.getElementById('view-indicator');
        if (indicator) {
            indicator.textContent = `Viewing: ${this.currentFace.toUpperCase()}`;
        }
    },

    updateTimer(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        const display = `${mins}:${secs.toString().padStart(2, '0')}`;
        const timerEl = document.getElementById('timer-display');
        if (timerEl) timerEl.textContent = display;
    },

    updateStrikes(count) {
        const strikeEl = document.getElementById('strike-display');
        if (strikeEl) {
            let strikeStr = "";
            for (let i = 0; i < count; i++) strikeStr += "X ";
            strikeEl.textContent = strikeStr;
            strikeEl.classList.add('strike-flash');
            setTimeout(() => strikeEl.classList.remove('strike-flash'), 500);
        }
    },

    renderEdgework() {
        // Render Serial Number (usually on the side or back)
        const snEl = document.getElementById('edgework-sn');
        if (snEl) snEl.textContent = `S/N: ${BombState.serialNumber}`;

        // Render Batteries
        const battContainer = document.getElementById('edgework-batteries');
        if (battContainer) {
            battContainer.innerHTML = '';
            for (let i = 0; i < BombState.batteries; i++) {
                const batt = document.createElement('div');
                batt.className = 'battery';
                battContainer.appendChild(batt);
            }
        }

        // Render Indicators
        const indContainer = document.getElementById('edgework-indicators');
        if (indContainer) {
            indContainer.innerHTML = '';
            BombState.indicators.forEach(ind => {
                const el = document.createElement('div');
                el.className = `indicator ${ind.lit ? 'lit' : 'unlit'}`;
                el.textContent = ind.label;
                indContainer.appendChild(el);
            });
        }
    },

    updateHUD() {
        // Initial HUD state
        this.updateTimer(300);
        this.updateStrikes(0);
        this.updateBombVisibility();
    },

    showGameOver(data) {
        const modal = document.createElement('div');
        modal.className = 'game-over-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h1>${data.result === 'win' ? 'BOMB DEFUSED' : 'BOOM!'}</h1>
                <p>${data.result === 'win' ? 'You survived.' : data.reason}</p>
                <button onclick="window.location.href='index.html'">Main Menu</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
};
