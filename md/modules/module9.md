# Module 9: Wire Sequences

## Description
A series of panels containing 3 wires each. Wires must be cut depending on how many of that specific color have been seen so far.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Wires:** 3 horizontal wires per panel.
- **Labels:** Each wire is connected to a letter (A, B, or C) on the right.
- **Navigation:** A "Down" arrow button to move to the next panel.
- **Panel Indicator:** Shows which panel (1-4) is currently visible.

## Logic & Function
- The module has 4 panels (12 wires total).
- The user must keep a running count of how many Red, Blue, and Black wires they have seen across all panels.
- For each wire, check the manual's table for its color and occurrence (e.g., "Red wire, 3rd occurrence: Cut if connected to B").
- Incorrect cuts cause a strike.
- Clicking the down arrow moves to the next set of wires once the current panel is handled.

## Clickable Parts
- **Individual Wires:** Click to cut.
- **Down Arrow:** To proceed to the next panel.
