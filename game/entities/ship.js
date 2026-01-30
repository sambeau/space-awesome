import { GameStates, ctx, game } from "../game.js"
import {
	collisionBetweenCircles,
	getColliderArea,
	pick,
	picker,
	randInt,
	stereoFromScreenX,
	thingsAreColliding
} from "/zap/zap.js"

import { bullet } from "./bullet.js"

const smartBombRadius = 500
const flashes = 12

const smartBombImage1 = new Image()
const smartBombImage2 = new Image()
const smartBombImage3 = new Image()
const smartBombImage4 = new Image()

smartBombImage1.src = "/images/smart-1.png"
smartBombImage2.src = "/images/smart-2.png"
smartBombImage3.src = "/images/smart-3.png"
smartBombImage4.src = "/images/smart-4.png"

const shieldFizzleImage1 = new Image()
const shieldFizzleImage2 = new Image()
const shieldFizzleImage3 = new Image()
const shieldFizzleImage4 = new Image()

shieldFizzleImage1.src = "/images/shield-fizzle-1.png"
shieldFizzleImage2.src = "/images/shield-fizzle-2.png"
shieldFizzleImage3.src = "/images/shield-fizzle-3.png"
shieldFizzleImage4.src = "/images/shield-fizzle-4.png"

const shieldCriticalImage1 = new Image()
const shieldCriticalImage2 = new Image()
const shieldCriticalImage3 = new Image()
const shieldCriticalImage4 = new Image()

shieldCriticalImage1.src = "/images/shield-critical-1.png"
shieldCriticalImage2.src = "/images/shield-critical-2.png"
shieldCriticalImage3.src = "/images/shield-critical-3.png"
shieldCriticalImage4.src = "/images/shield-critical-4.png"


// var deadSound = new Howl({ src: ['/sounds/ship-dead.mp3'] });
var gameOverSound = new Howl( { src: [ '/sounds/game-over.mp3' ] } )
var epicSound = new Howl( { src: [ '/sounds/epic.mp3' ] } )
var impactSound = new Howl( { src: [ '/sounds/impact.mp3' ] } )
var hugeExplosionSound = new Howl( { src: [ '/sounds/huge-explosion.mp3' ] } )
var shieldSound = new Howl( { src: [ '/sounds/one-shot.mp3' ] } )
var smartBombSound = new Howl( { src: [ '/sounds/smart-bomb.mp3' ] } )

var laserSound = new Howl( { src: [ '/sounds/laser.mp3' ] } )
var laser2Sound = new Howl( { src: [ '/sounds/laser2.mp3' ] } )
var laser3Sound = new Howl( { src: [ '/sounds/laser3.mp3' ] } )

impactSound.volume( 0.33 )
gameOverSound.volume( 1.0 )
epicSound.volume( 0.33 )
hugeExplosionSound.volume( 0.33 )
shieldSound.volume( 0.25 )
smartBombSound.volume( 0.6 )

laserSound.volume( 0.05 )
laser2Sound.volume( 0.05 )
laser3Sound.volume( 0.05 )

const fizzleSize = 243 / 230

var flameSound = new Howl( {
	src: [ '/sounds/ship-thrust.mp3' ],
	volume: 0,
	loop: true,
} )
const lov = 0//0.02
const hiv = 0.1

const smartBomb = () => {
	return {
		dead: true,
		cx: 0,
		cy: 0,
		width: smartBombRadius * 2,
		height: smartBombRadius * 2,
		collider: {
			type: "circle",
			ox: smartBombRadius,
			oy: smartBombRadius,
			r: smartBombRadius,
			colliding: false
		},
		charges: 1,
		ticker: 0,
		tick () {
			this.ticker++
			if ( this.ticker == flashes ) {
				this.dead = true
			}
		},
		fire ( { shipCX, shipCY } ) {
			//only one at a time
			if ( !this.dead )
				return
			// do we have a bomb ready?
			if ( this.charges < 1 )
				return
			smartBombSound.play()
			this.charges--
			this.dead = false
			this.cx = shipCX
			this.cy = shipCY
			this.ticker = 0
		},
		update ( { shipCX, shipCY } ) {
			this.cx = shipCX
			this.cy = shipCY

			this.collider.x = this.cx
			this.collider.y = this.cy

			if ( this.dead ) return
			this.tick()
		},
		draw () {
			// if (game.showColliders) { // show even when not firing
			// 	ctx.save()
			// 	ctx.lineWidth = 1;
			// 	ctx.strokeStyle = "#00ff00";
			// 	ctx.arc(this.collider.x, this.collider.y, this.collider.r, 0, 2 * Math.PI);
			// 	ctx.stroke()
			// 	ctx.restore()
			// }
			if ( this.dead ) return
			let image
			image = pick( [ smartBombImage1, smartBombImage2, smartBombImage3, smartBombImage4 ] )

			ctx.drawImage( image, this.cx - this.width / 2, this.cy - this.height / 2, this.width, this.height )

		}
	}
}

