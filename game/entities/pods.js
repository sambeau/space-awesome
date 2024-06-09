import { ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { makeN, randInt } from "/zap/zap.js";

let imagesLoaded = 0
const numImagesToLoad = 4

const image1 = new Image()
const image2 = new Image()
const image3 = new Image()
const image4 = new Image()

image1.src = "images/pod-1.png"
image2.src = "images/pod-2.png"
image3.src = "images/pod-3.png"
image4.src = "images/pod-4.png"

image1.onload = () => { imagesLoaded++ }
image2.onload = () => { imagesLoaded++ }
image3.onload = () => { imagesLoaded++ }
image4.onload = () => { imagesLoaded++ }

var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.25)

const pod = () => {
	return {
		name: "pod",
		color: "#FF00FF",
		ship: null,
		score: 1000,
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		rotation: Math.random() * 10,
		width: 48,
		height: 48,
		collider: {
			type: "circle",
			ox: (5.5 + (55 / 2)) * 32 / 48,
			oy: (6 + (55 / 2)) * 32 / 48,
			r: ((55 / 2)) * 32 / 48,
			colliding: false,
		},
		ticks: 0,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn({ swarmers, ship }) {
			this.swarmers = swarmers
			this.ship = ship //swarmers need ship to chase after
			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)
			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height * 2) - canvas.height * 2
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
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;
			this.x += this.vx;

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

			if (this.outOfBoundsV()) {
				// this.x = randInt(canvas.width)
				// this.y = 0 - randInt(canvas.heigh
				this.y = 0 - canvas.height * 3//randInt(canvas.height)
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {

			if (imagesLoaded == numImagesToLoad) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const context = canvas.getContext("2d");

				context.translate((this.width / 2), (this.height / 2))
				context.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				context.translate(0 - (this.width / 2), 0 - (this.height / 2))

				let tick = (this.ticks % 20) / 5
				if (tick < 1)
					context.drawImage(image1, 0, 0, this.width + 0, this.height + 0)
				else if (tick < 2)
					context.drawImage(image2, 0, 0, this.width + 0, this.height + 0)
				else if (tick < 3)
					context.drawImage(image3, 0, 0, this.width + 0, this.height + 0)
				else
					context.drawImage(image4, 0, 0, this.width + 0, this.height + 0)

				ctx.drawImage(canvas, this.x - 0, this.y - 0, this.width, this.height)

			}
		},
		onHit() {
			bangSound.play()
			this.dead = true
			game.score += this.score
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#FF00FF", "#FF00FF", "#FFBB00", "#961EFF"],
				size: 12,
			})
			this.swarmers.spawnSingle({ ship: this.ship, x: this.x + 5, y: this.y + 5, vx: this.vx + 5, vy: this.vy + 5 })
			this.swarmers.spawnSingle({ ship: this.ship, x: this.x, y: this.y, vx: this.vx, vy: this.vy })
			this.swarmers.spawnSingle({ ship: this.ship, x: this.x - 5, y: this.y - 5, vx: this.vx - 5, vy: this.vy - 5 })

			this.swarmers.spawnSingle({ ship: this.ship, x: this.x + 10, y: this.y + 10, vx: this.vx + 10, vy: this.vy + 10 })
			this.swarmers.spawnSingle({ ship: this.ship, x: this.x, y: this.y, vx: this.vx, vy: this.vy })
			this.swarmers.spawnSingle({ ship: this.ship, x: this.x - 10, y: this.y - 10, vx: this.vx - 10, vy: this.vy - 10 })

		}
	}
};


export const Pods = () => {
	return {
		pods: [],
		all() {
			return this.pods
		},
		spawn({ swarmers, ship }) {
			this.pods = makeN(pod, 2)
			this.pods.forEach((x) => x.spawn({ swarmers: swarmers, ship: ship }))
		},
		update(dt) {
			this.pods = this.pods.filter((b) => { return b.dead !== true })
			this.pods.forEach((x) => x.update(dt))
		},
		draw() {
			this.pods.forEach((x) => x.draw())
		}
	}
}
