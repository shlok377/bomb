# Module 1: Simple Wires

## Description
A basic module consisting of 3 to 6 colored wires. The defuser must cut the correct wire based on the total number of wires and their specific colors.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Wires:** 3 to 6 horizontal lines spanning the width of the module.
- **Colors:** Each wire can be Red, Blue, Yellow, White, or Black.
- **Connection Points:** Small grey circles on the left and right sides of each wire.

## Logic & Function
- The module randomly generates a set of wires.
- The "correct" wire to cut is determined by the logic in the manual (Stage 3).
- Cutting any wire other than the correct one results in a strike.
- Cutting the correct wire disarms the module (LED turns green).

## Clickable Parts
- **Individual Wires:** Clicking any part of a wire will "cut" it. The wire graphic will change to show a gap in the middle.
