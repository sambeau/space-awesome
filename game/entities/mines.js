import { ctx, game } from "../game.js";
import { randInt } from "../utils.js";
import { makeN } from "./entity.js";


const mine = () => {
	return {
		x: 0,
		y: 0,
		vx: Math.random() - 0.5,
		vy: Math.random() * 3,
		rotation: Math.random() * 10,
		width: 32,
		height: 32,
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
			this.image1.src = "images/mine1.png"
			this.image2.src = "images/mine2.png"
			this.image3.src = "images/mine3.png"
			this.image4.src = "images/mine4.png"
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
				const canvas = document.createElement("canvas")
				canvas.width = this.width;
				canvas.height = this.height;
				const context = canvas.getContext("2d");

				context.translate((this.width / 2), (this.height / 2))
				context.rotate(((this.ticks / 1000) * this.rotation) * Math.PI * 2)
				context.translate(0 - (this.width / 2), 0 - (this.height / 2))

				let tick = (this.ticks % 20) / 5
				if (tick < 1)
					context.drawImage(this.image1, 0, 0, this.width + 0, this.height + 0)
				else if (tick < 2)
					context.drawImage(this.image2, 0, 0, this.width + 0, this.height + 0)
				else if (tick < 3)
					context.drawImage(this.image3, 0, 0, this.width + 0, this.height + 0)
				else
					context.drawImage(this.image4, 0, 0, this.width + 0, this.height + 0)

				ctx.drawImage(canvas, this.x - 0, this.y - 0, this.width, this.height)

				//
				// 				let tick = (this.ticks % 20) / 5
				// 				if (tick < 1)
				// 					ctx.drawImage(this.image1, this.x, this.y, this.width, this.height)
				// 				else if (tick < 2)
				// 					ctx.drawImage(this.image2, this.x, this.y, this.width, this.height)
				// 				else if (tick < 3)
				// 					ctx.drawImage(this.image3, this.x, this.y, this.width, this.height)
				// 				else
				// 					ctx.drawImage(this.image4, this.x, this.y, this.width, this.height)

			}
		},
	}
};


export const mines = () => {
	return {
		mines: [],
		spawn() {
			this.mines = makeN(mine, 4)
			this.mines.forEach((x) => x.spawn())
		},
		update(dt) {
			this.mines.forEach((x) => x.update(dt))
		},
		draw() {
			this.mines.forEach((x) => x.draw())
		}
	}
}
