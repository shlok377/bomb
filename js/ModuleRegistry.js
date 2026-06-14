import { SimpleWires } from './modules/SimpleWires.js';
import { TheButton } from './modules/TheButton.js';
import { Keypads } from './modules/Keypads.js';
import { SimonSays } from './modules/SimonSays.js';
import { WhosOnFirst } from './modules/WhosOnFirst.js';
import { Memory } from './modules/Memory.js';
import { MorseCode } from './modules/MorseCode.js';
import { ComplicatedWires } from './modules/ComplicatedWires.js';
import { WireSequences } from './modules/WireSequences.js';
import { Mazes } from './modules/Mazes.js';
import { Passwords } from './modules/Passwords.js';
import { Logger } from './Logger.js';
import { AudioManager } from './AudioManager.js';
import { GameEngine } from './GameEngine.js';

// Module Identification Names
const ModuleTags = {
    'simple-wires': 'Simple Wires',
    'the-button': 'The Button',
    'keypads': 'Keypads',
    'simon-says': 'Simon Says',
    'whos-on-first': "Who's On First",
    'memory': 'Memory',
    'morse-code': 'Morse Code',
    'complicated-wires': 'Complicated Wires',
    'wire-sequences': 'Wire Sequences',
    'mazes': 'Mazes',
    'passwords': 'Passwords'
};

