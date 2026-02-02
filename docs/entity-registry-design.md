# Entity Registry Design

## Problem

Adding a new entity type requires editing multiple places in PlayState.js:
- `initializeEntities()` - create and spawn
- `update()` - update call in correct group
- `draw()` - draw call in correct layer
- `collideWeaponsWithAll()` / `crashIntoAll()` / `collect()` - collision lists
- `isWaveComplete()` - if it's a primary enemy

It's easy to forget one, leading to bugs. Copying an existing entity should "just work".

## Solution

A lightweight **registry** that:
1. Stores all entities by type (replacing individual manager arrays)
2. Reads metadata from entities themselves (no duplicate config)
3. Handles spawn, update, draw, and collision queries via metadata

Entities declare their own draw layer, update group, and collision groups. The registry uses this to automate what PlayState currently does manually.

---

## Core Concepts

### Entity Metadata

Each entity defines metadata in `createEntity()`:

```javascript
const galaxian = () => ({
  ...createEntity({
    name: 'galaxian',              // Registry key
    drawLayer: LAYER.BADDIES,      // When to draw
    updateGroup: UPDATE.BADDIES,   // When to update (optional)
    collisionGroups: ['shootable', 'deadly'],  // What it collides with
    // ... existing: width, height, score, collider
  }),
  // ... entity-specific code
})
```

### Layers and Groups (Enums)

Ordered numeric constants:

```javascript
// Draw order (lower = drawn first = behind)
const LAYER = {
  BACKGROUND: 0,   // stars
  DETRITUS: 1,     // mushrooms
  BADDIES: 2,      // enemies, spacemen
  POWERUPS: 3,
  SHIP: 4,
  PARTICLES: 5,
  FLOATERS: 6,
  UI: 7            // hud
}

// Update order (if needed - may not be)
const UPDATE = {
  POWERUPS: 0,
  STARS: 1,
  BADDIES: 2,
  SHIP: 3,
  PARTICLES: 4,
  UI: 5
}

// Collision groups (not ordered)
const COLLISION = {
  SHOOTABLE: 'shootable',   // ship weapons can hit
  DEADLY: 'deadly',         // kills ship on contact
  COLLECTABLE: 'collectable' // ship can collect (powerups, spacemen)
}
```

### Registry

```javascript
const createRegistry = () => ({
  refs: {},           // Shared: { ship, floaters }
  entities: {},       // By type: { galaxian: [], bomb: [], ... }
  meta: {},           // Metadata: { galaxian: { drawLayer, collisionGroups }, ... }
  factories: {},      // Factories: { galaxian: galaxian, ... }

  // Register one or more entity types
  register(factoryOrArray) { ... },

  // Spawn an entity, auto-injecting refs + merging props
  spawn(type, props = {}) { ... },  // props: { x, y, vx, vy, ... }

  // Get array by type
  get(type) { ... },

  // Get all entities in a collision group
  byGroup(group) { ... },

  // Update all entities (filters dead, respects update order)
  updateAll(dt) { ... },

  // Draw all entities at a specific layer
  drawLayer(layer) { ... },

  // Draw all layers in order
  drawAll() { ... }
})
```

---

## How It Works

### Registration (startup)

```javascript
// PlayState.initializeEntities()
const reg = createRegistry()

// Set shared refs (things many entities need)
reg.refs = { ship: Spaceship(), floaters: Floaters() }

// Register all entity types - metadata read from probe instance
reg.register([
  galaxian, swarmer, pod, bomb, asteroid, mine,
  defender, mother, bomber, fireBomber, mushroom,
  spaceman, powerup, snake, bullet, shot
])

// Initial spawn (with optional positioning props)
for (let i = 0; i < 4; i++) reg.spawn('galaxian', { x: i * 100 })
for (let i = 0; i < 2; i++) reg.spawn('pod', { x: canvas.width / 2, y: -200 * i })

// Future: wave data could drive spawning
waveData.enemies.forEach(e => reg.spawn(e.type, e.position))
```

