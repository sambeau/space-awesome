import { ctx, game } from "../game.js";
import { picker, randInt } from "../utils.js";

let numImagesLoaded = 0
const images = {}
const powerupTypes = ['life', 'smart', 'bullet', 'shield']
const powerupAnimations = [1, 2, 3]
const allPowerupsLoadedCount = powerupTypes.length * powerupAnimations.length

powerupTypes.forEach((s) => {
	images[s] = []
	powerupAnimations.forEach((i) => {
		images[s][i - 1] = new Image()
		images[s][i - 1].onload = () => { numImagesLoaded++ }
		images[s][i - 1].src = `images/${s}-up-${i}.png`
	})
})

const powerup = () => {
	return {
		type: 'bullet',
		images: null,
		image: null,
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		width: 50,
		height: 50,
		collider: { type: "circle", ox: 50 / 2, oy: 50 / 2, r: 50 / 2, colliding: false },
		animationSpeed: 3,
		rotation: 10,
		ticker: 0,
		ticks: 0, // amalgamate ^V
		tick() {
			this.ticker++
			if (this.ticker == this.animationSpeed) {
				this.ticker = 0
				this.animate()
			}
			this.ticks++
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
		spawn({ type, x, y, vx, vy }) {
			this.type = type
			this.images = picker(images[type])
			this.image = this.images.first()

			if (x) this.x = x
			else
				this.x = randInt(canvas.width)

			if (y) this.y = y
			else
				this.y = 0 - randInt(2 * canvas.height) - canvas.height * 2

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
				// this.x = randInt(canvas.width)
				// this.y = 0 - randInt(canvas.height / 2)
				this.y = 0 - canvas.height * 3//randInt(canvas.height)
				this.collider.colliding = false
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {
			if (numImagesLoaded >= allPowerupsLoadedCount) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const icon = canvas.getContext("2d");

				icon.translate((this.width / 2), (this.height / 2))
				icon.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				icon.translate(0 - (this.width / 2), 0 - (this.height / 2))

				icon.drawImage(this.image, 0, 0, this.width, this.height)

				ctx.drawImage(canvas, this.x, this.y, this.width, this.height)


				// ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
			}
		},
		animate() {
			if (this.animate.method == 'any')
				this.image = this.images.any()
			else
				this.image = this.images.next()
		},
		onHit() {
			this.dead = true;
		}
	}
};


export const Powerups = () => {
	return {
		powerups: [],
		spawnSingle({ type, x, y, vx, vy }) {
			let a = powerup()
			this.powerups.push(a)
			a.spawn({ type: type, x: x, y: y, vx: vx, vy: vy })
		},
		spawn() {
			this.spawnSingle({ type: 'bullet' })
			this.spawnSingle({ type: 'life' })
			this.spawnSingle({ type: 'smart' })
			this.spawnSingle({ type: 'shield' })
		},
		update(dt) {
			this.powerups = this.powerups.filter((x) => { return x.dead !== true })
			this.powerups.forEach((x) => x.update(dt))
		},
		draw() {
			this.powerups.forEach((x) => x.draw())
		}
	}
}
