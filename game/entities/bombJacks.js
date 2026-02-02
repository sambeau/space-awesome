import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, drawRotated, loadImages, loadSound } from "../zap/Entity.js"
import { picker, stereoFromScreenX } from "../zap/zap.js"

import { explode } from "./explosions.js"

// ASSET LOADING

const bombAssets = loadImages( [
	"images/bomb-jack-1.png",
	"images/bomb-jack-2.png",
	"images/bomb-jack-3.png",
] )

const bombSound = loadSound( "/sounds/bomb.mp3", 0.05 )

// BOMB ENTITY
// Projectiles fired by defenders that track toward the player

const bombWidth = 26
const bombSpeed = 0

export const bombJack = () => {
	return {
		...createEntity( {
			name: "bombJack",
			drawLayer: LAYER.PROJECTILES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: false,
			width: bombWidth,
			height: bombWidth,
			collider: {
				type: "circle",
				ox: bombWidth / 2,
				oy: bombWidth / 2,
				r: bombWidth / 2,
				area: 5,
				colliding: false
			}
		} ),

		speed: bombSpeed,
		bomber: null,
		ship: null,
		images: null,
		rotation: 10,

		spawn ( { ship, atx, aty, bomber } ) {
			this.ship = ship
			this.bomber = bomber
			this.images = picker( bombAssets.images )

			this.x = atx - this.width / 2
			this.y = aty + this.height / 2

			this.bomber.bombs++
			bombSound.play()
			bombSound.stereo( stereoFromScreenX( screen, this.x ) )
		},

		update () {
			this.tick()

			if ( this.y >= canvas.height ) {
				this.y = 0
				this.vy = 0
				this.dead = true
				this.bomber.bombs--
			} else {
				this.y += game.speed
			}

			this.syncCollider()
			bombSound.stereo( stereoFromScreenX( screen, this.x ) )
		},

		onHit () {
			this.dead = true
			this.bomber.bombs--
			bombSound.stop()
			explode( {
				x: this.x + this.collider.ox,
				y: this.y + this.collider.oy,
				styles: [
					"#C546C0",
					"#D8799F",
					"#E49B94",
					"#FFFFFF",
					"#FFFFFF",
					"#FFFFFF",
				],
				size: 4,
			} )
		},

		draw () {
			if ( this.dead ) return
			if ( bombAssets.loaded() ) {
				drawRotated( ctx, this, this.images.any() )
			}
		},
	}
}
