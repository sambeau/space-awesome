// Main gameplay state - handles collision, updates, rendering, and transitions

import { Snakes, snake } from '../entities/snakes.js'
import { spaceman } from '../entities/spacemen.js'

import { BaseState } from './BaseState.js'
import { COLLISION } from '../entities/constants.js'
import { Floaters } from '../entities/floaters.js'
import { Hud } from '../entities/hud.js'
import { Particles } from '../entities/particles.js'
import { spaceship as Spaceship } from '../entities/ship.js'
import { asteroid } from '../entities/asteroids.js'
import { bomb } from '../entities/bombs.js'
import { bombJack } from '../entities/bombJacks.js'
import { bomber } from '../entities/bombers.js'
import { bullet } from '../entities/bullet.js'
import { createRegistry } from '../entities/Registry.js'
import { defender } from '../entities/defenders.js'
import { drawBackground } from '../rendering.js'
import { fireBomber } from '../entities/fireBombers.js'
import { galaxian } from '../entities/galaxians.js'
import { mine } from '../entities/mines.js'
import { mother } from '../entities/mothers.js'
import { mushroom } from '../entities/mushrooms.js'
import { pod } from '../entities/pods.js'
import { powerup } from '../entities/powerups.js'
import { randInt } from '../zap/zap.js'
import { shot } from '../entities/shot.js'
import { swarmer } from '../entities/swarmers.js'

