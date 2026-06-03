# Module 7: Morse Code

## Description
A flashing light transmits a word in Morse code. The user must tune the module to the corresponding frequency.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Light:** A small circular LED that flashes in Morse code patterns.
- **Display:** A small digital readout showing a frequency (e.g., "3.505 MHz").
- **Control Buttons:** 
  - Left/Right arrows (or Up/Down) to change the frequency.
  - A "TX" (Transmit) button.

## Logic & Function
- The light flashes a word from a predefined list (e.g., "SHELL", "HALLS") on loop.
- The user identifies the word, finds the frequency for that word in the manual, and adjusts the display.
- Pressing "TX" when the frequency is correct disarms the module.
- Pressing "TX" on the wrong frequency results in a strike.

## Clickable Parts
- **Navigation Arrows:** To increment/decrement the frequency.
- **TX Button:** To submit the answer.
