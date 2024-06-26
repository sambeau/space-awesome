import { canvas, ctx, game } from "../game.js";
import { bomb } from "./bombs.js";
import { explode } from "./explosions.js";
import { picker, randInt, stereoFromScreenX, thingIsOnScreen, volumeFromX } from "/zap/zap.js";

let numImagesLoaded = 0
const motherImages = []
const imageStates = [1, 2, 3]
const allImagesLoadedCount = imageStates.length

imageStates.forEach((i) => {
	motherImages[i - 1] = new Image()
	motherImages[i - 1].onload = () => { numImagesLoaded++ }
	motherImages[i - 1].src = `images/mother-${i}.png`
})
var bigBoomSound = new Howl({ src: ['/sounds/impact.mp3'] });
bigBoomSound.volume(0.25)

var motherSound = new Howl({
	src: ['/sounds/mother.mp3'],
	volume: 0,
	loop: true,
});

const msize = 2.5
const mother = () => {
	return {
		ship: null,
		images: null,
		image: null,
		x: canvas.width * 2 + randInt(canvas.width / 2) + randInt(canvas.width / 2),
		y: randInt(canvas.height / 2) + randInt(canvas.height / 2),
		vx: 0,
		vy: 0,
		width: 170 / msize,
		height: 59 / msize,
		collider: [
			{ type: "circle", ox: 28.75 / msize, oy: 31.25 / msize, r: 28.25 / msize, area: 20, colliding: false },
			{ type: "circle", ox: 130.75 / msize, oy: 31.25 / msize, r: 28.25 / msize, area: 20, colliding: false },
			{ type: "circle", ox: 79.75 / msize, oy: 30 / msize, r: 29.5 / msize, area: 20, colliding: false },
			{ type: "circle", ox: 54.875 / msize, oy: 30 / msize, r: 29.5 / msize, area: 20, colliding: false },
			{ type: "circle", ox: 104.625 / msize, oy: 30 / msize, r: 29.5 / msize, area: 20, colliding: false },
		],
		animationSpeed: 3,
		ticker: 0,
		ticks: 0,
		hsec: 0,
		color: "#00BA02",
		immuneToCrash: true,
		score: 1000,
		direction: 'left',
		speed: 10,
		tick() {
			this.ticker++
			if (this.ticker == this.animationSpeed) {
				this.ticker = 0
				this.animate()
			}
			this.ticks++
			if (this.ticks === 1000)
				this.ticks = 0
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
		spawn({ mothers, floaters, ship, x, y, vx, vy }) {
			this.floaters = floaters
			this.ship = ship
			this.mothers = mothers

			this.states = picker(motherImages)
			this.image = this.states.first()
			this.collider.forEach((c) => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
				c.area = Math.round(Math.PI * c.r * c.r / game.massConstant)
			})
		},
		update(/*dt*/) {

			if (this.ticks % 6 == 0)
				this.fire()
			this.tick()

			if (this.direction == 'right') {
				this.x += this.speed;
				if (this.x > screen.width * 2) {
					this.direction = 'left'
					this.y = randInt(canvas.height / 2) + randInt(canvas.height / 2)
				}
			} else if (this.direction == 'left') {
				this.x -= this.speed;
				if (this.x < 0 - screen.width * 2) {
					this.direction = 'right'
					this.y = randInt(canvas.height / 2) + randInt(canvas.height / 2)
				}
			}
			this.collider.forEach((c) => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
			})

			this.sound()

		},
		draw() {
			if (numImagesLoaded >= allImagesLoadedCount) {
				// debugThing(ctx, this, `${getColliderArea(this)}`)
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
			}
		},
		sound() {
			if (!motherSound.playing()) {
				motherSound.play()
			}
			motherSound.stereo(stereoFromScreenX(screen, this.x))
			motherSound.volume(volumeFromX(screen, 1.5, this.x) * 0.0015)
		},
		animate() {
			this.image = this.states.next()
		},
		fire() {
			// fireSound.play()
			// fireSound.stereo((this.x - screen.width / 2) / screen.width)
			if (!thingIsOnScreen(this, screen) || Math.random() > 0.33) return
			let newbomb = bomb()
			this.mothers.bombs.push(newbomb)
			newbomb.spawn({ atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this })
		},
		onHit(smart) {
			// return
			motherSound.stop()
			bigBoomSound.play()
			bigBoomSound.stereo(stereoFromScreenX(screen, this.x))
			console.log(this)
			this.dead = true
			game.score += this.score
			this.floaters.spawnSingle({
				cx: this.x + this.width / 2,
				cy: this.y + this.height / 2,
				type: this.score
			})
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["#ffffff",
					"#ffffff",
					"#ffffff",
					"#00BA02",
					"#00BA02",
					"#FFBA11",
					"#C14501"],
				size: 25,
			})
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["#ffffff",
					"#ffffff",
					"#ffffff",
					"#00BA02",
					"#00BA02",
					"#FFBA11",
					"#C14501"],
				size: 15,
			})
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["#ffffff",
					"#ffffff",
					"#ffffff",
					"#00BA02",
					"#00BA02",
					"#FFBA11",
					"#C14501"],
				size: 10,
			})

		}
	}
};


export const Mothers = () => {
	return {
		mothers: [],
		bombs: [], // move to manager so it can be seen by ship

		all() {
			return this.mothers
		},
		spawnSingle({ floaters, ship, x, y, vx, vy }) {
			let a = mother()
			this.mothers.push(a)
			a.spawn({ mothers: this, floaters: floaters, ship: ship, x: x, y: y, vx: vx, vy: vy })
		},
		spawn({ ship, floaters }) {
			this.spawnSingle({ ship: ship, floaters: floaters })
		},
		update(dt) {
			this.bombs = this.bombs.filter((b) => { return b.dead !== true })

			this.mothers = this.mothers.filter((x) => { return x.dead !== true })
			this.mothers.forEach((x) => x.update(dt))

			this.bombs.forEach((s) => s.update())
			this.noBombs = this.bombs.length

		},
		draw() {
			this.bombs.forEach((s) => s.draw())
			this.mothers.forEach((x) => x.draw())
		}
	}
}
