# Entity System

A simple way to create game entities without copy-pasting boilerplate.

## Quick Start

```javascript
import { createEntity, loadImages, loadSound } from "./Entity.js";

// 1. Load your assets (cached automatically)
const assets = loadImages(["images/foo-1.png", "images/foo-2.png"])
const bangSound = loadSound('/sounds/bang.mp3', 0.25)

// 2. Create your entity
const foo = () => {
    return {
        ...createEntity({ name: "foo", width: 48, height: 48, score: 100 }),
        
        // Add your custom stuff here
    }
}
```

---

## What You Get For Free

When you spread `...createEntity()`, your entity automatically has:

| Property/Method | What it does |
|-----------------|--------------|
| `x`, `y`, `vx`, `vy` | Position and velocity (all start at 0) |
| `width`, `height` | Dimensions |
| `dead` | Set to `true` to remove the entity |
| `score` | Points when killed |
| `ticks` | Frame counter |
| `tick()` | Increments `ticks`, wraps at 1000 |
| `outOfBoundsB()` | Returns `true` if below screen |
| `outOfBoundsL()` | Returns `true` if left of screen |
| `outOfBoundsR()` | Returns `true` if right of screen |
| `syncCollider()` | Updates collider position to match entity |
| `wrapScreen()` | Handles screen wrapping (bottom→top, left↔right) |

---

## Loading Images

**Before:**

```javascript
let imagesLoaded = 0
const image1 = new Image()
const image2 = new Image()
image1.src = "images/pod-1.png"
image2.src = "images/pod-2.png"
image1.onload = () => { imagesLoaded++ }
image2.onload = () => { imagesLoaded++ }

// In draw():
if (imagesLoaded == 2) { ... }
```

**After:**

```javascript
const assets = loadImages(["images/pod-1.png", "images/pod-2.png"])

// In draw():
if (!assets.loaded()) return
ctx.drawImage(assets.images[0], ...)
```

---

## Loading Sounds

**Before:**

```javascript
var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.25)
```

**After:**

```javascript
const bangSound = loadSound('/sounds/bang.mp3', 0.25)
```

---

## Typical update() Method

```javascript
update() {
    this.tick()                         // count frames
    this.x += this.vx                   // move
    this.y += this.vy + game.speed      // move (with scroll)
    this.syncCollider()                 // keep collider in sync
    this.wrapScreen()                   // handle screen edges
}
```

---

## Drawing with Rotation

```javascript
import { drawRotated, getFrame } from "./Entity.js"

draw() {
    if (!assets.loaded()) return
    
    // Get current animation frame (4 frames, 5 ticks each)
    const frame = getFrame(this.ticks, 4, 5)
    
    // Draw with rotation
    drawRotated(ctx, this, assets.images[frame])
}
```

---

## Full Example: A Simple Enemy

```javascript
import { ctx, game } from "../game.js";
import { createEntity, loadImages, loadSound, drawRotated, getFrame } from "./Entity.js";
import { randInt, stereoFromScreenX } from "/zap/zap.js";
import { explode } from "./explosions.js";

const assets = loadImages(["images/blob-1.png", "images/blob-2.png"])
const bangSound = loadSound('/sounds/bang.mp3', 0.25)

const blob = () => {
    return {
        ...createEntity({
            name: "blob",
            width: 32,
            height: 32,
            score: 50,
            collider: { type: "circle", ox: 16, oy: 16, r: 14, colliding: false }
        }),

        color: "#00FF00",
        rotation: Math.random() * 10,
        vx: Math.random() - 0.5,
        vy: Math.random() * 2 + 1,

        spawn({ ship }) {
            this.ship = ship
            this.x = randInt(canvas.width)
            this.y = -randInt(canvas.height * 2)
            this.collider.area = Math.round(Math.PI * this.collider.r ** 2 / game.massConstant)
        },

        update() {
            this.tick()
            this.x += this.vx
            this.y += this.vy + game.speed
            this.syncCollider()
            this.wrapScreen()
        },

        draw() {
            if (!assets.loaded()) return
            drawRotated(ctx, this, assets.images[getFrame(this.ticks, 2, 10)])
        },

        onHit(smartbomb) {
            if (!smartbomb) {
                bangSound.play()
                bangSound.stereo(stereoFromScreenX(screen, this.x))
            }
            this.dead = true
            game.score += this.score
            explode({ x: this.x + 16, y: this.y + 16, styles: ["white", "#00FF00"], size: 6 })
        }
    }
}
```

---

## Don't Need Everything?

Just use the parts you want:

```javascript
// Only want the asset loaders?
import { loadImages, loadSound } from "./Entity.js"

// Only want bounds checking?
import { boundsMixin } from "./Entity.js"
const myThing = { ...boundsMixin, /* your stuff */ }
```

---

## Available Mixins

You can import these separately if you don't want `createEntity`:

```javascript
import { tickMixin, boundsMixin, colliderMixin, wrapMixin } from "./Entity.js"
```
