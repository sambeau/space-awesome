import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { bullet } from "./bullet.js";

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
		heightWithFlame: 0,
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		flames: flames(),
		flameOn: false,
		flickerCounter: 0,
		turn: 0,
		guns: 2,
		maxbullets: 10,
		bullets: [],
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
		},
		fire() {
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
		removeBullet() {
			delete (this.bullet)
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
			}
			if (this.flameOn) {
				this.vy = -3
				if (game.speed < 10) game.speed *= 1.025
			} else {
				this.vy = 4
				if (game.speed > 1) game.speed *= 0.99
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

			this.flames.update({ parentx: this.x, parenty: this.y, flameOn: this.flameOn })
			this.bullets = this.bullets.filter((b) => { return b.dead !== true })
			this.bullets.forEach((b) => b.update())
		},
		draw() {
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
		},
	}
}
