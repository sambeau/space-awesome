import { ctx, game, canvas } from "../game.js";
import { randInt } from "../utils.js";
import { makeN } from "./entity.js";


const defender = () => {
	return {
		x: 0,
		y: 0,
		vx: (Math.random() - 0.5) * 3,
		vy: Math.random() * 3 + 1,
		rotation: Math.random() * 10,
		width: 48,
		height: 48,
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		ticks: 0,
		ship: null,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn({ship}) {
			this.image1.src = "images/defender1.png"
			this.image2.src = "images/defender2.png"
			this.image3.src = "images/defender3.png"
			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height)
			this.image1.onload = () => { this.image1Loaded = true }
			this.image2.onload = () => { this.image2Loaded = true }
			this.image3.onload = () => { this.image3Loaded = true }
			this.ship = ship
		},
		outOfBoundsV() {
			if (this.y > canvas.height + this.height) return true
			return false;
		},
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed + Math.random()*6-3;

			//seek!
			if (this.x > this.ship.x) this.vx = -this.vy
			else if (this.x < this.ship.x) this.vx = this.vy
			else this.vx = 0

			this.x += this.vx + Math.random()*6-3

			if (this.outOfBoundsV()) {
				this.x = randInt(canvas.width)
				this.y = 0 - randInt(canvas.height)
			}
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
	}
};


export const defenders = () => {
	return {
		defenders: [],
		spawn({ship:ship}) {
			this.defenders = makeN(defender, 4)
			this.defenders.forEach((x) => x.spawn({ship:ship}))
		},
		update(dt) {
			this.defenders.forEach((x) => x.update(dt))
		},
		draw() {
			this.defenders.forEach((x) => x.draw())
		}
	}
}
