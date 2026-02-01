// Main gameplay state - handles collision, updates, rendering, and transitions

import { asteroids as Asteroids } from '../entities/asteroids.js'
import { BaseState } from './BaseState.js'
import { defenders as Defenders } from '../entities/defenders.js'
import { Floaters } from '../entities/floaters.js'
import { galaxians as Galaxians } from '../entities/galaxians.js'
import { Hud } from '../entities/hud.js'
import { Mines } from '../entities/mines.js'
import { Mothers } from '../entities/mothers.js'
import { Mushrooms } from '../entities/mushrooms.js'
import { Particles } from '../entities/particles.js'
import { Pods } from '../entities/pods.js'
import { Powerups } from '../entities/powerups.js'
import { Snakes } from '../entities/snakes.js'
import { Spacemen } from '../entities/spacemen.js'
import { spaceship as Spaceship } from '../entities/ship.js'
import { Swarmers } from '../entities/swarmers.js'
import { drawBackground } from '../rendering.js'

export class PlayState extends BaseState {
	constructor( game ) {
		super( game )

		// Entities (stars are shared via game.stars)
		this.ship = null
		this.floaters = null
		this.asteroids = null
		this.mines = null
		this.mothers = null
		this.spacemen = null
		this.swarmers = null
		this.pods = null
		this.defenders = null
		this.galaxians = null
		this.mushrooms = null
		this.snakes = null
		this.powerups = null
		this.hud = null

		// State data
		this.wave = 1
		this.lives = 3
		this.score = 0

		// Death sequence tracking
		this.deathSequenceActive = false
		this.deathSequenceComplete = false

		this.paused = false
	}

	enter ( data = {} ) {
		super.enter( data )

		// Restore state from transition data
		this.wave = data.wave || 1
		this.lives = data.lives || 3
		this.score = data.score || 0

		// Sync lives to game object for HUD
		this.game.lives = this.lives

		// Reset death sequence flags
		this.deathSequenceActive = false
		this.deathSequenceComplete = false

		// Initialize entities
		this.initializeEntities()

		// Setup input handlers
		this.setupInputHandlers()
	}

	initializeEntities () {
		// Stars are shared via game.stars
		this.game.particles = Particles()

		this.ship = Spaceship()
		this.floaters = Floaters()

		this.asteroids = Asteroids()
		this.asteroids.spawn()

		this.mines = Mines()
		this.mines.spawn( { ship: this.ship, floaters: this.floaters } )

		this.mothers = Mothers()
		this.mothers.spawn( { ship: this.ship, floaters: this.floaters } )

		this.spacemen = Spacemen()
		this.spacemen.spawn( { ship: this.ship, floaters: this.floaters } )

		this.swarmers = Swarmers()
		this.pods = Pods()
		this.pods.spawn( { swarmers: this.swarmers, ship: this.ship, floaters: this.floaters } )

		this.defenders = Defenders()
		this.defenders.spawn( { ship: this.ship } )

		this.galaxians = Galaxians()
		this.galaxians.spawn( { ship: this.ship } )

		this.mushrooms = Mushrooms()

		this.snakes = Snakes()
		this.snakes.spawn( { ship: this.ship, spacemen: this.spacemen, floaters: this.floaters, mushrooms: this.mushrooms } )

		this.powerups = Powerups()
		this.powerups.spawn( { ship: this.ship } )

		this.ship.spawn( {
			entities: [
				this.asteroids,
				this.mothers,
				this.pods,
				this.swarmers,
				this.mushrooms,
				this.defenders,
				this.galaxians,
				this.powerups,
				this.spacemen,
				this.snakes,
				this.mines,
			],
			floaters: this.floaters
		} )

		this.hud = Hud()
		this.hud.init( this.ship, this.spacemen, [
			this.mushrooms,
			this.asteroids,
			this.mothers,
			this.pods,
			this.swarmers,
			this.defenders,
			this.galaxians,
			this.powerups,
			this.spacemen,
			this.snakes,
			this.mines
		] )
	}

