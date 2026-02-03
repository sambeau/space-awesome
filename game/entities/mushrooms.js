import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, loadImages, loadSound } from "../zap/Entity.js"

import { explode } from "./explosions.js"
import { stereoFromScreenX } from "/zap/zap.js"

// Assets (loaded once, cached)
const mushroomAssets = {
	white: loadImages( [
		"images/mushroom-white-1.png",
		"images/mushroom-white-2.png",
		"images/mushroom-white-3.png",
		"images/mushroom-white-4.png",
	] ),
	black: loadImages( [
		"images/mushroom-black-1.png",
		"images/mushroom-black-2.png",
		"images/mushroom-black-3.png",
		"images/mushroom-black-4.png",
	] ),
	yellow: loadImages( [
		"images/mushroom-yellow-1.png",
		"images/mushroom-yellow-2.png",
		"images/mushroom-yellow-3.png",
		"images/mushroom-yellow-4.png",
	] ),
}
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

// Mushroom configuration
const explodeColors = {
	'white': [ "#ffffff", "#ffffff", "#00ffff", "#00ffff", "#ffffff" ],
	'black': [ "#ffffff", "#310933", "#FFFF00", "#FFFF00", "#ffffff" ],
	'yellow': [ "#ffffff", "#ffffff", "#ffff00", "#ffff00", "#7C6877" ],
}

const hudColor = {
	'white': "#ffffff",
	'black': "#FFFF00",
	'yellow': "#ffff00",
}

// Full collider (all 3 circles)
const fullCollider = [
	{ type: "circle", ox: 10, oy: 10, r: 10 },
	{ type: "circle", ox: 30, oy: 10, r: 10 },
	{ type: "circle", ox: 20, oy: 30, r: 10 },
]

// Half collider (top 2 circles only)
const halfCollider = [
	{ type: "circle", ox: 10, oy: 10, r: 10 },
	{ type: "circle", ox: 30, oy: 10, r: 10 },
]

// Mushroom Entity
export const mushroom = () => {
	// Create fresh colliders for each mushroom instance
	const myCollider = [
		{ type: "circle", ox: 10, oy: 10, r: 10 },
		{ type: "circle", ox: 30, oy: 10, r: 10 },
		{ type: "circle", ox: 20, oy: 30, r: 10 },
	]
	const myHalfCollider = [
		{ type: "circle", ox: 10, oy: 10, r: 10 },
		{ type: "circle", ox: 30, oy: 10, r: 10 },
	]

	return {
		...createEntity( {
			name: "mushroom",
			drawLayer: LAYER.DETRITUS,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: false,
			width: 40,
			height: 40,
			score: 50,
			collider: myCollider,
		} ),

		// Mushroom-specific properties
		color: "#ffffff",
		type: 'yellow',
		HP: 4,
		halfCollider: myHalfCollider,

		spawn ( { cx, cy, type } ) {
			this.x = cx - this.width / 2
			this.y = cy - this.height / 2
			this.type = type
			this.color = hudColor[ type ]
			this.collider.forEach( ( c ) => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
				c.area = Math.round( Math.PI * c.r * c.r / game.massConstant )
			} )
		},

		update (/*dt*/ ) {
			this.tick()
			this.y += game.speed
			this.syncCollider()

			if ( this.outOfBoundsV() ) {
				this.y = 0 - canvas.height * 3
			}
		},

		draw () {
			const assets = mushroomAssets[ this.type ]
			if ( !assets.loaded() ) return
			// HP goes from 4 to 1, images indexed 0-3, so use (4 - HP)
			ctx.drawImage( assets.images[ 4 - this.HP ], this.x, this.y, this.width, this.height )
		},

		onHit ( smartbomb, crash ) {
			if ( !smartbomb ) {
				bangSound.play()
				bangSound.stereo( stereoFromScreenX( screen, this.x ) )
			}

			this.HP -= 1

			if ( this.HP == 0 || crash ) {
				this.dead = true
				game.score += this.score
			} else {
				// Switch to half collider when damaged
				if ( this.collider !== this.halfCollider ) {
					this.collider = this.halfCollider
					this.collider.forEach( ( c ) => {
						c.x = this.x + c.ox
						c.y = this.y + c.oy
						c.area = Math.round( Math.PI * c.r * c.r / game.massConstant )
					} )
				}
			}

			explode( {
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: explodeColors[ this.type ],
				size: 6,
			} )
		}
	}
}
