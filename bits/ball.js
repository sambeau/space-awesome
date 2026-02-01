import { canvas, ctx } from "../game/game.js"
import { pick, randInt } from "/zap/zap.js"

import { createEntity } from "../game/entities/Entity.js"

const ball = () => {
	return {
		...createEntity( {
			name: "ball",
			width: 25,
			height: 25,
			collider: { type: "circle", ox: 0, oy: 0, r: 25, colliding: false }
		} ),

		radius: 25,
		color: "white",
		vx: 20,
		vy: 10,

		spawn () {
			this.color = pick( [ "#fff", "#0ff", "#ff0", "#f0f", "#0ff" ] )
			this.x = randInt( canvas.width )
			this.y = randInt( canvas.height )
			this.radius = randInt( randInt( 10 ) + 1 )
			this.vx = randInt( 20 ) + 1
			this.vy = randInt( 20 ) + 1
			this.width = this.radius
			this.height = this.radius
			this.collider.r = this.radius
		},

		update () {
			this.tick()
			this.x += this.vx
			this.y += this.vy

			// Bounce off edges
			if ( this.x > canvas.width - this.width || this.x < this.width ) {
				this.vx = -this.vx
			}
			if ( this.y > canvas.height - this.height || this.y < this.height ) {
				this.vy = -this.vy
			}

			this.syncCollider()
		},

		draw () {
			ctx.beginPath()
			ctx.arc( this.x, this.y, this.radius, 0, Math.PI * 2, true )
			ctx.closePath()
			ctx.fillStyle = this.color
			ctx.fill()
		},
	}
}

export { ball }
