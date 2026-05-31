import { GameEngine } from '../GameEngine.js';
import { Logger } from '../Logger.js';
import { AudioManager } from '../AudioManager.js';

export class Mazes {
    constructor(container) {
        this.container = container;
        this.size = 6;
        this.playerPos = { x: 0, y: 0 };
        this.goalPos = { x: 0, y: 0 };
        this.activeMaze = null;
        this.isDisarmed = false;

        // 9 official mazes from the KTANE manual
        this.mazes = [
            { indicators: [{x:1, y:0}, {x:5, y:2}], walls: ["0,0-0,1", "0,1-0,2", "0,1-1,1", "1,1-1,2", "1,2-2,2", "2,2-2,1", "2,1-3,1", "3,1-3,0", "3,0-4,0", "4,0-5,0", "4,1-5,1", "4,1-4,2", "3,2-4,2", "3,2-3,3", "2,3-3,3", "2,3-2,4", "1,3-1,4", "0,3-0,4", "0,4-0,5", "1,4-1,5", "2,4-2,5", "3,4-3,5", "4,4-4,5", "5,4-5,5", "4,3-5,3", "4,3-4,4", "0,3-1,3", "3,3-3,4", "4,4-5,4"] },
            { indicators: [{x:1, y:3}, {x:4, y:1}], walls: ["0,0-1,0", "1,0-1,1", "0,1-0,2", "0,2-1,2", "1,1-2,1", "2,0-3,0", "2,0-2,1", "3,0-3,1", "3,1-4,1", "4,0-5,0", "5,0-5,1", "5,1-5,2", "4,2-5,2", "4,2-4,3", "5,3-5,4", "4,4-5,4", "4,4-4,5", "3,4-3,5", "2,4-2,5", "1,4-1,5", "0,4-0,5", "0,3-0,4", "1,3-2,3", "1,2-1,3", "2,2-3,2", "2,2-2,3", "3,2-3,3", "3,3-4,3"] },
            { indicators: [{x:3, y:3}, {x:5, y:3}], walls: ["0,0-0,1", "0,0-1,0", "1,0-2,0", "2,0-2,1", "1,1-1,2", "0,2-0,3", "0,3-1,3", "1,3-1,4", "0,4-0,5", "1,4-2,4", "2,4-3,4", "3,4-4,4", "4,4-5,4", "5,4-5,5", "4,5-5,5", "3,5-4,5", "2,5-3,5", "1,5-2,5", "0,5-1,5", "5,0-5,1", "5,1-5,2", "4,1-4,2", "3,1-4,1", "3,0-4,0", "3,1-3,2", "2,2-3,2", "2,2-2,3", "3,3-4,3", "4,2-4,3"] },
            { indicators: [{x:0, y:0}, {x:0, y:3}], walls: ["0,1-1,1", "1,0-1,1", "1,1-1,2", "0,2-0,3", "0,3-1,3", "1,3-1,4", "1,4-2,4", "2,3-2,4", "2,4-3,4", "3,4-4,4", "4,4-4,5", "5,4-5,5", "5,3-5,4", "5,2-5,3", "4,2-5,2", "4,1-4,2", "4,0-5,0", "3,0-4,0", "2,0-3,0", "2,0-2,1", "2,1-3,1", "3,1-3,2", "2,2-3,2", "3,2-3,3", "3,3-4,3", "0,4-0,5", "1,5-2,5", "2,5-3,5", "3,5-4,5"] },
            { indicators: [{x:4, y:2}, {x:2, y:5}], walls: ["0,0-0,1", "0,1-1,1", "1,0-1,1", "1,1-2,1", "2,0-2,1", "2,1-3,1", "3,0-3,1", "3,1-4,1", "4,0-4,1", "4,1-5,1", "5,1-5,2", "5,2-5,3", "5,3-5,4", "5,4-5,5", "4,4-5,4", "4,4-4,5", "3,4-4,4", "3,4-3,5", "2,4-3,4", "2,4-2,5", "1,4-2,4", "1,4-1,5", "0,4-1,4", "0,4-0,5", "0,3-0,4", "0,2-0,3", "1,2-1,3", "1,2-2,2", "2,2-2,3", "2,3-3,3", "3,2-3,3", "3,2-4,2", "4,2-4,3"] },
            { indicators: [{x:2, y:1}, {x:4, y:4}], walls: ["0,0-1,0", "0,1-0,2", "1,0-1,1", "1,1-2,1", "2,0-2,1", "2,1-3,1", "3,1-3,2", "2,2-2,3", "1,2-1,3", "0,3-0,4", "0,4-0,5", "1,4-1,5", "2,4-2,5", "3,4-3,5", "4,4-4,5", "5,4-5,5", "5,3-5,4", "4,2-4,3", "4,1-4,2", "4,0-5,0", "5,0-5,1", "5,1-5,2", "5,2-5,3", "3,2-4,2", "3,2-3,3", "2,3-3,3", "1,3-2,3", "1,3-1,4", "3,3-4,3", "3,3-3,4"] },
            { indicators: [{x:1, y:0}, {x:1, y:5}], walls: ["0,1-1,1", "1,0-1,1", "1,1-1,2", "0,2-0,3", "1,2-2,2", "2,1-2,2", "2,0-3,0", "3,0-3,1", "3,1-4,1", "4,1-5,1", "5,0-5,1", "5,1-5,2", "4,2-5,2", "4,2-4,3", "4,3-5,3", "5,3-5,4", "5,4-5,5", "4,4-4,5", "3,4-4,4", "3,4-3,5", "2,4-3,4", "2,4-2,5", "1,4-2,4", "1,4-1,5", "0,4-1,4", "0,4-0,5", "0,3-1,3", "2,2-2,3", "2,3-3,3", "3,2-3,3"] },
            { indicators: [{x:3, y:0}, {x:2, y:3}], walls: ["0,0-1,0", "0,1-0,2", "1,1-1,2", "1,1-2,1", "2,0-2,1", "2,1-3,1", "3,0-4,0", "4,0-4,1", "4,1-5,1", "5,1-5,2", "5,2-5,3", "4,3-5,3", "4,3-4,4", "5,4-5,5", "4,4-4,5", "3,4-4,4", "3,4-3,5", "2,4-3,4", "2,4-2,5", "1,4-2,5", "1,4-1,5", "0,4-0,5", "0,3-0,4", "0,2-1,2", "1,2-1,3", "1,3-2,3", "2,2-3,2", "3,2-3,3", "3,3-4,3", "4,2-4,3"] },
            { indicators: [{x:0, y:4}, {x:2, y:1}], walls: ["0,0-1,0", "0,1-0,2", "1,1-2,1", "2,0-3,0", "3,0-3,1", "4,0-5,0", "5,0-5,1", "5,1-5,2", "4,2-5,2", "4,2-4,3", "5,3-5,4", "4,4-5,4", "4,4-4,5", "3,4-3,5", "2,4-2,5", "1,4-2,5", "1,4-1,5", "0,4-0,5", "0,3-0,4", "0,2-1,2", "1,2-2,2", "2,2-3,2", "3,1-3,2", "3,2-3,3", "3,3-4,3", "1,2-1,3", "1,3-2,3", "2,3-3,3"] }
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
        // KTANE Mazes logic
        // 1. Pick one of the 9 mazes randomly.
        const mazeIdx = Math.floor(Math.random() * this.mazes.length);
        this.activeMaze = this.mazes[mazeIdx];
        
        // 2. Place player and goal randomly.
        this.playerPos = { x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) };
        this.goalPos = { x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) };
        
        while (this.playerPos.x === this.goalPos.x && this.playerPos.y === this.goalPos.y) {
            this.goalPos = { x: Math.floor(Math.random() * 6), y: Math.floor(Math.random() * 6) };
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
                const isIndicator = this.activeMaze.indicators.some(ind => ind.x === x && ind.y === y);
                
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

        if (nx < 0 || nx >= 6 || ny < 0 || ny >= 6 || this.hasWall(this.playerPos.x, this.playerPos.y, nx, ny)) {
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

    hasWall(x1, y1, x2, y2) {
        const wallId = [`${x1},${y1}-${x2},${y2}`, `${x2},${y2}-${x1},${y1}`];
        return this.activeMaze.walls.some(w => wallId.includes(w));
    }

    disarm() {
        this.isDisarmed = true;
        this.container.querySelector('.module-status').classList.add('disarmed');
        Logger.log("Mazes", "Module Disarmed");
        GameEngine.moduleSolved();
    }
}
