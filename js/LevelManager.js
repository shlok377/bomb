// LevelManager.js - Handles level selection and redirection

export const LevelManager = {
    phases: [
        { id: 1, name: "Phase 1", modules: 3, levels: 5 },
        { id: 2, name: "Phase 2", modules: 4, levels: 5 },
        { id: 3, name: "Phase 3", modules: 6, levels: 5 }
    ],

    init() {
        this.renderLevels();
    },

    renderLevels() {
        this.phases.forEach(phase => {
            const container = document.getElementById(`phase${phase.id}-levels`);
            if (container) {
                for (let i = 1; i <= phase.levels; i++) {
                    const btn = document.createElement('button');
                    btn.className = 'level-btn';
                    btn.textContent = i;
                    btn.onclick = () => this.startLevel(phase.id, i);
                    container.appendChild(btn);
                }
            }
        });
    },

    startLevel(phaseId, levelId) {
        console.log(`Starting Phase ${phaseId}, Level ${levelId}`);
        // Navigate to the phase-specific page
        window.location.href = `phase${phaseId}.html?level=${levelId}`;
    }
};
