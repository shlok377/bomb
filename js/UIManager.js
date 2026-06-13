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
            this.updateStrikes(0); 
        } catch (err) {
            Logger.error("UIManager", "Failed to initialize UI", err);
        }
    },

    setupEventListeners() {
        try {
            // Keyboard rotation
            window.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowUp') this.rotateTo('top');
                if (e.key === 'ArrowDown') this.rotateTo('bottom');
                if (e.key === 'ArrowLeft') this.rotateTo('left');
                if (e.key === 'ArrowRight') this.rotateTo('right');
                if (e.key === 'Escape') this.rotateTo('front');
            });

            // On-screen navigation buttons
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-btn')) {
                    const face = e.target.dataset.face;
                    if (face) this.rotateTo(face);
                }
            });

            // Game Events
            window.addEventListener('game-tick', (e) => {
                this.updateTimer(e.detail.timeLeft);
            });

            window.addEventListener('game-strike', (e) => {
                this.updateStrikes(e.detail.strikes);
                this.triggerStrikeVisuals();
            });

            window.addEventListener('game-over', (e) => {
                Logger.log("UIManager", "Game Over event received", e.detail);
                if (e.detail.result === 'loss') this.triggerExplosionVisuals();
                this.showGameOver(e.detail);
            });
        } catch (err) {
            Logger.error("UIManager", "Error setting up event listeners", err);
        }
    },

    triggerStrikeVisuals() {
        const strikeEl = document.getElementById('strike-display');
        if (strikeEl) {
            strikeEl.classList.add('strike-shake');
            setTimeout(() => strikeEl.classList.remove('strike-shake'), 500);
        }
        document.body.classList.add('strike-flash');
        setTimeout(() => document.body.classList.remove('strike-flash'), 500);
    },

    triggerExplosionVisuals() {
        const bomb = document.getElementById('bomb-container');
        if (bomb) {
            bomb.classList.add('shake');
            setTimeout(() => bomb.classList.remove('shake'), 500);
        }
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
            const max = GameEngine.maxStrikes;
            let html = '';
            for (let i = 0; i < max; i++) {
                const isLit = i < count;
                html += `<span class="strike-cross ${isLit ? 'lit' : 'fainted'}">X</span>`;
            }
            strikeEl.innerHTML = html;
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
                el.innerHTML = `<div class="indicator-led"></div><span>${ind.label}</span>`;
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
        try {
            // Remove any existing modals
            const existing = document.querySelector('.game-over-modal');
            if (existing) existing.remove();

            const modal = document.createElement('div');
            modal.className = 'game-over-modal';
            
            const title = data.result === 'win' ? 'BOMB DEFUSED' : 'BOOM!';
            const message = data.result === 'win' ? 'You survived.' : `Explosion: ${data.reason}`;
            
            modal.innerHTML = `
                <div class="modal-content" style="text-align: center;">
                    <h1 style="color: ${data.result === 'win' ? '#0f0' : '#f00'}">${title}</h1>
                    <p style="font-size: 1.5rem; margin-bottom: 2rem;">${message}</p>
                    <button id="restart-btn" style="padding: 1rem 2rem; font-size: 1.2rem; cursor: pointer;">Return to Menu</button>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            document.getElementById('restart-btn').addEventListener('click', () => {
                window.location.href = 'index.html';
            });

            Logger.log("UIManager", "Game Over modal displayed");
        } catch (err) {
            Logger.error("UIManager", "Critical error in showGameOver", err);
            // Fallback alert if UI fails
            alert(`${data.result === 'win' ? 'Victory!' : 'BOOM!'} ${data.reason || ''}`);
            window.location.href = 'index.html';
        }
    }
};
