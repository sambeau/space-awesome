import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { makeN } from "./entity.js";
import { explode } from "./explosions.js";

const asteroid = () => {
	return {
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		rotation: Math.random() * 10,
		width: 64,
		height: 64,
		collider: { type: "circle", ox: 33, oy: 33, r: 30, colliding: false },
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		ticks: 0,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		outOfBoundsV() {
			if (this.y > canvas.height + this.height) return true
			return false;
		},
		spawn() {
			this.image1.src = "images/asteroid1.png"
			this.image2.src = "images/asteroid2.png"
			this.image3.src = "images/asteroid3.png"
			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height)
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
			this.image1.onload = () => { this.image1Loaded = true }
			this.image2.onload = () => { this.image2Loaded = true }
			this.image3.onload = () => { this.image3Loaded = true }
		},
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;
			this.x += this.vx;
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
			if (this.outOfBoundsV()) {
				this.x = randInt(canvas.width)
				this.y = 0 - randInt(canvas.height)
				this.collider.colliding = false
			}
		},
		draw() {

			if (this.image1Loaded
				&& this.image2Loaded
				&& this.image3Loaded
			) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const context = canvas.getContext("2d");

				context.translate((this.width / 2), (this.height / 2))
				context.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				context.translate(0 - (this.width / 2), 0 - (this.height / 2))

				let tick = (this.ticks % 48) / 16
				if (tick < 1)
					context.drawImage(this.image1, 0, 0, this.width + 0, this.height + 0)
				else if (tick < 2)
					context.drawImage(this.image2, 0, 0, this.width + 0, this.height + 0)
				else
					context.drawImage(this.image3, 0, 0, this.width + 0, this.height + 0)

				ctx.drawImage(canvas, this.x - 0, this.y - 0, this.width, this.height)

			}
		},
		onHit() {
			this.dead = true;
			// console.log("game:", game)
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#FFFF00", "#00FFFF", "#FF00FF"],
				size: 10
			})
		}
	}
};


export const asteroids = () => {
	return {
		asteroids: [],
		spawn() {
			this.asteroids = makeN(asteroid, 4)
			this.asteroids.forEach((x) => x.spawn())
		},
		update(dt) {
			this.asteroids = this.asteroids.filter((b) => { return b.dead !== true })
			this.asteroids.forEach((x) => x.update(dt))
		},
		draw() {
			this.asteroids.forEach((x) => x.draw())
		}
	}
}
