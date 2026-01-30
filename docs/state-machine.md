# State Machine — How to Use

A simple system for managing game screens (title, play, game over, etc).

---

## Overview

```
┌─────────┐      Space      ┌──────────┐
│  Title  │ ──────────────► │   Play   │
└─────────┘                 └──────────┘
     ▲                           │
     │                      Death│ Wave
     │         ┌─────────┐  (0   │ Complete
     │         │  Game   │◄──────┤
     └─────────│  Over   │       ▼
      8 secs   └─────────┘  ┌──────────┐
                            │  Wave    │
                            │Transition│
                            └──────────┘
```

---

## Quick Start

### 1. Create a state

```javascript
import { BaseState } from './BaseState.js'

export class MyState extends BaseState {
    enter(data = {}) {
        super.enter(data)
        // Setup: load stuff, add event listeners
    }

    update(dt) {
        // Called every frame
    }

    draw() {
        // Called every frame
    }

    exit() {
        super.exit()  // Cleans up event listeners automatically
    }
}
```

### 2. Register it

```javascript
// In game.js
import { MyState } from './states/MyState.js'

stateManager.register('myState', new MyState(game))
```

### 3. Transition to it

```javascript
// From anywhere
game.stateManager.transition('myState', { score: 1000, lives: 3 })
```

---

## Passing Data Between States

Data flows via the `transition()` call:

```javascript
// In PlayState — player died
game.stateManager.transition('gameOver', { 
    score: this.score 
})

// In GameOverState
enter(data = {}) {
    super.enter(data)
    this.finalScore = data.score || 0  // Received!
}
```

---

## Event Listeners (Auto-Cleanup!)

Use `this.addEventListener()` instead of `window.addEventListener()`:

```javascript
enter(data = {}) {
    super.enter(data)
    
    // This listener is automatically removed when exiting the state
    this.addEventListener(window, 'keydown', (e) => {
        if (e.code === 'Space') {
            this.game.stateManager.transition('play')
        }
    })
}
```

No need to manually remove it — `BaseState.exit()` handles cleanup.

---

## State Lifecycle

```
┌──────────────────────────────────────────────────────┐
│  transition('play', { lives: 3 })                    │
└──────────────────────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  currentState.exit()  │  ← cleanup old state
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  newState.enter(data) │  ← setup new state
            └───────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  update(dt) / draw()  │  ← called every frame
            └───────────────────────┘
```

---

## Full Example: A Pause State

```javascript
import { BaseState } from './BaseState.js'

export class PauseState extends BaseState {
    constructor(game) {
        super(game)
        this.savedGameData = null
    }

    enter(data = {}) {
        super.enter(data)
        
        // Save the game state we came from
        this.savedGameData = data
        
        // Unpause on Escape
        this.addEventListener(window, 'keydown', (e) => {
            if (e.code === 'Escape') {
                // Return to play with the same data
                this.game.stateManager.transition('play', this.savedGameData)
            }
        })
    }

    draw() {
        // Draw "PAUSED" over the frozen game
        const ctx = this.game.ctx
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = '#FFFF00'
        ctx.font = '64px Robotron'
        ctx.textAlign = 'center'
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2)
    }
}
```

---

## Existing States

| State | File | Purpose |
|-------|------|---------|
| `title` | TitleState.js | Logo, "press space" |
| `play` | PlayState.js | Main gameplay |
| `playerDeath` | PlayerDeathState.js | Death animation |
| `waveTransition` | WaveTransitionState.js | "Wave Complete" + bonus |
| `gameOver` | GameOverState.js | Final score display |
| `newHighScore` | NewHighScoreState.js | High score celebration |

---

## Tips

- **Always call `super.enter(data)`** at the start of `enter()`
- **Always call `super.exit()`** at the start of `exit()` 
- **Use `this.addEventListener()`** — not `window.addEventListener()`
- **Pass everything needed** via the `data` object — states don't share variables
