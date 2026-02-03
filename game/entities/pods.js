import { COLLISION, LAYER } from "./constants.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "../zap/Entity.js"
import { ctx, game } from "../game.js"
import { makeN, randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"

// Assets (loaded once, cached)
const assets = loadImages( [
	"images/pod-1.png",
	"images/pod-2.png",
	"images/pod-3.png",
	"images/pod-4.png",
] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

// Pod Entity
export const pod = () => {
	return {
		...createEntity( {
			name: "pod",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 48,
			height: 48,
			score: 1000,
			collider: {
				type: "circle",
				ox: ( 5.5 + ( 55 / 2 ) ) * 32 / 48,
				oy: ( 6 + ( 55 / 2 ) ) * 32 / 48,
				r: ( ( 55 / 2 ) ) * 32 / 48,
				colliding: false,
			}
		} ),

		// Pod-specific properties
		color: "#FF00FF",
		ship: null,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		rotation: Math.random() * 10,

		spawn ( { director, ship, floaters } ) {
			this.director = director
			this.ship = ship
			this.floaters = floaters
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant * 2 )
			this.x = randInt( canvas.width )
			this.y = -randInt( canvas.height * 2 ) - canvas.height * 2
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
			const frame = getFrame( this.ticks, 4, 5 )
			drawRotated( ctx, this, assets.images[ frame ] )
		},

		onHit ( smartbomb ) {
			if ( !smartbomb ) {
				bangSound.play()
				bangSound.stereo( stereoFromScreenX( screen, this.x ) )
			}
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
				styles: [ "white", "white", "#FF00FF", "#FF00FF", "#FFBB00", "#961EFF" ],
				size: 12,
			} )

			// Spawn swarmers
			for ( const offset of [ 5, 0, -5, 10, 0, -10 ] ) {
				this.director.spawn( 'swarmer', {
					ship: this.ship,
					x: this.x + offset,
					y: this.y + offset,
					vx: this.vx + offset,
					vy: this.vy + offset
				} )
			}
		}
	}
}
