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

        this.container.querySelectorAll('.maze-btn').forEach(btn => {
            btn.onclick = () => this.move(btn.dataset.dir);
        });
    }

    generateGridHTML() {
        let html = "";
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 6; x++) {
                const isPlayer = (x === this.playerPos.x && y === this.playerPos.y);
                const isGoal = (x === this.goalPos.x && y === this.goalPos.y);
                const val = this.activeMatrix[y][x];
                const isIndicator = (val === 2);
                
                html += `<div class="maze-cell">
                    ${isPlayer ? '<div class="maze-player"></div>' : ''}
                    ${isGoal ? '<div class="maze-goal"></div>' : ''}
                    ${isIndicator ? '<div class="maze-indicator"></div>' : ''}
                </div>`;
            }
        }
        return html;
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
            this.render();
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
