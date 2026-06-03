# Module 4: Simon Says

## Description
A memory-based module with four colored buttons that flash in an increasing sequence.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Buttons:** Four large colored segments (Red, Blue, Green, Yellow) arranged in a circle or 2x2 grid.
- **Center LED:** A small light that indicates when the module is flashing.

## Logic & Function
- The module flashes a sequence of colors.
- The correct "response" color for each flash depends on:
  - The color that flashed.
  - Whether the serial number contains a vowel.
  - How many strikes the bomb currently has.
- The user must repeat the sequence as it grows (1 flash, then 2, etc.).
- An incorrect button press results in a strike and a new sequence.

## Clickable Parts
- **Colored Buttons:** Each of the four colored segments is clickable. They should light up briefly when clicked.
