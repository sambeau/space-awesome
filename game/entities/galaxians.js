import { canvas, ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { explode } from "./explosions.js";
import { shot } from "./shot.js";

let maxShots = 4
let shots = []

const galaxian = () => {
	return {
		score: 500,
		x: 0,
		y: 0,
		vx: 0,
		vy: Math.random() * 3 + 3,
		rotation: Math.random() * 10,
		width: 56,
		height: 56,
		collider: {
			type: "circle",
			ox: (9.5 + 23.5) * 56 / 66,
			oy: (11 + 23.5) * 56 / 66,
			r: (23.5) * 56 / 66,
			colliding: false
		},

		imageS1: new Image(),
		imageS2: new Image(),
		imageS3: new Image(),
		imageS4: new Image(),

		imageL1: new Image(),
		imageL2: new Image(),
		imageL3: new Image(),
		imageL4: new Image(),

		imageR1: new Image(),
		imageR2: new Image(),
		imageR3: new Image(),
		imageR4: new Image(),

		imageS1Loaded: false,
		imageS2Loaded: false,
		imageS3Loaded: false,
		imageS4Loaded: false,

		imageL1Loaded: false,
		imageL2Loaded: false,
		imageL3Loaded: false,
		imageL4Loaded: false,

		imageR1Loaded: false,
		imageR2Loaded: false,
		imageR3Loaded: false,
		imageR4Loaded: false,

		ticks: 0,
		ship: null,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn({ ship }) {
			this.ship = ship

			this.imageS1.src = "images/galaxian-red-s-1.png"
			this.imageS2.src = "images/galaxian-red-s-2.png"
			this.imageS3.src = "images/galaxian-red-s-3.png"
			this.imageS4.src = "images/galaxian-red-s-4.png"

			this.imageL1.src = "images/galaxian-red-l-1.png"
			this.imageL2.src = "images/galaxian-red-l-2.png"
			this.imageL3.src = "images/galaxian-red-l-3.png"
			this.imageL4.src = "images/galaxian-red-l-4.png"

			this.imageR1.src = "images/galaxian-red-r-1.png"
			this.imageR2.src = "images/galaxian-red-r-2.png"
			this.imageR3.src = "images/galaxian-red-r-3.png"
			this.imageR4.src = "images/galaxian-red-r-4.png"

			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height * 4)

			this.imageS1.onload = () => { this.imageS1Loaded = true }
			this.imageS2.onload = () => { this.imageS2Loaded = true }
			this.imageS3.onload = () => { this.imageS3Loaded = true }
			this.imageS4.onload = () => { this.imageS4Loaded = true }

			this.imageL1.onload = () => { this.imageL1Loaded = true }
			this.imageL2.onload = () => { this.imageL2Loaded = true }
			this.imageL3.onload = () => { this.imageL3Loaded = true }
			this.imageL4.onload = () => { this.imageL4Loaded = true }

			this.imageR1.onload = () => { this.imageR1Loaded = true }
			this.imageR2.onload = () => { this.imageR2Loaded = true }
			this.imageR3.onload = () => { this.imageR3Loaded = true }
			this.imageR4.onload = () => { this.imageR4Loaded = true }
		},
		outOfBoundsV() {
			if (this.y > canvas.height + this.height) return true
			return false;
		},
		outOfBoundsL() {
			if (this.x + this.width < 0) return true
			return false;
		},
		outOfBoundsR() {
			if (this.x > canvas.width) return true
			return false;
		},
		fire() {
			if (shots.length < maxShots) {
				let newshot = shot()
				shots.push(newshot)
				newshot.spawn({ atx: this.x + this.width / 2, aty: this.y, shooter: this })
			}
		},
		// removeShot() {
		// 	delete (this.shot)
		// },
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;

			//seek!
			if (Math.abs(this.ship.x - this.x) < this.vy) {
				this.vx = 0
				this.fire()
			}
			else if (this.x > this.ship.x) { this.vx = -this.vy }
			else if (this.x < this.ship.x) { this.vx = this.vy }
			else { this.vx = 0 }

			this.x += this.vx

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

			if (this.outOfBoundsV()) {
				// this.x = randInt(canvas.width)
				this.y = 0 - canvas.height * 3//randInt(canvas.height)
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {

			if (
				this.imageS1Loaded &&
				this.imageS2Loaded &&
				this.imageS3Loaded &&
				this.imageS4Loaded &&
				this.imageL1Loaded &&
				this.imageL2Loaded &&
				this.imageL3Loaded &&
				this.imageL4Loaded &&
				this.imageR1Loaded &&
				this.imageR2Loaded &&
				this.imageR3Loaded &&
				this.imageR4Loaded
			) {
				let tick = (this.ticks % 24) / 8
				ctx.save()
				// ctx.filter = "invert(1)"
				if (Math.sign(this.vx) === 0) {
					if (tick < 1)
						ctx.drawImage(this.imageS1, this.x, this.y, this.width, this.height)
					else if (tick < 2)
						ctx.drawImage(this.imageS2, this.x, this.y, this.width, this.height)
					else if (tick < 3)
						ctx.drawImage(this.imageS3, this.x, this.y, this.width, this.height)
					else
						ctx.drawImage(this.imageS4, this.x, this.y, this.width, this.height)
				}
				else if (Math.sign(this.vx) === -1) { // left
					if (tick < 1)
						ctx.drawImage(this.imageL1, this.x, this.y, this.width, this.height)
					else if (tick < 2)
						ctx.drawImage(this.imageL2, this.x, this.y, this.width, this.height)
					else if (tick < 3)
						ctx.drawImage(this.imageL3, this.x, this.y, this.width, this.height)
					else
						ctx.drawImage(this.imageL4, this.x, this.y, this.width, this.height)
				}
				else if (Math.sign(this.vx) === 1) { // right
					if (tick < 1)
						ctx.drawImage(this.imageR1, this.x, this.y, this.width, this.height)
					else if (tick < 2)
						ctx.drawImage(this.imageR2, this.x, this.y, this.width, this.height)
					else if (tick < 3)
						ctx.drawImage(this.imageR3, this.x, this.y, this.width, this.height)
					else
						ctx.drawImage(this.imageR4, this.x, this.y, this.width, this.height)
				}
				ctx.restore()
			}
		},
		onHit() {
			this.dead = true
			game.score += this.score
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#FF0000", "#FF0000", "#FF0000", "#FF0000", "#272DFF", "#272DFF", "#DFDF10"],
				size: 8,
			})

		}
	}
};


export const galaxians = () => {
	return {
		galaxians: [],
		noShots: 0,
		spawnSingle({ ship }) {
			let x = galaxian()
			this.galaxians.push(x)
			x.spawn({ ship: ship })
		},
		spawn({ ship }) {
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })

			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
			this.spawnSingle({ ship })
		},
		update(dt) {
			shots = shots.filter((b) => { return b.dead !== true })
			this.galaxians = this.galaxians.filter((b) => { return b.dead !== true })
			this.galaxians.forEach((x) => x.update(dt))
			shots.forEach((s) => s.update())
			this.noShots = shots.length
		},
		draw() {
			shots.forEach((s) => s.draw())
			this.galaxians.forEach((x) => x.draw())
		}
	}
}

