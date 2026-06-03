# Module 10: Mazes

## Description
A navigation puzzle where the user must move a marker through an invisible maze.

## Visual Representation (2D Flat UI)
- **Housing:** A square module panel.
- **Grid:** A 6x6 grid of dots.
- **Indicators:**
  - **Two Green Circles:** Fixed indicators on the grid that identify which of the 9 possible mazes is active.
  - **White Square/Light:** The current position of the defuser.
  - **Red Triangle:** The goal position.
- **Controls:** Four arrow buttons (Up, Down, Left, Right).

## Logic & Function
- The green circles identify the specific maze walls (which are invisible to the defuser).
- The user must use the arrow buttons to move the white light to the red triangle.
- Hitting an invisible wall results in a strike and the light does not move.

## Clickable Parts
- **Four Arrow Buttons:** Used to navigate the grid.