### Spawning (runtime)

```javascript
// Pod spawning swarmers on death
onHit() {
  for (const offset of [5, 0, -5, 10, 0, -10]) {
    this.registry.spawn('swarmer', { x: this.x + offset, y: this.y + offset })
  }
}
```

The registry:
1. Calls factory: `swarmer()`
2. Calls `entity.spawn({ ...refs, registry, ...props })`
3. Adds to `entities.swarmer[]`

### Update Loop

```javascript
// PlayState.update()
reg.updateAll(dt)  // Filters dead, updates by group order
```

### Draw Loop

```javascript
// PlayState.draw()
drawBackground(ctx, canvas)
reg.drawAll()  // Draws each layer in order
```

### Collisions

```javascript
// PlayState.update() - collision section
ship.collideWeaponsWith(reg.byGroup('shootable'))
ship.crashInto(reg.byGroup('deadly'))
ship.collect(reg.byGroup('collectable'))
```

---

## Edge Cases

### 1. Bombs owned by multiple entity types

**Current:** Each manager has its own bombs array (`swarmers.bombs`, `defenders.bombs`, etc.)

**With registry:** All bombs go in `reg.entities.bomb`. Each bomb has `bomber` ref to know its owner. Ship crashes into `reg.get('bomb')` - no need to merge arrays.

### 2. Spacemen.saved counter

**Current:** `Spacemen()` manager has `saved` property.

**Options:**
- A) Store on registry: `reg.state.spacemenSaved = 0`
- B) Keep thin manager for types with extra state

**Recommendation:** Option A. Only a few types need extra state.

### 3. Snakes (segments + parent)

**Current:** `Snakes()` manager with `snakes[]` where each snake has `segments[]`. The `all()` helper flattens for collision.

**With registry:** Register `snake` (the parent/controller). Snake manages its own segments internally. For collision:
```javascript
// In registry or as helper
byGroup('deadly')  // Returns snakes
// Snake.collider could be array of segment colliders
// Or: snake.all() returns segments for collision
```

**Recommendation:** Keep snake's internal segment management. Registry holds snake controllers. Collision uses snake's composite collider or `all()` method.

### 4. Galaxians.shots vs defenders.bombs

**Current:** Different managers for enemy projectiles.

**With registry:** Could unify as `shot` type, or keep separate (`galaxianShot`, `defenderBomb`). Separate is clearer for different behaviors.

### 5. Ship sub-entities (shield, smartBomb, flames)

**Current:** Created inside ship, not in any manager.

**With registry:** Leave as-is. These are truly sub-entities owned by ship, not independent. Ship handles their lifecycle.

### 6. Flock behavior (swarmers need to see other swarmers)

**Current:** `this.swarmers.swarmers` to iterate siblings.

**With registry:** `this.registry.get('swarmer')` - cleaner.

### 7. isWaveComplete()

**Current:** Manual check of specific arrays in PlayState.

**With registry:** Registry provides helper methods, PlayState retains full control:
```javascript
// Registry helpers
reg.allDead('galaxian', 'pod', 'swarmer')  // true if all these types empty
reg.countByGroup('shootable')              // count all shootable entities
reg.allPrimaryEnemiesDead()                // uses isPrimaryEnemy metadata

// PlayState.isWaveComplete() - custom logic per wave
isWaveComplete() {
  // Simple: just check primary enemies
  return this.reg.allPrimaryEnemiesDead()
  
  // Or complex: custom conditions
  // return this.reg.allDead('galaxian', 'pod') 
  //   && this.spacemenSaved >= 3
  //   && this.bossDefeated
}
```

**Key point:** `isWaveComplete()` stays on PlayState with full control. Registry just provides data helpers. Future wave configs could include custom completion functions.

### 8. HUD and minimap

**Current:** HUD receives list of entity managers for display.

**With registry:** HUD receives registry, queries what it needs:
```javascript
hud.init(reg)
// HUD internally: reg.get('spaceman'), reg.get('galaxian'), etc.
```

