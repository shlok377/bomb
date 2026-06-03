# Stage 2: Core Game Engine & Edgework

## Objectives
- Build the global bomb mechanics (time, strikes).
- Implement the edgework generation.
- Create the 2D UI for viewing the bomb and its sides.

## Tasks
1. Create the Bomb UI shell (top-down view).
2. Implement rotation abstraction (switching views via UI buttons and arrow keys) to see top, bottom, and sides.
3. Build the core Engine:
   - Global Timer (5 minutes).
   - Strike System (Explode on 3rd strike).
4. Implement Edgework generation logic:
   - Serial Number (6 alphanumeric characters).
   - Batteries (randomized count).
   - Indicators (lit/unlit, up to 3 uppercase letters like CAR, FRK).
   - Render edgework dynamically on the bomb's sides.
