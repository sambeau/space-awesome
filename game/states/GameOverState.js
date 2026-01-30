// Game over state - displays final score and returns to title

import { BaseState } from './BaseState.js'
import { drawBackground } from '../rendering.js'

export class GameOverState extends BaseState {
	constructor( game ) {
		super( game )
		this.score = 0  // Will be set in enter() from transition data
		this.elapsedTime = 0
		this.autoReturnTime = 8000 // 8 seconds
	}

	enter ( data = {} ) {
		super.enter( data )

		this.score = data.score || 0
		this.elapsedTime = 0

		// Set game over flag
		this.game.over = true

		console.log( `Game Over! Final Score: ${this.score}` )

		// Check if this is a new high score
		this.isNewHighScore = this.game.highScoreManager.checkAndUpdateHighScore(this.score)

		if (this.isNewHighScore) {
			console.log('🎉 NEW HIGH SCORE!')
		}

		// Note: Individual sounds are cleaned up by PlayState.exit() before transitioning here
		// Don't call Howler.stop() globally as it prevents sounds in the next game

		// Listen for Space key to return to title
		const spaceHandler = ( event ) => {
			if ( event.defaultPrevented ) return

			if ( event.code === "Space" ) {
				this.returnToTitle()
			}
		}

		this.addEventListener( window, 'keydown', spaceHandler, true )
	}

	update ( dt ) {
		this.elapsedTime += dt

		// Update stars
		if ( this.game.stars ) {
			this.game.stars.update( dt )
		}

		// Auto-return to title after 8 seconds
		if ( this.elapsedTime >= this.autoReturnTime ) {
			this.returnToTitle()
		}
	}

	draw () {
		drawBackground( this.game.ctx, this.game.canvas )

		// Draw stars
		if ( this.game.stars ) {
			this.game.stars.draw()
		}

		const ctx = this.game.ctx
		const canvas = this.game.canvas

		ctx.save()

		// Draw "GAME OVER" text
		ctx.font = "96px Robotron"
		ctx.fillStyle = "#FF00FF"
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText( 'GAME OVER', canvas.width / 2, canvas.height / 2 - 96 - 40 )

		// Draw final score
		ctx.fillStyle = '#FFFF00'
		ctx.font = "48px Robotron"
		ctx.fillText( `SCORE: ${this.score}`, canvas.width / 2, canvas.height / 2 + 20 )

		// Draw "Press Space" instruction
		ctx.fillStyle = '#00FFFF'
		ctx.font = "24px Robotron"
		ctx.fillText( 'PRESS SPACE TO CONTINUE', canvas.width / 2, canvas.height / 2 + 120 )

		ctx.restore()
	}

	returnToTitle () {
		// If new high score, show celebration screen first
		if (this.isNewHighScore) {
			this.game.stateManager.transition('newHighScore', {
				score: this.score
			})
		} else {
			this.game.stateManager.transition('title')
		}
	}

	exit () {
		// Clear game over flag
		this.game.over = false
		super.exit()
	}
}
