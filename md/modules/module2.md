# Module 2: The Button

## Description
A single large button that may need to be pressed or held depending on its color and label.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Button:** A large circular button in the center.
- **Label:** Text on the button (e.g., "Abort", "Detonate", "Hold", "Press").
- **Button Color:** The button can be Blue, White, Yellow, or Red.
- **Indicator Strip:** A thin rectangular strip on the right side of the button that lights up when the button is held.

## Logic & Function
- **Immediate Press:** Some buttons should be pressed and released immediately.
- **Hold & Release:** Some buttons require the user to hold them down. When held, the indicator strip glows a specific color (Blue, White, Yellow, or Other). The user must then release the button when the countdown timer has a specific digit in it (based on the manual).
- Incorrect release timing or an incorrect immediate press results in a strike.

## Clickable Parts
- **The Button:** 
  - Mouse Down: Initiates the press.
  - Mouse Up: Initiates the release.
  - The game must track the duration and the timer state at the moment of release.
