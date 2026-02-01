// Wave transition state - displays wave complete message and awards bonus

import { BaseState } from './BaseState.js'
import { drawBackground } from '../rendering.js'
import { spaceman } from '../entities/spacemen.js'

// Sound for spaceman bonus reveal
const bonusSound = new Howl( { src: [ '/sounds/save.mp3' ] } )
bonusSound.volume( 0.25 )

export class WaveTransitionState extends BaseState {
	constructor( game ) {
		super( game )
		this.wave = 1
		this.lives = 3
		this.score = 0
		this.bonus = 0
		this.alpha = 0
		this.fadeIn = true
		this.displayTime = 0
		this.totalDisplayTime = 3000 // Will be extended based on spacemen count

		// Spaceman bonus animation
		this.survivingSpacemen = 0
		this.spacemenRevealed = 0
		this.spacemenEntities = [] // Actual spaceman entities for animation
		this.revealTimer = 0
		this.revealInterval = 400 // ms between each spaceman reveal
		this.bonusPerSpaceman = 0
		this.displayedBonus = 0
		this.revealPhase = false
		this.revealComplete = false
	}

	enter ( data = {} ) {
		super.enter( data )

		this.wave = data.wave || 1
		this.lives = data.lives || 3
		this.score = data.score || 0
		this.survivingSpacemen = data.survivingSpacemen || 0

		// Calculate bonus per spaceman using Defender-style scoring
		// Waves 1-5: 500 points x wave number per surviving spaceman
		// Wave 6+: 2500 points per surviving spaceman
		if ( this.wave <= 5 ) {
			this.bonusPerSpaceman = 500 * this.wave
		} else {
			this.bonusPerSpaceman = 2500
		}

		// Total bonus
		this.bonus = this.survivingSpacemen * this.bonusPerSpaceman

		// Reset animation state
		this.spacemenRevealed = 0
		this.spacemenEntities = []
		this.revealTimer = 0
		this.displayedBonus = 0
		this.revealPhase = false
		this.revealComplete = this.survivingSpacemen === 0

		// Reset fade animation
		this.alpha = 0
		this.fadeIn = true
		this.displayTime = 0

		// Extend display time based on spacemen count (at least 3 seconds, plus time for reveals)
		this.totalDisplayTime = Math.max( 3000, 1500 + this.survivingSpacemen * this.revealInterval + 1500 )

		console.log( `Wave ${this.wave} complete! Surviving spacemen: ${this.survivingSpacemen}, Bonus: ${this.bonus}` )
	}

	update ( dt ) {
		this.displayTime += dt

		// Update stars
		if ( this.game.stars ) {
			this.game.stars.update( dt )
		}

		// Fade in for first 500ms
		if ( this.fadeIn ) {
			this.alpha += dt / 500
			if ( this.alpha >= 1.0 ) {
				this.alpha = 1.0
				this.fadeIn = false
				// Start reveal phase after fade in
				this.revealPhase = true
			}
		}

		// Spaceman reveal animation
		if ( this.revealPhase && !this.revealComplete ) {
			this.revealTimer += dt
			if ( this.revealTimer >= this.revealInterval ) {
				this.revealTimer = 0
				if ( this.spacemenRevealed < this.survivingSpacemen ) {
					// Create a new spaceman entity at the reveal position
					const canvas = this.game.canvas
					const spacemanSize = 46
					const spacing = 56
					const totalWidth = this.survivingSpacemen * spacing
					const startX = canvas.width / 2 - totalWidth / 2 + spacing / 2
					const x = startX + this.spacemenRevealed * spacing - spacemanSize / 2
					const y = canvas.height / 2 + 50

					const s = spaceman()
					s.spawn( { id: this.spacemenRevealed, x: x, y: y, vx: 0, vy: 0 } )
					s.width = spacemanSize
					s.height = spacemanSize
					this.spacemenEntities.push( s )

					this.spacemenRevealed++
					this.displayedBonus += this.bonusPerSpaceman
					bonusSound.play()
				} else {
					this.revealComplete = true
					// Add bonus to score
					this.score += this.bonus
				}
			}
		}

		// Update all revealed spaceman entities (for animation)
		for ( const s of this.spacemenEntities ) {
			s.tick()
		}

		// Fade out for last 500ms
		if ( this.displayTime >= this.totalDisplayTime - 500 && !this.fadeIn ) {
			this.alpha -= dt / 500
			if ( this.alpha <= 0 ) {
				this.alpha = 0
			}
		}

		// Transition to next wave after display time
		if ( this.displayTime >= this.totalDisplayTime ) {
			// Increase difficulty
			const newSpeed = Math.min( this.game.speed + 0.5, 10 )
			this.game.speed = newSpeed

			this.game.stateManager.transition( 'play', {
				wave: this.wave + 1,
				lives: this.lives,
				score: this.score
			} )
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
		ctx.globalAlpha = this.alpha

		// Draw "Wave X Complete" message
		ctx.fillStyle = '#00FFFF'
		ctx.font = '72px Robotron'
		ctx.textAlign = 'center'
		ctx.textBaseline = 'middle'

		const waveText = `WAVE ${this.wave}`
		const completeText = 'COMPLETE!'

		ctx.fillText( waveText, canvas.width / 2, canvas.height / 2 - 180 )
		ctx.fillText( completeText, canvas.width / 2, canvas.height / 2 - 40 )

		// Draw spaceman bonus section
		if ( this.survivingSpacemen > 0 ) {
			// Draw all revealed spaceman entities (they animate!)
			for ( const s of this.spacemenEntities ) {
				s.draw()
			}

			// Draw bonus text
			ctx.font = '24px Robotron'
			ctx.fillStyle = '#FFFF00'

			// Show points per spaceman
			const pointsText = this.wave <= 5
				? `${500} x ${this.wave} = ${this.bonusPerSpaceman} PTS EACH`
				: `${this.bonusPerSpaceman} PTS EACH`
			ctx.fillText( pointsText, canvas.width / 2, canvas.height / 2 + 140 )

			// Show running total
			ctx.font = '36px Robotron'
			ctx.fillStyle = '#00FF00'
			ctx.fillText( `BONUS: ${this.displayedBonus}`, canvas.width / 2, canvas.height / 2 + 200 )
		} else {
			// No spacemen survived
			ctx.font = '24px Robotron'

			ctx.fillStyle = '#FF6666'
			ctx.fillText( 'NO SPACEMEN SAVED', canvas.width / 2, canvas.height / 2 + 60 )

			ctx.font = '36px Robotron'
			ctx.fillStyle = '#FFFF00'
			ctx.fillText( 'BONUS: 0', canvas.width / 2, canvas.height / 2 + 120 )
		}

		ctx.restore()
	}

	exit () {
		super.exit()
	}
}