	setupInputHandlers () {
		const keydownHandler = ( event ) => {
			if ( event.defaultPrevented ) return

			switch ( event.code ) {
				case "ArrowDown":
					this.ship.thrustOff()
					this.ship.break = true
					break
				case "ArrowUp":
					this.ship.thrust()
					break
				case "ArrowLeft":
					this.ship.turn = -12.5
					break
				case "ArrowRight":
					this.ship.turn = 12.5
					break
				case "Space":
					this.ship.startFiring()
					break
				case "Digit1":
					console.log( "guns 1" )
					this.ship.guns = 1
					break
				case "Digit2":
					console.log( "guns 2" )
					this.ship.guns = 2
					break
				case "Digit3":
					console.log( "guns 3" )
					this.ship.guns = 3
					break
				case "Backquote":
					this.game.debug = !this.game.debug
					break
				case "KeyZ":
					this.game.showColliders = !this.game.showColliders
					break
				case "KeyW":
					this.asteroids.spawnSingle( {} )
					break
				case "KeyQ":
					this.galaxians.spawnSingle( { ship: this.ship } )
					break
				case "KeyP":
					// toggle pause state
					this.paused = !this.paused
					break
				case "Slash":
					this.ship.boostShields()
					break
				case "Backslash":
					// Set shields to 0 for testing
					this.ship.shield.strength = 0
					this.ship.shield.updateCollider()
					console.log( "Shields set to 0" )
					break
				case "KeyN":
					// Skip to next wave (kill all enemies)
					this.asteroids.asteroids = []
					this.galaxians.galaxians = []
					this.defenders.defenders = []
					this.mothers.mothers = []
					this.pods.pods = []
					this.swarmers.swarmers = []
					this.mines.mines = []
					console.log( "Skipping to next wave" )
					break
				case "KeyL":
					// Add a life
					this.lives++
					this.game.lives++
					console.log( `Lives: ${this.lives}` )
					break
				case "KeyK":
					// Add 1 saved spaceman
					this.spacemen.saved++
					console.log( `Saved spacemen: ${this.spacemen.saved}` )
					break
				case "KeyI":
					// Toggle invincibility
					this.ship.invincible = !this.ship.invincible
					console.log( `Invincibility: ${this.ship.invincible ? 'ON' : 'OFF'}` )
					break
				case "KeyT":
					// Test wave transition with current state
					this.game.stateManager.transition( 'waveTransition', {
						wave: this.wave,
						lives: this.lives,
						score: this.game.score,
						survivingSpacemen: this.spacemen.saved
					} )
					break
				case "Enter":
				case "NumpadEnter":
					this.ship.fireSmartBomb()
					break
				default:
					console.log( "key pressed:", event.code )
					break
			}
		}

		const keyupHandler = ( event ) => {
			if ( event.defaultPrevented ) return

			switch ( event.code ) {
				case "ArrowDown":
					this.ship.break = false
				case "ArrowUp":
					this.ship.thrustOff()
					break
				case "ArrowLeft":
					this.ship.turn = 0
					break
				case "ArrowRight":
					this.ship.turn = 0
					break
				case "Space":
					this.ship.stopFiring()
					break
			}
		}

		this.addEventListener( window, 'keydown', keydownHandler, true )
		this.addEventListener( window, 'keyup', keyupHandler, true )
	}

	update ( dt ) {

		// paused?
		if ( this.paused ) return

		// Check for ship death and start death sequence
		if ( this.ship.dead && !this.deathSequenceActive && !this.deathSequenceComplete ) {
			this.deathSequenceActive = true
			this.startDeathSequence()
			// Don't return - let entities continue updating
		}

		// If death sequence is complete, handle respawn or game over
		if ( this.deathSequenceComplete ) {
			this.lives--
			this.game.lives = this.lives  // Sync to game object for HUD
			if ( this.lives <= 0 ) {
				// Game over - clean up ship sounds
				if ( this.ship && this.ship.cleanup ) {
					this.ship.cleanup()
				}
				this.game.stateManager.transition( 'gameOver', {
					score: this.game.score  // Use game.score, not ship.score
				} )
				return
			} else {
				// Respawn - keep all entities, just reset ship with shield
				this.respawnShip()
				this.deathSequenceActive = false
				this.deathSequenceComplete = false
				// Continue gameplay without returning
			}
		}

		// Check for wave completion
		if ( this.isWaveComplete() ) {
			this.game.stateManager.transition( 'waveTransition', {
				wave: this.wave,
				lives: this.lives,
				score: this.game.score,  // Use game.score
				survivingSpacemen: this.spacemen.saved
			} )
			return
		}

		// Collision detection
		this.ship.collideWeaponsWithAll( [
			this.asteroids.asteroids,
			this.galaxians.galaxians,
			this.defenders.defenders,
			this.mothers.mothers,
			this.pods.pods,
			this.swarmers.swarmers,
			this.mushrooms.mushrooms,
			this.mines.mines,
			this.spacemen.spacemen
		] )

		this.ship.crashIntoAll( [
			this.asteroids.asteroids,
			this.galaxians.galaxians,
			this.defenders.defenders,
			this.mothers.mothers,
			this.pods.pods,
			this.swarmers.swarmers,
			this.mushrooms.mushrooms,
			this.mines.mines,
			this.galaxians.shots,
			this.defenders.bombs,
			this.swarmers.bombs,
			this.mothers.bombs,
			this.snakes.all()
		] )

		this.ship.collect( this.powerups.powerups )
		this.ship.collect( this.spacemen.spacemen )

		// Update all entities
		this.powerups.update( dt )
		this.game.stars.update( dt )
		this.asteroids.update( dt )
		this.mines.update( dt )
		this.spacemen.update( dt )
		this.mothers.update( dt )
		this.pods.update( dt )
		this.swarmers.update( dt )
		this.mushrooms.update( dt )
		this.defenders.update( dt )
		this.galaxians.update( dt )
		this.snakes.update( dt )
		this.ship.update( dt )
		this.game.particles.update( dt )
		this.floaters.update( dt )

		this.hud.update( dt )
	}

