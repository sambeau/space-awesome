## What would I do differently?

- create basic entity system
- use classes? or mixins (via ...)? or both?
- use centre-point for *everything*
- shared timer/callback system
- simple animation system based on shared timer
- load all images first with standard loader
- simple standard out-of-bounds system
- be careful about saving and restoring context
- consider sprite sheets
- a few text tools (e.g. centre)
- a tiny maths library (e.g draw circle point/distance/collision)
- colliders are always an array (or use Array.isArray())
- colliders are a sub-entity with updater and draw function for debug
- entities all have a debug function to draw text beside them
- floaters as part of engine
- Break things in objects and sprites
- Sprite strips like ship-7
- Opacity-based collisions



## Sprite Sheets

Created on-the-fly:

https://stackoverflow.com/questions/59056888/html5-canvas-large-sprite-sheet-image-animation-performance-optimization
