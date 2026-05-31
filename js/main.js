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
    const defuserBriefing = document.getElementById('defuser-briefing');
    const closeDefuserBriefing = document.getElementById('close-defuser-briefing');
    const expertBriefing = document.getElementById('expert-briefing');
    const closeExpertBriefing = document.getElementById('close-expert-briefing');
    const creditsBtn = document.getElementById('credits-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCredits = document.getElementById('close-credits');

    // Initialize Level Manager
    LevelManager.init();

    // Landing Page Actions
    defuseBtn.addEventListener('click', () => {
        Logger.log("SYSTEM", "Defuse clicked - showing briefing");
        defuserBriefing.style.display = 'flex';
    });

    manualBtn.addEventListener('click', () => {
        Logger.log("SYSTEM", "Manual clicked - showing briefing");
        expertBriefing.style.display = 'flex';
    });

    // Briefing Accept Actions
    closeDefuserBriefing.addEventListener('click', () => {
        defuserBriefing.style.display = 'none';
        levelModal.style.display = 'flex';
    });

    closeExpertBriefing.addEventListener('click', () => {
        expertBriefing.style.display = 'none';
        window.open('manual.html', '_blank');
    });

    creditsBtn.addEventListener('click', () => {
        creditsModal.style.display = 'flex';
    });

    closeCredits.addEventListener('click', () => {
        creditsModal.style.display = 'none';
    });

    // Close Modal Actions
    closeModal.addEventListener('click', () => {
        levelModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === levelModal) {
            levelModal.style.display = 'none';
        }
        if (event.target === creditsModal) {
            creditsModal.style.display = 'none';
        }
        if (event.target === defuserBriefing) {
            defuserBriefing.style.display = 'none';
        }
        if (event.target === expertBriefing) {
            expertBriefing.style.display = 'none';
        }
    });
});
