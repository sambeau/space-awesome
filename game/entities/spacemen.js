import { ctx, game } from "../game.js"
import { picker, randInt, stereoFromScreenX } from "/zap/zap.js"
import { createEntity, loadImages, loadSound, drawRotated } from "./Entity.js"
import { explode } from "./explosions.js"

const assets = loadImages( [
	"images/spaceman-1.png",
	"images/spaceman-2.png",
	"images/spaceman-3.png",
	"images/spaceman-4.png",
	"images/spaceman-5.png",
	"images/spaceman-6.png",
	"images/spaceman-7.png",
	"images/spaceman-8.png"
] )

const saveSound = loadSound( '/sounds/save.mp3', 0.25 )
const crySound = loadSound( '/sounds/cry1.mp3', 0.05 )
const bangSound = loadSound( '/sounds/bang.mp3', 0.25 )

const spaceman = () => {
	return {
		...createEntity( {
			name: "spaceman",
			width: 69 * 2 / 3,
			height: 69 * 2 / 3,
			score: 0,
			collider: { type: "circle", ox: 50 / 2, oy: 50 / 2, r: 50 / 2, colliding: false }
		} ),

		// Custom properties
		type: "spaceman",
		color: "random",
		id: 0,
		images: null,
		image: null,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		animationSpeed: 3,
		rotation: 10,
		ticker: 0,
		saved: false,

		tick () {
			this.ticker++
			if ( this.ticker == this.animationSpeed ) {
				this.ticker = 0
				this.animate()
			}
			this.ticks = ( this.ticks + 1 ) % 1000
		},

		spawn ( { floaters, id, x, y, vx, vy } ) {
			this.id = id
			this.floaters = floaters
			this.images = picker( assets.images )
			this.image = this.images.first()

			if ( x ) this.x = x
			else this.x = randInt( canvas.width )

			if ( y ) this.y = y
			else this.y = 0 - randInt( 2 * canvas.height ) - canvas.height * 2

			if ( vx ) this.vx = vx
			if ( vy ) this.vy = vy

			this.syncCollider()
			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2
		},

		update () {
			this.tick()
			this.y += this.vy + game.speed
			this.x += this.vx

			this.syncCollider()
			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2

			// Wrap screen (custom behavior - wraps back to top instead of standard wrap)
			if ( this.outOfBoundsB() ) {
				this.y = 0 - canvas.height * 3
				this.collider.colliding = false
			}
			if ( this.outOfBoundsL() ) this.x = canvas.width
			if ( this.outOfBoundsR() ) this.x = 0 - this.width
		},

		draw () {
			if ( !assets.loaded() ) return
			drawRotated( ctx, this, this.image )
		},

		animate () {
			if ( this.animate.method == 'any' )
				this.image = this.images.any()
			else
				this.image = this.images.next()
		},

		onHit () {
			crySound.play()
			crySound.stereo( stereoFromScreenX( screen, this.x ) )
			bangSound.play()
			bangSound.stereo( stereoFromScreenX( screen, this.x ) )
			this.dead = true
			explode( {
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: [ "white", "white", "#0DC500", "#FF00F2", "#BC4700", "#F8B500" ],
				size: 12,
			} )
		},

		onEat () {
			this.dead = true
			explode( {
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: [ "white", "white", "#0DC500", "#FF00F2", "#BC4700", "#F8B500" ],
				size: 6,
			} )
		},

		onCollect ( ship ) {
			saveSound.play()
			saveSound.stereo( stereoFromScreenX( screen, this.x ) )
			this.saved = true
			this.dead = true
			ship.onCollect( this.type )
			this.floaters.spawnSingle( {
				cx: this.x + this.width / 2,
				cy: this.y + this.height / 2,
				type: 500
			} )
			game.particles.spawnCircle( {
				points: 64,
				cx: ship.x + ship.width / 2,
				cy: ship.y + ship.width / 2,
				width: 20,
				height: 20,
				speed: 30,
				lifespan: 50,
				style: "random",
			} )
			game.particles.spawnCircle( {
				points: 32,
				cx: ship.x + ship.width / 2,
				cy: ship.y + ship.width / 2,
				width: 25,
				height: 25,
				speed: 20,
				lifespan: 50,
				style: "random",
			} )
		},
	}
}


export const Spacemen = () => {
	return {
		spacemen: [],
		ids: 0,
		saved: 0,

		all () {
			return this.spacemen
		},

		count () {
			return this.spacemen.length
		},

		spawnSingle ( { floaters, x, y, vx, vy } ) {
			let a = spaceman()
			this.spacemen.push( a )
			this.ids++
			a.spawn( { floaters: floaters, id: this.ids, x: x, y: y, vx: vx, vy: vy } )
		},

		spawn ( { floaters } ) {
			this.floaters = floaters
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 4 ) + canvas.height * 3 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 3 ) + canvas.height * 2 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 3 ) + canvas.height * 1 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 2 ) + canvas.height * 1 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 4 ) + canvas.height * 3 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 3 ) + canvas.height * 2 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 3 ) + canvas.height * 1 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 2 ) + canvas.height * 1 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 2 ) } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 2 ) + canvas.height * 4 } )
			this.spawnSingle( { floaters: floaters, y: randInt( canvas.height * 2 ) + canvas.height * 4 } )
		},

		update ( dt ) {
			let newlysaved = 0
			this.spacemen.forEach( ( x ) => { if ( x.saved ) newlysaved++ } )
			this.saved += newlysaved
			this.spacemen = this.spacemen.filter( ( x ) => { return x.dead !== true } )
			this.spacemen.forEach( ( x ) => x.update( dt ) )
		},

		draw () {
			this.spacemen.forEach( ( x ) => x.draw() )
		}
	}
}
