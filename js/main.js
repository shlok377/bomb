import { LevelManager } from './LevelManager.js';
import { Logger } from './Logger.js';
import { CommentatorManager } from './commentator/CommentatorManager.js';
import { CommsIndicator } from './commentator/CommsIndicator.js';

window.onerror = function(message, source, lineno, colno, error) {
    Logger.error("GLOBAL", `Uncaught Error: ${message}`, { source, lineno, colno, error });
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    Logger.log("SYSTEM", "Game Initialized...");
    
    const landingPage = document.getElementById('landing-page');
    const defuseBtn = document.getElementById('defuse-btn');
    const manualBtn = document.getElementById('manual-btn');
    const levelModal = document.getElementById('level-modal');
    const closeModal = document.getElementById('close-modal');
    const defuserBriefing = document.getElementById('defuser-briefing');
    const closeDefuserBriefing = document.getElementById('close-defuser-briefing');
    const expertBriefing = document.getElementById('expert-briefing');
    const closeExpertBriefing = document.getElementById('close-expert-briefing');
    const creditsBtn = document.getElementById('credits-btn');
    const muteBtn = document.getElementById('mute-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCredits = document.getElementById('close-credits');

    // Initialize Level Manager
    LevelManager.init();

    // Initialize Mute Button State
    const updateMuteButtonUI = () => {
        if (muteBtn) {
            muteBtn.innerText = CommentatorManager.isMuted ? '🔇' : '🔊';
            muteBtn.style.color = CommentatorManager.isMuted ? '#f00' : '#fff';
            muteBtn.style.borderColor = CommentatorManager.isMuted ? '#f00' : '#555';
        }
    };
    updateMuteButtonUI();

    // Initialize Commentator UI on Landing Page
    if (landingPage) {
        const titleH1 = landingPage.querySelector('h1');
        new CommsIndicator(titleH1);

        const commsBox = document.getElementById('landing-comms-box');
        const commsText = document.getElementById('comms-text');

        window.addEventListener('comms-start', (e) => {
            if (commsBox && commsText && e.detail && e.detail.text) {
                commsText.innerText = e.detail.text;
                commsBox.classList.add('active');
            }
        });

        // Box stays persistent now, no removal on 'comms-stop'
        
        // Auto-briefing after 0.5s
        setTimeout(() => {
            CommentatorManager.speak('landing_brief');
        }, 500);
    }

    // Landing Page Actions
    defuseBtn.addEventListener('click', () => {
        Logger.log("SYSTEM", "Defuse clicked - showing briefing");
        defuserBriefing.style.display = 'flex';
    });

    manualBtn.addEventListener('click', () => {
        Logger.log("SYSTEM", "Manual clicked - showing briefing");
        expertBriefing.style.display = 'flex';
    });

    muteBtn.addEventListener('click', () => {
        CommentatorManager.isMuted = !CommentatorManager.isMuted;
        localStorage.setItem('commentator_muted', CommentatorManager.isMuted);
        Logger.log("SYSTEM", `Commentator ${CommentatorManager.isMuted ? 'Muted' : 'Unmuted'}`);
        updateMuteButtonUI();
        
        if (CommentatorManager.isMuted) {
            CommentatorManager.stop();
        } else {
            // Small delay helps some browsers trigger TTS reliably after a click
            setTimeout(() => {
                CommentatorManager.speak('landing_brief');
            }, 100);
        }
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
