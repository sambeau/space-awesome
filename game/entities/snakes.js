import { canvas, ctx, game } from "../game.js";
import { debugThing, distanceBetweenPoints, findClosestThing, picker, thingsAreColliding } from "/zap/zap.js";

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
			this.collider = {
				type: "circle",
				x: this.cx,
				y: this.cy,
				r: this.width / 2,
				colliding: false
			}
		},
		update() {
			this.x += this.vx
			this.y += this.vy + game.speed
			this.cx = this.x + this.width / 2
			this.cy = this.y + this.height / 2
			this.collider = {
				type: "circle",
				x: this.cx,
				y: this.cy,
				r: this.width / 2,
				colliding: false
			}
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
		vx: 0,
		vy: 8,
		colors: null,
		ticker: 0,
		state: null,
		states: {},
		seeking: 0,
		init() {
			this.states.angry = {}
			this.states.angry.colors = picker(["#080A32", "#FFC104"])
			this.states.angry.update = () => {
				let cohesion = 0.1
				const head = this.snake[0]

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
			}
			this.states.hungry = {}
			this.states.hungry.colors = picker(["#ff00ff", "#ffff00", "#00ffff"])
			this.states.hungry.update = () => {
				const head = this.snake[0]

				const closestSpaceman = findClosestThing(head, this.spacemen.spacemen)
				if (!closestSpaceman) {
					this.state = this.states.angry
					this.seeking = 0
					return
				}

				if (thingsAreColliding(head, closestSpaceman)) {
					closestSpaceman.dead = true
				}
				this.seeking = closestSpaceman.id

				head.vx = 0
				head.vy = 0
				if (closestSpaceman.cx > head.cx) {
					//go right
					head.vx = 2
				} else {
					head.vx = -2
				}
				if (closestSpaceman.cy > head.cy) {
					//go right
					head.vy = 2
				} else {
					head.vy = 0
				}
			}
			this.state = this.states.hungry
		},
		all() {
			return this.snake
		},
		spawn({ snakes, ship, spacemen, x, y, length }) {
			this.ship = ship
			this.snakes = snakes
			this.spacemen = spacemen

			this.x = x
			this.y = y
			this.cx = x + this.width / 2
			this.cy = y + this.height / 2

			this.init()

			for (let i = 0; i < length; i++) {
				this.snake[i] = Segment()
				this.snake[i].spawn({ x: this.x, y: this.y, color: this.state.colors.next() })
			}
		},
		grow() {
			const segment = Segment()
			segment.spawn({
				x: this.snake[this.snake.length - 1].x,
				y: this.snake[this.snake.length - 1].y,
				color: this.state.colors.next()
			})
			this.snake.push(segment)
		},
		update() {
			// move body
			for (let i = this.snake.length - 1; i > 0; i--) {
				// if (this.ticker % 2 == 0) {
				if (distanceBetweenPoints(
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
				this.snake[i].update()
			}
			const head = this.snake[0]
			// move head
			if (this.ticker % 8 == 0) {
				this.state.update()
			}
			head.update()

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
					this.snake[i].y = 0 /*- canvas.height * 2*/ + (this.snake[i].y - canvas.height / 3) - lowestSnakeY
				}
			}

			this.ticker++
			if (this.ticker > 1000) this.ticker = 0
		},
		draw() {
			debugThing(ctx, this.snake[0], this.seeking.toString())
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
