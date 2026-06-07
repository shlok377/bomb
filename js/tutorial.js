/**
 * tutorial.js
 * Handles the interactive guided tour for the defusal manual.
 */

import { CommentatorManager } from './commentator/CommentatorManager.js';
import { CommsIndicator } from './commentator/CommsIndicator.js';
import { Logger } from './Logger.js';

const tourSteps = [
    {
        target: '#welcome-screen',
        title: 'Welcome, Expert',
        text: "Welcome to the DEFUSAL INTRANET. This system is your primary tool for disarming explosive devices. Let's get you acquainted with the interface.",
        speechId: 'landing_brief'
    },
    {
        target: '#search-container',
        title: 'Rapid Identification',
        text: "Use the search bar to filter modules. Ask the defuser for the HEX CODE (Nightmare Tag) on their module (e.g., #D0OV8B) and type it here for instant access to the deactivation guide.",
        speechId: 'tutorial_search'
    },
    {
        target: '#nav-links-flat',
        title: 'Classification Levels',
        text: "Select a protocol from the sidebar. Directives, Modules, and Appendices are organized here for deep research when the search code is unavailable.",
        position: 'right',
        speechId: 'tutorial_nav'
    },
    {
        target: '#sticky-note',
        title: 'Tactical Scratchpad',
        text: "The Scratchpad is open by default. Use it to log vital data like the serial number, battery count, or those hex codes so you don't forget them while navigating between pages. Closing and Reopening it won't lose your note, refreshing will.",
        position: 'left',
        speechId: 'tutorial_scratchpad'
    }
];

let currentStep = 0;

function initTutorial() {
    Logger.log("Tutorial", "Initializing manual tutorial...");
    
    // Create elements if they don't exist
    if (!document.getElementById('tutorial-overlay')) {
        Logger.log("Tutorial", "Creating tutorial DOM elements...");
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        document.body.appendChild(overlay);

        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.innerHTML = `
            <div id="tooltip-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <h3 id="tour-title" style="margin: 0;"></h3>
                <div id="comms-indicator-container"></div>
            </div>
            <p id="tour-text"></p>
            <div class="tutorial-buttons">
                <button class="tutorial-btn" id="tour-skip">Skip</button>
                <div style="display: flex; gap: 5px;">
                    <button class="tutorial-btn" id="tour-prev">Back</button>
                    <button class="tutorial-btn primary" id="tour-next">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(tooltip);

        // Initialize Comms Indicator in Tooltip
        new CommsIndicator(document.getElementById('comms-indicator-container'));

        // Event Listeners
        document.getElementById('tour-skip').onclick = endTour;
        document.getElementById('tour-prev').onclick = prevStep;
        document.getElementById('tour-next').onclick = nextStep;
    }

    // Hook up replay button - DO THIS ALWAYS
    const replayBtn = document.getElementById('replay-tutorial-btn');
    if (replayBtn) {
        Logger.log("Tutorial", "Replay button found, attaching listener.");
        replayBtn.onclick = (e) => {
            e.preventDefault();
            Logger.log("Tutorial", "Replay button clicked.");
            startTour();
        };
    } else {
        Logger.warn("Tutorial", "Replay button NOT found in DOM.");
    }

    // Check if seen
    const seen = localStorage.getItem('manual_tutorial_seen');
    if (!seen) {
        startTour();
    }
}

function startTour() {
    Logger.log("Tutorial", "Starting tour...");
    currentStep = 0;
    const overlay = document.getElementById('tutorial-overlay');
    const tooltip = document.getElementById('tutorial-tooltip');
    if (overlay) overlay.style.display = 'block';
    if (tooltip) tooltip.style.display = 'block';
    showStep();
}

function showStep() {
    const step = tourSteps[currentStep];
    const target = document.querySelector(step.target);
    const tooltip = document.getElementById('tutorial-tooltip');

    // Remove previous highlights
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));

    if (target) {
        target.classList.add('tutorial-highlight');
        
        // Position Tooltip
        const rect = target.getBoundingClientRect();
        let top, left;

        if (step.position === 'right') {
            top = rect.top + (rect.height / 2) - 100;
            left = rect.right + 20;
        } else if (step.position === 'left') {
            top = rect.top + (rect.height / 2) - 100;
            left = rect.left - 320;
        } else {
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - 150;
        }

        // Boundary checks
        if (top < 10) top = 10;
        if (top + 200 > window.innerHeight) top = window.innerHeight - 210;
        if (left < 10) left = 10;
        if (left + 320 > window.innerWidth) left = window.innerWidth - 330;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    }

    document.getElementById('tour-title').innerText = step.title;
    document.getElementById('tour-text').innerText = step.text;
    
    document.getElementById('tour-prev').disabled = currentStep === 0;
    document.getElementById('tour-next').innerText = currentStep === tourSteps.length - 1 ? 'Finish' : 'Next';

    // Trigger Commander Speech
    if (step.speechId) {
        CommentatorManager.speak(step.speechId);
    }
}

function nextStep() {
    if (currentStep < tourSteps.length - 1) {
        currentStep++;
        showStep();
    } else {
        endTour();
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep();
    }
}

function endTour() {
    CommentatorManager.stop();
    document.getElementById('tutorial-overlay').style.display = 'none';
    document.getElementById('tutorial-tooltip').style.display = 'none';
    document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
    localStorage.setItem('manual_tutorial_seen', 'true');
}

// Start
initTutorial();
