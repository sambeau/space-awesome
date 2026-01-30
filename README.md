# SPACE AWESOME

*Aliens have destroyed a troop carrier and survivors have been scattered into space. Save them before they get shot by baddies … or eaten by space snakes!*

Space Awesome is a silly old-skool shoot-em-up from the Galaxians’ skool, if Galaxian’s had been made by Williams.

Like many games created by old farts, it uses elements of games from the early 1980—mostly Williams’ games (Especially Defender and Robotron), but it has a few Atari nods too. It’s homage, not theft. Honest.

## Javascript

Space Awesome was an exercise in seeing how far you could get using just the simplest of Javascipt: A canvas, a smattering of CSS, simple objects, a tiny amount of vector maths, a rudimentary collision system (based on circles), a game loop. 

It turns out that you can get quite far—modern Javascript is *fast*!

## The Game

The game has a ship, missiles, smart bombs, spacemen to save, and lots of nasty baddies including pods and swarmers, motherships and snakes. It’s an awesome mashup, set in space.

The aim is to get the next high-score while saving as many spacemen as possible.

## What would I do differently?

Next time I would do this:

- create basic entity system ✅
- use centre-point for *everything*
- shared timer/callback system
- simple animation system based on shared timer
- load all images first with standard loader ✅
- simple standard out-of-bounds system ✅
- be careful about saving and restoring context
- consider sprite sheets
- a few text tools (e.g. centre)
- a tiny maths library (e.g draw circle point/distance/collision) ✅
- colliders are always an array (or use Array.isArray())
- colliders are a sub-entity with updater and draw function for debug
- entities all have a debug function to draw text beside them
- floaters as part of engine
- Break things in objects and sprites
- Sprite strips like ship-7
- Opacity-based collisions