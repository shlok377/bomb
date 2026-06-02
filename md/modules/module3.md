# Module 3: Keypads

## Description
Four buttons, each featuring a unique symbol. The symbols must be pressed in the correct order.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Buttons:** Four small square buttons arranged in a 2x2 grid.
- **Symbols:** Each button displays a unique, strange symbol from the manual's symbol sets.
- **Status LEDs:** A small LED above each button that turns green when pressed in the correct order.

## Logic & Function
- There are specific columns of symbols in the manual.
- The module picks one column and selects 4 symbols from it, then shuffles their positions on the keypad.
- The Defuser must press the symbols in the order they appear from top to bottom in that specific column in the manual.
- Pressing a symbol out of order results in a strike and resets the input.

## Clickable Parts
- **Symbol Buttons:** Each of the four buttons is clickable.
