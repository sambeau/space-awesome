import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { makeN } from "./entity.js";


const galaxian = () => {
	return {
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3 + 3,
		rotation: Math.random() * 10,
		width: 56,
		height: 56,
		image1: new Image(),
		image2: new Image(),
		image3: new Image(),
		image4: new Image(),
		image1Loaded: false,
		image2Loaded: false,
		image3Loaded: false,
		image4Loaded: false,
		ticks: 0,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn() {
			this.image1.src = "images/galaxian1.png"
			this.image2.src = "images/galaxian2.png"
			this.image3.src = "images/galaxian3.png"
			this.image4.src = "images/galaxian4.png"
			this.x = randInt(canvas.width)
			this.y = 0 - randInt(canvas.height)
			this.image1.onload = () => { this.image1Loaded = true }
			this.image2.onload = () => { this.image2Loaded = true }
			this.image3.onload = () => { this.image3Loaded = true }
			this.image4.onload = () => { this.image4Loaded = true }
		},
		outOfBoundsV() {
			if (this.y > canvas.height + this.height) return true
			return false;
		},
		update(/*dt*/) {
			this.tick()
			this.y += this.vy + game.speed;
			this.x += this.vx;
			if (this.outOfBoundsV()) {
				this.x = randInt(canvas.width)
				this.y = 0 - randInt(canvas.height)
			}
		},
		draw() {

			if (this.image1Loaded
				&& this.image2Loaded
				&& this.image3Loaded
				&& this.image4Loaded
			) {
				let tick = (this.ticks % 24) / 8
				if (tick < 1)
					ctx.drawImage(this.image1, this.x, this.y, this.width, this.height)
				else if (tick < 2)
					ctx.drawImage(this.image2, this.x, this.y, this.width, this.height)
				else if (tick < 3)
					ctx.drawImage(this.image3, this.x, this.y, this.width, this.height)
				else
					ctx.drawImage(this.image4, this.x, this.y, this.width, this.height)
			}
		},
	}
};


export const galaxians = () => {
	return {
		galaxians: [],
		spawn() {
			this.galaxians = makeN(galaxian, 4)
			this.galaxians.forEach((x) => x.spawn())
		},
		update(dt) {
			this.galaxians.forEach((x) => x.update(dt))
		},
		draw() {
			this.galaxians.forEach((x) => x.draw())
		}
	}
}
