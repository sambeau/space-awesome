import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { explode } from "./explosions.js";

let numImagesLoaded = 0
const image = {}
const asteroidSizes = ['S', 'M', 'L']
const asteroidColors = [0, 1, 2]
const allAsteroidsLoadedCount = asteroidSizes.length * asteroidColors.length

asteroidSizes.forEach((s) => {
	console.log(s)
	image[s] = []
	asteroidColors.forEach((i) => {
		image[s][i] = new Image()
		image[s][i].onload = () => { numImagesLoaded++ }
		image[s][i].src = `images/asteroid-${s}-${i + 1}.png`
	})
})

const colliders = {
	S: { type: "circle", ox: 21 / 2 + 20.5, oy: 21 / 2 + 21, r: 25 / 2, colliding: false },
	M: { type: "circle", ox: 40.43 / 2 + 11.5, oy: 40.43 / 2 + 12, r: 43 / 2, colliding: false },
	L: { type: "circle", ox: 60 / 2 + 3, oy: 60 / 2 + 3, r: 60 / 2, colliding: false },
}

const asteroid = () => {
	return {
		asteroids: null,
		score: 100,
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		rotation: Math.random() * 10,
		width: 64,
		height: 64,
		size: 'L',
		collider: null,
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
		outOfBoundsL() {
			if (this.x + this.width < 0) return true
			return false;
		},
		outOfBoundsR() {
			if (this.x > canvas.width) return true
			return false;
		},
		spawn({ asteroids, size, x, y, vx, vy }) {
			this.asteroids = asteroids

			if (size) this.size = size
			this.collider = { ...colliders[this.size] }

			if (x) this.x = x
			else
				this.x = randInt(canvas.width)

			if (y) this.y = y
			else
				this.y = 0 - randInt(canvas.height)

			if (vx) this.vx = vx
			if (vy) this.vy = vy

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
		},
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;
			this.x += this.vx;
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
			if (this.outOfBoundsV()) {
				this.x = randInt(canvas.width)
				this.y = 0 - randInt(canvas.height / 2)
				this.collider.colliding = false
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {

			if (numImagesLoaded >= allAsteroidsLoadedCount) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const context = canvas.getContext("2d");

				context.translate((this.width / 2), (this.height / 2))
				context.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				context.translate(0 - (this.width / 2), 0 - (this.height / 2))

				let tick = Math.floor((this.ticks % 48) / 16)
				context.drawImage(image[this.size][tick], 0, 0, this.width + 0, this.height + 0)

				ctx.drawImage(canvas, this.x, this.y, this.width, this.height)

				ctx.font = "16px San-serif"
				ctx.fillText(`(${Math.floor(this.x)},${Math.floor(this.y)})`, this.x, this.y - 4);

				if (this.outOfBoundsL())
					ctx.fillRect(this.x, this.y, this.width, this.height)
			}
		},
		onHit() {
			this.dead = true;
			game.score += this.score
			let explosionSize = 0
			switch (this.size) {
				case 'L':
					explosionSize = 11
					this.asteroids.spawnSingle({
						size: 'M',
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 2,
					})
					this.asteroids.spawnSingle({
						size: 'M',
						x: this.x,
						y: this.y,
						vx: Math.random() + 2,
						vy: this.vy + 2,
					})
					break;
				case 'M':
					explosionSize = 7
					this.asteroids.spawnSingle({
						size: 'S',
						x: this.x,
						y: this.y,
						vx: Math.random() + 2,
						vy: this.vy + 2,
					})
					this.asteroids.spawnSingle({
						size: 'S',
						x: this.x,
						y: this.y,
						vx: Math.random() - 2,
						vy: this.vy + 2,
					})
					// this.asteroids.spawnSingle({
					// 	size: 'S',
					// 	x: this.x,
					// 	y: this.y,
					// 	vx: Math.random(),
					// 	vy: this.vy + 2,
					// })
					break;
				case 'S':
					explosionSize = 5
			}
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#FFFF00", "#00FFFF", "#FF00FF"],
				size: explosionSize,
			})
		}
	}
};


export const asteroids = () => {
	return {
		asteroids: [],
		spawnSingle({ size, x, y, vx, vy }) {
			let a = asteroid()
			this.asteroids.push(a)
			a.spawn({ asteroids: this, size: size, x: x, y: y, vx: vx, vy: vy })
		},
		spawn() {
			this.spawnSingle({ size: 'L' })
			this.spawnSingle({ size: 'L' })
			this.spawnSingle({ size: 'L' })
			this.spawnSingle({ size: 'L' })
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
