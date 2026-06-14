import { LevelManager } from './LevelManager.js';
import { Logger } from './Logger.js';
import { CommentatorManager } from './commentator/CommentatorManager.js';
import { CommsIndicator } from './commentator/CommsIndicator.js';
import { AudioManager } from './AudioManager.js';

window.onerror = function(message, source, lineno, colno, error) {
    Logger.error("GLOBAL", `Uncaught Error: ${message}`, { source, lineno, colno, error });
    return false;
};

document.addEventListener('DOMContentLoaded', () => {
    Logger.log("SYSTEM", "Game Initialized...");
    
    // Global Tactile Click
    document.addEventListener('mousedown', () => {
        if (!AudioManager.isInitialized) {
            AudioManager.init();
        }
        AudioManager.playClick();
    });

    const landingPage = document.getElementById('landing-page');
    const defuseBtn = document.getElementById('defuse-btn');
    const manualBtn = document.getElementById('manual-btn');
    const gamemodeBtn = document.getElementById('gamemode-btn');
    const levelModal = document.getElementById('level-modal');
    const closeModal = document.getElementById('close-modal');
    const gamemodeModal = document.getElementById('gamemode-modal');
    const applyGamemodeBtn = document.getElementById('apply-gamemode');
    const closeGamemodeBtn = document.getElementById('close-gamemode');
    const aiConfigModal = document.getElementById('ai-config-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const connectAiBtn = document.getElementById('connect-ai');
    const cancelAiConfigBtn = document.getElementById('cancel-ai-config');
    const groqLink = document.getElementById('groq-link');
    const defuserBriefing = document.getElementById('defuser-briefing');
    const closeDefuserBriefing = document.getElementById('close-defuser-briefing');
    const expertBriefing = document.getElementById('expert-briefing');
    const closeExpertBriefing = document.getElementById('close-expert-briefing');
    const creditsBtn = document.getElementById('credits-btn');
    const muteBtn = document.getElementById('mute-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeCredits = document.getElementById('close-credits');

    // State
    let selectedGameMode = 'classic'; // Always reset to default on land
    window.sessionApiKey = null; // Strictly session-based, destroyed on close
    localStorage.setItem('selected_gamemode', 'classic'); // Ensure storage is synced to default

    // Initialize Level Manager
    LevelManager.init();

    // Initialize UI State
    const initUI = () => {
        // Set correct radio button
        const radio = document.querySelector(`input[name="gamemode"][value="${selectedGameMode}"]`);
        if (radio) radio.checked = true;
        
        updateLandingRoles();
    };

    const updateLandingRoles = () => {
        if (manualBtn) {
            if (selectedGameMode === 'ai') {
                manualBtn.style.display = 'none';
            } else {
                manualBtn.style.display = 'block';
            }
        }
    };

    initUI();

    // Initialize Mute Button State
    const updateMuteButtonUI = () => {
        if (muteBtn) {
            // Using Unicode codepoints (\ue050 = volume_up, \ue04f = volume_off)
            muteBtn.innerText = CommentatorManager.isMuted ? '\ue04f' : '\ue050';
            muteBtn.style.color = CommentatorManager.isMuted ? '#f00' : '#eee';
            muteBtn.style.borderColor = CommentatorManager.isMuted ? '#f00' : '#333';
        }
    };
    updateMuteButtonUI();

    // Fullscreen Logic
    if (fullscreenBtn) {
        // Initial icon (\ue5d0 = fullscreen)
        fullscreenBtn.innerText = '\ue5d0';

        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    Logger.error("SYSTEM", `Error enabling fullscreen: ${err.message}`);
                });
                fullscreenBtn.innerText = '\ue5d1'; // fullscreen_exit
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    fullscreenBtn.innerText = '\ue5d0'; // fullscreen
                }
            }
        });
    }

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

    if (gamemodeBtn) {
        gamemodeBtn.addEventListener('click', () => {
            gamemodeModal.style.display = 'flex';
        });
    }

    applyGamemodeBtn.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="gamemode"]:checked');
        if (selectedRadio) {
            const modeValue = selectedRadio.value;
            
            if (modeValue === 'ai' && !window.sessionApiKey) {
                // Intercept to get API Key first
                gamemodeModal.style.display = 'none';
                aiConfigModal.style.display = 'flex';
                apiKeyInput.value = ''; // Clear for safety
                apiKeyInput.focus();
            } else {
                applyMode(modeValue);
            }
        }
    });

    const applyMode = (mode) => {
        selectedGameMode = mode;
        localStorage.setItem('selected_gamemode', selectedGameMode);
        Logger.log("SYSTEM", `Game Mode updated to: ${selectedGameMode.toUpperCase()}`);
        updateLandingRoles();
        gamemodeModal.style.display = 'none';
        aiConfigModal.style.display = 'none';
    };

    connectAiBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key && key.startsWith('gsk_')) {
            window.sessionApiKey = key;
            Logger.log("SYSTEM", "AI Uplink Established (Key stored in session memory)");
            applyMode('ai');
        } else {
            alert("Invalid API Key. Please enter a valid Groq API key (starts with gsk_).");
        }
    });

    cancelAiConfigBtn.addEventListener('click', () => {
        aiConfigModal.style.display = 'none';
        // Revert radio button in gamemode modal
        const radio = document.querySelector(`input[name="gamemode"][value="${selectedGameMode}"]`);
        if (radio) radio.checked = true;
        gamemodeModal.style.display = 'flex';
    });

    closeGamemodeBtn.addEventListener('click', () => {
        gamemodeModal.style.display = 'none';
        // Reset radio to saved state
        const radio = document.querySelector(`input[name="gamemode"][value="${selectedGameMode}"]`);
        if (radio) radio.checked = true;
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

    if (groqLink) {
        groqLink.addEventListener('click', (e) => {
            e.preventDefault();
            const width = 600;
            const height = 700;
            const left = (window.screen.width / 2) - (width / 2);
            const top = (window.screen.height / 2) - (height / 2);
            window.open(
                groqLink.href, 
                'GroqConsole', 
                `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
            );
        });
    }

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
        if (event.target === gamemodeModal) {
            gamemodeModal.style.display = 'none';
        }
        if (event.target === defuserBriefing) {
            defuserBriefing.style.display = 'none';
        }
        if (event.target === expertBriefing) {
            expertBriefing.style.display = 'none';
        }
    });
});