### 9. Particles (high-volume, no collision)

**Current:** Lightweight particle system, not entity-like.

**Recommendation:** Leave particles outside registry. They're fire-and-forget visuals with different lifecycle (no `dead` flag, just `lifespan`).

### 10. Stars (shared across states)

**Current:** `game.stars` shared via game object.

**Recommendation:** Keep as-is. Stars persist across state transitions, registry is per-PlayState.

---

## Implementation Plan

### Phase 0: Foundation

#### 0.0 Test Infrastructure Setup
Automated tests run after each sub-phase to verify correctness before proceeding.

- [ ] Add Vitest to package.json: `npm install -D vitest`
- [ ] Add test script to package.json: `"test": "vitest run", "test:watch": "vitest"`
- [ ] Create `tests/` directory
- [ ] Create `tests/setup.js` with minimal mocks:
  ```javascript
  // Mock browser globals for Node environment
  global.canvas = { width: 800, height: 600 }
  global.screen = { width: 800, height: 600 }
  global.Image = class { onload = null; src = '' }
  global.Howl = class { play() {} stop() {} volume() {} stereo() {} }
  ```
- [ ] Create `vitest.config.js`:
  ```javascript
  export default {
    test: { setupFiles: ['./tests/setup.js'] }
  }
  ```
- [ ] Verify: `npm test` runs without error

---

#### 0.1 Complete Entity System Conversion

Before implementing the registry, ensure all game entities use the Entity system consistently.

**Already Converted (15 files):**
asteroids, bombers, bombJacks, bombs, defenders, fireBombers, floaters, galaxians, mines, mothers, mushrooms, pods, powerups, swarmers, spacemen

**To Convert:**

#### 0.2 bullet.js (player projectile)
- [ ] Add imports: `createEntity`, `loadImages` from Entity.js
- [ ] Replace manual image loading with `loadImages(['images/bullet-long.png'])`
- [ ] Use `...createEntity({ name: 'bullet', width: 6, height: 70, collider: {...} })`
- [ ] Add `this.tick()` and `this.syncCollider()` to update()
- [ ] **Automated test:** `tests/entities/bullet.test.js`
  ```javascript
  test('bullet has required entity properties', () => {
    const b = bullet()
    expect(b.name).toBe('bullet')
    expect(b.width).toBe(6)
    expect(b.height).toBe(70)
    expect(b.collider).toBeDefined()
    expect(typeof b.syncCollider).toBe('function')
  })
  ```
- [ ] **Verify:** `npm test` passes
- [ ] **Manual test:** Ship fires, bullets travel, bullets hit enemies

#### 0.3 shot.js (enemy projectile)
- [ ] Add imports: `createEntity`, `loadImages` from Entity.js
- [ ] Replace manual image loading with `loadImages(['images/shot.png'])`
- [ ] Use `...createEntity({ name: 'shot', width: 6, height: 35, collider: {...} })`
- [ ] Add `this.tick()` and `this.syncCollider()` to update()
- [ ] **Automated test:** `tests/entities/shot.test.js`
  ```javascript
  test('shot has required entity properties', () => {
    const s = shot()
    expect(s.name).toBe('shot')
    expect(s.collider).toBeDefined()
    expect(typeof s.syncCollider).toBe('function')
  })
  ```
- [ ] **Verify:** `npm test` passes
- [ ] **Manual test:** Galaxians fire, shots travel, shots hit ship

#### 0.4 snakes.js - Segment()
- [ ] Add imports: `createEntity`, `loadSound` from Entity.js
- [ ] Replace raw `new Howl()` with `loadSound()`
- [ ] Use `...createEntity({ name: 'snake', width: 16, height: 16, score: 50, collider: {...} })`
- [ ] Add `this.syncCollider()` to Segment update()
- [ ] Keep Snake() as controller (manages segment array, not a full entity)
- [ ] **Automated test:** `tests/entities/snakes.test.js`
  ```javascript
  test('Segment has required entity properties', () => {
    const seg = Segment()
    expect(seg.name).toBe('snake')
    expect(seg.score).toBe(50)
    expect(typeof seg.syncCollider).toBe('function')
  })
  ```
