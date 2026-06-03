# Animation Plan

This document tracks the approved animations and visual effects for the game.

## Title Animation
### Flickering Neon
- **Description:** The title text simulates a faulty neon sign. It features irregular flickering where the brightness and glow intensity fluctuate randomly. Occasionally, the light "stutters" or briefly cuts out completely, accompanied by a subtle color shift to a dimmer hue.
- **Timing:** Played continuously (on loop) while the user is on the landing page.
- **Technical Detail:** Uses CSS keyframes with varying opacity and text-shadow values at random intervals to create a non-linear flickering effect.

## Button Animations
### Hazard Border Pulse
- **Description:** Upon hovering, the button's border is replaced with a rotating yellow-and-black diagonal "hazard stripe" pattern. The pattern scrolls continuously along the perimeter of the button.
- **Timing:** Triggered on mouse hover; stops immediately when the mouse leaves.
- **Technical Detail:** Uses a CSS `linear-gradient` as a `border-image` or a background-clip trick, animated with `background-position` to create the scrolling movement.

## Background Animation
### Vignette Pulse
- **Description:** A soft, dark shadow creeps in from the edges of the viewport (vignette effect). It subtly expands toward the center and contracts back, creating a rhythmic "breathing" sensation of pressure and claustrophobia.
- **Timing:** Played continuously (on loop).
- **Technical Detail:** Uses a CSS `box-shadow: inset` or a `radial-gradient` overlay, with keyframes animating the spread or opacity.

## Level Selection Modal Animation
### Industrial Drop-Down
- **Description:** When the "Defuse the Bomb" button is clicked, the level selection menu slides rapidly from the top of the viewport. It features a physical "bounce" or "clank" effect upon reaching its center position, simulating a heavy metal door falling into place.
- **Timing:** Triggered on click of the "Defuse" button.
- **Technical Detail:** Uses CSS `transform: translateY` with a `cubic-bezier` timing function to create the weighted falling and bounce-back effect.

## Manual View Transition
### Slide from Left
- **Description:** Upon clicking "Read the Manual", the manual interface slides smoothly from the left side of the screen, completely covering the main menu.
- **Timing:** Triggered on click of the "Manual" button.
- **Technical Detail:** The manual container is positioned absolutely at `left: -100%` and transitions to `left: 0` or `transform: translateX(0)` when activated.

## Level Button Animations
### Staggered Sequential Fade
- **Description:** As the level selection modal finishes its drop-down animation, the individual level buttons (1-5) fade in sequentially from left to right (or top to bottom). This creates a "wave" effect, suggesting the system is loading each level module one by one.
- **Timing:** Triggered automatically after the Level Selection Modal completes its entry animation.
- **Technical Detail:** Uses CSS `opacity` with staggered `transition-delay` values applied to each button based on its index.

## Bomb Rotation/Perspective Shift
### Parallax Tilt
- **Description:** The bomb casing reacts to the user's mouse movement. As the cursor moves across the screen, the entire bomb tilts slightly in 3D space toward the cursor, giving the 2D UI a sense of depth and physicality.
- **Timing:** Played continuously based on mouse position during the defusal phase.
- **Technical Detail:** Uses JavaScript to track `mousemove` coordinates and applies a dynamic CSS `transform: perspective() rotateX() rotateY()` to the bomb container.

### Smooth Glide Transition
- **Description:** When switching between bomb faces (e.g., from Front to Top), the current face slides smoothly out of the viewport in the direction of rotation, while the new face slides in from the opposite side.
- **Timing:** Triggered by navigation buttons (Flip Up/Down/Left/Right) or arrow keys.
- **Technical Detail:** Uses CSS `transition` with `transform: translate()` and `opacity`. The container uses `overflow: hidden` to mask the faces during the glide.
