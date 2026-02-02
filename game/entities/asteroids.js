import { COLLISION, LAYER } from "./constants.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "./Entity.js"
import { ctx, game } from "../game.js"
import { distanceBetweenPoints, randInt, stereoFromScreenX } from "/zap/zap.js"

import { explode } from "./explosions.js"

// ═══════════════════════════════════════════════════════════════════════════
// ASSETS
// ═══════════════════════════════════════════════════════════════════════════

const assets = {
	S: loadImages( [
		"images/asteroid-S-1.png",
		"images/asteroid-S-2.png",
		"images/asteroid-S-3.png",
	] ),
	M: loadImages( [
		"images/asteroid-M-1.png",
		"images/asteroid-M-2.png",
		"images/asteroid-M-3.png",
	] ),
	L: loadImages( [
		"images/asteroid-L-1.png",
		"images/asteroid-L-2.png",
		"images/asteroid-L-3.png",
	] ),
}

const killSound = loadSound( "/sounds/kill.mp3", 0.2 )
const asteroidLSound = loadSound( "/sounds/asteroidL.mp3", 0.25 )
const asteroidMSound = loadSound( "/sounds/asteroidM.mp3", 0.25 )
const asteroidSSound = loadSound( "/sounds/asteroidS.mp3", 0.25 )

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const colliders = {
	S: { type: "circle", ox: 26 / 2 + 20, oy: 26 / 2 + 20.5, r: 26 / 2, colliding: false },
	M: { type: "circle", ox: 40.43 / 2 + 11.5, oy: 40.43 / 2 + 12, r: 43 / 2, colliding: false },
	L: { type: "circle", ox: 60 / 2 + 3, oy: 60 / 2 + 3, r: 60 / 2, colliding: false },
}

const scores = {
	S: 100,
	M: 50,
	L: 20,
}

// ═══════════════════════════════════════════════════════════════════════════
// ASTEROID ENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const asteroid = () => {
	return {
		...createEntity( {
			name: "asteroid",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			width: 64,
			height: 64,
			score: 100,
			collider: null, // Set dynamically in spawn() based on size
		} ),

		// Custom properties
		color: "#00ffff",
		asteroids: null,
		vx: Math.random() - 0.25,
		vy: Math.random() * 2,
		rotation: Math.random() * 10,
		size: "L",
		closestDistance: 0,

		spawn ( { registry, size, x, y, vx, vy } ) {
			this.registry = registry

			if ( size ) this.size = size
			this.score = scores[ this.size ]
			this.collider = { ...colliders[ this.size ] }
			this.collider.area = Math.round( Math.PI * this.collider.r * this.collider.r / game.massConstant )

			if ( x !== undefined ) this.x = x
			else this.x = randInt( canvas.width )

			if ( y !== undefined ) this.y = y
			else this.y = 0 - randInt( canvas.height * 4 )

			if ( vx !== undefined ) this.vx = vx
			if ( vy !== undefined ) this.vy = vy

			this.syncCollider()
		},

		update ( /*dt*/ ) {
			this.tick()
			this.flock()

			this.x += this.vx
			this.y += this.vy + game.speed

			this.syncCollider()
			this.wrapScreen()
		},

		draw () {
			if ( !assets[ this.size ].loaded() ) return

			const frame = getFrame( this.ticks, 3, 16 )
			drawRotated( ctx, this, assets[ this.size ].images[ frame ] )
		},

		flock () {
			const cohesion = 0.0015

			let closestAsteroid1 = null
			let closestAsteroid2 = null
			let closestDistance1 = Number.MAX_VALUE
			let closestDistance2 = Number.MAX_VALUE

			const asteroids = this.registry ? this.registry.get( 'asteroid' ) : []
			asteroids.forEach( ( a ) => {
				if ( a === this ) return

				const d = distanceBetweenPoints( this.x, this.y, a.x, a.y )
				if ( d === 0 ) return

				if ( closestDistance1 !== 0 && d < closestDistance1 ) {
					closestDistance2 = closestDistance1
					closestAsteroid2 = closestAsteroid1
					closestDistance1 = d
					closestAsteroid1 = a
				} else if ( d < closestDistance2 ) {
					closestDistance2 = d
					closestAsteroid2 = a
				}
			} )

			if ( closestAsteroid1 !== null && closestAsteroid2 !== null ) {
				this.vx += ( ( closestAsteroid1.x + closestAsteroid2.x ) / 2 - this.x ) * cohesion
				this.vy += ( ( closestAsteroid1.y + closestAsteroid2.y ) / 2 - this.y ) * cohesion

				if ( closestDistance1 < ( this.width + closestAsteroid2.width ) / 2 ) {
					this.vx += ( this.x - closestAsteroid1.x ) * cohesion
					this.vy += ( this.y - closestAsteroid1.y ) * cohesion
				}
			}

			// Clamp velocities
			if ( this.vx > 3 ) this.vx = 3
			if ( this.vx < -3 ) this.vx = -3
			if ( this.vy > 1 ) this.vy = 1
			if ( this.vy < -1 ) this.vy = -1
		},

		onHit ( smartbomb ) {
			if ( !smartbomb ) {
				killSound.play()
				killSound.stereo( stereoFromScreenX( screen, this.x ) )
			}

			this.dead = true
			game.score += this.score

			let explosionSize = 0

			switch ( this.size ) {
				case "L":
					asteroidLSound.play()
					asteroidLSound.stereo( stereoFromScreenX( screen, this.x ) )
					explosionSize = 11

					this.registry.spawn( 'asteroid', {
						size: "M",
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 2,
					} )
					this.registry.spawn( 'asteroid', {
						size: "M",
						x: this.x,
						y: this.y,
						vx: Math.random() + 2,
						vy: this.vy + 2,
					} )
					this.registry.spawn( 'asteroid', {
						size: "M",
						x: this.x,
						y: this.y,
						vx: Math.random() + 2,
						vy: this.vy + 2,
					} )
					this.registry.spawn( 'asteroid', {
						size: "M",
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 3,
					} )
					break

				case "M":
					asteroidMSound.play()
					asteroidMSound.stereo( stereoFromScreenX( screen, this.x ) )
					explosionSize = 7

					this.registry.spawn( 'asteroid', {
						size: "S",
						x: this.x,
						y: this.y,
						vx: Math.random() + 2,
						vy: this.vy + 2,
					} )
					this.registry.spawn( 'asteroid', {
						size: "S",
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 2,
					} )
					this.registry.spawn( 'asteroid', {
						size: "S",
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 3,
					} )
					break


				case "S":
					asteroidSSound.play()
					asteroidSSound.stereo( stereoFromScreenX( screen, this.x ) )
					explosionSize = 5
					break
			}

			explode( {
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: [ "white", "white", "#FFFF00", "#00FFFF", "#FF00FF" ],
				size: explosionSize,
			} )
		},
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// ASTEROIDS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════

export const asteroids = () => {
	return {
		asteroids: [],

		all () {
			return this.asteroids
		},

		spawnSingle ( { size, x, y, vx, vy } ) {
			const a = asteroid()
			this.asteroids.push( a )
			a.spawn( { asteroids: this, size, x, y, vx, vy } )
		},

		spawn () {
			this.spawnSingle( { size: "L" } )
			this.spawnSingle( { size: "L" } )
			this.spawnSingle( { size: "L" } )
		},

		update ( dt ) {
			this.asteroids = this.asteroids.filter( ( b ) => b.dead !== true )
			this.asteroids.forEach( ( x ) => x.update( dt ) )
		},

		draw () {
			this.asteroids.forEach( ( x ) => x.draw() )
		},
	}
}
