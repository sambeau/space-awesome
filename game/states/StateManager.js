// Central state coordinator with transition management

export class StateManager {
	constructor(game) {
		this.game = game
		this.states = {} // Registered states by name
		this.currentState = null
		this.currentStateName = null
	}

	// Register a state with a name
	register(name, state) {
		this.states[name] = state
	}

	// Transition to a new state
	transition(stateName, data = {}) {
		if (!this.states[stateName]) {
			console.error(`State '${stateName}' not found`)
			return
		}

		// Exit current state
		if (this.currentState) {
			this.currentState.exit()
		}

		// Switch to new state
		this.currentStateName = stateName
		this.currentState = this.states[stateName]
		this.currentState.enter(data)
	}

	// Update current state
	update(dt) {
		if (this.currentState) {
			this.currentState.update(dt)
		}
	}

	// Draw current state
	draw() {
		if (this.currentState) {
			this.currentState.draw()
		}
	}

	// Get current state name
	getCurrentStateName() {
		return this.currentStateName
	}
}