const shield = () => {
	return {
		x: 0,
		y: 0,
		strength: 50, //50
		width: 0,
		height: 0,
		image: null,
		normalImage: new Image(),
		hitImage: new Image(),
		imageLoaded: false,
		ticker: 0,
		hitTimer: 0,
		hit: false,
		collider: {},
		fizzleImages: null,
		criticalImages: null,
		fizzleImage: null,
		criticalImage: null,
		fizzling: false,
		critical: true,
		recharging: 100,
		tick () {
			this.ticker++
			if ( this.ticker == 30 ) {
				this.ticker = 0
				this.strength -= 0.5
				if ( this.strength < 0 ) this.strength = 0
			}
			if ( this.hitTimer > 0 )
				this.hitTimer--
			if ( this.hitTimer === 0 ) {
				this.hit = false
			}
			this.recharging--
		},
		spawn ( { height } ) {
			this.width = height
			this.height = height

			this.normalImage.src = "images/shield.png"
			this.hitImage.onload = () => {
				this.imageLoaded = true
			}
			this.hitImage.src = "images/shield-hit.png"
			this.image = this.normalImage
			this.fizzleImages = picker( [
				shieldFizzleImage1,
				shieldFizzleImage2,
				shieldFizzleImage3,
				shieldFizzleImage4,
			] )
			this.criticalImages = picker( [
				shieldCriticalImage1,
				shieldCriticalImage2,
				shieldCriticalImage3,
				shieldCriticalImage4,
			] )

			this.fizzleImage = this.fizzleImages.first()
			this.criticalImage = this.criticalImages.first()

			this.updateCollider()
		},
		update ( { shipCX, shipCY, health } ) {
			this.tick()

			this.x = shipCX - ( this.width / 2 ) - this.strength
			this.y = shipCY - ( this.height / 2 ) - this.strength
			this.updateCollider()

			this.fizzling = false
			if ( this.recharging > 0 )
				this.fizzling = true

			this.critical = false
			if ( this.strength < 25 ) this.critical = true

			if ( this.fizzling && this.ticker % 2 == 0 )
				this.fizzleImage = this.fizzleImages.next()
			if ( this.critical && this.ticker % 2 == 0 )
				this.criticalImage = this.criticalImages.next()
		},
		updateCollider () {
			this.collider = {
				type: "circle",
				ox: this.width / 2 + this.strength,
				oy: this.height / 2 + this.strength,
				r: this.width / 2 + this.strength,
				colliding: false
			}
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
		},
		draw () {
			ctx.save()
			ctx.globalAlpha = ( Math.random() + Math.sin( this.ticker / 30 ) ) * this.strength / 50

			if ( this.hit )
				ctx.drawImage( this.hitImage, this.x, this.y, this.width + this.strength * 2, this.height + this.strength * 2 )
			else
				ctx.drawImage( this.normalImage, this.x, this.y, this.width + this.strength * 2, this.height + this.strength * 2 )

			ctx.restore()

			ctx.save()
			ctx.globalAlpha = 1.0

			if ( this.fizzling && ( Math.random() > 0.33 ) )
				ctx.drawImage(
					this.fizzleImage,
					this.x - 2,
					this.y - 2,
					this.width * fizzleSize + this.strength * 2,
					this.height * fizzleSize + this.strength * 2
				)
			if ( this.critical && ( Math.random() > 0.33 ) )
				ctx.drawImage(
					this.criticalImage,
					this.x - 2,
					this.y - 2,
					this.width * fizzleSize + this.strength * 2,
					this.height * fizzleSize + this.strength * 2
				)

			ctx.restore()

		},
		onHit () {
			this.hit = true
			this.hitTimer += 10
			canvas.classList.add( "hit-shake" )
			shieldSound.play()
			shieldSound.stereo( stereoFromScreenX( screen, this.x ) )

			setTimeout( () => {
				canvas.classList.remove( "hit-shake" )
			}, 250 )
		}
	}
}

