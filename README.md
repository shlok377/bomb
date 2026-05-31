# Keep Talking and Nobody Explodes - Web Clone

A high-fidelity, web-native reproduction of the critically acclaimed cooperative bomb defusal game, designed specifically for long-distance communication and high-tension gameplay.

## 🚀 Overview

This project brings the "Keep Talking and Nobody Explodes" experience to the browser. One player (the **Defuser**) interacts with a randomized bomb interface, while the other player (the **Expert**) uses a comprehensive technical manual to provide instructions. 

This version was built with long-distance couples in mind, offering a frictionless, web-based way to test communication skills under extreme (simulated) pressure.

## 🏆 Credits

This project is a fan-made tribute and reproduction of the original game **"Keep Talking and Nobody Explodes"** created by **Steel Crate Games**. 

All original game concepts, module logic, and manual content are the intellectual property of Steel Crate Games. If you enjoy this web version, please support the original developers by purchasing the official game on [Steam](https://store.steampowered.com/app/341800/Keep_Talking_and_Nobody_Explodes/) or other platforms.

## 🎮 How to Play

### **Requirement: Two Players**
1.  **The Defuser:** Opens the game and selects a level. They can see and interact with the bomb but do not have the instructions.
2.  **The Expert:** Opens the **Classified Manual**. They have all the technical data needed to disarm the modules but cannot see the bomb.

### **The Objective**
The Defuser must disarm all modules on the bomb before the timer reaches 0:00. Communication is the only bridge between the two players.

### **Controls**
-   **Interact:** Click/Mouse-down on wires, buttons, and keypad symbols.
-   **Rotate Bomb:** Use the **Arrow Keys** or the on-screen **Flip Buttons** to view different sides of the bomb for edgework (Serial Number, Batteries, Indicators).
-   **Modules:** 11 unique modules are implemented, including Simple Wires, The Button, Keypads, Simon Says, Who's on First, Memory, Morse Code, Complicated Wires, Wire Sequences, Mazes, and Passwords.

## 🛠 Technical Features

-   **Synthetic Audio Engine:** Zero-asset audio system using the Web Audio API. Ticking, buzzers, and chimes are generated in real-time.
-   **Dynamic Difficulty:** As strikes are recorded, the countdown timer accelerates (up to 3x speed!), increasing the pressure.
-   **Clunky Gov Portal:** A custom HTML manual built with a "2016 military intranet" aesthetic, featuring a persistent sidebar for rapid lookup.
-   **Data-Driven Logic:** All manual rules and module behaviors are driven by structured JSON, allowing for future randomization and procedural generation.

## 📦 Local Setup

Due to modern browser security policies regarding JavaScript Modules and the Web Audio API, this project must be run via a local web server.

1.  Clone the repository.
2.  Navigate to the project directory.
3.  Start a local server.
    -   *Using Python:* `python3 -m http.server 8000`
    -   *Using Node.js:* `npx serve`
4.  Open `http://localhost:8000` in your browser.

## 📂 Project Structure

-   `index.html`: The main landing page and level selection.
-   `manual.html`: The dynamic, bureaucratic Expert manual.
-   `js/`: Core game engine, UI manager, and module handlers.
-   `css/`: Styling for the bomb, modules, and the manual portal.
-   `pdf/json/`: The master data files containing all manual rules.
-   `md/`: Extensive documentation covering every stage of the project's development.

---
*Built with ❤️ for long-distance defusal.*
