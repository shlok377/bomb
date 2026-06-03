# Game Logic & State Management Architecture (The "Backend")

To ensure a highly functional and maintainable game, we will use a modular, event-driven architecture running client-side.

## 1. Module Handlers (`modules/`)
Each of the 11 modules will have its own dedicated JavaScript handler (e.g., `SimpleWires.js`, `Keypads.js`).
- **Responsibility:** Managing its own internal puzzle state, generating its unique puzzle, and handling its own UI interactions.
- **Independence:** Handlers are isolated. They do not know about other modules.
- **Communication:** They emit events (e.g., `STRIKE`, `DISARMED`) to the central Game Engine.

## 2. Level & Randomization Manager (`LevelManager.js`)
Handles the rules of progression and bomb configuration.
- **Responsibility:** Translating a Phase/Level selection into a specific bomb configuration.
- **Logic:** Randomly selects the required number of modules (3 for Phase 1, 4 for Phase 2, 6 for Phase 3) from the available pool.
- **Transition:** Orchestrates the loading of the correct Phase webpage.

## 3. Central Game Engine (`GameEngine.js`)
The orchestrator of the active game session.
- **Responsibility:** Managing global game state.
- **Systems Managed:**
  - **Global Timer:** Ticking down from 5 minutes.
  - **Strike System:** Tracking total strikes (Max 3).
  - **Win/Loss Logic:** Checking if all modules are disarmed or if time/strikes have run out.
- **Event Bus:** Acts as the central hub for module communication.

## 4. Edgework Generator (`BombState.js`)
Generates the unique identifiers for each bomb.
- **Responsibility:** Creating the Serial Number, Batteries, and Indicators at the start of a level.
- **Data Source:** Serves as a "Single Source of Truth" that modules query to solve puzzles (e.g., `BombState.hasVowel()`).

## 5. Supporting Systems
- **Audio Manager (`AudioManager.js`):** Centralized control for all sound effects (ticking, strikes, explosions, clicks).
- **UI/DOM Controller (`UIManager.js`):** Handles all visual updates, including bomb rotation views, modal popups, and HUD updates.

## Communication Flow
1. `LevelManager` initializes a level.
2. `BombState` generates edgework.
3. `GameEngine` starts timer and initializes `Module Handlers`.
4. User interacts with a Module.
5. Module emits `STRIKE` or `DISARMED`.
6. `GameEngine` updates global state and triggers `UIManager` and `AudioManager`.
