# Game UI & Navigation Plan

## Landing Screen
- **Options:** Two main choices: "Defuse the Bomb" and "Read the Manual".

## The Expert ("Read the Manual")
- **Action:** Opens the manual in the same page.
- **Implementation:** Uses an `<iframe>` to embed `pdf/manual.pdf` directly in the UI.
- **Navigation:** Includes a persistent "Back to Main Menu" button overlaying the top corner, so the Expert can easily return without relying on browser navigation.

## The Defuser ("Defuse the Bomb")
- **Action:** Clicking this opens a popup/modal displaying the game phases and levels.
- **Structure:**
  - **Phases & Levels:** Each phase contains 5 randomized levels. All levels are unlocked by default.
  - **Difficulty Scaling:**
    - **Phase 1:** 3 random modules per level.
    - **Phase 2:** 4 random modules per level.
    - **Phase 3:** 6 random modules per level.

## Game Navigation & Architecture
- **Webpage Structure:** The game will use multiple web pages. Clicking on a level in the popup will navigate the user to a completely new webpage. Each phase will have its own dedicated webpage.

## Bomb View (In-Game UI)
- **Visual Style:** 2D Flat UI (Top-down view).
- **Interactivity:** The user sees the main face of the bomb. They can "rotate" the bomb to check the sides, top, and bottom for "Edgework" (like batteries, indicators, and the serial number).
- **Controls:** Rotation is handled via on-screen UI buttons and keyboard arrow keys.
