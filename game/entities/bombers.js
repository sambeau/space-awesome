import { COLLISION, LAYER } from "./constants.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "./Entity.js"
import { makeN, stereoFromScreenX, thingIsOnScreen } from "/zap/zap.js"

import { explode } from "./explosions.js"

// ─────────────────────────────────────────────────────────────────────────────
// Assets (loaded once, cached)
// ─────────────────────────────────────────────────────────────────────────────
const assets = loadImages( [
	"images/bomber-1.png",
	"images/bomber-2.png",
	"images/bomber-3.png",
] )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

// ─────────────────────────────────────────────────────────────────────────────
// Bomber Entity
// ─────────────────────────────────────────────────────────────────────────────
export const bomber = () => {
	return {
		...createEntity( {
			name: "bomber",
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

		// Bomber-specific properties
		ship: null,
		registry: null,
		vx: ( Math.random() * 3 - 1.5 ) * 2,
		vy: Math.random() * 2 + 6,
		rotation: 8,

		spawn ( { registry, ship, floaters, x, y, vx, vy } ) {

			this.registry = registry
			this.ship = ship

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
			if ( this.ticks % 12 === 0 ) this.fire()
		},

		draw () {
			if ( !assets.loaded() ) return
			const frame = getFrame( this.ticks, 3, 8 )
			drawRotated( ctx, { ...this, rotation: -this.rotation, x: this.x + 10, y: this.y - 10 }, assets.images[ 2 - frame ] )
			drawRotated( ctx, this, assets.images[ frame ] )
		},

		fire () {
			if ( !thingIsOnScreen( this, screen ) || Math.random() > 0.15 ) return
			this.registry.spawn( 'bombJack', { atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this } )
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


export const Bombers = () => {
	return {
		bombers: [],
		registry: null,
		all () {
			return this.bombers
		},
		spawn ( { registry, ship, floaters } ) {
			this.registry = registry
			this.bombers = makeN( bomber, 10 )
			this.bombers.forEach( ( x ) => x.spawn( { registry: registry, ship: ship, floaters: floaters } ) )
		},
		update ( dt ) {
			this.bombers = this.bombers.filter( ( b ) => { return b.dead !== true } )
			this.bombers.forEach( ( x ) => x.update( dt ) )
			// Bombs are now updated via registry.updateType('bombJack', dt)
		},
		draw () {
			// Bombs are now drawn via registry.drawType('bombJack')
			this.bombers.forEach( ( x ) => x.draw() )
		}
	}
}
