/**
 * Logger.js
 * Centralized logging system for the game.
 */

export const Logger = {
    log(module, message, data = null) {
        console.log(`[${module}] ${message}`, data || "");
    },

    error(module, message, error = null) {
        console.error(`[${module}] ERROR: ${message}`, error || "");
    },

    warn(module, message, data = null) {
        console.warn(`[${module}] WARNING: ${message}`, data || "");
    }
};
