import { COLLISION, LAYER } from "./Registry.js"
import { canvas, ctx, game } from "../game.js"
import { createEntity, loadImages, loadSound } from "./Entity.js"
import { picker, randInt, stereoFromScreenX, thingIsOnScreen, volumeFromX } from "/zap/zap.js"

import { explode } from "./explosions.js"

const assets = loadImages( [
	"images/mother-1.png",
	"images/mother-2.png",
	"images/mother-3.png"
] )
const bigBoomSound = loadSound( '/sounds/impact.mp3', 0.25 )
const motherSound = new Howl( {
	src: [ '/sounds/mother.mp3' ],
	volume: 0,
	loop: true,
} )

const msize = 2.5
export const mother = () => {
	return {
		...createEntity( {
			name: "mother",
			drawLayer: LAYER.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ],
			isPrimaryEnemy: true,
			width: 170 / msize,
			height: 59 / msize,
			score: 1000,
			collider: [
				{ type: "rect", ox: 0, oy: 0, w: 170 / msize, h: 59 / msize }
			]
		} ),

		// Custom properties
		x: canvas.width * 2 + randInt( canvas.width / 2 ) + randInt( canvas.width / 2 ),
		y: randInt( canvas.height / 2 ) + randInt( canvas.height / 2 ),
		states: null,
		image: null,
		animationSpeed: 3,
		ticker: 0,
		color: "#00BA02",
		immuneToCrash: true,
		direction: 'left',
		speed: 10,

		tick () {
			this.ticker++
			if ( this.ticker == this.animationSpeed ) {
				this.ticker = 0
				this.animate()
			}
			this.ticks = ( this.ticks + 1 ) % 1000
		},

		spawn ( { registry, floaters, ship } ) {
			this.floaters = floaters
			this.ship = ship
			this.registry = registry

			this.states = picker( assets.images )
			this.image = this.states.first()
			this.syncCollider()
		},

		update () {
			if ( this.ticks % 6 == 0 )
				this.fire()
			this.tick()

			if ( this.direction == 'right' ) {
				this.x += this.speed
				if ( this.x > screen.width * 3 ) {
					this.direction = 'left'
					this.y = randInt( canvas.height / 2 ) + randInt( canvas.height / 2 )
				}
			} else if ( this.direction == 'left' ) {
				this.x -= this.speed
				if ( this.x < 0 - screen.width * 2 ) {
					this.direction = 'right'
					this.y = randInt( canvas.height / 2 ) + randInt( canvas.height / 2 )
				}
			}

			this.syncCollider()
			this.sound()
		},

		draw () {
			if ( !assets.loaded() ) return
			ctx.drawImage( this.image, this.x, this.y, this.width, this.height )
		},

		sound () {
			if ( !motherSound.playing() ) {
				motherSound.play()
			}
			motherSound.stereo( stereoFromScreenX( screen, this.x ) )
			motherSound.volume( volumeFromX( screen, 1.5, this.x ) * 0.0015 )
		},

		animate () {
			this.image = this.states.next()
		},

		fire () {
			if ( !thingIsOnScreen( this, screen ) || Math.random() > 0.33 ) return
			this.registry.spawn( 'bomb', { atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this } )
		},

		onHit ( smartbomb ) {
			motherSound.stop()
			if ( !smartbomb ) {
				bigBoomSound.play()
				bigBoomSound.stereo( stereoFromScreenX( screen, this.x ) )
			}

			this.dead = true
			game.score += this.score
			this.floaters.spawnSingle( {
				cx: this.x + this.width / 2,
				cy: this.y + this.height / 2,
				type: this.score
			} )

			const explosionStyles = [
				"#ffffff", "#ffffff", "#ffffff",
				"#00BA02", "#00BA02",
				"#FFBA11", "#C14501"
			]
			const cx = this.x + this.width / 2
			const cy = this.y + this.height / 2

			explode( { x: cx, y: cy, styles: explosionStyles, size: 25 } )
			explode( { x: cx, y: cy, styles: explosionStyles, size: 15 } )
			explode( { x: cx, y: cy, styles: explosionStyles, size: 10 } )
		}
	}
}


export const Mothers = () => {
	return {
		mothers: [],
		registry: null,

		all () {
			return this.mothers
		},
		spawnSingle ( { registry, floaters, ship, x, y, vx, vy } ) {
			let a = mother()
			this.mothers.push( a )
			a.spawn( { registry: registry || this.registry, floaters: floaters, ship: ship, x: x, y: y, vx: vx, vy: vy } )
		},
		spawn ( { registry, ship, floaters } ) {
			this.registry = registry
			this.spawnSingle( { registry: registry, ship: ship, floaters: floaters } )
		},
		update ( dt ) {
			this.mothers = this.mothers.filter( ( x ) => { return x.dead !== true } )
			this.mothers.forEach( ( x ) => x.update( dt ) )
			// Bombs are now updated via registry.updateType('bomb', dt)
		},
		draw () {
			// Bombs are now drawn via registry.drawType('bomb')
			this.mothers.forEach( ( x ) => x.draw() )
		}
	}
}
