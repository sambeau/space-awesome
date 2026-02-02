# Zap — A Minimal Game Library

**v1.0.0-beta**

A tiny, dependency-free JavaScript library for making 2D canvas games. Born from building [Space Awesome](../../README.md), extracted for reuse.

No build step. No framework. Just functions you can copy into any project.

---

## What's Included

| File | Purpose |
|------|---------|
| **zap.js** | Math, collision, random, animation utilities |
| **Entity.js** | Entity factory with asset loading and common behaviours |
| **Director.js** | Entity management — spawning, updating, drawing, collision groups |
| **StateManager.js** | Game state machine (title, play, game over, etc.) |
| **HighScoreManager.js** | LocalStorage high score persistence |

---

## How They Fit Together

```
┌─────────────────────────────────────────────────────────────┐
│                         Your Game                           │
├─────────────────────────────────────────────────────────────┤
│  StateManager        │  Director           │  HighScores    │
│  ─────────────       │  ────────           │  ──────────    │
│  Manages screens:    │  Manages entities:  │  Saves/loads   │
│  title → play →      │  spawn, update,     │  high scores   │
│  gameOver            │  draw, collisions   │                │
├─────────────────────────────────────────────────────────────┤
│                        Entity.js                            │
│  Creates game objects with common behaviours                │
├─────────────────────────────────────────────────────────────┤
│                         zap.js                              │
│  Math • Collision • Random • Animation • Audio helpers      │
└─────────────────────────────────────────────────────────────┘
```

You can use them together or pick just the pieces you need.

---

## Using in Isolation

Each module works independently:

```javascript
// Just want math utilities?
import { lerp, clamp, randInt, pick } from './zap.js'

// Just want entity helpers?
import { createEntity, loadImages, loadSound } from './Entity.js'

// Just want state management?
import { StateManager } from './StateManager.js'

// Just want high scores?
import { HighScoreManager } from './HighScoreManager.js'

// Want full entity management?
import { createDirector } from './Director.js'
```

---

## Quick Start

```javascript
import { createDirector } from './zap/Director.js'
import { createEntity, loadImages } from './zap/Entity.js'
import { StateManager } from './zap/StateManager.js'
import { randInt, thingsAreColliding } from './zap/zap.js'

// 1. Create an entity type
const asteroid = () => ({
    ...createEntity({ name: 'asteroid', width: 64, height: 64, score: 100 }),
    spawn({ x, y }) {
        this.x = x ?? randInt(800)
        this.y = y ?? -100
        this.vy = 2
    },
    update() {
        this.tick()
        this.y += this.vy
    },
    draw() {
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
})

// 2. Set up director
const director = createDirector()
director.register(asteroid)

// 3. Spawn some entities
for (let i = 0; i < 10; i++) {
    director.spawn('asteroid')
}

// 4. Game loop
function gameLoop() {
    director.updateAll()
    director.drawAll()
    requestAnimationFrame(gameLoop)
}
```

---

## API Reference

### zap.js — Utility Functions

#### Math

| Function | Description |
|----------|-------------|
| `lerp(a, b, t)` | Linear interpolation between a and b |
| `clamp(value, min, max)` | Constrain value to range |

#### Geometry & Vectors

| Function | Description |
|----------|-------------|
| `distanceBetweenPoints(x1, y1, x2, y2)` | Distance between two points |
| `angleOfLineInRads(x1, y1, x2, y2)` | Angle in radians |
| `angleOfLineInDegs(x1, y1, x2, y2)` | Angle in degrees |
| `normalize(x, y)` | Unit vector `{ x, y }` |
| `vectorFromAngle(angleRads, length)` | Velocity from angle `{ x, y }` |
| `wrapAngle(angle)` | Wrap angle to 0–2π |
| `rotationDirection(current, target)` | Which way to turn: -1, 0, or 1 |
| `moveDistanceAlongLine(dx, x1, y1, x2, y2)` | Velocity to move distance along line `{ vx, vy }` |

#### Collision Detection

| Function | Description |
|----------|-------------|
| `collisionBetweenCircles(x1, y1, r1, x2, y2, r2)` | Circle vs circle |
| `rectsCollide(x1, y1, w1, h1, x2, y2, w2, h2)` | Rectangle vs rectangle (AABB) |
| `rectCircleCollide(rx, ry, rw, rh, cx, cy, cr)` | Rectangle vs circle |
| `pointInRect(px, py, rx, ry, rw, rh)` | Point inside rectangle |
| `thingsAreColliding(thing1, thing2)` | Two entities colliding (handles arrays) |
| `thingIsOnScreen(thing, screen)` | Is entity visible on screen |
| `getColliderArea(thing)` | Total area of entity's colliders |

#### Random

| Function | Description |
|----------|-------------|
| `randInt(n)` | Random integer 0 to n-1 |
| `randRange(min, max)` | Random integer in range (inclusive) |
| `randFloat(min, max)` | Random float in range |
| `pick(array)` | Random item from array |
| `shuffle(array)` | Shuffled copy of array |

#### Animation & Easing

