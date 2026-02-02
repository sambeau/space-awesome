import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, loadImages, loadSound } from "./Entity.js"
import { distanceBetweenPoints, picker, randInt, stereoFromScreenX, thingIsOnScreen } from "/zap/zap.js"

import { bomb } from "./bombs.js"
import { explode } from "./explosions.js"

// ─────────────────────────────────────────────────────────────────────────────
// Assets (loaded once, cached)
// ─────────────────────────────────────────────────────────────────────────────
const assets = loadImages( [ "images/swarmer-1.png", "images/swarmer-2.png" ] )
const swarmerSound = loadSound( '/sounds/swarmer.mp3', 0.10 )
const swarmerClassicSound = loadSound( '/sounds/swarmer2.mp3', 0.05 )
const bangSound = loadSound( '/sounds/bang.mp3', 0.10 )

// ─────────────────────────────────────────────────────────────────────────────
// Swarmer Entity
// ─────────────────────────────────────────────────────────────────────────────
export const swarmer = () => {
	return {
		...createEntity( {
			name: "swarmer",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,  // Swarmers must be killed for wave completion
			width: 41 / 2,
			height: 33 / 2,
			score: 150,
			collider: {
				type: "circle",
				ox: ( -2 + ( 45 / 2 ) ) / 2,
				oy: ( -5 + ( 45 / 2 ) ) / 2,
				r: ( ( 45 / 2 ) ) / 2,
				colliding: false,
			}
		} ),

		// Swarmer-specific properties
		color: "#FF0000",
		ship: null,
		vy: 2,
		image: null,
		images: null,
		closestDistance: 0,

		spawn ( { swarmers, ship, x, y, vx, vy } ) {
			swarmerSound.play()
			swarmerSound.stereo( stereoFromScreenX( screen, this.x ) )
			swarmerClassicSound.play()
			swarmerClassicSound.stereo( stereoFromScreenX( screen, this.x ) )

			this.swarmers = swarmers
			this.ship = ship

			this.x = x ?? randInt( canvas.width )
			this.y = y ?? -randInt( canvas.height )
			this.vx = vx ?? Math.random() - 0.5
			this.vy = vy ?? Math.random() * 3

			this.syncCollider()
			this.collider.area = 1

			this.images = picker( assets.images )
			this.image = this.images.first()
		},

		update (/*dt*/ ) {
			this.tick()
			this.flock()
			this.x += this.vx
			this.y += this.vy + game.speed
			this.syncCollider()
			this.wrapScreen()

			if ( this.ticks % 12 === 0 ) this.fire()
			if ( this.ticks % 5 === 0 ) this.image = this.images.next()
		},

		draw () {
			if ( !assets.loaded() ) return
			ctx.drawImage( this.image, this.x, this.y, this.width, this.height )
		},

		flock () {
			const cohesion = 0.03

			// Start with ship as the default targets
			let closest1 = this.ship
			let closest2 = this.ship
			let dist1 = distanceBetweenPoints( this.x, this.y, this.ship.x, this.ship.y )
			let dist2 = dist1

			// Find the two closest swarmers (or ship)
			for ( const other of this.swarmers.swarmers ) {
				if ( other === this ) continue
				const d = distanceBetweenPoints( this.x, this.y, other.x, other.y )
				if ( d === 0 ) continue

				if ( dist1 !== 0 && d < dist1 ) {
					dist2 = dist1
					closest2 = closest1
					dist1 = d
					closest1 = other
				} else if ( d < dist2 ) {
					dist2 = d
					closest2 = other
				}
			}

			// Move towards the midpoint of closest two
			if ( closest1 && closest2 ) {
				const midX = ( closest1.x + closest2.x ) / 2
				const midY = ( closest1.y + closest2.y ) / 2
				this.vx += ( midX - this.x ) * cohesion
				this.vy += ( midY - this.y ) * cohesion

				// Separation: push away if too close
				const minDist = ( this.width + closest2.width ) / 2 + 5
				if ( dist1 < minDist ) {
					this.vx += ( this.x - closest1.x ) * cohesion
					this.vy += ( this.y - closest1.y ) * cohesion
				}
			}

			// Clamp velocities
			if ( this.vx > 3 ) this.vx = 6.6
			if ( this.vx < -3 ) this.vx = -6.6
			if ( this.vy > 1 ) this.vy = 2.6
			if ( this.vy < -1 ) this.vy = -2.6
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
				styles: [ "white", "#FE0600", "#00BE00" ],
				size: 6,
			} )
		},

		fire () {
			if ( !thingIsOnScreen( this, screen ) || Math.random() > 0.15 ) return
			const newbomb = bomb()
			this.swarmers.bombs.push( newbomb )
			newbomb.spawn( { atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this } )
		}
	}
}


export const Swarmers = () => {
	return {
		swarmers: [],
		bombs: [], // move to manager so it can be seen by ship
		all () {
			return this.swarmers
		},
		spawnSingle ( { ship, x, y, vx, vy } ) {
			let a = swarmer()
			this.swarmers.push( a )
			a.spawn( { swarmers: this, ship: ship, x: x, y: y, vx: vx, vy: vy } )
		},
		spawn () {
			// this.spawnSingle({})
		},
		update ( dt ) {
			this.bombs = this.bombs.filter( ( b ) => { return b.dead !== true } )

			this.swarmers = this.swarmers.filter( ( b ) => { return b.dead !== true } )
			this.swarmers.forEach( ( x ) => x.update( dt ) )

			this.bombs.forEach( ( s ) => s.update() )
			this.noBombs = this.bombs.length

		},
		draw () {
			this.bombs.forEach( ( s ) => s.draw() )

			this.swarmers.forEach( ( x ) => x.draw() )
		}
	}
}
