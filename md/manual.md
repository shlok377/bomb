# HTML Manual Design & UI

This document tracks the UI/UX decisions for the custom HTML manual, replacing the static PDF.

## Visual Theme: "Clunky Gov Portal"
- **Inspiration:** Circa 2010-2016 government and military intranet sites.
- **Background:** Dull off-white/beige (#F5F5DC or similar).
- **Typography:** Standard, uninspired fonts (Arial, Times New Roman, or Courier).
- **Styling:** Harsh box shadows, sharp square corners, thick HTML table borders, and standard blue/purple hyperlinks.
- **Thematic Elements:** Large "CLASSIFIED" or "EYES ONLY" red banners at the top/bottom of pages.

## Navigation: "Vague Top-Menu Dropdowns" (Option B)
To intentionally induce panic and friction, the navigation uses vague, bureaucratic categories rather than explicit module names.

### 1. DIRECTIVES
*   **Operational Overview:** (General Rules, Strikes, Timer, Win/Loss conditions).
*   **Identification Protocol:** (How to identify if a module is disarmed).

### 2. COMPONENT SCHEMATICS
*   **Linear Connectors:** (Simple Wires)
*   **Multi-State Actuators:** (The Button)
*   **Hierarchical Symbol Sets:** (Keypads)
*   **Pattern Recognition:** (Simon Says)
*   **Asymmetrical Wiring:** (Complicated Wires)
*   **Sequential Routing:** (Wire Sequences)

### 3. SIGNAL & LOGIC
*   **Verbal Relays:** (Who's On First)
*   **Volatile Memory Access:** (Memory)
*   **Frequential Deciphering:** (Morse Code)
*   **Navigational Algorithms:** (Mazes)
*   **Cryptographic Passphrases:** (Passwords)

### 4. SUSTENANCE & MAINTENANCE (Needy Modules)
*   **Atmospheric Venting:** (Venting Gas)
*   **Energy Dissipation:** (Capacitor Discharge)
*   **Rotary Interfacing:** (Knobs)

### 5. APPENDICES (Identification Reference)
*   **Reference A:** Visual Indicators
*   **Reference B:** Power Sources (Batteries)
*   **Reference C:** Interface Ports

## Technical Architecture
- **Data-Driven:** The manual content is stored in 5 JSON files in `pdf/json/`.
- **Renderer:** A `manualRenderer.js` script dynamically builds the HTML based on the selected category and module data.
- **Future-Proof:** This setup allows for procedural generation (randomization) of the manual rules in later stages.
