import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, getFrame, loadImages, loadSound } from "./Entity.js"
import { makeN, randInt, stereoFromScreenX, thingIsOnScreen } from "/zap/zap.js"

import { explode } from "./explosions.js"

const assets = loadImages( [ "images/defender1.png", "images/defender2.png", "images/defender3.png" ] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

export const defender = () => {
	return {
		...createEntity( {
			name: "defender",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 48,
			height: 48,
			score: 150,
			collider: {
				type: "circle",
				ox: ( 5.5 + ( 55 / 2 ) ) * 48 / 66,
				oy: ( 6 + ( 55 / 2 ) ) * 48 / 66,
				r: ( ( 55 / 2 ) ) * 48 / 66,
				colliding: false,
			}
		} ),

		// Custom properties
		color: "#06BA01",
		ship: null,
		registry: null,
		vx: ( Math.random() - 0.5 ) * 3,
		vy: Math.random() * 3 + 1,

		spawn ( { ship, registry } ) {
			this.ship = ship
			this.registry = registry
			this.x = randInt( canvas.width )
			this.y = -randInt( canvas.height * 2 )
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant )
		},

		update ( /*dt*/ ) {
			this.tick()
			this.y += this.vy + game.speed + Math.random() * 6 - 3

			// Seek toward ship
			if ( this.x > this.ship.x ) this.vx = -this.vy
			else if ( this.x < this.ship.x ) this.vx = this.vy
			else this.vx = 0

			this.x += this.vx + Math.random() * 6 - 3

			this.syncCollider()
			this.wrapScreen()

			if ( this.ticks % 12 === 0 ) this.fire()
		},

		draw () {
			if ( !assets.loaded() ) return
			const frame = getFrame( this.ticks, 3, 5 )
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
				styles: [ "white", "white", "#FFB301", "#06BA01", "#06BA01" ],
				size: 6,
			} )
		},

		fire () {
			if ( !thingIsOnScreen( this, screen ) || Math.random() > 0.125 ) return
			this.registry.spawn( 'bomb', { atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this } )
		}
	}
}

export const defenders = () => {
	return {
		defenders: [],
		registry: null,

		all () {
			return this.defenders
		},

		spawn ( { ship, registry } ) {
			this.registry = registry
			this.defenders = makeN( defender, 4 )
			this.defenders.forEach( ( x ) => x.spawn( { ship: ship, registry: registry } ) )
		},

		update ( dt ) {
			this.defenders = this.defenders.filter( ( b ) => b.dead !== true )
			this.defenders.forEach( ( x ) => x.update( dt ) )
			// Bombs are now updated via registry.updateType('bomb', dt)
		},

		draw () {
			// Bombs are now drawn via registry.drawType('bomb')
			this.defenders.forEach( ( x ) => x.draw() )
		}
	}
}