| Function | Description |
|----------|-------------|
| `getFrame(ticks, frameCount, speed)` | Current animation frame index |
| `picker(images, props)` | Frame picker object with `first()`, `last()`, `next()`, `any()`, `bounce()` |
| `easeInQuad(t)` | Ease in (slow start) |
| `easeOutQuad(t)` | Ease out (slow end) |
| `easeInOutQuad(t)` | Ease in and out |

#### Audio Helpers

| Function | Description |
|----------|-------------|
| `stereoFromScreenX(screen, x)` | Stereo pan value (-1 to 1) from x position |
| `volumeFromY(screen, n, y)` | Volume based on y position |
| `volumeFromX(screen, n, x)` | Volume based on x distance from center |

#### Game Objects

| Function | Description |
|----------|-------------|
| `makeN(factory, n)` | Create n instances from factory |
| `findClosestThing(thing, things)` | Find nearest entity |
| `debugThing(ctx, thing, text)` | Draw debug text next to entity |

---

### Entity.js — Entity Factory

#### Functions

| Function | Description |
|----------|-------------|
| `createEntity(config)` | Create base entity with common behaviours |
| `loadImages(paths)` | Load images with caching → `{ images, loaded() }` |
| `loadSound(src, volume)` | Load sound with caching → `Howl` |
| `drawRotated(ctx, entity, image)` | Draw sprite with rotation |
| `getFrame(ticks, frameCount, speed)` | Re-exported from zap.js |

#### Mixins

| Mixin | Properties/Methods |
|-------|-------------------|
| `tickMixin` | `ticks`, `tick()` |
| `boundsMixin` | `outOfBoundsB()`, `outOfBoundsL()`, `outOfBoundsR()`, `outOfBoundsV()` |
| `colliderMixin` | `syncCollider()` |
| `wrapMixin` | `wrapScreen()` |

#### createEntity Config

```javascript
createEntity({
    name: 'asteroid',           // Entity type name (required for Director)
    width: 64,                  // Width in pixels
    height: 64,                 // Height in pixels
    score: 100,                 // Points when killed
    collider: { ... },          // Collider definition
    drawLayer: 2,               // Draw order (lower = behind)
    collisionGroups: ['shootable', 'deadly'],
    isPrimaryEnemy: true        // For wave completion tracking
})
```

---

### Director.js — Entity Management

#### Function

| Function | Description |
|----------|-------------|
| `createDirector()` | Create new director instance |

#### Director Methods

| Method | Description |
|--------|-------------|
| `register(factory)` | Register entity type(s) |
| `spawn(type, props)` | Create entity instance |
| `get(type)` | Get all entities of type |
| `byGroup(group)` | Get all entities in collision group |
| `count(type)` | Count living entities of type |
| `countByGroups(...groups)` | Count entities in collision groups |
| `allDead(...types)` | Check if types are empty |
| `allPrimaryEnemiesDead()` | Check if wave complete |
| `getPrimaryEnemyTypes()` | List primary enemy type names |
| `updateAll(dt)` | Update all entities (prunes dead first) |
| `drawAll()` | Draw all entities in layer order |
| `updateType(type, dt)` | Update one entity type |
| `drawType(type)` | Draw one entity type |
| `drawLayer(layer)` | Draw one layer |
| `prune()` | Remove dead entities |
| `clear()` | Remove all entities |
| `clearType(type)` | Remove all of one type |
| `setRefs(refs)` | Set shared references |
| `allByLayer()` | Get entities sorted by layer |
| `allForMinimap()` | Get all living entities |
| `sync(type, array)` | Sync external array |
| `add(type, entity)` | Add entity manually |

#### Director Properties

| Property | Description |
|----------|-------------|
| `refs` | Shared references object |
| `entities` | Entity storage by type |
| `meta` | Metadata by type |
| `factories` | Factory functions by type |
| `onBeforePrune` | Callback before pruning dead entities |

---

### StateManager.js — State Machine

#### Class: StateManager

```javascript
const stateManager = new StateManager(game)
```

| Method | Description |
|--------|-------------|
| `register(name, state)` | Register a state |
| `transition(name, data)` | Switch to state, passing data |
| `update(dt)` | Update current state |
| `draw()` | Draw current state |
| `getCurrentStateName()` | Get current state name |

States should implement: `enter(data)`, `update(dt)`, `draw()`, `exit()`

---

### HighScoreManager.js — Score Persistence

#### Class: HighScoreManager

```javascript
const scores = new HighScoreManager()
```

| Method | Description |
|--------|-------------|
| `getHighScore()` | Get current high score |
| `saveHighScore(score)` | Save new high score |
| `checkAndUpdateHighScore(score)` | Update if new record, returns `true`/`false` |
| `loadHighScore()` | Load from localStorage |

---

## Dependencies

- **zap.js** — None
- **Entity.js** — Requires [Howler.js](https://howlerjs.com/) for `loadSound()` (optional)
- **Director.js** — None
- **StateManager.js** — None
- **HighScoreManager.js** — Requires `localStorage`

## Want to Understand More?

Check out the SpaceAwesome docs:

- [Entity System](../../docs/entity-system.md) — How entities work
- [Director](../../docs/director.md) — How the director manages entities
- [State Machine](../../docs/state-machine.md) — How game states work  
- [zap.js Reference](../../docs/zap.md) — All the utility functions

---

## License

**MIT License**

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

**Help yourself and fill your boots!** 🎮
