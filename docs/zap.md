# zap.js

A minimal game utility library. No dependencies, just functions.

```javascript
import { lerp, clamp, randInt, pick } from "/zap/zap.js"
```

---

## Math Basics

```javascript
// Smooth interpolation between values
lerp(0, 100, 0.5)      // → 50 (halfway)
lerp(0, 100, 0.25)     // → 25 (quarter way)

// Keep value in bounds
clamp(150, 0, 100)     // → 100
clamp(-20, 0, 100)     // → 0
clamp(50, 0, 100)      // → 50
```

---

## Geometry & Vectors

```javascript
// Distance between two points
distanceBetweenPoints(0, 0, 3, 4)   // → 5

// Angle from point A to point B
angleOfLineInRads(0, 0, 1, 1)      // → 0.785 (45° in radians)
angleOfLineInDegs(0, 0, 1, 1)      // → 45

// Make a unit vector (length = 1)
normalize(3, 4)                     // → { x: 0.6, y: 0.8 }

// Get velocity from angle
vectorFromAngle(0, 5)               // → { x: 5, y: 0 } (moving right)
vectorFromAngle(Math.PI/2, 5)       // → { x: 0, y: 5 } (moving down)

// Move towards a target at fixed speed
moveDistanceAlongLine(10, 0, 0, 100, 100)  // → { vx: 7.07, vy: 7.07 }

// Which way to turn? (-1 = left, 1 = right, 0 = aligned)
rotationDirection(currentAngle, targetAngle)
```

---

## Collisions

```javascript
// Circle vs circle
collisionBetweenCircles(x1, y1, r1, x2, y2, r2)  // → true/false

// Rectangle vs rectangle
rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2)     // → true/false

// Rectangle vs circle
rectCircleCollide(rx, ry, rw, rh, cx, cy, cr)    // → true/false

// Point inside rectangle?
pointInRect(px, py, rx, ry, rw, rh)               // → true/false

// Two game objects colliding? (handles arrays of colliders)
thingsAreColliding(enemy, bullet)                 // → true/false

// Is thing visible on screen?
thingIsOnScreen(enemy, screen)                    // → true/false
```

---

## Random

```javascript
// Random integer: 0 to n-1
randInt(10)              // → 0, 1, 2, ... or 9

// Random integer in range (inclusive)
randRange(5, 10)         // → 5, 6, 7, 8, 9, or 10

// Random float in range
randFloat(0.5, 1.5)      // → e.g. 0.823

// Pick random item from array
pick(['red', 'green', 'blue'])   // → 'green'

// Shuffle array (returns new array)
shuffle([1, 2, 3, 4])    // → e.g. [3, 1, 4, 2]
```

---

## Animation

```javascript
// Get current frame for sprite animation
// getFrame(ticks, frameCount, speed)
getFrame(0, 4, 5)    // → 0
getFrame(5, 4, 5)    // → 1
getFrame(10, 4, 5)   // → 2
getFrame(20, 4, 5)   // → 0 (loops back)

// Frame picker - more control over animation
const anim = picker([img1, img2, img3, img4])
anim.first()    // → img1
anim.last()     // → img4
anim.next()     // → img1, img2, img3, img4, img1... (loops)
anim.any()      // → random frame
anim.bounce()   // → img1, img2, img3, img4, img3, img2, img1...
```

---

## Easing

For smooth animations — t goes from 0 to 1:

```javascript
easeInQuad(t)      // Slow start, fast end
easeOutQuad(t)     // Fast start, slow end  
easeInOutQuad(t)   // Slow start and end

// Example: fade in over 60 frames
const t = frameCount / 60           // 0 → 1
const alpha = easeOutQuad(t)        // Smooth fade
ctx.globalAlpha = alpha
```

---

## Audio Helpers

```javascript
// Stereo pan based on screen position (-1 left, 0 center, 1 right)
sound.stereo(stereoFromScreenX(screen, enemy.x))

// Volume based on Y position (quieter when off-screen above)
sound.volume(volumeFromY(screen, 2, enemy.y))

// Volume based on X distance from center
sound.volume(volumeFromX(screen, 2, enemy.x))
```

---

## Game Objects

```javascript
// Create N instances of a factory function
const asteroids = makeN(asteroid, 10)  // → [asteroid(), asteroid(), ...]

// Find closest thing to another thing
const nearest = findClosestThing(player, enemies)

// Debug text next to an object
debugThing(ctx, enemy, `HP: ${enemy.hp}`)
```

---

## Quick Reference

| Category | Functions |
|----------|-----------|
| **Math** | `lerp`, `clamp` |
| **Geometry** | `distanceBetweenPoints`, `angleOfLineInRads/Degs`, `normalize`, `vectorFromAngle`, `moveDistanceAlongLine`, `wrapAngle`, `rotationDirection` |
| **Collision** | `collisionBetweenCircles`, `rectsCollide`, `rectCircleCollide`, `pointInRect`, `thingsAreColliding`, `thingIsOnScreen` |
| **Random** | `randInt`, `randRange`, `randFloat`, `pick`, `shuffle` |
| **Animation** | `getFrame`, `picker`, `easeInQuad`, `easeOutQuad`, `easeInOutQuad` |
| **Audio** | `stereoFromScreenX`, `volumeFromY`, `volumeFromX` |
| **Objects** | `makeN`, `findClosestThing`, `debugThing`, `getColliderArea` |
