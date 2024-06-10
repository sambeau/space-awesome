import { ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { picker, randInt, stereoFromScreenX } from "/zap/zap.js";

let numImagesLoaded = 0
const mineStates = []
const imageStates = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const allMinesLoadedCount = imageStates.length

const colliders = [
	{ type: "circle", ox: 87.0384944, oy: 88, r: 86.5384944, colliding: false },
	{ type: "circle", ox: 87.9615056, oy: 88, r: 77.884645, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 70.0961805, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 63.0865624, colliding: false },
	{ type: "circle", ox: 87.5179268, oy: 88, r: 56.7779062, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 51.1001156, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 45.990104, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 45.990104, colliding: false },
	{ type: "circle", ox: 87.5, oy: 88, r: 42.3671638, colliding: false },
]

imageStates.forEach((i) => {
	mineStates[i - 1] = {}
	mineStates[i - 1].image = new Image()
	mineStates[i - 1].image.onload = () => { numImagesLoaded++ }
	mineStates[i - 1].image.src = `images/mine-${i}.png`
	mineStates[i - 1].collider = colliders[i - 1]
})
var bigBoomSound = new Howl({ src: ['/sounds/impact.mp3'] });
bigBoomSound.volume(0.25)

const angryImage = new Image()
let angryImageLoaded = false
angryImage.src = "images/mine-angry.png"
angryImage.onload = () => { angryImageLoaded = true }

const HP = 50
const mine = () => {
	return {
		ship: null,
		images: null,
		image: null,
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		width: 175,
		height: 176,
		collider: null,
		animationSpeed: 3,
		rotation: 10,
		ticker: 0,
		ticks: 0, // amalgamate ^V
		hsec: 0,
		sulking: false,
		color: "black",
		immuneToCrash: true,
		// hp: HP,
		tick() {
			this.ticker++
			if (this.ticker == this.animationSpeed) {
				this.ticker = 0
				this.animate()
			}
			this.ticks++
			if (this.ticks === 1000)
				this.ticks = 0
			// this.hsec++
			// if (this.hsec == 30)
			// 	this.hsec = 0
			// return this.tick
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
		spawn({ ship, x, y, vx, vy }) {
			this.ship = ship
			this.states = picker(mineStates, { start: 7, end: 7 })
			this.image = (this.states.first()).image
			this.collider = { ...(this.states.first()).collider }
			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)

			if (x) this.x = x
			else
				this.x = canvas.width - (randInt(canvas.width) * randInt(canvas.width) / 2)

			if (y) this.y = y
			else
				this.y = 0 - randInt(canvas.height * 2) + canvas.height * 2

			if (vx) this.vx = vx
			if (vy) this.vy = vy

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
		},
		update(/*dt*/) {
			this.tick()

			if (this.sulking) this.seekShip()
			this.y += this.vy + game.speed;
			this.x += this.vx;

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)

			if (this.outOfBoundsV()) {
				// this.x = randInt(canvas.width)
				this.y = 0 - canvas.height * 3//randInt(canvas.height * 2)
				this.collider.colliding = false
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {
			if (numImagesLoaded >= allMinesLoadedCount) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const icon = canvas.getContext("2d");

				icon.translate((this.width / 2), (this.height / 2))
				icon.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				icon.translate(0 - (this.width / 2), 0 - (this.height / 2))

				icon.drawImage(this.image, 0, 0, this.width, this.height)

				ctx.drawImage(canvas, this.x, this.y, this.width, this.height)
				// if (this.hp < HP / 2) {
				// 	const opacity = (HP - this.hp) * (1 / HP)
				// 	if (angryImageLoaded) {
				// 		ctx.save()
				// 		ctx.globalAlpha = Math.sin((this.hsec / 60) * Math.PI * 2) * opacity
				// 		ctx.drawImage(angryImage, this.x + 45.15, this.y + 45.63, 84.73, 84.73)
				// 		ctx.restore()
				// 	}
				// }
			}
		},
		animate() {
			if (this.sulking) {
				this.image = (this.states.bounceHold()).image
				this.collider = { ...(this.states.bounceHold()).collider }
			} else {
				this.image = (this.states.first()).image
				this.collider = { ...(this.states.first()).collider }
			}
		},
		seekShip() {
			let cohesion = 0.0015
			this.vx -= (this.x - this.ship.x) * cohesion
			this.vy -= (this.y - this.ship.y) * cohesion// * 0.5
			if (this.vx > 3) this.vx = 3
			if (this.vx < -3) this.vx = -3
			if (this.vy > 1) this.vy = 1
			if (this.vy < -1) this.vy = -1
		},
		onHit(smart) {
			// this.hp--
			this.sulking = true;
			if (smart) {
				bigBoomSound.play()
				bigBoomSound.stereo(stereoFromScreenX(screen, this.y))

				this.dead = true
				explode({
					x: this.x + this.width / 2,
					y: this.y + this.height / 2,
					styles: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF"],
					size: 25,
				})
				explode({
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 - 40,
					styles: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF"],
					size: 10,
				})
				explode({
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 + 40,
					styles: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF"],
					size: 10,
				})
				explode({
					x: this.x + this.width / 2,
					y: this.y + this.height / 2 - 40,
					styles: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#FFFF00", "#FF00FF", "#00FFFF"],
					size: 10,
				})
			}
		}
	}
};


export const Mines = () => {
	return {
		mines: [],
		all() {
			return this.mines
		},
		spawnSingle({ ship, x, y, vx, vy }) {
			let a = mine()
			this.mines.push(a)
			a.spawn({ ship: ship, x: x, y: y, vx: vx, vy: vy })
		},
		spawn({ ship }) {
			this.spawnSingle({ ship: ship })
			this.spawnSingle({ ship: ship })
			this.spawnSingle({ ship: ship })
		},
		update(dt) {
			this.mines = this.mines.filter((x) => { return x.dead !== true })
			this.mines.forEach((x) => x.update(dt))
		},
		draw() {
			this.mines.forEach((x) => x.draw())
		}
	}
}
