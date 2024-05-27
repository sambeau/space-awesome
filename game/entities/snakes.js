import { canvas, ctx, game } from "../game.js";
import { picker } from "../utils.js";
import { distanceBetweenCircles } from "./entity.js";

// angle in radians
const angleRadians = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

// angle in degrees
const angleDeg = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

const Segment = () => {
	return {
		name: "snake",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 20,
		height: 20,
		color: "#FFC104",
		spawn({ x, y, color }) {
			this.x = x
			this.y = y
			this.color = color
		},
		outOfBoundsB() {
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
		draw(position) {
			ctx.save()
			switch (position) {
				case "tail":
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.width - 10, 0, 2 * Math.PI);
					ctx.fill();
					break;
				case "head":
					// head
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
					ctx.fill();

					// eyes
					ctx.fillStyle = "#FFC104" // eyecolor

					ctx.beginPath();
					ctx.arc(this.x - this.width / 2, this.y + this.width / 2 + 3, 6, 0, 2 * Math.PI);
					ctx.fill();
					ctx.beginPath();
					ctx.arc(this.x + this.width / 2, this.y + this.width / 2 + 3, 6, 0, 2 * Math.PI);
					ctx.fill();
					break;
				default:
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.wobblywidth, 0, 2 * Math.PI);
					ctx.fill();
					break;
			}
			ctx.restore()

		},
	}
}

const Snake = () => {
	return {
		ship: null,
		snake: [],
		vx: 0,
		vy: 4,
		colors: null,
		ticker: 0,
		init() { },
		all() {
			return this.snake
		},
		spawn({ ship, x, y, length }) {
			// console.log({ ship, x, y, length })
			this.ship = ship
			this.x = x
			this.y = y
			this.colors = picker(["#080A32", "#06BA01", "#FFB301"])
			// this.colors = picker(["#080A32", "#FFC104"])
			for (let i = 0; i < length; i++) {
				this.snake[i] = Segment()
				this.snake[i].spawn({ x: this.x, y: this.y, color: this.colors.next() })
			}
		},
		grow() {
			const segment = Segment()
			segment.spawn({
				x: this.snake[this.snake.length - 1].x,
				y: this.snake[this.snake.length - 1].y,
				color: this.colors.next()
			})
			this.snake.push(segment)
		},
		update() {
			// move body
			for (let i = this.snake.length - 1; i > 0; i--) {
				if (this.ticker % 2 == 0) {
					if (distanceBetweenCircles(this.snake[i].x, this.snake[i].y, this.snake[i - 1].x, this.snake[i - 1].y) < this.snake[i - 1].width / 4) {
						this.snake[i].vx = 0
						this.snake[i].vy = 0
					}
					else {
						this.snake[i].vx = this.snake[i - 1].vx
						this.snake[i].vy = this.snake[i - 1].vy
					}
					this.snake[i].wobblywidth = this.snake[i - 1].wobblywidth

				}
				this.snake[i].x += this.snake[i].vx
				this.snake[i].y += this.snake[i].vy + game.speed
			}

			if (this.ticker % 2 == 0) {
				// move head
				let cohesion = 0.1
				this.snake[0].vx -= (this.snake[0].x - this.ship.x) * cohesion
				this.snake[0].vy -= (this.snake[0].y - this.ship.y) * cohesion// * 0.5
				if (this.snake[0].vx > 5) this.snake[0].vx = 5
				if (this.snake[0].vx < -5) this.snake[0].vx = -5
				if (this.snake[0].vy > 4) this.snake[0].vy = 4
				if (this.snake[0].vy < -4) this.snake[0].vy = -4
			}
			this.snake[0].x += this.snake[0].vx
			this.snake[0].y += this.snake[0].vy + game.speed
			this.snake[0].wobblywidth = Math.cos(this.ticker / 33 * 2 * Math.PI) * 2 + this.snake[0].width

			for (let i = 0; i < this.snake.length; i++) {
				if (this.snake[i].outOfBoundsL())
					this.snake[i].x = canvas.width
				if (this.snake[i].outOfBoundsR())
					this.snake[i].x = 0 - this.snake[i].width
			}
			let lowestSnakeY = this.snake[0].y
			this.snake.forEach((s) => { if (s.y < lowestSnakeY) lowestSnakeY = s.y })
			if (lowestSnakeY > canvas.height + this.snake[0].height) {
				for (let i = 0; i < this.snake.length; i++) {
					this.snake[i].y = 0 - canvas.height * 3 + (this.snake[i].y - canvas.height) - lowestSnakeY
				}
			}

			this.ticker++
			if (this.ticker > 1000) this.ticker = 0
		},
		draw() {
			for (let i = this.snake.length - 1; i >= 0; i--) {
				let position = "body"
				if (i === 0) position = "head"
				if (i == this.snake.length - 1) position = "tail"
				this.snake[i].draw(position)
			}
		},
	}
}

export const Snakes = () => {
	return {
		snakes: [],
		init() { },
		all() {
			let allSnakes = []
			this.snakes.forEach((s) => {
				allSnakes = [...allSnakes, ...s.all()]
			})
			return allSnakes
		},
		spawn({ ship }) {
			this.spawnSingle({
				ship: ship,
				x: canvas.width * Math.random(),
				y: Math.random() * (canvas.height / 2 - canvas.height * 3),
				length: 64
			})
			// this.spawnSingle({
			// 	ship: ship,
			// 	x: canvas.width * Math.random(),
			// 	y: Math.random() * (canvas.height / 2 - canvas.height * 3),
			// 	length: 12
			// })
			// this.spawnSingle({
			// 	ship: ship,
			// 	x: canvas.width * Math.random(),
			// 	y: Math.random() * (canvas.height / 2 - canvas.height * 3),
			// 	length: 4
			// })
		},
		spawnSingle({ ship, x, y, length }) {
			const snake = Snake()
			this.snakes.push(snake)
			snake.spawn({ ship: ship, x: x, y: y, length: length })
		},
		update() {
			this.snakes.forEach((s) => s.update())
		},
		draw() {
			this.snakes.forEach((s) => s.draw())
		},
	}
}
