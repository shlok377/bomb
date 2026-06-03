# Game Mechanics: Web-Based KTANE Clone

## Core Architecture
- **Connection Type:** Unconnected. The web app does not link the two players over a server.
- **Roles:**
  - **Defuser:** Clicks "Defuse the Bomb" on the landing screen. A bomb is generated locally on their device.
  - **Expert:** Clicks "Read the Manual" on the landing screen. They view a static, locally loaded web manual.
- **Manual Type:** Static PDF/HTML Replica. The game logic will strictly follow the official vanilla KTANE rules, and the Expert will use a static version of the original manual.
- **Communication:** Handled entirely out-of-band by the players (e.g., via Discord, phone call, FaceTime).

## Bomb Global Structure & Identifiers (Edgework)
- **Time Limit:** 5 minutes default.
- **Strikes Allowed:** 3 strikes (bomb explodes on the 3rd strike, or you survive 2).
- **Serial Number:** 6 alphanumeric characters.
- **Batteries:** Included (randomized count).
- **Indicators:** Included (lit/unlit, up to 3 uppercase letters, e.g., CAR, FRK).

## UI, Visual Style, & Navigation
- **Tech Stack/Style:** 2D Flat UI (Top-down view).
- **Landing Page Flow:** 
  - **Expert ("Read the Manual"):** Opens `pdf/manual.pdf` in the same page (embedded or full-screen).
  - **Defuser ("Defuse the Bomb"):** Opens a popup/modal displaying Phases and Levels.
  - **Level Selection:** Clicking a level navigates the user to the bomb view. Each Phase uses a distinct web page/view.
- **Rotation/Edgework:** Users can "rotate" the bomb (switch between the front face, sides, top, and bottom to find edgework like batteries and indicators) using on-screen buttons and keyboard arrow keys.

## Progression and Level Design
- **Structure:** The game is divided into "Phases" and "Levels".
- **Levels per Phase:** 5 randomized levels in each phase.
- **Unlocking:** All levels are unlocked by default.
- **Difficulty Scaling (Modules per Bomb):**
  - **Phase 1:** 3 random modules per level.
  - **Phase 2:** 4 random modules per level.
  - **Phase 3:** 6 random modules per level.

## Modules (Targeting full parity with base KTANE)
1. Simple Wires
2. The Button
3. Keypads
4. Simon Says
5. Who's on First
6. Memory
7. Morse Code
8. Complicated Wires
9. Wire Sequences
10. Mazes
11. Passwords