- [ ] **Verify:** `npm test` passes
- [ ] **Manual test:** Snakes spawn, move, eat spacemen, can be shot segment-by-segment

#### 0.5 Ship sub-entities (optional, lower priority)
- [ ] shield(): Consider `...createEntity()` for `syncCollider()` mixin
- [ ] smartBomb(): Consider `...createEntity()` for `syncCollider()` mixin  
- [ ] flames(): Leave as-is (visual effect only, no collision)

**Leave As-Is (different patterns):**
- particles.js - High-volume, lifespan-based, no `dead` flag
- stars.js - Simple background, no assets, persists across states
- hud.js - UI component, not a game entity
- logo.js - UI component, not a game entity

---

### Phase 1: Registry Foundation

Create the registry infrastructure without changing existing code behavior.

#### 1.1 Constants
- [ ] Create `LAYER` enum in Entity.js:
  ```javascript
  export const LAYER = {
    BACKGROUND: 0, DETRITUS: 1, BADDIES: 2, POWERUPS: 3,
    SHIP: 4, PARTICLES: 5, FLOATERS: 6, UI: 7
  }
  ```
- [ ] Create `UPDATE` enum (if needed for ordering)
- [ ] Create `COLLISION` group constants:
  ```javascript
  export const COLLISION = {
    SHOOTABLE: 'shootable',
    DEADLY: 'deadly', 
    COLLECTABLE: 'collectable'
  }
  ```

#### 1.2 Extend createEntity()
- [ ] Add optional params: `drawLayer`, `updateGroup`, `collisionGroups`, `isPrimaryEnemy`
- [ ] Store on entity for probe pattern to read
- [ ] Existing entities unchanged (params optional)

#### 1.3 Create createRegistry()
- [ ] Implement in Entity.js or new Registry.js:
  - `refs: {}` - shared dependencies
  - `entities: {}` - arrays by type
  - `meta: {}` - metadata by type
  - `factories: {}` - factory functions
  - `state: {}` - extra state (spacemenSaved, etc.)
