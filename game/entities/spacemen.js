import { ctx, game } from "../game.js";
import { picker, randInt, stereoFromScreenX } from "/zap/zap.js";
// import { makeN } from "/zap/zap.js";
import { explode } from "./explosions.js";

let numImagesLoaded = 0
const images = []
const spacemenAnimations = [1, 2, 3, 4, 5, 6, 7, 8]
const allSpacemenLoadedCount = spacemenAnimations.length

var saveSound = new Howl({ src: ['/sounds/save.mp3'] });
saveSound.volume(0.25)
var crySound = new Howl({ src: ['/sounds/cry1.mp3'] });
crySound.volume(0.05)
var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.25)

spacemenAnimations.forEach((i) => {
	images[i - 1] = new Image()
	images[i - 1].onload = () => { numImagesLoaded++ }
	images[i - 1].src = `images/spaceman-${i}.png`
})

const spaceman = () => {
	return {
		name: "spaceman",
		type: "spaceman",
		color: "random",
		id: 0,
		images: null,
		image: null,
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		width: 69 * 2 / 3,
		height: 69 * 2 / 3,
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
		spawn({ floaters, id, x, y, vx, vy }) {
			this.id = id
			this.floaters = floaters
			this.images = picker(images)
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

			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2
		},
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;
			this.x += this.vx;

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2

			if (this.outOfBoundsV()) {
				this.y = 0 - canvas.height * 3
				this.collider.colliding = false
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
		},
		draw() {
			if (numImagesLoaded >= allSpacemenLoadedCount) {
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const icon = canvas.getContext("2d");

				icon.translate((this.width / 2), (this.height / 2))
				icon.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				icon.translate(0 - (this.width / 2), 0 - (this.height / 2))

				icon.drawImage(this.image, 0, 0, this.width, this.height)

				ctx.drawImage(canvas, this.x, this.y, this.width, this.height)
			}
			// debugThing(ctx, this, this.id.toString())
		},
		animate() {
			if (this.animate.method == 'any')
				this.image = this.images.any()
			else
				this.image = this.images.next()
		},
		onHit() {
			crySound.play()
			crySound.stereo(stereoFromScreenX(screen, this.x))
			bangSound.play()
			bangSound.stereo(stereoFromScreenX(screen, this.x))
			this.dead = true;
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#0DC500", "#FF00F2", "#BC4700", "#F8B500"],
				size: 12,
			})
		},
		onEat() {
			this.dead = true;
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#0DC500", "#FF00F2", "#BC4700", "#F8B500"],
				size: 6,
			})
		},

		onCollect(ship) {
			saveSound.play()
			saveSound.stereo(stereoFromScreenX(screen, this.x))
			// saveSound.vol(sreen, n, this.y))
			this.saved = true
			this.dead = true
			ship.onCollect(this.type)
			this.floaters.spawnSingle({
				cx: this.x + this.width / 2,
				cy: this.y + this.height / 2,
				type: 500
			})
			game.particles.spawnCircle({
				points: 64,
				cx: ship.x + ship.width / 2,
				cy: ship.y + ship.width / 2,
				width: 20,
				height: 20,
				speed: 30,
				lifespan: 50,
				style: "random",
			})
			game.particles.spawnCircle({
				points: 32,
				cx: ship.x + ship.width / 2,
				cy: ship.y + ship.width / 2,
				width: 25,
				height: 25,
				speed: 20,
				lifespan: 50,
				style: "random",
			})
		},
	}
};


export const Spacemen = () => {
	return {
		spacemen: [],
		ids: 0,
		saved: 0,
		all() {
			return this.spacemen
		},
		count() {
			return this.spacemen.length
		},
		spawnSingle({ floaters, x, y, vx, vy }) {
			let a = spaceman()
			this.spacemen.push(a)
			this.ids++
			a.spawn({ floaters: floaters, id: this.ids, x: x, y: y, vx: vx, vy: vy })
		},
		spawn({ floaters }) {
			this.floaters = floaters
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 4) + canvas.height * 3 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 3) + canvas.height * 2 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 3) + canvas.height * 1 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 2) + canvas.height * 1 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 4) + canvas.height * 3 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 3) + canvas.height * 2 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 3) + canvas.height * 1 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 2) + canvas.height * 1 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 2) })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 2) + canvas.height * 4 })
			this.spawnSingle({ floaters: floaters, y: randInt(canvas.height * 2) + canvas.height * 4 })
		},
		update(dt) {
			let newlysaved = 0
			this.spacemen.forEach((x) => { if (x.saved) newlysaved++ })
			this.saved += newlysaved
			this.spacemen = this.spacemen.filter((x) => { return x.dead !== true })
			this.spacemen.forEach((x) => x.update(dt))
		},
		draw() {
			this.spacemen.forEach((x) => x.draw())
		}
	}
}
