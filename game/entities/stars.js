import { ctx, game } from "../game.js";
import { randInt } from "/zap/zap.js"
import { makeN } from "/zap/zap.js";

const star = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 3,
		radius: 3,
		color: "pink",
		spawn({ color, size, speed }) {
			// this.color = pick(["#fff", "#0ff", "#ff0", "#f0f", "#0ff"])
			this.color = color
			this.size = size
			this.x = randInt(canvas.width)
			this.y = randInt(canvas.height)
			this.radius = (randInt(this.size) + 1)
			this.width = (1 * this.radius)
			this.height = (1 * this.radius)
			this.vy = speed
		},
		outOfBoundsV() {
			if (this.y > canvas.height || this.y < 0) return true
			return false;
		},
		update(/*dt*/) {
			this.y += this.vy + game.speed;
			if (this.outOfBoundsV()) {
				this.y = randInt(100) - 100
				this.x = randInt(canvas.width)
				this.radius = (randInt(this.size) + 1)
				this.width = (1 * this.radius)
				this.height = (1 * this.radius)
			}
		},
		draw() {
			ctx.beginPath();
			if (this.radius > 2) {
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
				ctx.closePath();
				ctx.fillStyle = this.color;
				ctx.fill();
			}
			else
				ctx.fillRect(this.x, this.y, this.radius * 2, this.radius * 2)

		},
	}
};


const starfield = () => {
	return {
		stars1: [],
		stars2: [],
		stars3: [],
		spawn() {
			this.stars1 = makeN(star, 64)
			this.stars2 = makeN(star, 64)
			this.stars3 = makeN(star, 32)
			this.stars1.forEach((b) => b.spawn({ color: "#ffdddd44", size: 2, speed: 0.125 }))
			this.stars2.forEach((b) => b.spawn({ color: "#ddddff66", size: 3, speed: 0.25 }))
			this.stars3.forEach((b) => b.spawn({ color: "#ffffee66", size: 4, speed: 0.5 }))
		},
		update(dt) {
			this.stars1.forEach((b) => b.update(dt))
			this.stars2.forEach((b) => b.update(dt))
			this.stars3.forEach((b) => b.update(dt))
		},
		draw() {
			this.stars1.forEach((b) => b.draw())
			this.stars2.forEach((b) => b.draw())
			this.stars3.forEach((b) => b.draw())
		}
	}
}

export { starfield };
