import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class Mazes {
    constructor(container) {
        this.container = container;
        this.size = 6;
        this.playerPos = { x: 0, y: 0 };
        this.goalPos = { x: 0, y: 0 };
        this.activeMatrix = null;
        this.isDisarmed = false;

        // 9 hardcoded matrices (0=path, 1=wall, 2=indicator, 3=start, 4=end)
        this.matrices = [
            [
                [0, 3, 1, 4, 0, 1],
                [2, 0, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 2],
                [0, 1, 1, 1, 1, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 0, 0, 1, 1, 1]
            ],
            [
                [3, 1, 1, 1, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [1, 0, 0, 1, 1, 1],
                [1, 2, 0, 0, 0, 1],
                [1, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 0, 4]
            ],
            [
                [1, 1, 1, 1, 3, 1],
                [1, 1, 0, 0, 0, 1],
                [1, 1, 0, 1, 1, 1],
                [1, 0, 0, 2, 1, 2],
                [0, 0, 1, 1, 1, 1],
                [4, 1, 1, 1, 1, 1]
            ],
            [
                [2, 1, 0, 3, 1, 1],
                [1, 1, 0, 1, 1, 1],
                [1, 0, 0, 1, 1, 1],
                [2, 0, 1, 1, 1, 1],
                [1, 0, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 4]
            ],
            [
                [1, 1, 0, 0, 0, 3],
                [1, 0, 0, 1, 1, 1],
                [0, 0, 1, 1, 2, 1],
                [0, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1, 1],
                [1, 1, 4, 2, 1, 1]
            ],
            [
                [1, 1, 3, 1, 2, 1],
                [1, 1, 0, 1, 1, 1],
                [0, 0, 0, 1, 1, 1],
                [0, 1, 1, 1, 1, 1],
                [0, 0, 2, 1, 1, 1],
                [1, 0, 0, 4, 1, 1]
            ],
            [
                [1, 2, 1, 1, 1, 1],
                [1, 1, 1, 3, 1, 1],
                [1, 1, 1, 0, 0, 1],
                [1, 4, 1, 1, 0, 1],
                [1, 0, 1, 0, 0, 1],
                [1, 2, 0, 0, 1, 1]
            ],
            [
                [0, 0, 0, 2, 1, 1],
                [0, 1, 3, 1, 1, 1],
                [0, 1, 1, 1, 1, 1],
                [0, 0, 2, 1, 1, 1],
                [1, 0, 0, 1, 4, 1],
                [1, 1, 0, 0, 0, 1]
            ],
            [
                [1, 1, 1, 3, 0, 1],
                [1, 1, 2, 1, 0, 0],
                [1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 0],
                [2, 4, 0, 1, 0, 0],
                [1, 1, 0, 0, 0, 1]
            ]
        ];
    }

    init() {
        try {
            Logger.log("Mazes", "Initializing module");
            this.setupMaze();
            this.render();
        } catch (err) {
            Logger.error("Mazes", "Initialization failed", err);
        }
    }

    setupMaze() {
        const matrixIdx = Math.floor(Math.random() * this.matrices.length);
        this.activeMatrix = this.matrices[matrixIdx];
        
        // Scan the matrix for positions
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const val = this.activeMatrix[y][x];
                if (val === 3) this.playerPos = { x, y };
                if (val === 4) this.goalPos = { x, y };
            }
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="module mazes">
                <div class="module-status"></div>
                <div class="maze-grid">
                    ${this.generateGridHTML()}
                    <div class="maze-player"></div>
                </div>
                <div class="maze-controls">
                    <button class="maze-btn up" data-dir="up">▲</button>
                    <div class="maze-mid-row">
                        <button class="maze-btn left" data-dir="left">◀</button>
                        <button class="maze-btn right" data-dir="right">▶</button>
                    </div>
                    <button class="maze-btn down" data-dir="down">▼</button>
                </div>
            </div>
        `;

        this.updatePlayerPosition(true); // Initial position without transition

        this.container.querySelectorAll('.maze-btn').forEach(btn => {
            btn.onclick = () => this.move(btn.dataset.dir);
        });
    }

    generateGridHTML() {
        let html = "";
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const isGoal = (x === this.goalPos.x && y === this.goalPos.y);
                const val = this.activeMatrix[y][x];
                const isIndicator = (val === 2);
                
                // Calculate distance from center for circular stagger
                const dx = x - 2.5;
                const dy = y - 2.5;
                const dist = Math.sqrt(dx*dx + dy*dy);
                const delay = dist * 0.05;

                html += `<div class="maze-cell maze-cell-reveal" style="animation-delay: ${delay}s">
                    ${isGoal ? '<div class="maze-goal"></div>' : ''}
                    ${isIndicator ? '<div class="maze-indicator"></div>' : ''}
                </div>`;
            }
        }
        return html;
    }

    updatePlayerPosition(instant = false) {
        const player = this.container.querySelector('.maze-player');
        if (!player) return;

        // Cell size is 120/6 = 20px. Gap is 2px.
        // Actually grid is 120px + gaps. 
        // 6 cells * 18px + 5 gaps * 2px + 2 padding * 2px = 108 + 10 + 4 = 122ish.
        // Let's use percentage based positioning for robustness.
        const step = 100 / 6;
        const xPercent = this.playerPos.x * step + step / 2;
        const yPercent = this.playerPos.y * step + step / 2;

        if (instant) {
            player.style.transition = 'none';
        } else {
            player.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }

        // We use translate(-50%, -50%) to center the dot in the cell
        // and then offset by the cell coordinates.
        player.style.left = `${xPercent}%`;
        player.style.top = `${yPercent}%`;
        player.style.transform = `translate(-50%, -50%)`;
    }

    move(dir) {
        if (this.isDisarmed || GameEngine.isGameOver) return;

        AudioManager.playClick();
        let nx = this.playerPos.x;
        let ny = this.playerPos.y;

        if (dir === 'up') ny--;
        if (dir === 'down') ny++;
        if (dir === 'left') nx--;
        if (dir === 'right') nx++;

        // Strike if out of bounds or if target is a wall (1)
        if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6 || this.activeMatrix[ny][nx] === 1) {
            Logger.warn("Mazes", `Strike! Hit a wall moving ${dir}`);
            GameEngine.addStrike();
        } else {
            this.playerPos = { x: nx, y: ny };
            this.updatePlayerPosition();
            if (this.playerPos.x === this.goalPos.x && this.playerPos.y === this.goalPos.y) {
                this.disarm();
            }
        }
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Mazes", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
