# Module 8: Complicated Wires

## Description
A set of wires with multiple attributes: color (Red/Blue), an LED, and a Star symbol.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Wires:** Up to 6 vertical wires.
- **Wire Attributes:**
  - **Color:** Red, Blue, or Striped Red/Blue.
  - **LED:** A small light above each wire (Lit or Unlit).
  - **Star:** A small star symbol printed below each wire (Present or Absent).

## Logic & Function
- For each wire, the user checks the Venn diagram in the manual based on its 3 attributes (Red, LED, Star).
- The diagram gives a result: Cut (C), Don't Cut (D), Cut if Serial is Even (S), Cut if Parallel Port exists (P - replace with Serial even for our version), or Cut if 2+ Batteries (B).
- **Modification:** Since we aren't doing ports, "P" will be "Cut if 2+ batteries" or another edgework check.
- Incorrect cut results in a strike.

## Clickable Parts
- **Individual Wires:** Each wire is clickable to "cut" it.
