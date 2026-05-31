import { LevelManager } from './LevelManager.js';
import { Logger } from './Logger.js';

window.onerror = function(message, source, lineno, colno, error) {
    Logger.error("GLOBAL", `Uncaught Error: ${message}`, { source, lineno, colno, error });
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    Logger.log("SYSTEM", "Game Initialized...");
    
    const defuseBtn = document.getElementById('defuse-btn');
    const manualBtn = document.getElementById('manual-btn');
    const levelModal = document.getElementById('level-modal');
    const closeModal = document.getElementById('close-modal');
    const manualViewer = document.getElementById('manual-viewer');
    const closeManual = document.getElementById('close-manual');

    // Initialize Level Manager
    LevelManager.init();

    // Landing Page Actions
    defuseBtn.addEventListener('click', () => {
        console.log("Defuse button clicked");
        levelModal.style.display = 'flex';
    });

    manualBtn.addEventListener('click', () => {
        console.log("Manual button clicked");
        manualViewer.style.display = 'block';
    });

    // Close Actions
    closeModal.addEventListener('click', () => {
        levelModal.style.display = 'none';
    });

    closeManual.addEventListener('click', () => {
        console.log("Closing manual viewer");
        manualViewer.style.display = 'none';
    });

    // Close modal on outside click
    window.addEventListener('click', (event) => {
        if (event.target === levelModal) {
            levelModal.style.display = 'none';
        }
    });
});
