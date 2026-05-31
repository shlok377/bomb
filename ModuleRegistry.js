import { SimpleWires } from './modules/SimpleWires.js';
import { TheButton } from './modules/TheButton.js';
import { Keypads } from './modules/Keypads.js';
import { Logger } from './Logger.js';

export const ModuleRegistry = {
    // List of available module classes
    availableModules: {
        'simple-wires': SimpleWires,
        'the-button': TheButton,
        'keypads': Keypads
    },

    injectModules(containerId, count) {
        try {
            const container = document.getElementById(containerId);
            if (!container) throw new Error(`Container ${containerId} not found`);

            Logger.log("ModuleRegistry", `Injecting ${count} modules into ${containerId}`);
            
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

            // Get available module keys
            const keys = Object.keys(this.availableModules);
            
            // Randomly select 'count' indices from the 6 available slots
            // Ensuring they are as non-adjacent as possible
            const selectedIndices = this.pickNonAdjacentSlots(count);
            
            Logger.log("ModuleRegistry", `Selected Non-Adjacent Slots: ${selectedIndices}`);

            selectedIndices.forEach(slotIdx => {
                const slot = slots[slotIdx];
                slot.innerHTML = ''; // Clear slot if needed

                // Randomly pick a module type
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                const ModuleClass = this.availableModules[randomKey];
                
                // Initialize the module
                const moduleInstance = new ModuleClass(slot);
                moduleInstance.init();
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
        
        // Fallback: just pick random if no non-adjacent set is found (unlikely for count=3)
        Logger.warn("ModuleRegistry", "Could not find perfect non-adjacent slots, falling back to random.");
        return slots.sort(() => Math.random() - 0.5).slice(0, count);
    },

    areAdjacent(s1, s2) {
        // Grid:
        // 0 1 2
        // 3 4 5
        const row1 = Math.floor(s1 / 3);
        const col1 = s1 % 3;
        const row2 = Math.floor(s2 / 3);
        const col2 = s2 % 3;
        
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        
        // Horizontal or Vertical adjacency (not diagonal)
        return (rowDiff === 0 && colDiff === 1) || (rowDiff === 1 && colDiff === 0);
    }
};
