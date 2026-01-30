// Game over state - displays final score and returns to title

import { BaseState } from './BaseState.js'
import { drawBackground } from '../rendering.js'

export class GameOverState extends BaseState {
	constructor(game) {
		super(game)
		this.score = 0
		this.elapsedTime = 0
		this.autoReturnTime = 8000 // 8 seconds
	}

	enter(data = {}) {
		super.enter(data)

		this.score = data.score || 0
		this.elapsedTime = 0

		// Set game over flag
		this.game.over = true

		console.log(`Game Over! Final Score: ${this.score}`)

		// Note: Individual sounds are cleaned up by PlayState.exit() before transitioning here
		// Don't call Howler.stop() globally as it prevents sounds in the next game

		// Listen for Space key to return to title
		const spaceHandler = (event) => {
			if (event.defaultPrevented) return

			if (event.code === "Space") {
				this.returnToTitle()
			}
		}

		this.addEventListener(window, 'keydown', spaceHandler, true)
	}

	update(dt) {
		this.elapsedTime += dt

		// Update stars
		if (this.game.stars) {
			this.game.stars.update(dt)
		}

		// Auto-return to title after 8 seconds
		if (this.elapsedTime >= this.autoReturnTime) {
			this.returnToTitle()
		}
	}

	draw() {
		drawBackground(this.game.ctx, this.game.canvas)

		// Draw stars
		if (this.game.stars) {
			this.game.stars.draw()
		}

		const ctx = this.game.ctx
		const canvas = this.game.canvas

		ctx.save()

		// Draw "GAME OVER" text
		ctx.fillStyle = '#FF0000'
		ctx.font = 'bold 96px "Press Start 2P", monospace'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 80)

		// Draw final score
		ctx.fillStyle = '#FFFF00'
		ctx.font = 'bold 48px "Press Start 2P", monospace'
		ctx.fillText(`SCORE: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20)

		// Draw "Press Space" instruction
		ctx.fillStyle = '#00FFFF'
		ctx.font = 'bold 24px "Press Start 2P", monospace'
		ctx.fillText('PRESS SPACE TO CONTINUE', canvas.width / 2, canvas.height / 2 + 120)

		ctx.restore()
	}

	returnToTitle() {
		this.game.stateManager.transition('title')
	}

	exit() {
		// Clear game over flag
		this.game.over = false
		super.exit()
	}
}