const flames = () => {
	return {
		x: 0,
		y: 0,
		width: 15,
		height: 75,
		offsetx: 0,
		offsety: 0,
		flameOn: false,
		flame1: new Image(),
		flame1Loaded: false,
		flame2: new Image(),
		flame2Loaded: false,
		flamecounter: 0,
		brightflame: false,
		flamelength: 10,

		spawn ( { offsetx, offsety } ) {
			this.offsetx = offsetx
			this.offsety = offsety
			this.flame1.onload = () => {
				this.flame1Loaded = true
			}
			this.flame2.onload = () => {
				this.flame2Loaded = true
			}
			this.flame1.src = "images/flame-1.png"
			this.flame2.src = "images/flame-2.png"
		},
		update ( { parentx, parenty, flameOn } ) {
			this.flameOn = flameOn
			this.flamecounter += 1
			if ( this.flamecounter == this.flamelength ) {
				if ( this.brightflame )
					this.brightflame = false
				else
					this.brightflame = true
				this.flamecounter = 0
				this.flamelength = 1 + randInt( 10 ) + randInt( 10 )
			}
			this.x = parentx + this.offsetx
			this.y = parenty + this.offsety
		},
		draw () {
			if ( this.flame1Loaded && this.flame2Loaded && this.flameOn ) {
				if ( !randInt( 5 ) == 0 )
					if ( this.brightflame )
						ctx.drawImage( this.flame2, this.x, this.y, this.width, this.height )
					else
						ctx.drawImage( this.flame1, this.x, this.y, this.width, this.height )
			}

		},
	}
}
export const spaceship = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		dead: false,
		collider: [
			{ type: "circle", ox: 0 + 49.5 / 2, oy: 16 + 49.5 / 2, r: 49.5 / 2, colliding: false },
			{ type: "circle", ox: 16.5 + 16.5 / 2, oy: 5 + 16.5 / 2, r: 16.5 / 2, colliding: false },
		],
		heightWithFlame: 0,
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		flames: flames(),
		flameOn: false,
		break: false,
		flickerCounter: 0,
		turn: 0,
		firing: false,
		firingRate: 60 / 12,
		guns: 1,
		maxbullets: 12,
		firingTicker: 0,
		bullets: [],
		shield: shield(),
		smartBomb: smartBomb(),
		fading: false,
		spawn ( { entities: entities, floaters: floaters } ) {
			this.width = 50
			this.height = 64
			this.image1.onload = () => {
				this.image1Loaded = true
			}
			this.image2.onload = () => {
				this.image2Loaded = true
			}
			this.image3.onload = () => {
				this.image3Loaded = true
			}
			this.image1.src = "images/ship-l-1.png"
			this.image2.src = "images/ship-l-2.png"
			this.image3.src = "images/ship-l-3.png"

			this.entities = entities
			this.floaters = floaters

			this.y = canvas.height - this.height * 2
			this.x = canvas.width / 2

			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2

			this.flames.spawn( { offsetx: 17.25, offsety: 55.5 } )
			this.heightWithFlame = canvas.height - this.flames.height

			this.shield.spawn( { height: this.height } )

			if ( !flameSound.playing() ) {
				flameSound.play()
			}

		},
		boostShields () {
			this.shield.strength += 50
			this.shield.recharging = 100
			this.shield.updateCollider()
		},
		thrust () {
			if ( !this.flameOn ) {
				const vol = flameSound.volume()
				flameSound.fade( vol, hiv, 5 )
				// flameSound.volume(hiv)
			}
			this.flameOn = true
		},
		thrustOff () {
			if ( this.flameOn ) {
				const vol = flameSound.volume()
				flameSound.fade( vol, lov, 500 )
			}
			this.flameOn = false
		},
		fire () {
			this.maxbullets = 10 * this.guns
			if ( this.guns == 1 )
				laserSound.play()
			else if ( this.guns == 2 )
				laser2Sound.play()
			else if ( this.guns == 3 )
				laser3Sound.play()

			if ( ( this.guns == 1 || this.guns == 3 ) && this.bullets.length < this.maxbullets ) {
				laserSound.play()
				let newbullet = bullet()
				this.bullets.push( newbullet )
				newbullet.spawn( { atx: this.x + this.width / 2, aty: this.y, ship: this } )
			}
			if ( ( this.guns == 2 || this.guns == 3 ) && this.bullets.length < this.maxbullets ) {
				laserSound.play()
				let newbullet = bullet()
				this.bullets.push( newbullet )
				newbullet.spawn( { atx: this.x + 4.4, aty: this.y + 22, ship: this } )
			}
			if ( ( this.guns == 2 || this.guns == 3 ) && this.bullets.length < this.maxbullets ) {
				laserSound.play()
				let newbullet = bullet()
				this.bullets.push( newbullet )
				newbullet.spawn( { atx: this.x + 44.15, aty: this.y + 22, ship: this } )
			}
		},
		stopFiring () {
			this.firing = false
		},
		startFiring () {
			this.firing = true
		},
		cleanup () {
			// Stop ship activity and fade out sounds
			try {
				this.thrustOff() // Fades flame sound to 0
				this.stopFiring()
				this.flameOn = false
				// Don't call flameSound.stop() - it breaks the sound for next game
				// Instead, just fade to 0 volume which thrustOff() already does
				if ( flameSound && flameSound.volume ) {
					flameSound.volume( 0 ) // Ensure volume is 0
				}
			} catch ( e ) {
				console.error( 'Error in ship cleanup:', e )
			}
		},
		removeBullet () {
			delete ( this.bullet )
		},
		fireSmartBomb () {
			this.smartBomb.fire( { x: this.cx, y: this.cy } )
		},
		flicker () {
			this.flickerCounter += 1
			if ( this.flickerCounter === 10 )
				this.flickerCounter = 0
			if ( this.flickerCounter >= 4 )
				return true

			return false
		},
		sound () {
			flameSound.stereo( stereoFromScreenX( screen, this.x ) )
		},
		outOfBoundsTop () {
			if ( this.y <= 0 ) return true
			return false
		},
		outOfBoundsBottom () {
			if ( this.y >= this.heightWithFlame ) return true
			return false
		},
		outOfBoundsLeft () {
			if ( this.cx <= 0 ) return true
			return false
		},
		outOfBoundsRight () {
			if ( this.cx >= canvas.width ) return true
			return false
		},
		update (/*dt*/ ) {
			if ( game.over || this.dead )
				return

			if ( this.outOfBoundsTop() ) {
				this.y = 0
				this.vy = 0
			} else if ( this.outOfBoundsBottom() ) {
				this.y = this.heightWithFlame
				this.vy = 0
				this.break = false
			}
			if ( this.flameOn ) {
				this.vy = -8
				if ( game.speed < 15 ) game.speed *= 1.04
			} else {
				if ( this.break ) {
					this.vy = 6
					if ( game.speed > 2 ) game.speed *= 0.9
				} else {
					this.vy = 4
					if ( game.speed > 2 ) game.speed *= 0.99
				}
			}
			this.x += this.turn
			if ( this.outOfBoundsLeft() ) {
				this.x = 1 - this.width / 2
				this.vx = 0
			} else if ( this.outOfBoundsRight() ) {
				this.x = canvas.width - this.width / 2 - 1
				this.vx = 0
			}

			this.y += this.vy
			this.x += this.vx

			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2

			this.collider[ 0 ].x = this.x + this.collider[ 0 ].ox
			this.collider[ 0 ].y = this.y + this.collider[ 0 ].oy
			this.collider[ 1 ].x = this.x + this.collider[ 1 ].ox
			this.collider[ 1 ].y = this.y + this.collider[ 1 ].oy

			this.flames.update( { parentx: this.x, parenty: this.y, flameOn: this.flameOn } )

			this.shield.update( {
				shipCX: this.x + ( this.width / 2 ),
				shipCY: this.y + ( this.height / 2 ),
				health: 1000,
			} )

			this.bullets = this.bullets.filter( ( b ) => { return b.dead !== true } )
			this.bullets.forEach( ( b ) => b.update() )
			this.smartBomb.update( {
				shipCX: this.x + this.width / 2,
				shipCY: this.y + this.height / 2
			} )
			this.firingTicker++
			if ( ( this.firingTicker == this.firingRate ) ) {
				this.firingTicker = 0
				if ( this.firing )
					this.fire()
			}
			this.sound()
		},
		draw () {
			// draw ship
			if ( game.over || this.dead ) return

			if ( this.image1Loaded && this.image2Loaded && this.image3Loaded ) {
				this.bullets.forEach( ( b ) => b.draw() )
				if ( this.flameOn )
					ctx.drawImage( this.image3, this.x, this.y, this.width, this.height )
				else
					if ( this.flicker() )
						ctx.drawImage( this.image1, this.x, this.y, this.width, this.height )
					else
						ctx.drawImage( this.image2, this.x, this.y, this.width, this.height )

				this.flames.draw()
			}
			// draw shield
			this.shield.draw()
			this.smartBomb.draw()
		},
		collideWeaponsWithAll ( entityTypes ) {
			entityTypes.forEach( ( et ) => this.collideWeaponsWith( et ) )
		},
		collideWeaponsWith ( entities ) {
			// console.log(entities)
			this.bullets.forEach( ( b ) => {
				entities.forEach( ( e ) => {
					if ( thingsAreColliding( e, b ) ) {
						e.collider.colliding = true
						b.collider.colliding = true
						if ( !b.dead ) // stop multiple hits
							e.onHit()
						b.dead = true
					}
				} )
			} )
			if ( !this.smartBomb.dead ) {
				entities.forEach( ( e ) => {
					if ( thingsAreColliding( e, this.smartBomb ) ) {
						e.collider.colliding = true
						e.onHit( true )
					}
				} )
			}
		},
		crashIntoAll ( entityTypes ) {
			entityTypes.forEach( ( et ) => this.crashInto( et ) )
		},
		crashInto ( entities ) {
			// return // <-- uncomment to disable crashing for debug
			if ( this.dead || game.over ) return
			let collider = this
			if ( this.shield.strength > 0 )
				collider = this.shield
			entities.forEach( ( e ) => {
				if ( thingsAreColliding( collider, e ) ) {

					// exception for fleeing snake
					if ( e.isCrashProof && e.isCrashProof() )
						return

					if ( this.shield.strength > 0 ) {
						this.shield.strength -= getColliderArea( e )
						this.shield.onHit()
					} else {
						this.shield.strength = 0
						e.onHit( false, true )
						this.dead = true  // Just set flag, state machine handles rest
					}
					e.onHit( false, true )
				}
			} )
		},
		collect ( powerups ) {
			if ( this.dead || game.over ) return
			// console.log(entities)
			powerups.forEach( ( powerup ) => {
				if (
					collisionBetweenCircles(
						powerup.collider.x, powerup.collider.y, powerup.collider.r,
						this.collider[ 0 ].x, this.collider[ 0 ].y, this.collider[ 0 ].r
					)
					|| collisionBetweenCircles(
						powerup.collider.x, powerup.collider.y, powerup.collider.r,
						this.collider[ 1 ].x, this.collider[ 1 ].y, this.collider[ 1 ].r
					) ) {
					powerup.onCollect( this )
				}
			} )
		},
		onCollect ( type ) {
			switch ( type ) {
				case 'bullet':
					this.guns++
					if ( this.guns > 3 )
						this.guns = 3
					break
				case 'life':
					game.lives++
					this.floaters.spawnSingle( {
						cx: this.cx,
						cy: this.cy,
						type: '1up'
					} )
					break
				case 'smart':
					this.smartBomb.charges++
					this.floaters.spawnSingle( {
						cx: this.cx,
						cy: this.cy,
						type: 'bomb'
					} )
					break
				case 'shield':
					this.boostShields()
					break
				case 'spaceman':
					break
			}
		}
	}
}