export class PlayState extends BaseState {
	constructor( game ) {
		super( game )

		// Entity Registry (new system - coexists with managers during migration)
		this.registry = null

		// Entities (stars are shared via game.stars)
		this.ship = null
		this.floaters = null
		this.snakes = null
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

		// Initialize registry with shared refs
		this.registry = createRegistry()
		this.registry.setRefs( {
			ship: this.ship,
			floaters: this.floaters,
			game: this.game,
			registry: this.registry
		} )

		// Register all entity factories
		this.registry.register( [
			// Primary enemies (must be killed to complete wave)
			galaxian,
			defender,
			pod,
			mother,
			bomber,
			fireBomber,
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
			// Collectables
			spaceman,
			powerup,
			// Environment
			mushroom,
		] )

		// Spawn initial asteroids via registry
		this.registry.spawn( 'asteroid', { size: 'L' } )
		this.registry.spawn( 'asteroid', { size: 'L' } )
		this.registry.spawn( 'asteroid', { size: 'L' } )

		// Spawn mine via registry
		this.registry.spawn( 'mine' )

		// Spawn mother via registry (1 mother)
		this.registry.spawn( 'mother' )

		// Spawn spacemen via registry (11 spacemen with various y positions)
		const ch = this.game.canvas.height
		this.registry.spawn( 'spaceman', { y: randInt( ch * 4 ) + ch * 3 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 3 ) + ch * 2 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 3 ) + ch * 1 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 2 ) + ch * 1 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 4 ) + ch * 3 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 3 ) + ch * 2 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 3 ) + ch * 1 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 2 ) + ch * 1 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 2 ) } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 2 ) + ch * 4 } )
		this.registry.spawn( 'spaceman', { y: randInt( ch * 2 ) + ch * 4 } )

		// Swarmers are spawned by pods via registry - no initial spawns needed

		// Spawn pods via registry (2 pods)
		this.registry.spawn( 'pod' )
		this.registry.spawn( 'pod' )

		// Spawn bombers via registry (10 bombers)
		for ( let i = 0; i < 10; i++ ) this.registry.spawn( 'bomber' )

		// Spawn fireBombers via registry (10 fireBombers)
		for ( let i = 0; i < 10; i++ ) this.registry.spawn( 'fireBomber' )

		// Spawn defenders via registry (4 defenders)
		for ( let i = 0; i < 4; i++ ) this.registry.spawn( 'defender' )

		// Spawn galaxians via registry (4 galaxians)
		for ( let i = 0; i < 4; i++ ) this.registry.spawn( 'galaxian' )

		this.snakes = Snakes()
		this.snakes.spawn( { ship: this.ship, floaters: this.floaters, registry: this.registry } )

		// Spawn powerups via registry (7 powerups with various types/positions)
		const ch = this.game.canvas.height
		this.registry.spawn( 'powerup', { type: 'bullet', y: randInt( ch * 4 ) + ch * 3 } )
		this.registry.spawn( 'powerup', { type: 'bullet', y: randInt( ch * 3 ) + ch * 2 } )
		this.registry.spawn( 'powerup', { type: 'life', y: randInt( ch * 3 ) + ch * 1 } )
		this.registry.spawn( 'powerup', { type: 'smart', y: randInt( ch * 2 ) + ch * 1 } )
		this.registry.spawn( 'powerup', { type: 'shield', y: randInt( ch * 2 ) } )
		this.registry.spawn( 'powerup', { type: 'shield', y: randInt( ch * 2 ) + ch * 4 } )
		this.registry.spawn( 'powerup', { type: 'shield', y: randInt( ch * 2 ) + ch * 4 } )

		this.ship.spawn( {
			entities: [
				// Is order important?
				this.snakes,
			],
			floaters: this.floaters
		} )

		// Sync manager entity arrays with registry for unified tracking
		// This allows using registry.allPrimaryEnemiesDead() etc.
		this.registry.sync( 'snakeController', this.snakes.snakes )

		this.hud = Hud()
		this.hud.init( this.ship, () => this.savedSpacemen, [
			// Is order important?
			this.snakes,
		], this.registry )
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
					this.registry.spawn( 'asteroid', {} )
					break
				case "KeyQ":
					this.registry.spawn( 'galaxian' )
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
					this.registry.clearType( 'asteroid' )
					this.registry.clearType( 'galaxian' )
					this.registry.clearType( 'defender' )
					this.registry.clearType( 'mother' )
					this.registry.clearType( 'pod' )
					this.registry.clearType( 'swarmer' )
					this.registry.clearType( 'mine' )
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
			this.registry.byGroup( COLLISION.SHOOTABLE )
		] )

		// Ship can crash into DEADLY entities (includes enemy projectiles now in registry)
		this.ship.crashIntoAll( [
			this.registry.byGroup( COLLISION.DEADLY ),
			this.snakes.all()
		] )

		// Ship can collect COLLECTABLE entities (powerups, spacemen)
		this.ship.collect( this.registry.byGroup( COLLISION.COLLECTABLE ) )

		// Update all entities
		// Order is important, by groups
		// e.g. you can't update the hud until all the baddies have been moved
		// UPDATE_GROUP_POWERUPS
		this.registry.updateType( 'powerup', dt )
		// UPDATE_GROUP_STARS
		// stars can be moved any time, surey
		this.game.stars.update( dt )
		// UPDATE_GROUP_BADDIES
		// Is order important here?
		// i.e. do spacemen have to move before snakes?
		this.registry.updateType( 'asteroid', dt )
		this.registry.updateType( 'mine', dt )
		// Track saved spacemen before update prunes them
		this.registry.get( 'spaceman' ).forEach( s => { if ( s.saved ) this.savedSpacemen++ } )
		this.registry.updateType( 'spaceman', dt )
		this.registry.updateType( 'mother', dt )
		this.registry.updateType( 'bomber', dt )
		this.registry.updateType( 'fireBomber', dt )
		this.registry.updateType( 'pod', dt )
		this.registry.updateType( 'swarmer', dt )  // Swarmers spawned from pods
		this.registry.updateType( 'mushroom', dt )
		this.registry.updateType( 'defender', dt )
		this.registry.updateType( 'galaxian', dt )
		this.registry.updateType( 'shot', dt )  // Galaxian shots
		this.registry.updateType( 'bomb', dt )  // Defender/Mother/Swarmer bombs
		this.registry.updateType( 'bombJack', dt )  // Bomber bombs
		this.snakes.update( dt )
		// UPDATE_SHIP
		this.ship.update( dt )
		// UPDATE_PARTICLES
		this.game.particles.update( dt )
		this.floaters.update( dt )
		// UPDATE_UI
		this.hud.update( dt )
	}

	draw () {
		drawBackground( this.game.ctx, this.game.canvas )

		// Draw all entities
		// order is important here as some entities need to be drawn over others, e.g.:-
		// background is always drawn first
		// - Floaters always float over other entities
		// - Explosions always cover other entities
		// - UI is always drawn last
		// - etc.

		// DRAW_LAYER_BACKGROUND
		this.game.stars.draw()
		// DRAW_LAYER_ENVIRONMENT
		// Not used yet
		// DRAW_LAYER_DETRITUS
		this.registry.drawType( 'mushroom' )
		// DRAW_LAYER_BADDIES
		this.snakes.draw()
		this.registry.drawType( 'asteroid' )
		this.registry.drawType( 'mine' )
		this.registry.drawType( 'spaceman' )
		this.registry.drawType( 'mother' )
		this.registry.drawType( 'bomber' )
		this.registry.drawType( 'fireBomber' )
		this.registry.drawType( 'pod' )
		this.registry.drawType( 'swarmer' )  // Swarmers spawned from pods
		this.registry.drawType( 'defender' )
		this.registry.drawType( 'galaxian' )
		this.registry.drawType( 'shot' )  // Galaxian shots
		this.registry.drawType( 'bomb' )  // Defender/Mother/Swarmer bombs
		this.registry.drawType( 'bombJack' )  // Bomber bombs
		// DRAW_LAYER_POWERUPS
		this.registry.drawType( 'powerup' )
		// DRAW_LAYER_SHIP
		this.ship.draw()
		// DRAW_LAYER_PARTICLES
		this.game.particles.draw()
		// DRAW_LAYER_FLOATERS
		this.floaters.draw()
		// DRAW_LAYER_UI
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
		const primaryEnemiesDead = this.registry.allPrimaryEnemiesDead()
		const spacemenCleared = this.registry.count( 'spaceman' ) === 0

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
