import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, getFrame, loadImages } from "../zap/Entity.js"

import { explode } from "./explosions.js"

const debug = false

const { images: fireBombImages, loaded } = loadImages( [
	"images/firebomb-1.png",
	"images/firebomb-2.png",
	"images/firebomb-3.png",
	"images/firebomb-4.png",
	"images/firebomb-5.png",
	"images/firebomb-6.png",
	"images/firebomb-7.png",
	"images/firebomb-8.png",
] )

export const fireBomb = () => {
	return {
		...createEntity( {
			name: "fireBomb",
			drawLayer: LAYER.PROJECTILES,
			collisionGroups: [ COLLISION.DEADLY ],  // enemy fireBombs can kill the player
			width: 40,
			height: 33,
			collider: {
				type: "rect",
				ox: 2,
				oy: 2,
				w: 38,
				h: 41,
				area: 5,
				colliding: false
			}
		} ),
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		speed: 20,
		shooter: null,
		dead: false,
		direction: 1,
		spawn ( { atx, aty, shooter, direction, vy } ) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 4
			this.vx = this.speed
			this.vy = vy
			this.shooter = shooter
			this.shooter.fireBombs++
			this.direction = direction
		},
		outOfBounds () {
			if ( this.y >= canvas.height ) return true
			if ( this.y < 0 ) return true

			if ( this.x >= canvas.width ) return true
			if ( this.x < 0 ) return true

			return false
		},
		update ( /*dt*/ ) {
			this.tick()
			if ( this.outOfBounds() ) {
				this.y = 0
				this.vy = 0
				this.dead = true
				this.shooter.fireBombs--
				// this.shooter.removeShot()
			} else {
				this.y += this.vy + game.speed
				this.x += this.vx * this.direction
			}
			this.syncCollider()
		},
		onHit () {
			this.dead = true
			this.shooter.fireBombs--
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
			if ( loaded() ) {
				const frame = getFrame( this.ticks, 8, 5 )
				ctx.drawImage( fireBombImages[ frame ], this.x, this.y, this.width, this.height )
			}
		},
	}
}
