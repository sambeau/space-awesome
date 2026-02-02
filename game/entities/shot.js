import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, loadImages } from "./Entity.js"

import { explode } from "./explosions.js"

const debug = false

const { images: [ shotImage ], loaded } = loadImages( [ "images/shot.png" ] )

export const shot = () => {
	return {
		...createEntity( {
			name: "shot",
			drawLayer: LAYER.PROJECTILES,
			collisionGroups: [ COLLISION.DEADLY ],  // enemy shots can kill the player
			width: 6,
			height: 35,
			collider: {
				type: "circle",
				ox: 3,
				oy: 32,
				r: 3,
				area: 5,
				colliding: false
			}
		} ),
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		speed: 10,
		shooter: null,
		dead: false,
		spawn ( { atx, aty, shooter } ) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 4
			this.vy = this.speed
			this.shooter = shooter
			this.shooter.shots++
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
				this.shooter.shots--
				// this.shooter.removeShot()
			} else
				this.y += this.vy + game.speed

			this.syncCollider()
		},
		onHit () {
			this.dead = true
			this.shooter.shots--
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
				ctx.drawImage( shotImage, this.x, this.y, this.width, this.height )
			}
		},
	}
}
