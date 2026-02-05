import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "../zap/Entity.js"
import { makeN, randInt, stereoFromScreenX, thingIsOnScreen } from "/zap/zap.js"

import { explode } from "./explosions.js"

// Assets (loaded once, cached)
const assets = loadImages( [
	"images/dart-1.png",
	"images/dart-2.png",
	"images/dart-3.png",
	"images/dart-4.png",
	"images/dart-5.png",
	"images/dart-6.png",
] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

// Bomber Entity
export const screamer = () => { // TODO: find a good screaming sound
	return {
		...createEntity( {
			name: "screamer",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 66,
			height: 66,
			score: 500,
			collider: {
				type: "circle",
				ox: 33,
				oy: 33,
				r: 30,
				colliding: false,
			}
		} ),

		// Bomber-specific properties
		ship: null,
		director: null,
		vx: 0,
		vy: Math.random() * 2 + 20,
		rotation: 8,
		color: "#ffff00",

		spawn ( { director, ship, floaters, x, y, vx, vy } ) {

			this.director = director
			this.ship = ship

			if ( x ) this.x = x
			else this.x = randInt( canvas.width )

			if ( y ) this.y = y
			else this.y = 0

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
			const frame = getFrame( this.ticks, 6, 2 )
			ctx.drawImage( assets.images[ frame ], this.x, this.y, this.width, this.height )
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
				styles: [ "white", "white", "#ff00ff", "#00ffff", "#FFFF00" ],
				size: 12,
			} )
		}
	}
}
