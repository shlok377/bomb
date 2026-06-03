# Module 11: Passwords

## Description
A five-letter word guessing game where the user rotates letters in each position to find a valid word.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Letter Slots:** 5 vertical columns.
- **Arrows:** Small Up and Down arrows above and below each letter column.
- **Display:** The current selected letter in each column is visible in the middle.
- **Submit Button:** A small "Submit" or "Apply" button at the bottom (optional, can also auto-disarm when valid).

## Logic & Function
- Each column has 6 possible letters.
- The user must find the only 5-letter word from the manual's list that can be formed using the letters available in the columns.
- Clicking "Submit" (or matching the word) disarms the module.
- Submitting an invalid word results in a strike.

## Clickable Parts
- **Up/Down Arrows:** 10 total (2 per column) to cycle through the letters.
- **Submit Button:** To check the word.
