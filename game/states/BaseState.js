// Base class for all game states
// Provides lifecycle methods and event listener tracking

export class BaseState {
	constructor(game) {
		this.game = game
		this.eventListeners = [] // Track listeners for cleanup
	}

	// Called when entering this state
	enter(data = {}) {
		console.log(`Entering ${this.constructor.name}`, data)
	}

	// Called when exiting this state
	exit() {
		console.log(`Exiting ${this.constructor.name}`)
		this.cleanupListeners()
	}

	// Called every frame with delta time
	update(dt) {
		// Override in subclasses
	}

	// Called every frame for rendering
	draw() {
		// Override in subclasses
	}

	// Helper to add event listener with tracking
	addEventListener(target, event, handler, options) {
		target.addEventListener(event, handler, options)
		this.eventListeners.push({ target, event, handler, options })
	}

	// Clean up all tracked event listeners
	cleanupListeners() {
		for (const { target, event, handler, options } of this.eventListeners) {
			target.removeEventListener(event, handler, options)
		}
		this.eventListeners = []
	}
}
