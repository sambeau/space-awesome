import { canvas, ctx, game } from "../game.js";
import { picker } from "../utils.js";
import { collisionBetweenCircles, distanceBetweenCircles } from "./entity.js";

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
		width: 16,
		height: 16,
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
					ctx.arc(this.x, this.y, this.width - 5, 0, 2 * Math.PI);
					ctx.fill();
					break;
				case "head":
					// head
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.x, this.y, this.width, 0, 2 * Math.PI);
					ctx.fill();

					// eyes
					ctx.fillStyle = "#FFC104" // normal eyecolor
					// ctx.fillStyle = "#ff0000"// angry eyecolor

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
		snakes: null,
		mode: 'angry',
		vx: 0,
		vy: 8,
		colors: null,
		ticker: 0,
		init() { },
		all() {
			return this.snake
		},
		spawn({ snakes, ship, spacemen, x, y, length }) {
			// console.log({ ship, x, y, length })
			this.ship = ship
			this.snakes = snakes
			this.spacemen = spacemen
			// console.log("spacemen:", this.spacemen.all())
			this.x = x
			this.y = y
			// this.colors = picker(["#080A32", "#06BA01", "#FFB301"])
			// this.colors = picker(["#080A32", "#FFC104"]) // angry
			this.colors = picker(["#ff00ff", "#ffff00", "#00ffff"]) // hungry
			// this.colors = picker(["#B102B9", "#B1AA11", "#09AAB9"]) // angry
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
				// if (this.ticker % 2 == 0) {
				if (distanceBetweenCircles(
					this.snake[i].x,
					this.snake[i].y,
					this.snake[i - 1].x,
					this.snake[i - 1].y) < this.snake[i - 1].width / 4
				) {
					this.snake[i].vx = 0
					this.snake[i].vy = 0
				}
				else {
					this.snake[i].vx = this.snake[i - 1].vx
					this.snake[i].vy = this.snake[i - 1].vy
				}
				this.snake[i].wobblywidth = this.snake[i - 1].wobblywidth

				// }
				this.snake[i].x += this.snake[i].vx
				this.snake[i].y += this.snake[i].vy + game.speed
			}
			const head = this.snake[0]
			// move head
			if (this.ticker % 8 == 0) {

				if (this.mode === 'angry') {

					let cohesion = 0.1
					head.vx -= (head.x - this.ship.x) * cohesion
					head.vy -= (head.y - this.ship.y) * cohesion
					this.snakes.forEach((s) => {
						head.vx += (head.x - s.x) * cohesion / 100
						head.vy += (head.y - s.y) * cohesion / 100
					})
					if (head.vx > 5) head.vx = 5
					if (head.vx < -5) head.vx = -5
					if (head.vy > 4) head.vy = 4
					if (head.vy < -4) head.vy = -4

				} else if (this.mode === 'searching') {
					console.log(this.mode)
					// find nearest spaceman
					let nearestDistance = Number.MAX_VALUE
					let nearestSpaceman
					const spacemen = this.spacemen.all()

					for (let i = 0; i < spacemen.length; i++) {
						const s = spacemen[i]
						const d = distanceBetweenCircles(head.x, head.y, s.x, s.y)
						if (d < nearestDistance) {
							console.log(i)
							nearestDistance = d
							nearestSpaceman = s
						}
					}

					// find biggest of width/height
					if (nearestSpaceman && (nearestDistance < screen.height)) {
						this.seeking = nearestSpaceman
						this.mode = 'seeking'
					}
					else {
						// move down
						head.vx = 0;
						head.vy = 8//10;
					}
					// move that way at speed


				} else if (this.mode === 'seeking') {
					console.log(this.mode, this.seeking)
					if (this.seeking.dead == true) {
						this.mode = "searching"
					} else if (collisionBetweenCircles(
						head.x,
						head.y,
						head.width,
						this.seeking.collider.x,
						this.seeking.collider.y,
						this.seeking.collider.r,
					)) {
						// collide
						console.log("collide!")
						this.seeking.dead = true
					} else {
						if (this.seeking.y >= this.y) {
							//seek down
							console.log("seek DOWN", this.seeking.y - this.y)
							head.vx = 0;
							head.vy = 8
						} else if (this.seeking.x < this.x) {
							// seek left
							console.log("seek LEFT", this.seeking.x - this.x)
							head.vx = -8;
							head.vy = 0
						} else if (this.seeking.x >= this.x) {
							// seek right
							console.log("seek RIGHT", this.seeking.x - this.x)
							head.vx = 8
							head.vy = 0
						} else {
							// seek up
							console.log("seek UP", this.seeking.y - this.y)
							head.vx = 0
							head.vy = -8
						}
					}
				}
			}

			head.x += head.vx
			head.y += head.vy + game.speed

			head.wobblywidth = Math.cos(this.ticker / 33 * 2 * Math.PI) * 2 + head.width

			for (let i = 0; i < this.snake.length; i++) {
				if (this.snake[i].outOfBoundsL())
					this.snake[i].x = canvas.width
				if (this.snake[i].outOfBoundsR())
					this.snake[i].x = 0 - this.snake[i].width
			}
			let lowestSnakeY = head.y
			this.snake.forEach((s) => { if (s.y < lowestSnakeY) lowestSnakeY = s.y })
			if (lowestSnakeY > canvas.height + head.height) {
				for (let i = 0; i < this.snake.length; i++) {
					this.snake[i].y = 0 - canvas.height * 2 + (this.snake[i].y - canvas.height) - lowestSnakeY
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
		spawn({ ship, spacemen }) {
			this.spawnSingle({
				ship: ship,
				snakes: this.snakes,
				spacemen: spacemen,
				x: canvas.width * Math.random(),
				y: Math.random() * (canvas.height / 2 - canvas.height * 3),
				length: 16
			})
		},
		spawnSingle({ ship, spacemen, x, y, length }) {
			const snake = Snake()
			this.snakes.push(snake)
			snake.spawn({ snakes: this.snakes, ship: ship, spacemen: spacemen, x: x, y: y, length: length })
		},
		update() {
			this.snakes.forEach((s) => s.update())
		},
		draw() {
			this.snakes.forEach((s) => s.draw())
		},
	}
}
