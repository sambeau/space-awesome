# Director

Manages all entities in one place — spawning, updating, drawing, and collision detection.

---

## Quick Start

```javascript
import { createDirector } from './zap/Director.js'

// 1. Create a director

	const director = createDirector()

// 2. Register entity types

	director.register([ asteroid, galaxian, bomb, bullet ])

// 3. Share references (ship, etc.) with all entities

	director.setRefs({ ship, director })

// 4. Spawn entities

	director.spawn('asteroid', { x: 100, y: 50 })
	director.spawn('galaxian')

// 5. In your game loop

	director.updateAll(dt)
	director.drawAll()
```

---

## Registering Entities

Each entity factory must return an object with `name` (and optionally `drawLayer`, `collisionGroups`, `isPrimaryEnemy`):

```javascript
const asteroid = () => ({
    ...createEntity({
        name: 'asteroid',
        drawLayer: LAYER.BADDIES,
        collisionGroups: [COLLISION.SHOOTABLE, COLLISION.DEADLY],
        isPrimaryEnemy: true
    }),
    // ...
})

director.register(asteroid)
// or register many at once
director.register([asteroid, galaxian, bomb])
```

---

## Spawning

```javascript
// Basic spawn
director.spawn('asteroid')

// With properties (merged via entity's spawn() method)
director.spawn('asteroid', { x: 100, y: 200, size: 3 })
```

Shared refs (set via `setRefs()`) are auto-injected into every spawn.

---

## Shared References

Pass objects that many entities need:

```javascript
director.setRefs({ ship, director, floaters })

// Now every spawned entity receives { ship, director, floaters, ...props }
```

---

## Querying Entities

```javascript
// Get all asteroids
director.get('asteroid')

// Count living bombs
director.count('bomb')

// Get all entities in a collision group
director.byGroup(COLLISION.SHOOTABLE)

// Check if type is empty
director.allDead('asteroid', 'galaxian')

// Check if wave is complete
director.allPrimaryEnemiesDead()
```

---

## Update & Draw

**Simple (recommended):**

```javascript
update(dt) {
    director.updateAll(dt)  // prunes dead, updates in group order
}

draw() {
    director.drawAll()      // draws in layer order
}
```

**Selective:**

```javascript
director.updateType('bomb', dt)  // update one type
director.drawType('bomb')        // draw one type
director.drawLayer(LAYER.HUD)    // draw one layer
```

---

## Layers & Groups

Define your constants separately:

```javascript
// constants.js
export const LAYER = { STARS: 0, BADDIES: 10, SHIP: 20, HUD: 100 }
export const COLLISION = { SHOOTABLE: 'shootable', DEADLY: 'deadly' }
```

Entities declare their layer and groups:

```javascript
createEntity({
    name: 'galaxian',
    drawLayer: LAYER.BADDIES,
    collisionGroups: [COLLISION.SHOOTABLE, COLLISION.DEADLY],
    isPrimaryEnemy: true
})
```

---

## Primary Enemies

Mark wave-ending enemies with `isPrimaryEnemy: true`:

```javascript
// Check if wave is complete
if (director.allPrimaryEnemiesDead()) {
    nextWave()
}

// Get all primary enemy types
director.getPrimaryEnemyTypes()  // ['asteroid', 'galaxian', ...]
```

---

## Lifecycle Hooks

**Before prune callback:**

```javascript
// Count entities before they're removed (e.g., saved spacemen)
director.onBeforePrune = (dir) => {
    for (const spaceman of dir.get('spaceman')) {
        if (spaceman.dead && spaceman.saved) savedCount++
    }
}
```

---

## Cleanup

```javascript
director.clearType('bomb')  // remove all bombs
director.clear()            // remove everything
```

---

## Full Example

```javascript
import { createDirector } from './zap/Director.js'
import { LAYER, COLLISION } from './entities/constants.js'
import { asteroid } from './entities/asteroids.js'
import { ship } from './entities/ship.js'

// Setup
const director = createDirector()
director.register([asteroid, ship])

const playerShip = director.spawn('ship', { x: 400, y: 500 })
director.setRefs({ ship: playerShip, director })

// Spawn wave
for (let i = 0; i < 5; i++) {
    director.spawn('asteroid', { size: 3 })
}

// Game loop
function update(dt) {
    director.updateAll(dt)
    
    // Collision detection
    const bullet = playerShip.bullet
    if (bullet) {
        for (const target of director.byGroup(COLLISION.SHOOTABLE)) {
            if (hit(bullet, target)) {
                target.onHit()
                bullet.dead = true
            }
        }
    }
    
    if (director.allPrimaryEnemiesDead()) {
        nextWave()
    }
}

function draw() {
    director.drawAll()
}
```
