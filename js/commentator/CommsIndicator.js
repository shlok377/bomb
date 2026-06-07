/**
 * js/commentator/CommsIndicator.js
 * Manages the visual state of the comms signal LED.
 */

export class CommsIndicator {
    /**
     * @param {HTMLElement} container - The parent container for the indicator.
     */
    constructor(container) {
        if (!container) return;
        this.container = container;
        this.el = null;
        this.vignette = null;
        this.init();
        this.setupEventListeners();
    }

    init() {
        // Create the LED element
        this.el = document.createElement('div');
        this.el.className = 'comms-indicator';
        this.el.title = "Nervous Commander Signal";
        this.container.appendChild(this.el);

        // Create the vignette overlay if it doesn't exist
        if (!document.querySelector('.comms-vignette')) {
            this.vignette = document.createElement('div');
            this.vignette.className = 'comms-vignette';
            document.body.appendChild(this.vignette);
        } else {
            this.vignette = document.querySelector('.comms-vignette');
        }
    }

    setupEventListeners() {
        window.addEventListener('comms-start', () => this.updateState(true));
        window.addEventListener('comms-stop', () => this.updateState(false));
    }

    /**
     * Updates the LED to active/idle state.
     * @param {boolean} isActive 
     */
    updateState(isActive) {
        if (!this.el) return;

        if (isActive) {
            this.el.classList.add('active');
            if (this.vignette) this.vignette.classList.add('active');
        } else {
            this.el.classList.remove('active');
            if (this.vignette) this.vignette.classList.remove('active');
        }
    }
}
