// Wave transition state - displays wave complete message and awards bonus

import { BaseState } from './BaseState.js'
import { drawBackground } from '../rendering.js'

export class WaveTransitionState extends BaseState {
	constructor(game) {
		super(game)
		this.wave = 1
		this.lives = 3
		this.score = 0
		this.bonus = 0
		this.alpha = 0
		this.fadeIn = true
		this.displayTime = 0
		this.totalDisplayTime = 3000 // 3 seconds
	}

	enter(data = {}) {
		super.enter(data)

		this.wave = data.wave || 1
		this.lives = data.lives || 3
		this.score = data.score || 0

		// Calculate wave bonus
		this.bonus = this.wave * 1000
		this.score += this.bonus

		// Reset fade animation
		this.alpha = 0
		this.fadeIn = true
		this.displayTime = 0

		console.log(`Wave ${this.wave} complete! Bonus: ${this.bonus}`)
	}

	update(dt) {
		this.displayTime += dt

		// Update stars
		if (this.game.stars) {
			this.game.stars.update(dt)
		}

		// Fade in for first 500ms
		if (this.fadeIn) {
			this.alpha += dt / 500
			if (this.alpha >= 1.0) {
				this.alpha = 1.0
				this.fadeIn = false
			}
		}

		// Fade out for last 500ms
		if (this.displayTime >= this.totalDisplayTime - 500 && !this.fadeIn) {
			this.alpha -= dt / 500
			if (this.alpha <= 0) {
				this.alpha = 0
			}
		}

		// Transition to next wave after display time
		if (this.displayTime >= this.totalDisplayTime) {
			// Increase difficulty
			const newSpeed = Math.min(this.game.speed + 0.5, 10)
			this.game.speed = newSpeed

			this.game.stateManager.transition('play', {
				wave: this.wave + 1,
				lives: this.lives,
				score: this.score
			})
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
		ctx.globalAlpha = this.alpha

		// Draw "Wave X Complete" message
		ctx.fillStyle = '#00FFFF'
		ctx.font = 'bold 72px "Press Start 2P", monospace'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'

		const waveText = `WAVE ${this.wave}`
		const completeText = 'COMPLETE!'

		ctx.fillText(waveText, canvas.width / 2, canvas.height / 2 - 60)
		ctx.fillText(completeText, canvas.width / 2, canvas.height / 2 + 20)

		// Draw bonus
		ctx.font = 'bold 36px "Press Start 2P", monospace'
		ctx.fillStyle = '#FFFF00'
		ctx.fillText(`BONUS: ${this.bonus}`, canvas.width / 2, canvas.height / 2 + 100)

		ctx.restore()
	}

	exit() {
		super.exit()
	}
}
