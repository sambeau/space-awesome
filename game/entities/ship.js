import { ctx, game } from "../game.js";
import { pick, randInt } from "/zap/zap.js"
import { bullet } from "./bullet.js";
import { collisionBetweenCircles } from "/zap/zap.js";

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
		tick() {
			this.ticker++
			if (this.ticker == flashes) {
				this.dead = true
			}
		},
		fire({ shipCX, shipCY }) {
			//only one at a time
			if (!this.dead)
				return
			// do we have a bomb ready?
			if (this.charges < 1)
				return

			this.charges--
			this.dead = false
			this.cx = shipCX
			this.cy = shipCY
			this.ticker = 0
		},
		update({ shipCX, shipCY }) {
			this.cx = shipCX
			this.cy = shipCY

			this.collider.x = this.cx
			this.collider.y = this.cy

			if (this.dead) return
			this.tick()
		},
		draw() {
			// if (game.showColliders) { // show even when not firing
			// 	ctx.save()
			// 	ctx.lineWidth = 1;
			// 	ctx.strokeStyle = "#00ff00";
			// 	ctx.arc(this.collider.x, this.collider.y, this.collider.r, 0, 2 * Math.PI);
			// 	ctx.stroke()
			// 	ctx.restore()
			// }
			if (this.dead) return
			let image
			image = pick([smartBombImage1, smartBombImage2, smartBombImage3, smartBombImage4])

			ctx.drawImage(image, this.cx - this.width / 2, this.cy - this.height / 2, this.width, this.height)
		}
	}
}

