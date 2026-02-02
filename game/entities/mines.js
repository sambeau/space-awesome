import { COLLISION, LAYER } from "./Registry.js"
import { createEntity, getFrame, loadImages, loadSound } from "./Entity.js"
import { ctx, game } from "../game.js"
import { picker, randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"

// ═══════════════════════════════════════════════════════════════════════════
// ASSET LOADING
// ═══════════════════════════════════════════════════════════════════════════

const mineAssets = loadImages( [
	"images/mine-1.png",
	"images/mine-2.png",
	"images/mine-3.png",
	"images/mine-4.png",
	"images/mine-5.png",
	"images/mine-6.png",
	"images/mine-7.png",
	"images/mine-8.png",
	"images/mine-9.png",
] )

const bigBoomSound = loadSound( "/sounds/impact.mp3", 0.25 )

// ═══════════════════════════════════════════════════════════════════════════
// COLLIDERS - one per animation frame
// ═══════════════════════════════════════════════════════════════════════════

const colliders = [
	{ type: "circle", ox: 87.0384944, oy: 88, r: 86.5384944, colliding: false },
	{ type: "circle", ox: 87.9615056, oy: 88, r: 77.884645, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 70.0961805, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 63.0865624, colliding: false },
	{ type: "circle", ox: 87.5179268, oy: 88, r: 56.7779062, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 51.1001156, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 45.990104, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 45.990104, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 42.3671638, colliding: false },
]

// Build mine states array combining images with colliders
const mineStates = mineAssets.images.map( ( image, i ) => ( {
	image,
	collider: colliders[ i ]
} ) )

// ═══════════════════════════════════════════════════════════════════════════
// MINE ENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const mine = () => {
	return {
		...createEntity( {
			name: "mine",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: false,  // Obstacle, not required for wave completion
			width: 175,
			height: 176,
			score: 1500,
		} ),

		// Mine-specific properties
		ship: null,
		floaters: null,
		image: null,
		states: null,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		animationSpeed: 3,
		rotation: 10,
		sulking: false,
		color: "black",
		immuneToCrash: true,

		spawn ( { floaters, ship, x, y, vx, vy } ) {
			this.floaters = floaters
			this.ship = ship
			this.states = picker( mineStates, { start: 7, end: 7 } )
			this.image = ( this.states.first() ).image
			this.collider = { ...( this.states.first() ).collider }
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant )

			if ( x ) this.x = x
			else this.x = canvas.width - ( randInt( canvas.width ) * randInt( canvas.width ) / 2 )

			if ( y ) this.y = y
			else this.y = 0 - randInt( canvas.height * 2 ) + canvas.height * 2

			if ( vx ) this.vx = vx
			if ( vy ) this.vy = vy

			this.syncCollider()
		},

		update ( /*dt*/ ) {
			this.tick()

			// Animate on tick boundary
			if ( getFrame( this.ticks, this.animationSpeed ) !== getFrame( this.ticks - 1, this.animationSpeed ) ) {
				this.animate()
			}

			if ( this.sulking ) this.seekShip()

			this.y += this.vy + game.speed
			this.x += this.vx

			this.syncCollider()
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant )

			this.wrapScreen()
		},

		draw () {
			if ( !mineAssets.loaded() ) return

			const offscreen = document.createElement( "canvas" )
			offscreen.width = this.width
			offscreen.height = this.height
			const icon = offscreen.getContext( "2d" )

			icon.translate( this.width / 2, this.height / 2 )
			icon.rotate( ( ( this.ticks / 1000 ) * this.rotation ) * Math.PI * 2 )
			icon.translate( -this.width / 2, -this.height / 2 )

			icon.drawImage( this.image, 0, 0, this.width, this.height )

			ctx.drawImage( offscreen, this.x, this.y, this.width, this.height )
		},

		animate () {
			if ( this.sulking ) {
				this.image = ( this.states.bounceHold() ).image
				this.collider = { ...( this.states.bounceHold() ).collider }
			} else {
				this.image = ( this.states.first() ).image
				this.collider = { ...( this.states.first() ).collider }
			}
		},

		seekShip () {
			const cohesion = 0.0015
			this.vx -= ( this.x - this.ship.x ) * cohesion
			this.vy -= ( this.y - this.ship.y ) * cohesion
			if ( this.vx > 3 ) this.vx = 3
			if ( this.vx < -3 ) this.vx = -3
			if ( this.vy > 1 ) this.vy = 1
			if ( this.vy < -1 ) this.vy = -1
		},

		onHit ( smart ) {
			this.sulking = true
			if ( smart ) {
				bigBoomSound.play()
				bigBoomSound.stereo( stereoFromScreenX( screen, this.x ) )

				this.dead = true
				game.score += this.score
				this.floaters.spawnSingle( {
					cx: this.x + this.width / 2,
					cy: this.y + this.height / 2,
					type: this.score
				} )
				explode( {
					x: this.x + this.width / 2,
					y: this.y + this.height / 2,
					styles: [ "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF" ],
					size: 25,
				} )
				explode( {
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 - 40,
					styles: [ "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF" ],
					size: 10,
				} )
				explode( {
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 + 40,
					styles: [ "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF" ],
					size: 10,
				} )
				explode( {
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 - 40,
					styles: [ "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF" ],
					size: 10,
				} )
			}
		}
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// MINES MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export const Mines = () => {
	return {
		mines: [],

		all () {
			return this.mines
		},

		spawnSingle ( { floaters, ship, x, y, vx, vy } ) {
			const a = mine()
			this.mines.push( a )
			a.spawn( { floaters, ship, x, y, vx, vy } )
		},

		spawn ( { ship, floaters } ) {
			this.spawnSingle( { ship, floaters } )
		},

		update ( dt ) {
			this.mines = this.mines.filter( x => x.dead !== true )
			this.mines.forEach( x => x.update( dt ) )
		},

		draw () {
			this.mines.forEach( x => x.draw() )
		}
	}
}
