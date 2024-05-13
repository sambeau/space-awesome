import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";

const flames = () => {
	return {
		x: 0,
		y: 0,
		width: 20,
		height: 100,
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
			this.flame1.src = "images/flame1.png"
			this.flame2.src = "images/flame2.png"
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
		image: new Image(),
		imageLoaded: false,
		flames: flames(),
		flameOn: false,
		turn: 0,
		spawn() {
			this.width = 66
			this.height = 85
			this.image.onload = () => {
				this.imageLoaded = true
			}
			this.image.src = "images/ship.png"
			this.y = canvas.height - this.height * 2;
			this.x = canvas.width / 2;
			this.flames.spawn({ offsetx: 23, offsety: 74 })
		},
		outOfBoundsTop() {
			if (this.y >= canvas.height) return true
			return false;
		},
		outOfBoundsBottom() {
			if (this.y <= 0) return true
			return false;
		},
		outOfBoundsLeft() {
			if (this.x <= 0) return true
			return false
		},
		outOfBoundsRight() {
			if (this.x >= canvas.width) return true
			return false
		},
		outOfBoundsV() {
			return this.outOfBoundsTop() || this.outOfBoundsBottom()
		},
		outOfBoundsH() {
			return this.outOfBoundsLeft() || this.outOfBoundsRight()
		},
		update(/*dt*/) {
			if (this.flameOn) {
				if (!this.outOfBoundsV()) {
					this.vy = -3
					if (game.speed < 10) game.speed *= 1.025
				}
			}
			if (!this.flameOn) {
				if (this.outOfBoundsV()) {
					this.vy = 0
				}
				else this.vy = 4
				if (game.speed > 1) game.speed *= 0.99
			}
			if (this.turn !== 0) {
				if (!this.outOfBoundsH()) {
					this.x += this.turn
				}
			}

			this.y += this.vy;
			this.x += this.vx;

			if (this.outOfBoundsH()) {
				this.vx = 0
			}
			this.flames.update({ parentx: this.x, parenty: this.y, flameOn: this.flameOn })
		},
		draw() {
			if (this.imageLoaded) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
				this.flames.draw()
			}
			ctx.strokeStyle = "rgb(255 0 0 / 100%)";
			ctx.strokeRect(this.x, this.y, this.width, this.height)
		},
	}
}