- [ ] Implement `register(factoryOrArray)` with probe pattern
- [ ] Implement `spawn(type, props)` with ref injection
- [ ] Implement `get(type)` 
- [ ] Implement `byGroup(group)`
- [ ] Implement `allDead(...types)`
- [ ] **Automated tests:** `tests/registry.test.js` (CRITICAL - run after each function)
  ```javascript
  describe('createRegistry', () => {
    test('register() stores factory and creates empty array', () => {
      const reg = createRegistry()
      const mockFactory = () => ({ name: 'test', drawLayer: 1 })
      reg.register(mockFactory)
      expect(reg.factories.test).toBe(mockFactory)
      expect(reg.entities.test).toEqual([])
    })

    test('register() reads metadata via probe pattern', () => {
      const reg = createRegistry()
      const mockFactory = () => ({ 
        name: 'enemy', 
        drawLayer: 2, 
        collisionGroups: ['shootable', 'deadly'],
        isPrimaryEnemy: true 
      })
      reg.register(mockFactory)
      expect(reg.meta.enemy.drawLayer).toBe(2)
      expect(reg.meta.enemy.collisionGroups).toContain('shootable')
    })

    test('register() handles array of factories', () => {
      const reg = createRegistry()
      reg.register([() => ({ name: 'a' }), () => ({ name: 'b' })])
      expect(reg.factories.a).toBeDefined()
      expect(reg.factories.b).toBeDefined()
    })

    test('spawn() creates entity and adds to array', () => {
      const reg = createRegistry()
      let spawnCalled = false
      reg.register(() => ({ name: 'test', spawn: () => { spawnCalled = true } }))
      reg.spawn('test')
      expect(reg.entities.test.length).toBe(1)
      expect(spawnCalled).toBe(true)
    })

    test('spawn() injects refs and registry into props', () => {
      const reg = createRegistry()
      let receivedProps = null
      reg.register(() => ({ name: 'test', spawn: (p) => { receivedProps = p } }))
      reg.refs = { ship: { x: 100 } }
      reg.spawn('test', { custom: 'value' })
      expect(receivedProps.ship.x).toBe(100)
      expect(receivedProps.registry).toBe(reg)
      expect(receivedProps.custom).toBe('value')
    })

    test('get() returns entity array by type', () => {
      const reg = createRegistry()
      reg.register(() => ({ name: 'test', spawn: () => {} }))
      reg.spawn('test')
      reg.spawn('test')
      expect(reg.get('test').length).toBe(2)
    })

    test('byGroup() returns entities matching collision group', () => {
      const reg = createRegistry()
      reg.register(() => ({ name: 'enemy', collisionGroups: ['shootable'], spawn: () => {} }))
      reg.register(() => ({ name: 'item', collisionGroups: ['collectable'], spawn: () => {} }))
      reg.spawn('enemy')
      reg.spawn('item')
      expect(reg.byGroup('shootable').length).toBe(1)
      expect(reg.byGroup('collectable').length).toBe(1)
    })

    test('allDead() returns true when specified types empty', () => {
      const reg = createRegistry()
      reg.register(() => ({ name: 'a', spawn: () => {} }))
      reg.register(() => ({ name: 'b', spawn: () => {} }))
      expect(reg.allDead('a', 'b')).toBe(true)
    })

    test('allDead() returns false when any type has entities', () => {
      const reg = createRegistry()
      reg.register(() => ({ name: 'a', spawn: () => {} }))
      reg.spawn('a')
      expect(reg.allDead('a')).toBe(false)
    })

    test('updateAll() filters dead entities', () => {
      const reg = createRegistry()
      reg.register(() => ({ name: 'test', dead: false, spawn: () => {}, update: () => {} }))
      reg.spawn('test')
      reg.spawn('test')
      reg.entities.test[0].dead = true
      reg.updateAll(16)
      expect(reg.entities.test.length).toBe(1)
    })

    test('updateAll() calls update on all entities', () => {
      const reg = createRegistry()
      let count = 0
      reg.register(() => ({ name: 'test', spawn: () => {}, update: () => { count++ } }))
      reg.spawn('test')
      reg.spawn('test')
      reg.updateAll(16)
      expect(count).toBe(2)
    })
  })
  ```
- [ ] **Verify:** `npm test` passes all registry tests

---

### Phase 2: Add Entity Metadata

Add metadata to each entity's `createEntity()` call. No behavior change yet.

**Testing approach:** After each entity update, add/extend `tests/entities/metadata.test.js` to verify metadata is correct.

```javascript
// tests/entities/metadata.test.js - grows with each entity
import { LAYER, COLLISION } from '../game/entities/Entity.js'

describe('Entity metadata', () => {
  // Add test for each entity as it's updated
})
```

#### 2.1 Baddies (LAYER.BADDIES, shootable + deadly)
- [ ] asteroids.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: false`
- [ ] galaxians.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] defenders.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] mothers.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] bombers.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] fireBombers.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] pods.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] swarmers.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] mines.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: false`
- [ ] snakes.js (Segment): `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'deadly'], isPrimaryEnemy: true`
- [ ] **Automated tests for baddies:**
  ```javascript
  test.each([
    ['galaxian', LAYER.BADDIES, ['shootable', 'deadly'], true],
    ['defender', LAYER.BADDIES, ['shootable', 'deadly'], true],
    ['swarmer', LAYER.BADDIES, ['shootable', 'deadly'], true],
    ['pod', LAYER.BADDIES, ['shootable', 'deadly'], true],
    ['asteroid', LAYER.BADDIES, ['shootable', 'deadly'], false],
    // ... add all baddies
  ])('%s has correct metadata', (name, layer, groups, isPrimary) => {
    const factory = factories[name]  // import all factories
    const entity = factory()
    expect(entity.drawLayer).toBe(layer)
    expect(entity.collisionGroups).toEqual(expect.arrayContaining(groups))
    expect(entity.isPrimaryEnemy).toBe(isPrimary)
  })
  ```
