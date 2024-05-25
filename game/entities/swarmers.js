import { canvas, ctx, game } from "../game.js";
import { picker, randInt } from "../utils.js";
import { distanceBetweenCircles } from "./entity.js";
import { explode } from "./explosions.js";

let imagesLoaded = 0
const numImagesToLoad = 2

const image1 = new Image()
const image2 = new Image()

image1.src = "images/swarmer-1.png"
image2.src = "images/swarmer-2.png"

image1.onload = () => { imagesLoaded++ }
image2.onload = () => { imagesLoaded++ }

const swarmer = () => {
	return {
		ship: null,
		swarmers: null,
		score: 100,
		x: 0,
		y: 0,
		vx: 0,
		vy: 2,
		width: 41 / 2,
		height: 33 / 2,
		image: image1,
		collider: {
			type: "circle",
			ox: (-2 + (45 / 2)) / 2,
			oy: (-5 + (45 / 2)) / 2,
			r: ((45 / 2)) / 2,
			colliding: false,
		},
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
		spawn({ swarmers, ship, x, y, vx, vy }) {
			// console.log("spawn")
			this.swarmers = swarmers
			this.ship = ship

			if (x) this.x = x
			else
				this.x = randInt(canvas.width)

			if (y) this.y = y
			else
				this.y = 0 - randInt(canvas.height * 1)

			if (vx) this.vx = vx ? vx : Math.random() - 0.5
			if (vy) this.vy = vy ? vy : Math.random() * 3

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)

			this.images = picker([image1, image2])
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

			this.animate()

		},
		draw() {
			if (imagesLoaded >= numImagesToLoad) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
			}
		},
		flock() {
			let cohesion = 0.01
			// const visibleDistance = 100

			// console.log(this)
			let closestswarmer1 = this.ship // add ship here?
			let closestswarmer2 = this.ship // add ship here?
			let closestDistance1 = distanceBetweenCircles(this.x, this.y, this.ship.x, this.ship.y)
			let closestDistance2 = distanceBetweenCircles(this.x, this.y, this.ship.x, this.ship.y)

			this.swarmers.swarmers.forEach((a) => {
				if (a == this) // skip
					return
				const d = distanceBetweenCircles(this.x, this.y, a.x, a.y)
				if (d == 0) return
				// if (d < visibleDistance) {
				if (closestDistance1 !== 0 && d < closestDistance1) {
					closestDistance2 = closestDistance1
					closestswarmer2 = closestswarmer1
					closestDistance1 = d
					closestswarmer1 = a
				}
				else if (d < closestDistance2) {
					closestDistance2 = d
					closestswarmer2 = a
				}
				// }
				// move towards closest swarmer
			})
			if (closestswarmer1 !== null && closestswarmer2 !== null) {
				this.vx += ((closestswarmer1.x + closestswarmer2.x) / 2 - this.x) * cohesion
				this.vy += ((closestswarmer1.y + closestswarmer2.y) / 2 - this.y) * cohesion// * 0.5

				if (closestDistance1 < (this.width + closestswarmer2.width) / 2 + 5) {
					this.vx += (this.x - closestswarmer1.x) * cohesion
					this.vy += (this.y - closestswarmer1.y) * cohesion// * 0.5
				}
			}

			// tamp them down
			if (this.vx > 3) this.vx = 3.3
			if (this.vx < -3) this.vx = -3.3
			if (this.vy > 1) this.vy = 1.3
			if (this.vy < -1) this.vy = -1.3
		},
		animate() {
			if (this.ticks % 5 == 0)
				this.image = this.images.next()
		},
		onHit() {
			this.dead = true;
			game.score += this.score
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "#FE0600", "#00BE00"],
				size: 6,
			})
		}
	}
};


export const Swarmers = () => {
	return {
		swarmers: [],
		spawnSingle({ ship, x, y, vx, vy }) {
			let a = swarmer()
			this.swarmers.push(a)
			a.spawn({ swarmers: this, ship: ship, x: x, y: y, vx: vx, vy: vy })
		},
		spawn() {
			// this.spawnSingle({})
		},
		update(dt) {
			this.swarmers = this.swarmers.filter((b) => { return b.dead !== true })
			this.swarmers.forEach((x) => x.update(dt))
		},
		draw() {
			this.swarmers.forEach((x) => x.draw())
		}
	}
}
