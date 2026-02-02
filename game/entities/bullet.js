import { createEntity, loadImages } from "./Entity.js"

import { LAYER } from "./constants.js"
import { ctx } from "../game.js"

// ─────────────────────────────────────────────────────────────────────────────
// Assets (loaded once, cached)
// ─────────────────────────────────────────────────────────────────────────────
const assets = loadImages( [ "images/bullet-long.png" ] )

// ─────────────────────────────────────────────────────────────────────────────
// Bullet Entity - Player projectile
// ─────────────────────────────────────────────────────────────────────────────
export const bullet = () => {
	return {
		...createEntity( {
			name: "bullet",
			drawLayer: LAYER.PROJECTILES,
			collisionGroups: [],  // bullets hit things, they're not in collision groups themselves
			width: 6,
			height: 70,
			collider: { type: "circle", ox: 3, oy: 5, r: 3, colliding: false }
		} ),

		// Bullet-specific properties
		speed: 20,
		ship: null,

		spawn ( { atx, aty, ship } ) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 3
			this.vy = -this.speed
			this.ship = ship
			this.syncCollider()
		},

		outOfBoundsTop () {
			return this.y <= 0 - this.height
		},

		update ( /*dt*/ ) {
			this.tick()
			this.syncCollider()
			if ( this.outOfBoundsTop() ) {
				this.y = 0
				this.vy = 0
				this.dead = true
				this.ship.removeBullet()
			} else {
				this.y += this.vy
			}
		},

		draw () {
			if ( this.dead ) return
			if ( !assets.loaded() ) return
			ctx.drawImage( assets.images[ 0 ], this.x, this.y, this.width, this.height )
		}
	}
}