	draw () {
		drawBackground( this.game.ctx, this.game.canvas )

		// Draw all entities
		this.game.stars.draw()
		this.mushrooms.draw()
		this.snakes.draw()
		this.asteroids.draw()
		this.mines.draw()
		this.spacemen.draw()
		this.mothers.draw()
		this.pods.draw()
		this.swarmers.draw()
		this.defenders.draw()
		this.galaxians.draw()
		this.powerups.draw()
		this.ship.draw()
		this.game.particles.draw()
		this.floaters.draw()

		this.hud.draw()
	}

	async startDeathSequence () {
		// Wait for audio context to be ready before playing sounds
		if ( this.game.audioManager ) {
			try {
				await this.game.audioManager.forceResume()
				console.log( 'Audio context ready for death sequence' )
			} catch ( e ) {
				console.error( 'Failed to resume audio:', e )
			}
		}

		// Get sounds (lazily initialized)
		const getSounds = () => {
			if ( typeof Howl === 'undefined' ) {
				console.warn( 'Howl is not defined - sounds disabled' )
				return null
			}

			// Check audio context state
			if ( typeof Howler !== 'undefined' && Howler.ctx ) {
				console.log( 'AudioContext state:', Howler.ctx.state )
			}

			try {
				return {
					huge: new Howl( { src: [ '/sounds/huge-explosion.mp3' ], volume: 0.33 } ),
					epic: new Howl( { src: [ '/sounds/epic.mp3' ], volume: 0.33 } ),
					impact: new Howl( { src: [ '/sounds/impact.mp3' ], volume: 0.33 } ),
					gameOver: new Howl( { src: [ '/sounds/game-over.mp3' ], volume: 1.0 } )
				}
			} catch ( e ) {
				console.error( 'Error creating sounds:', e )
				return null
			}
		}

		const sounds = getSounds()
		const canvas = this.game.canvas
		const isGameOver = this.lives - 1 <= 0
		if ( isGameOver ) { // we won't make it back to do this // this should be done earlier
			this.lives--
			this.game.lives = this.lives  // Sync to game object for HUD
		}
		console.log( 'Death sequence starting, sounds available:', !!sounds )

		// Play initial sounds
		if ( sounds ) {
			sounds.huge.play()
			sounds.epic.play()
		}
		canvas.classList.add( "game-over-shake" )

		// Create explosion effect at ship position
		const explosion = () => {
			if ( sounds ) sounds.impact.play()
			for ( let i = 100; i > 4; i = i / 2 ) {
				this.game.particles.spawnCircle( {
					points: i,
					cx: this.ship.x + this.ship.width / 2,
					cy: this.ship.y + this.ship.height / 2,
					width: 20,
					height: 20,
					speed: i / 2,
					lifespan: 50,
					style: "glitter"
				} )
			}
		}

		// Run explosion sequence (matching original timing)
		explosion()
		setTimeout( () => {
			explosion()
			setTimeout( () => {
				explosion()
				setTimeout( () => {
					explosion()
					setTimeout( () => {
						explosion()
						setTimeout( () => {
							explosion()
							if ( isGameOver ) {
								setTimeout( () => {
									explosion()
									setTimeout( () => {
										canvas.classList.remove( "game-over-shake" )
										setTimeout( () => {
											if ( sounds ) sounds.gameOver.play()
											this.game.speed = 2
											setTimeout( () => {
												this.deathSequenceComplete = true
											}, 2000 )
										}, 5300 )
									}, 500 )
								}, 500 )
							} else {
								this.game.speed = 2
								canvas.classList.remove( "game-over-shake" )
								setTimeout( () => {
									this.deathSequenceComplete = true
								}, 1000 )
							}
						}, 400 )
					}, 300 )
				}, 200 )
			}, 100 )
		}, 100 )
	}

	respawnShip () {
		// Reset ship to center of screen
		this.ship.x = this.game.canvas.width / 2 - this.ship.width / 2
		this.ship.y = this.game.canvas.height / 2 - this.ship.height / 2
		this.ship.vx = 0
		this.ship.vy = 0
		this.ship.rotation = 0
		this.ship.dead = false

		// Give full shield to compensate for immediate danger
		if ( this.ship.shield ) {
			this.ship.shield.strength = this.ship.shield.maxStrength || 100
		}

		console.log( `Respawning with ${this.lives} lives remaining, shield at full strength` )
	}

	isWaveComplete () {
		// Wave is complete when all primary enemies are defeated
		// Primary enemies: asteroids, galaxians, defenders, mothers, pods, swarmers, mines
		return (
			this.asteroids.asteroids.length === 0 &&
			this.galaxians.galaxians.length === 0 &&
			this.defenders.defenders.length === 0 &&
			this.mothers.mothers.length === 0 &&
			this.pods.pods.length === 0 &&
			this.swarmers.swarmers.length === 0 &&
			this.mines.mines.length === 0
		)
	}

	exit () {
		console.log( 'PlayState exiting' )

		// Clean up ship sounds (fade to 0, don't stop completely)
		if ( this.ship && this.ship.cleanup ) {
			this.ship.cleanup()
		}

		super.exit()
		// Cleanup happens in BaseState.exit()
	}
}
