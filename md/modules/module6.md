# Module 6: Memory

## Description
A five-stage memory puzzle where the user must remember previous button numbers and positions.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Display:** A large digit (1-4) at the top.
- **Buttons:** Four numbered buttons in a row (Left to Right). Each button has a label (1-4).
- **Stage Indicators:** Five small LEDs at the bottom to show progress through the five stages.

## Logic & Function
- In each of the 5 stages, a number is displayed.
- The user must press a button based on the displayed number and the rules for that stage (e.g., "Stage 2: Press the button in the same position as Stage 1").
- Correct inputs advance the stage; incorrect inputs cause a strike and reset the module to Stage 1.
- The game must "remember" the position and label of every button pressed in previous stages.

## Clickable Parts
- **Four Numbered Buttons:** The buttons in the horizontal row are clickable.