export const ModuleRegistry = {
    // List of available module classes
    availableModules: {
        'simple-wires': SimpleWires,
        'the-button': TheButton,
        'keypads': Keypads,
        'simon-says': SimonSays,
        'whos-on-first': WhosOnFirst,
        'memory': Memory,
        'morse-code': MorseCode,
        'complicated-wires': ComplicatedWires,
        'wire-sequences': WireSequences,
        'mazes': Mazes,
        'passwords': Passwords
    },

    // Phase-specific module pools
    phaseModules: {
        1: ['simple-wires', 'the-button', 'keypads', 'memory', 'whos-on-first', 'passwords', 'simon-says'],
        2: ['simple-wires', 'the-button', 'keypads', 'memory', 'whos-on-first', 'passwords', 'simon-says', 'wire-sequences', 'mazes'],
        3: ['simple-wires', 'the-button', 'keypads', 'memory', 'whos-on-first', 'passwords', 'simon-says', 'wire-sequences', 'mazes', 'complicated-wires', 'morse-code']
    },

    injectModules(containerId, count, phase = 3) {
        try {
            const container = document.getElementById(containerId);
            if (!container) throw new Error(`Container ${containerId} not found`);

            let allowedKeys = [...(this.phaseModules[phase] || this.phaseModules[3])];
            
            // SIDE QUEST FIX: Simon Says only works correctly with 0, 1, or 2 strikes.
            // If the level allows more than 2 strikes, exclude it from the pool.
            if (GameEngine.maxStrikes > 2) {
                const originalLength = allowedKeys.length;
                allowedKeys = allowedKeys.filter(k => k !== 'simon-says');
                if (allowedKeys.length < originalLength) {
                    Logger.log("ModuleRegistry", `Simon Says excluded from pool (maxStrikes: ${GameEngine.maxStrikes} > 2)`);
                }
            }

            Logger.log("ModuleRegistry", `Injecting ${count} modules from Phase ${phase} pool into ${containerId}`);
            
            // Clear container first
            container.innerHTML = '';

            // Create 6 slots (3x2 grid: 3 columns, 2 rows)
            const slots = [];
            for (let i = 0; i < 6; i++) {
                const slot = document.createElement('div');
                slot.className = 'module-slot';
                container.appendChild(slot);
                slots.push(slot);
            }

            // Randomly select 'count' indices from the 6 available slots
            const selectedIndices = this.pickNonAdjacentSlots(count);
            
            Logger.log("ModuleRegistry", `Selected Non-Adjacent Slots: ${selectedIndices}`);

            // Track modules already used in this phase and their frequencies
            const moduleCounts = {};

            selectedIndices.forEach(slotIdx => {
                const slot = slots[slotIdx];
                slot.innerHTML = ''; 

                let randomKey;
                const r = Math.random();
                
                const usedKeys = Object.keys(moduleCounts);
                const twiceUsed = usedKeys.filter(k => moduleCounts[k] === 2);
                const onceUsed = usedKeys.filter(k => moduleCounts[k] === 1);
                const uniquePool = allowedKeys.filter(key => !moduleCounts[key]);

                if (r < 0.01 && twiceUsed.length > 0) {
                    // 1% chance for 3rd occurrence
                    randomKey = twiceUsed[Math.floor(Math.random() * twiceUsed.length)];
                } else if (r < 0.08 && onceUsed.length > 0) {
                    // 7% chance for 2nd occurrence (0.01 to 0.08 range)
                    randomKey = onceUsed[Math.floor(Math.random() * onceUsed.length)];
                } else if (uniquePool.length > 0) {
                    // Default: pick unique if available
                    randomKey = uniquePool[Math.floor(Math.random() * uniquePool.length)];
                } else {
                    // Fallback to full pool
                    randomKey = allowedKeys[Math.floor(Math.random() * allowedKeys.length)];
                }

                moduleCounts[randomKey] = (moduleCounts[randomKey] || 0) + 1;
                const ModuleClass = this.availableModules[randomKey];
                
                // Initialize the module
                const moduleInstance = new ModuleClass(slot);
                moduleInstance.init();

                // Add the Obfuscation Cover
                const cover = document.createElement('div');
                cover.className = 'module-cover';
                cover.textContent = ModuleTags[randomKey];
                slot.appendChild(cover); // Restore missing cover!

                const revealModule = () => {
                    if (cover.classList.contains('revealed')) return;
                    cover.classList.add('revealed');
                    const moduleEl = slot.querySelector('.module');
                    if (moduleEl) moduleEl.classList.add('start-animations');
                };

                cover.onclick = () => {
                    AudioManager.playClick();
                    revealModule();
                };

                // Phase-based auto-reveal timeout
                // Force phase to number for comparison
                const phaseNum = Number(phase);
                let revealTime = 30000; // Default Phase 1: 30s
                if (phaseNum === 2) revealTime = 20000; // Phase 2: 20s
                if (phaseNum === 3) revealTime = 10000; // Phase 3: 10s

                setTimeout(() => {
                    if (!cover.classList.contains('revealed')) {
                        Logger.log("ModuleRegistry", `Auto-revealing tag after ${revealTime/1000}s timeout for Phase ${phaseNum}`);
                        revealModule();
                    }
                }, revealTime);
            });

        } catch (err) {
            Logger.error("ModuleRegistry", "Failed to inject modules", err);
        }
    },

    pickNonAdjacentSlots(count) {
        const slots = [0, 1, 2, 3, 4, 5];
        let attempts = 0;
        
        while (attempts < 50) {
            const selected = [];
            const tempSlots = [...slots];
            
            while (selected.length < count && tempSlots.length > 0) {
                const randIdx = Math.floor(Math.random() * tempSlots.length);
                const slot = tempSlots.splice(randIdx, 1)[0];
                
                // Check adjacency with already selected slots
                const isAdjacent = selected.some(s => this.areAdjacent(s, slot));
                
                if (!isAdjacent) {
                    selected.push(slot);
                }
            }
            
            if (selected.length === count) return selected;
            attempts++;
        }
        
        // Fallback: just pick random if no non-adjacent set is found
        Logger.warn("ModuleRegistry", "Could not find perfect non-adjacent slots, falling back to random.");
        return slots.sort(() => Math.random() - 0.5).slice(0, count);
    },

    areAdjacent(s1, s2) {
        const row1 = Math.floor(s1 / 3);
        const col1 = s1 % 3;
        const row2 = Math.floor(s2 / 3);
        const col2 = s2 % 3;
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
    }
};