const shield = () => {
	return {
		x: 0,
		y: 0,
		strength: 0, //50
		width: 0,
		height: 0,
		image: new Image(),
		imageLoaded: false,
		ticker: 0,
		tick() {
			this.ticker++
			if (this.ticker == 30) {
				this.ticker = 0
				this.strength--
				if (this.strength < 0) this.strength = 0
			}
		},
		spawn({ height }) {
			this.width = height
			this.height = height
			this.image.onload = () => {
				this.imageLoaded = true
			}
			this.image.src = "images/shield.png"
		},
		update({ shipCX, shipCY, health }) {
			this.tick()
			this.x = shipCX - (this.width / 2) - this.strength
			this.y = shipCY - (this.height / 2) - this.strength

		},
		draw() {
			ctx.save()
			ctx.globalAlpha = (Math.random() + Math.sin(this.ticker / 30)) * this.strength / 50
			ctx.drawImage(this.image, this.x, this.y, this.width + this.strength * 2, this.height + this.strength * 2);
			ctx.restore()
		},
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

		spawn({ offsetx, offsety }) {
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
		update({ parentx, parenty, flameOn }) {
			this.flameOn = flameOn
			this.flamecounter += 1
			if (this.flamecounter == this.flamelength) {
				if (this.brightflame)
					this.brightflame = false
				else
					this.brightflame = true
				this.flamecounter = 0
				this.flamelength = 1 + randInt(10) + randInt(10)
			}
			this.x = parentx + this.offsetx
			this.y = parenty + this.offsety
		},
		draw() {
			if (this.flame1Loaded && this.flame2Loaded && this.flameOn) {
				if (!randInt(5) == 0)
					if (this.brightflame)
						ctx.drawImage(this.flame2, this.x, this.y, this.width, this.height);
					else
						ctx.drawImage(this.flame1, this.x, this.y, this.width, this.height);
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
		colliders: [
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
		spawn() {
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

			this.y = canvas.height - this.height * 2;
			this.x = canvas.width / 2;

			this.flames.spawn({ offsetx: 17.25, offsety: 55.5 })
			this.heightWithFlame = canvas.height - this.flames.height

			this.shield.spawn({ height: this.height })
		},
		boostShields() {
			this.shield.strength += 50
		},
		fire() {
			this.maxbullets = 10 * this.guns
			if ((this.guns == 1 || this.guns == 3) && this.bullets.length < this.maxbullets) {
				let newbullet = bullet()
				this.bullets.push(newbullet)
				newbullet.spawn({ atx: this.x + this.width / 2, aty: this.y, ship: this })
			}
			if ((this.guns == 2 || this.guns == 3) && this.bullets.length < this.maxbullets) {
				let newbullet = bullet()
				this.bullets.push(newbullet)
				newbullet.spawn({ atx: this.x + 4.4, aty: this.y + 22, ship: this })
			}
			if ((this.guns == 2 || this.guns == 3) && this.bullets.length < this.maxbullets) {
				let newbullet = bullet()
				this.bullets.push(newbullet)
				newbullet.spawn({ atx: this.x + 44.15, aty: this.y + 22, ship: this })
			}
		},
		stopFiring() {
			this.firing = false
		},
		startFiring() {
			this.firing = true
		},
		removeBullet() {
			delete (this.bullet)
		},
		fireSmartBomb() {
			this.smartBomb.fire({ x: this.x + this.width / 2, y: this.y + this.height / 2 })
		},
		flicker() {
			this.flickerCounter += 1
			if (this.flickerCounter === 10)
				this.flickerCounter = 0
			if (this.flickerCounter >= 4)
				return true

			return false
		},
		outOfBoundsTop() {
			if (this.y <= 0) return true
			return false;
		},
		outOfBoundsBottom() {
			if (this.y >= this.heightWithFlame) return true
			return false;
		},
		outOfBoundsLeft() {
			if (this.x <= 0) return true
			return false
		},
		outOfBoundsRight() {
			if (this.x >= (canvas.width - this.width)) return true
			return false
		},
		update(/*dt*/) {
			if (this.outOfBoundsTop()) {
				this.y = 0
				this.vy = 0
			} else if (this.outOfBoundsBottom()) {
				this.y = this.heightWithFlame
				this.vy = 0
				this.break = false
			}
			if (this.flameOn) {
				this.vy = -6
				if (game.speed < 15) game.speed *= 1.033
			} else {
				if (this.break) {
					this.vy = 8
					if (game.speed > 1) game.speed *= 0.5
				} else {
					this.vy = 3
					if (game.speed > 1) game.speed *= 0.99
				}
			}
			this.x += this.turn
			if (this.outOfBoundsLeft()) {
				this.x = 0
				this.vx = 0
			} else if (this.outOfBoundsRight()) {
				this.x = canvas.width - this.width
				this.vx = 0
			}

			this.y += this.vy;
			this.x += this.vx;

			this.colliders[0].x = this.x + this.colliders[0].ox
			this.colliders[0].y = this.y + this.colliders[0].oy
			this.colliders[1].x = this.x + this.colliders[1].ox
			this.colliders[1].y = this.y + this.colliders[1].oy

			this.flames.update({ parentx: this.x, parenty: this.y, flameOn: this.flameOn })

			this.shield.update({
				shipCX: this.x + (this.width / 2),
				shipCY: this.y + (this.height / 2),
				health: 1000,
			})

			this.bullets = this.bullets.filter((b) => { return b.dead !== true })
			this.bullets.forEach((b) => b.update())
			this.smartBomb.update({
				shipCX: this.x + this.width / 2,
				shipCY: this.y + this.height / 2
			})
			this.firingTicker++
			if ((this.firingTicker == this.firingRate)) {
				this.firingTicker = 0
				if (this.firing)
					this.fire()
			}
		},
		draw() {
			// draw ship
			if (this.image1Loaded && this.image2Loaded && this.image3Loaded) {
				this.bullets.forEach((b) => b.draw())
				if (this.flameOn)
					ctx.drawImage(this.image3, this.x, this.y, this.width, this.height);
				else
					if (this.flicker())
						ctx.drawImage(this.image1, this.x, this.y, this.width, this.height);
					else
						ctx.drawImage(this.image2, this.x, this.y, this.width, this.height);

				this.flames.draw()
			}
			// draw shield
			this.shield.draw()
			this.smartBomb.draw()
		},
		collide(entities) {
			// console.log(entities)
			this.bullets.forEach((b) => {
				entities.forEach((e) => {
					if (collisionBetweenCircles(
						e.collider.x, e.collider.y, e.collider.r,
						b.collider.x, b.collider.y, b.collider.r
					)) {
						e.collider.colliding = true
						b.collider.colliding = true
						b.dead = true
						e.onHit()
					}
				})
			})
			if (!this.smartBomb.dead) {
				entities.forEach((e) => {
					if (collisionBetweenCircles(
						e.collider.x, e.collider.y, e.collider.r,
						this.smartBomb.collider.x,
						this.smartBomb.collider.y,
						this.smartBomb.collider.r
					)) {
						e.collider.colliding = true
						e.onHit(true)
					}
				})
			}
		},
		collect(powerups) {
			// console.log(entities)
			powerups.forEach((powerup) => {
				if (
					collisionBetweenCircles(
						powerup.collider.x, powerup.collider.y, powerup.collider.r,
						this.colliders[0].x, this.colliders[0].y, this.colliders[0].r
					)
					|| collisionBetweenCircles(
						powerup.collider.x, powerup.collider.y, powerup.collider.r,
						this.colliders[1].x, this.colliders[1].y, this.colliders[1].r
					)) {
					powerup.onCollect(this)
				}
			})
		},
		onCollect(type) {
			switch (type) {
				case 'bullet':
					this.guns++
					if (this.guns > 3)
						this.guns = 3
					break;
				case 'life':
					game.lives++
					break;
				case 'smart':
					this.smartBomb.charges++
					break;
				case 'shield':
					this.boostShields()
					break;
				case 'spaceman':
					this.boostShields()
					break;
			}
		}
	}
}
