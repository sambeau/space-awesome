import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "./Entity.js"
import { makeN, randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"

// ─────────────────────────────────────────────────────────────────────────────
// Assets (loaded once, cached)
// ─────────────────────────────────────────────────────────────────────────────
const assets = loadImages( [
	"images/fireBomber-1.png",
	"images/fireBomber-2.png",
	"images/fireBomber-3.png",
	"images/fireBomber-4.png",
	"images/fireBomber-5.png",
	"images/fireBomber-6.png",
] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

// ─────────────────────────────────────────────────────────────────────────────
// FireBomber Entity
// ─────────────────────────────────────────────────────────────────────────────
export const fireBomber = () => {
	return {
		...createEntity( {
			name: "fireBomber",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 66,
			height: 67,
			score: 1000,
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

		spawn ( { bombJacks, ship, floaters, x, y, vx, vy } ) {
			if ( x ) this.x = x
			else this.x = canvas.width / 2

			if ( y ) this.y = y
			else this.y = 0 - canvas.height * 3

			if ( vx ) this.vx = vx
			if ( vy ) this.vy = vy
		},

		update (/*dt*/ ) {
			this.tick()
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
		}
	}
}


export const FireBombers = () => {
	return {
		fireBombers: [],
		all () {
			return this.fireBombers
		},
		spawn ( { bombJacks, ship, floaters } ) {
			this.fireBombers = makeN( fireBomber, 10 )
			this.fireBombers.forEach( ( x ) => x.spawn( { bombJacks: null, ship: ship, floaters: floaters } ) )
		},
		update ( dt ) {
			this.fireBombers = this.fireBombers.filter( ( b ) => { return b.dead !== true } )
			this.fireBombers.forEach( ( x ) => x.update( dt ) )
		},
		draw () {
			this.fireBombers.forEach( ( x ) => x.draw() )
		}
	}
}
