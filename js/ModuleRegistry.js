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
            
            // Get module keys
            const keys = Object.keys(this.availableModules);
            
            for (let i = 0; i < count; i++) {
                // Create a slot for the module
                const slot = document.createElement('div');
                slot.className = 'module-slot';
                container.appendChild(slot);

                // Randomly pick a module type
                const randomKey = keys[Math.floor(Math.random() * keys.length)];
                const ModuleClass = this.availableModules[randomKey];
                
                // Initialize the module
                const moduleInstance = new ModuleClass(slot);
                moduleInstance.init();
            }
        } catch (err) {
            Logger.error("ModuleRegistry", "Failed to inject modules", err);
        }
    }
};
