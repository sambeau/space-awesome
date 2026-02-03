import { COLLISION, LAYER } from "./constants.js"
import { createEntity, drawRotated, getFrame, loadImages, loadSound } from "../zap/Entity.js"
import { ctx, game } from "../game.js"
import { randInt, stereoFromScreenX } from "/zap/zap.js"

// Load images for each powerup type (3 frames each)
const lifeImages = loadImages( [
	"images/life-up-1.png",
	"images/life-up-2.png",
	"images/life-up-3.png"
] )

const smartImages = loadImages( [
	"images/smart-up-1.png",
	"images/smart-up-2.png",
	"images/smart-up-3.png"
] )

const bulletImages = loadImages( [
	"images/bullet-up-1.png",
	"images/bullet-up-2.png",
	"images/bullet-up-3.png"
] )

const shieldImages = loadImages( [
	"images/shield-up-1.png",
	"images/shield-up-2.png",
	"images/shield-up-3.png"
] )

const imagesByType = {
	life: lifeImages,
	smart: smartImages,
	bullet: bulletImages,
	shield: shieldImages
}

// Load sounds at module level
const pickupSound = loadSound( "/sounds/pick-up.mp3", 0.33 )
const levelUpSound = loadSound( "/sounds/level-up.mp3", 0.33 )

export const powerup = () => {
	return {
		...createEntity( {
			name: "powerup",
			drawLayer: LAYER.POWERUPS,
			collisionGroups: [ COLLISION.COLLECTABLE ],
			isPrimaryEnemy: false,
			width: 50,
			height: 50,
			collider: { type: "circle", ox: 50 / 2, oy: 50 / 2, r: 50 / 2, colliding: false }
		} ),

		type: 'bullet',
		imageSet: null,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		animationSpeed: 3,
		rotation: 10,

		spawn ( { type, x, y, vx, vy } ) {
			this.type = type
			this.imageSet = imagesByType[ type ]

			if ( x ) this.x = x
			else this.x = randInt( canvas.width )

			if ( y ) this.y = y
			else this.y = 0 - randInt( 2 * canvas.height ) - canvas.height * 2

			if ( vx ) this.vx = vx
			if ( vy ) this.vy = vy

			this.syncCollider()
		},

		update ( /*dt*/ ) {
			this.tick()
			this.y += this.vy + game.speed
			this.x += this.vx

			this.syncCollider()

			if ( this.outOfBoundsV() ) {
				this.y = 0 - canvas.height * 3
				this.collider.colliding = false
			}
			if ( this.outOfBoundsL() )
				this.x = canvas.width
			if ( this.outOfBoundsR() )
				this.x = 0 - this.width
		},

		draw () {
			if ( this.imageSet && this.imageSet.loaded() ) {
				const frame = getFrame( this.ticks, this.imageSet.images.length, this.animationSpeed )
				drawRotated( ctx, this, this.imageSet.images[ frame ] )
			}
		},

		onHit () {
			this.dead = true
		},

		onCollect ( ship ) {
			pickupSound.play()
			pickupSound.stereo( stereoFromScreenX( screen, this.x ) )
			levelUpSound.play()
			levelUpSound.stereo( stereoFromScreenX( screen, this.x ) )

			this.dead = true
			ship.onCollect( this.type )
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