- [ ] **Verify:** `npm test` passes

#### 2.2 Projectiles (deadly only)
- [ ] bombs.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['deadly']`
- [ ] shot.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['deadly']`
- [ ] bullet.js: `drawLayer: LAYER.SHIP, collisionGroups: []` (ship's weapon, not deadly to ship)
- [ ] **Automated tests for projectiles:**
  ```javascript
  test('bomb is deadly but not shootable', () => {
    const b = bomb()
    expect(b.collisionGroups).toContain('deadly')
    expect(b.collisionGroups).not.toContain('shootable')
  })
  test('bullet has no collision groups (ship weapon)', () => {
    const b = bullet()
    expect(b.collisionGroups || []).toEqual([])
  })
  ```
- [ ] **Verify:** `npm test` passes

#### 2.3 Collectables
- [ ] spacemen.js: `drawLayer: LAYER.BADDIES, collisionGroups: ['shootable', 'collectable']`
- [ ] powerups.js: `drawLayer: LAYER.POWERUPS, collisionGroups: ['collectable']`
- [ ] **Automated tests for collectables:**
  ```javascript
  test('spaceman is collectable and shootable', () => {
    const s = spaceman()
    expect(s.collisionGroups).toContain('collectable')
    expect(s.collisionGroups).toContain('shootable')
  })
  test('powerup is collectable only', () => {
    const p = powerup()
    expect(p.collisionGroups).toContain('collectable')
    expect(p.collisionGroups).not.toContain('shootable')
  })
  ```
- [ ] **Verify:** `npm test` passes

#### 2.4 Other
- [ ] mushrooms.js: `drawLayer: LAYER.DETRITUS, collisionGroups: ['shootable', 'deadly']`
- [ ] floaters.js: `drawLayer: LAYER.FLOATERS, collisionGroups: []`
- [ ] ship.js: `drawLayer: LAYER.SHIP, collisionGroups: []`
- [ ] bombJacks.js: Check usage, assign appropriate layer/groups

---

### Phase 3: Registry Integration (Incremental)

Integrate registry alongside existing managers, test each step.

#### 3.1 Setup registry in PlayState
- [ ] Import `createRegistry` 
- [ ] Create `this.reg = createRegistry()` in constructor or enter()
- [ ] Set `this.reg.refs = { ship: this.ship, floaters: this.floaters }`

#### 3.2 Register all factories
- [ ] Import entity factories (not managers)
- [ ] Call `this.reg.register([galaxian, swarmer, pod, ...])`
- [ ] **Automated test:** `tests/integration/registration.test.js`
  ```javascript
  test('all entity factories register without error', () => {
    const reg = createRegistry()
    expect(() => reg.register([
      galaxian, swarmer, pod, bomb, asteroid, mine,
      defender, mother, bomber, fireBomber, mushroom,
      spaceman, powerup, bullet, shot
    ])).not.toThrow()
  })
  
  test('all registered entities have required metadata', () => {
    const reg = createRegistry()
    reg.register([galaxian, swarmer, pod /* ... */])
    for (const [name, meta] of Object.entries(reg.meta)) {
      expect(meta.drawLayer).toBeDefined()
      expect(Array.isArray(meta.collisionGroups)).toBe(true)
    }
  })
  ```
- [ ] **Verify:** `npm test` passes

#### 3.3 Migrate spawning (one type at a time)
Start with a simple one (e.g., asteroid), verify, then continue:
- [ ] asteroids: Replace `this.asteroids.spawnSingle()` with `this.reg.spawn('asteroid')`
- [ ] Update asteroid `spawn()` to use `this.registry` from props
- [ ] **Automated test:**
  ```javascript
  test('asteroid spawn receives registry in props', () => {
    const reg = createRegistry()
    let receivedRegistry = null
    // Mock asteroid to capture props
    const mockAsteroid = () => ({
      ...createEntity({ name: 'asteroid' }),
      spawn: (props) => { receivedRegistry = props.registry }
    })
    reg.register(mockAsteroid)
    reg.spawn('asteroid')
    expect(receivedRegistry).toBe(reg)
  })
  ```
- [ ] **Verify:** `npm test` passes
- [ ] **Manual test:** Asteroid appears and behaves correctly
- [ ] Repeat pattern for: galaxians, defenders, mothers, bombers, fireBombers, pods, swarmers, mines, spacemen, powerups, mushrooms, snakes

#### 3.4 Migrate runtime spawning
- [ ] Pod.onHit(): `this.registry.spawn('swarmer', {...})` instead of `this.swarmers.spawnSingle()`
- [ ] Enemies firing: `this.registry.spawn('bomb', {...})` instead of `this.manager.bombs.push()`
- [ ] Ship firing: `this.registry.spawn('bullet', {...})`
- [ ] **Automated test:**
  ```javascript
  test('pod onHit spawns swarmers via registry', () => {
    const reg = createRegistry()
    reg.refs = { ship: { x: 0, y: 0 } }
    reg.register(swarmer)
    reg.register(pod)
    const p = reg.spawn('pod', { x: 100, y: 100 })
    p.registry = reg
    p.onHit()  // Should spawn swarmers
    expect(reg.get('swarmer').length).toBeGreaterThan(0)
  })
  ```
- [ ] **Verify:** `npm test` passes
- [ ] **Manual test:** All spawn scenarios work in-game

#### 3.5 Update sibling access
- [ ] Swarmers flock(): `this.registry.get('swarmer')` instead of `this.swarmers.swarmers`
- [ ] Any other cross-entity lookups

---

### Phase 4: Update/Draw Consolidation

Replace manual loops with registry methods.

#### 4.1 Implement registry update/draw
- [x] `updateAll(dt)`: Filter dead, iterate by updateGroup order
- [x] `drawLayer(layer)`: Draw all entities at specified layer
- [x] `drawAll()`: Iterate layers in order, call drawLayer()
- [x] **Automated tests:** Added to registry.test.js
- [x] **Verify:** Tests pass

#### 4.2 Replace PlayState.update() entity loops
- [ ] Comment out old manual update calls
- [ ] Add `this.reg.updateAll(dt)`
- [ ] Keep special cases (particles, stars, hud) outside registry
- [ ] Test all entities still update correctly
- **Deferred:** Entity managers still own update logic (spawning, AI, etc.)
  Would require moving all manager code to entity self-update methods.

#### 4.3 Replace PlayState.draw() entity loops  
- [ ] Comment out old manual draw calls
- [ ] Add `this.reg.drawAll()`
- [ ] Keep special cases outside registry
- [ ] Test draw order matches original
- **Deferred:** Same as 4.2 - managers own draw logic alongside entities.

---

### Phase 5: Collision Consolidation

#### 5.1 Implement collision helpers
- [x] `byGroup(group)`: Return flat array of all entities in group (implemented in Phase 3)
- [x] **Automated tests:** byGroup tests added to registry.test.js
- [x] **Verify:** Tests pass

#### 5.2 Replace collision arrays
- [x] `ship.collideWeaponsWithAll([this.registry.byGroup(COLLISION.SHOOTABLE)])`
- [x] `ship.crashIntoAll([this.registry.byGroup(COLLISION.DEADLY), ...projectileArrays])`
- [x] `ship.collect(this.registry.byGroup(COLLISION.COLLECTABLE))`
- [x] Test all collision scenarios still work
- **Note:** Enemy projectiles (shots, bombs) remain in manager arrays since they're short-lived
  and spawned by enemy managers. Registry tracks enemy entities; managers track projectiles.

---

### Phase 6: Cleanup

#### 6.1 Update dependent systems
- [x] HUD: Pass registry, update to use `reg.get()` (registry passed via init, optional)
- [x] Minimap: Update entity access (uses registry.allForMinimap() when available)
- [x] isWaveComplete(): Use `reg.allPrimaryEnemiesDead()` or custom logic
- [ ] Add `reg.state.spacemenSaved` for spacemen counter (deferred - spacemen manager still owns state)

#### 6.2 Remove obsolete code
- [ ] Remove manager wrapper functions where empty (just factory + array)
- [ ] Keep managers that have extra behavior/state
- [ ] Update imports across files
- **Note:** Managers kept because they have spawning logic, state, and projectile management.
  The registry coexists with managers via sync() rather than replacing them.

#### 6.3 Final testing
- [ ] Full playthrough: title → play → death → respawn → wave complete → game over
- [ ] Test each enemy type spawns, moves, dies, scores
- [ ] Test all collision types
- [ ] Test all projectiles (bullets, bombs, shots)
- [ ] Test powerups and spacemen collection
- [ ] Test HUD displays correctly
- [ ] Test wave transitions

---

### Phase 7: Documentation & Polish

- [ ] Update this design doc with any changes discovered during implementation
- [ ] Add JSDoc comments to registry functions
- [ ] Document any gotchas or edge cases found
- [ ] Consider: Should registry be in Entity.js or separate Registry.js?

---

## Testing Strategy

### Integrated Testing Approach

Automated tests are **part of each implementation phase**, not a separate step. This enables:
- AI verification during implementation (run `npm test` after each change)
- Immediate regression detection
- Confidence to proceed to next step

**Pattern for each sub-phase:**
1. Implement the change
2. Write/run automated test
3. `npm test` must pass before proceeding
4. Manual testing for visual/gameplay verification

### Test File Structure

```
tests/
  setup.js              # Browser globals mock
  registry.test.js      # Core registry logic (Phase 1)
  entities/
    bullet.test.js      # Phase 0
    shot.test.js        # Phase 0
    snakes.test.js      # Phase 0
    metadata.test.js    # Phase 2 (grows with each entity)
  integration/
    registration.test.js  # Phase 3
    spawning.test.js      # Phase 3
    collision.test.js     # Phase 5
```

### Manual Testing Checklist

Visual and gameplay behavior requires human verification:

**Per-entity checklist (during Phase 2-3):**
- [ ] Renders at correct position
- [ ] Renders in correct layer (z-order)
- [ ] Animation plays correctly
- [ ] Sound plays at correct times
- [ ] Collision works (can be shot / crashes ship / can collect)
- [ ] Death/removal works
- [ ] Score increments correctly
- [ ] Explosion spawns on death

**Full game flow (Phase 6.3):**
- [ ] Title screen displays
- [ ] Game starts on input
- [ ] Ship controls work (thrust, turn, fire)
- [ ] Enemies spawn and move
- [ ] Enemies fire projectiles
- [ ] Ship can die from crashes and projectiles
- [ ] Death sequence plays (explosions, shake, sounds)
- [ ] Respawn works with shield
- [ ] Lives decrement correctly
- [ ] Game over triggers at 0 lives
- [ ] Wave completion triggers transition
- [ ] Score persists across waves
- [ ] HUD displays all info correctly
- [ ] Minimap shows entities

**Regression tests after migration:**
- [ ] Compare screenshot of old vs new at same game state
- [ ] Compare entity counts at wave complete
- [ ] Verify no console errors during full playthrough

---

## What Stays the Same

- Entity factory pattern (`const galaxian = () => ({ ... })`)
- `createEntity()` spread pattern
- Entity lifecycle: factory → spawn → update/draw → dead
- `loadImages()` / `loadSound()` at module level
- Collision detection logic (just data source changes)
- Ship's sub-entities (shield, smartBomb, flames)
- Particles system
- Stars (shared via game object)

## What Changes

- Managers disappear (mostly) - registry replaces them
- Entities declare their own metadata
- Spawn via `registry.spawn('type', props)` not `manager.spawnSingle(props)`
- Access siblings via `registry.get('type')` not `this.manager.entities`
- PlayState update/draw becomes ~10 lines instead of ~50
