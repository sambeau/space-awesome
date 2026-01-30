// Title screen state - displays logo and waits for Space key

import { BaseState } from './BaseState.js'
import { Logo } from '../entities/logo.js'
import { drawBackground } from '../rendering.js'

export class TitleState extends BaseState {
	constructor(game) {
		super(game)
		this.logo = null
	}

	enter(data = {}) {
		super.enter(data)

		// Initialize logo (stars are shared via game.stars)
		this.logo = Logo()
		this.logo.spawn()

		// Listen for Space key to start game
		const spaceHandler = (event) => {
			if (event.defaultPrevented) return

			if (event.code === "Space") {
				this.game.stateManager.transition('play', { wave: 1, lives: 3, score: 0 })
			}
		}

		this.addEventListener(window, 'keydown', spaceHandler, true)
	}

	update(dt) {
		this.game.stars.update(dt)
		this.logo.update(dt)
	}

	draw() {
		drawBackground(this.game.ctx, this.game.canvas)
		this.game.stars.draw()
		this.logo.draw()

		// Draw high score at bottom
		const ctx = this.game.ctx
		const canvas = this.game.canvas
		const highScore = this.game.highScoreManager.getHighScore()

		ctx.save()
		ctx.fillStyle = '#FFFF00'
		ctx.font = '32px Robotron'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'bottom'
		ctx.fillText(`HIGH SCORE: ${highScore}`, canvas.width / 2, canvas.height - 40)
		ctx.restore()
	}

	exit() {
		super.exit()
		// Cleanup happens in BaseState.exit()
	}
}
