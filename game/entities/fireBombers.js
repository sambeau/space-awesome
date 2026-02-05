import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "../zap/Entity.js"
import { makeN, randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"

// Assets (loaded once, cached)
const assets = loadImages( [
	"images/fireBomber-1.png",
	"images/fireBomber-2.png",
	"images/fireBomber-3.png",
	"images/fireBomber-4.png",
	"images/fireBomber-5.png",
	"images/fireBomber-6.png",
] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )
const fireSound = loadSound( "/sounds/pyeeow.wav", 0.1 ) // TODO: change this for something more firey

const maxFireBombs = 5

// FireBomber Entity
export const fireBomber = () => {
	return {
		...createEntity( {
			name: "fireBomber",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 66,
			height: 67,
			score: 250,
			collider: {
				type: "circle",
				ox: 33,
				oy: 33,
				r: 30,
				colliding: false,
			}
		} ),

		// FireBomber-specific properties
		ship: null,
		vx: ( Math.random() * 10 - 5 ) * 2,
		vy: Math.random() * 2 + 6,
		rotation: 30,
		frames: 6,
		fireBombs: 0,
		maxFireBombs: 4,
		color: "#0000FF",

		spawn ( { director, ship, floaters, x, y, vx, vy } ) {
			this.ship = ship
			this.director = director

			if ( x ) this.x = x
			else this.x = canvas.width / 2

			if ( y ) this.y = y
			else this.y = 0 - canvas.height * 3

			if ( vx ) this.vx = vx
			if ( vy ) this.vy = vy
		},

		update (/*dt*/ ) {
			this.tick()

			if ( this.ticks % 6 === 0 && Math.random() < 0.25 ) this.fire()

			this.x += this.vx
			this.y += this.vy + game.speed

			this.syncCollider()
			this.wrapScreen()
		},

		draw () {
			if ( !assets.loaded() ) return
			const frame = getFrame( this.ticks, this.frames, 3 )
			drawRotated( ctx, this, assets.images[ frame ] )
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
				styles: [ "white", "white", "#ff00ff", "#00ffff", "#FFFF00", "#ff0000", "#00ff00", "#0000ff" ],
				size: 12,
			} )
		},

		fire () {
			console.log( "fire!" )
			if (
				this.director.count( 'fireBomb' ) < maxFireBombs &&
				this.fireBombs < this.maxFireBombs &&
				this.ship.y - this.y < canvas.height * 0.9
			) {
				console.log( "FIRE!" )
				fireSound.play()
				fireSound.stereo( ( this.x - screen.width / 2 ) / screen.width )
				let direction = 1
				if ( this.ship.x < this.x ) direction = -1
				this.director.spawn( 'fireBomb', { atx: this.x + this.width / 2, aty: this.y, shooter: this, direction, vy: this.vy } )
			}
		},
	}
}
