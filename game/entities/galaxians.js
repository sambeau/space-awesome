import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, getFrame, loadImages, loadSound } from "./Entity.js"
import { randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"
import { shot } from "./shot.js"

// ═══════════════════════════════════════════════════════════════════════════
// GALAXIAN ENTITY
// Seeking enemies that track and fire at the player
// ═══════════════════════════════════════════════════════════════════════════

const maxShots = 5

// Preload images for each direction (straight, left, right)
const assetsS = loadImages( [
	"images/galaxian-red-s-1.png",
	"images/galaxian-red-s-2.png",
	"images/galaxian-red-s-3.png",
	"images/galaxian-red-s-4.png"
] )
const assetsL = loadImages( [
	"images/galaxian-red-l-1.png",
	"images/galaxian-red-l-2.png",
	"images/galaxian-red-l-3.png",
	"images/galaxian-red-l-4.png"
] )
const assetsR = loadImages( [
	"images/galaxian-red-r-1.png",
	"images/galaxian-red-r-2.png",
	"images/galaxian-red-r-3.png",
	"images/galaxian-red-r-4.png"
] )

// Preload sounds
const bangSound = loadSound( "/sounds/bang.mp3", 0.25 )
const fireSound = loadSound( "/sounds/pyeeow.wav", 0.1 )

export const galaxian = () => {
	return {
		...createEntity( {
			name: "galaxian",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 56,
			height: 56,
			score: 100,
			collider: {
				type: "circle",
				ox: ( 9.5 + 23.5 ) * 56 / 66,
				oy: ( 11 + 23.5 ) * 56 / 66,
				r: ( 23.5 ) * 56 / 66,
				colliding: false
			}
		} ),

		color: "#FF0000",
		ship: null,
		galaxians: null,
		vx: 0,
		vy: Math.random() * 3 + 3,
		shots: 0,
		maxShots: 4,

		spawn ( { ship, galaxians } ) {
			this.ship = ship
			this.galaxians = galaxians
			this.x = randInt( canvas.width )
			this.y = -randInt( canvas.height * 4 )
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant )
		},

		update () {
			this.tick()
			this.y += this.vy + game.speed

			// Seeking behavior
			if ( Math.abs( this.ship.x - this.x ) < this.vy * 2 ) {
				this.vx = 0
				if ( this.ticks % 12 === 0 ) this.fire()
			} else if ( this.x > this.ship.x ) {
				this.vx = -this.vy
			} else if ( this.x < this.ship.x ) {
				this.vx = this.vy
			} else {
				this.vx = 0
			}

			if ( this.ticks % 6 === 0 && Math.random() < 0.25 ) this.fire()

			this.x += this.vx
			this.syncCollider()
			this.wrapScreen()
		},

		draw () {
			// Choose asset set based on direction
			const assets = Math.sign( this.vx ) === 0 ? assetsS : Math.sign( this.vx ) === -1 ? assetsL : assetsR
			if ( !assets.loaded() ) return

			const frame = getFrame( this.ticks, 4, 8 )
			ctx.drawImage( assets.images[ frame ], this.x, this.y, this.width, this.height )
		},

		fire () {
			if (
				this.galaxians.shots.length < maxShots &&
				this.shots < this.maxShots &&
				this.ship.y - this.y < canvas.height * 0.9
			) {
				fireSound.play()
				fireSound.stereo( ( this.x - screen.width / 2 ) / screen.width )
				const newshot = shot()
				this.galaxians.shots.push( newshot )
				newshot.spawn( { atx: this.x + this.width / 2, aty: this.y, shooter: this } )
			}
		},

		onHit ( smartbomb ) {
			if ( !smartbomb ) {
				bangSound.play()
				bangSound.stereo( stereoFromScreenX( screen, this.x ) )
			}
			this.dead = true
			game.score += this.score
			explode( {
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: [ "white", "white", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#272DFF", "#272DFF", "#DFDF10" ],
				size: 8,
			} )
		}
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// GALAXIANS MANAGER
// Manages collection of galaxian entities and their shots
// ═══════════════════════════════════════════════════════════════════════════

export const galaxians = () => {
	return {
		galaxians: [],
		shots: [],
		noShots: 0,

		all () {
			return this.galaxians
		},

		spawnSingle ( { ship } ) {
			const x = galaxian()
			this.galaxians.push( x )
			x.spawn( { ship: ship, galaxians: this } )
		},

		spawn ( { ship } ) {
			this.spawnSingle( { ship: ship } )
			this.spawnSingle( { ship: ship } )
			this.spawnSingle( { ship: ship } )
			this.spawnSingle( { ship: ship } )
		},

		update ( dt ) {
			this.shots = this.shots.filter( b => b.dead !== true )
			this.galaxians = this.galaxians.filter( b => b.dead !== true )
			this.galaxians.forEach( x => x.update( dt ) )
			this.shots.forEach( s => s.update() )
			this.noShots = this.shots.length
		},

		draw () {
			this.shots.forEach( s => s.draw() )
			this.galaxians.forEach( x => x.draw() )
		}
	}
}

