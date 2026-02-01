// New high score celebration state

import { BaseState } from './BaseState.js'
import { drawBackground } from '../rendering.js'

export class NewHighScoreState extends BaseState {
	constructor( game ) {
		super( game )
		this.score = 0
		this.elapsedTime = 0
		this.displayTime = 5000 // 5 seconds
		this.flashTime = 0
		this.showText = true
	}

	enter ( data = {} ) {
		super.enter( data )

		this.score = data.score || 0
		this.elapsedTime = 0
		this.flashTime = 0
		this.showText = true

		console.log( `NEW HIGH SCORE! ${this.score}` )

		// Listen for Space key to skip to title
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
		this.flashTime += dt

		// Update stars
		if ( this.game.stars ) {
			this.game.stars.update( dt )
		}

		// Flash text every 300ms
		if ( this.flashTime >= 300 ) {
			this.showText = !this.showText
			this.flashTime = 0
		}

		// Auto-return to title after display time
		if ( this.elapsedTime >= this.displayTime ) {
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

		// Flashing "NEW HIGH SCORE!" text
		if ( this.showText ) {
			ctx.fillStyle = '#FFFF00'
			ctx.font = '72px Robotron'
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'
			ctx.fillText( 'NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 - 100 )
		}

		// Display the score (always visible)
		ctx.fillStyle = '#00FFFF'
		ctx.font = '96px Robotron'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'
		ctx.fillText( this.score.toString(), canvas.width / 2, canvas.height / 2 + 40 )

		// "Press Space" instruction
		ctx.fillStyle = '#FFFFFF'
		ctx.font = '20px Robotron'
		ctx.fillText( 'PRESS SPACE TO CONTINUE', canvas.width / 2, canvas.height / 2 + 200 )

		ctx.restore()
	}

	returnToTitle () {
		this.game.stateManager.transition( 'title' )
	}

	exit () {
		super.exit()
	}
}
