// Main gameplay state - handles collision, updates, rendering, and transitions

import { BaseState } from './BaseState.js'
import { COLLISION } from '../entities/constants.js'
import { Floaters } from '../entities/floaters.js'
import { Hud } from '../entities/hud.js'
import { Particles } from '../entities/particles.js'
import { spaceship as Spaceship } from '../entities/ship.js'
import { WaveManager } from '../systems/WaveManager.js'
import { asteroid } from '../entities/asteroids.js'
import { bomb } from '../entities/bombs.js'
import { bombJack } from '../entities/bombJacks.js'
import { bomber } from '../entities/bombers.js'
import { bullet } from '../entities/bullet.js'
import { createDirector } from '../zap/Director.js'
import { defender } from '../entities/defenders.js'
import { drawBackground } from '../rendering.js'
import { fireBomb } from '../entities/fireBomb.js'
import { fireBomber } from '../entities/fireBombers.js'
import { galaxian } from '../entities/galaxians.js'
import { mine } from '../entities/mines.js'
import { mother } from '../entities/mothers.js'
import { mushroom } from '../entities/mushrooms.js'
import { pod } from '../entities/pods.js'
import { powerup } from '../entities/powerups.js'
import { screamer } from '../entities/screamers.js'
import { shot } from '../entities/shot.js'
import { snake } from '../entities/snakes.js'
import { spaceman } from '../entities/spacemen.js'
import { swarmer } from '../entities/swarmers.js'

export class PlayState extends BaseState {
	constructor( game ) {
		super( game )

		// Entity Director (new system - coexists with managers during migration)
		this.director = null

		// Entities (stars are shared via game.stars)
		this.ship = null
		this.floaters = null
		this.hud = null

		// State data
		this.wave = 1
		this.lives = 3
		this.score = 0
		this.savedSpacemen = 0

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
		this.savedSpacemen = 0  // Reset for new wave (previous saved count is in score)

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

		// Initialize director with shared refs
		this.director = createDirector()
		this.director.setRefs( {
			ship: this.ship,
			floaters: this.floaters,
			game: this.game,
			director: this.director
		} )

		// Register all entity factories
		this.director.register( [
			// Primary enemies (must be killed to complete wave)
			galaxian,
			defender,
			pod,
			mother,
			bomber,
			fireBomber,
			screamer,
			snake,  // snake controller (isPrimaryEnemy: true)
			// Secondary enemies (spawned, not required for wave)
			swarmer,
			// Non-primary enemies/obstacles
			asteroid,
			mine,
			// Projectiles
			bomb,
			bombJack,
			bullet,
			shot,
			fireBomb,
			// Collectables
			spaceman,
			powerup,
			// Environment
			mushroom,
		] )

		// Spawn all entities for this wave via WaveManager
		this.waveManager = new WaveManager()
		const waveConfig = this.waveManager.spawnWave( this.director, this.wave, this.game.canvas )
		this.waveName = waveConfig.name
		this.waveModifiers = waveConfig.modifiers

		this.ship.spawn( {
			entities: [],
			floaters: this.floaters
		} )

		// Director now owns all entity arrays - no sync needed for snakes

		// Count saved spacemen before they're pruned
		this.director.onBeforePrune = ( reg ) => {
			reg.get( 'spaceman' ).forEach( s => { if ( s.saved ) this.savedSpacemen++ } )
		}

		this.hud = Hud()
		this.hud.init( this.ship, () => this.savedSpacemen, [], this.director )
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
					this.director.spawn( 'asteroid', {} )
					break
				case "KeyQ":
					this.director.spawn( 'galaxian' )
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
					this.director.clearType( 'asteroid' )
					this.director.clearType( 'galaxian' )
					this.director.clearType( 'defender' )
					this.director.clearType( 'mother' )
					this.director.clearType( 'pod' )
					this.director.clearType( 'swarmer' )
					this.director.clearType( 'mine' )
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
					this.savedSpacemen++
					console.log( `Saved spacemen: ${this.savedSpacemen}` )
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
						survivingSpacemen: this.savedSpacemen
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
				survivingSpacemen: this.savedSpacemen
			} )
			return
		}

		// Collision detection - using registry for entity groups
		// Ship weapons (bullets/smartbomb) can hit SHOOTABLE entities
		this.ship.collideWeaponsWithAll( [
			this.director.byGroup( COLLISION.SHOOTABLE )
		] )

		// Ship can crash into DEADLY entities (includes enemy projectiles now in registry)
		// Snake segments are not in registry, so we get them from snake controllers
		const snakeSegments = this.director.get( 'snakeController' ).flatMap( s => s.all() )
		this.ship.crashIntoAll( [
			this.director.byGroup( COLLISION.DEADLY ),
			snakeSegments
		] )

		// Ship can collect COLLECTABLE entities (powerups, spacemen)
		this.ship.collect( this.director.byGroup( COLLISION.COLLECTABLE ) )

		// Update all entities
		this.game.stars.update( dt )
		this.director.updateAll( dt )  // All registry entities in update group order
		this.ship.update( dt )
		this.game.particles.update( dt )
		this.floaters.update( dt )
		this.hud.update( dt )
	}

	draw () {
		drawBackground( this.game.ctx, this.game.canvas )

		// Draw all entities in layer order
		this.game.stars.draw()
		this.director.drawAll()  // All registry entities in layer order
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
		// Wave is complete when all primary enemies are defeated AND
		// all spacemen are saved/dead (game design: must rescue or lose all)
		// 
		// Registry tracks: galaxian, defender, pod, mother, bomber, fireBomber, 
		// snakeController, swarmer (all via registry now)
		const primaryEnemiesDead = this.director.allPrimaryEnemiesDead()
		const spacemenCleared = this.director.count( 'spaceman' ) === 0

		return primaryEnemiesDead && spacemenCleared
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
