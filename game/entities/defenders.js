import { canvas, ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { makeN, randInt, stereoFromScreenX, thingIsOnScreen } from "/zap/zap.js";

import { bomb } from "./bombs.js";

var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.25)

const defender = () => {
	return {
		name: "defender",
		color: "#06BA01",
		score: 150,
		x: 0,
		y: 0,
		vx: (Math.random() - 0.5) * 3,
		vy: Math.random() * 3 + 1,
		rotation: Math.random() * 10,
		width: 48,
		height: 48,
		collider: {
			type: "circle",
			ox: (5.5 + (55 / 2)) * 48 / 66,
			oy: (6 + (55 / 2)) * 48 / 66,
			r: ((55 / 2)) * 48 / 66,
			colliding: false,
		},
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		ticks: 0,
		ship: null,
		defenders: null,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn({ ship, defenders }) {
			this.ship = ship
			this.defenders = defenders
			this.image1.src = "images/defender1.png"
			this.image2.src = "images/defender2.png"
			this.image3.src = "images/defender3.png"
			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height * 2)
			this.image1.onload = () => { this.image1Loaded = true }
			this.image2.onload = () => { this.image2Loaded = true }
			this.image3.onload = () => { this.image3Loaded = true }
			this.collider.area = Math.round(Math.PI * this.collider.r * this.collider.r / game.massConstant)
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
			this.y += this.vy + game.speed + Math.random() * 6 - 3;

			//seek!
			if (this.x > this.ship.x) this.vx = -this.vy
			else if (this.x < this.ship.x) this.vx = this.vy
			else this.vx = 0

			this.x += this.vx + Math.random() * 6 - 3

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

			if (this.outOfBoundsV()) {
				this.y = 0 - canvas.height * 3
			}
			if (this.outOfBoundsL())
				this.x = canvas.width
			if (this.outOfBoundsR())
				this.x = 0 - this.width
			if (this.ticks % 12 == 0)
				this.fire()
		},
		draw() {

			if (this.image1Loaded
				&& this.image2Loaded
				&& this.image3Loaded
			) {
				let tick = (this.ticks % 20) / 5
				if (tick < 1)
					ctx.drawImage(this.image1, this.x, this.y, this.width, this.height)
				else if (tick < 2)
					ctx.drawImage(this.image2, this.x, this.y, this.width, this.height)
				else
					ctx.drawImage(this.image3, this.x, this.y, this.width, this.height)
			}
		},
		onHit(smartbomb) {
			if (!smartbomb) {
				bangSound.play()
				bangSound.stereo(stereoFromScreenX(screen, this.x))
			}
			this.dead = true
			game.score += this.score
			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: ["white", "white", "#FFB301", "#06BA01", "#06BA01"],
				size: 6,
			})
		},
		fire() {
			// fireSound.play()
			// fireSound.stereo((this.x - screen.width / 2) / screen.width)
			if (!thingIsOnScreen(this, screen) || Math.random() > 0.125) return
			let newbomb = bomb()
			this.defenders.bombs.push(newbomb)
			newbomb.spawn({ atx: this.x + this.width / 2, aty: this.y, ship: this.ship, bomber: this })
		}
	}
};


export const defenders = () => {
	return {
		defenders: [],
		bombs: [], // move to manager so it can be seen by ship
		all() {
			return this.defenders
		},
		spawn({ ship: ship }) {
			this.defenders = makeN(defender, 4)
			this.defenders.forEach((x) => x.spawn({ ship: ship, defenders: this }))
		},
		update(dt) {
			this.bombs = this.bombs.filter((b) => { return b.dead !== true })

			this.defenders = this.defenders.filter((b) => { return b.dead !== true })
			this.defenders.forEach((x) => x.update(dt))

			this.bombs.forEach((s) => s.update())
			this.noBombs = this.bombs.length

		},
		draw() {
			this.bombs.forEach((s) => s.draw())

			this.defenders.forEach((x) => x.draw())
		}
	}
}
