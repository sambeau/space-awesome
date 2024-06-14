import { ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { distanceBetweenPoints, randInt, stereoFromScreenX } from "/zap/zap.js";

let numImagesLoaded = 0
const image = {}
const asteroidSizes = ['S', 'M', 'L']
const asteroidColors = [0, 1, 2]
const allAsteroidsLoadedCount = asteroidSizes.length * asteroidColors.length

var killSound = new Howl({ src: ['/sounds/kill.mp3'] });
killSound.volume(0.2)

var asteroidLSound = new Howl({ src: ['/sounds/asteroidL.mp3'] });
var asteroidMSound = new Howl({ src: ['/sounds/asteroidM.mp3'] });
var asteroidSSound = new Howl({ src: ['/sounds/asteroidS.mp3'] });
asteroidLSound.volume(0.25)
asteroidMSound.volume(0.25)
asteroidSSound.volume(0.25)

asteroidSizes.forEach((s) => {
	image[s] = []
	asteroidColors.forEach((i) => {
		image[s][i] = new Image()
		image[s][i].onload = () => { numImagesLoaded++ }
		image[s][i].src = `images/asteroid-${s}-${i + 1}.png`
	})
})

const colliders = {
	S: { type: "circle", ox: 26 / 2 + 20, oy: 26 / 2 + 20.5, r: 26 / 2, colliding: false },
	M: { type: "circle", ox: 40.43 / 2 + 11.5, oy: 40.43 / 2 + 12, r: 43 / 2, colliding: false },
	L: { type: "circle", ox: 60 / 2 + 3, oy: 60 / 2 + 3, r: 60 / 2, colliding: false },
}

const scores = {
	S: 100,
	M: 50,
	L: 20,
}

const asteroid = () => {
	return {
		name: "asteroid",
		color: "#00ffff",
		asteroids: null,
		score: 100,
		x: 0,
		y: 0,
		vx: Math.random() - 0.25,
		vy: Math.random() * 2,
		rotation: Math.random() * 10,
		width: 64,
		height: 64,
		size: 'L',
		collider: null,
		ticks: 0,
		closestDistance: 0,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		outOfBoundsB() {
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
			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)

			if (x) this.x = x
			else
				this.x = randInt(canvas.width)

			if (y) this.y = y
			else
				this.y = 0 - randInt(canvas.height * 4)

			if (vx) this.vx = vx
			if (vy) this.vy = vy

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
		},
		update(/*dt*/) {
			this.tick()
			//flock
			this.flock()
			this.x += this.vx;
			this.y += this.vy + game.speed;

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
			if (this.outOfBoundsB()) {
				this.y = 0 - canvas.height * 3
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

				//debug
				// ctx.save()
				// ctx.font = "16px sans-serif";
				// ctx.fillStyle = "#00ff00";
				// ctx.fillText(`Nearest: ${Math.floor(this.closestDistance)}`, this.x, this.y - 10);
				// ctx.restore()

				if (this.outOfBoundsL())
					ctx.fillRect(this.x, this.y, this.width, this.height)
			}
		},
		flock() {
			let cohesion = 0.0015
			// const visibleDistance = 100

			// console.log(this)
			let closestAsteroid1 = null
			let closestAsteroid2 = null
			let closestDistance1 = Number.MAX_VALUE
			let closestDistance2 = Number.MAX_VALUE

			this.asteroids.asteroids.forEach((a) => {
				if (a == this) // skip
					return
				const d = distanceBetweenPoints(this.x, this.y, a.x, a.y)
				if (d == 0) return
				// if (d < visibleDistance) {
				if (closestDistance1 !== 0 && d < closestDistance1) {
					closestDistance2 = closestDistance1
					closestAsteroid2 = closestAsteroid1
					closestDistance1 = d
					closestAsteroid1 = a
				}
				else if (d < closestDistance2) {
					closestDistance2 = d
					closestAsteroid2 = a
				}
				// }
				// move towards closest asteroid
			})
			if (closestAsteroid1 !== null && closestAsteroid2 !== null) {
				this.vx += ((closestAsteroid1.x + closestAsteroid2.x) / 2 - this.x) * cohesion
				this.vy += ((closestAsteroid1.y + closestAsteroid2.y) / 2 - this.y) * cohesion// * 0.5

				if (closestDistance1 < (this.width + closestAsteroid2.width) / 2) {
					this.vx += (this.x - closestAsteroid1.x) * cohesion
					this.vy += (this.y - closestAsteroid1.y) * cohesion// * 0.5
				}
			}
			// tamp them down
			if (this.vx > 3) this.vx = 3
			if (this.vx < -3) this.vx = -3
			if (this.vy > 1) this.vy = 1
			if (this.vy < -1) this.vy = -1
		},
		onHit() {
			killSound.play()
			killSound.stereo(stereoFromScreenX(screen, this.x))

			this.dead = true;
			game.score += this.score
			let explosionSize = 0
			switch (this.size) {
				case 'L':
					asteroidLSound.play()
					asteroidLSound.stereo(stereoFromScreenX(screen, this.x))

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
					asteroidMSound.play()
					asteroidMSound.stereo(stereoFromScreenX(screen, this.x))

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
					asteroidSSound.play()
					asteroidSSound.stereo(stereoFromScreenX(screen, this.x))

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
		all() {
			return this.asteroids
		},
		spawnSingle({ size, x, y, vx, vy }) {
			let a = asteroid()
			this.asteroids.push(a)
			a.spawn({ asteroids: this, size: size, x: x, y: y, vx: vx, vy: vy })
		},
		spawn() {
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
