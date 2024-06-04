import { canvas, ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { debugThing, distanceBetweenPoints, findClosestThing, picker, randInt, thingsAreColliding } from "/zap/zap.js";

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
				r: this.width,
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
					ctx.arc(this.cx, this.cy, this.width - 5, 0, 2 * Math.PI);
					ctx.fill();
					break;
				case "head":
					// head
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.cx, this.cy, this.width, 0, 2 * Math.PI);
					ctx.fill();

					// eyes
					ctx.fillStyle = "#FFC104" // normal eyecolor
					// ctx.fillStyle = "#ff0000"// angry eyecolor

					ctx.beginPath();
					ctx.arc(this.cx - this.width / 2, this.cy + this.width / 2 + 3, 6, 0, 2 * Math.PI);
					ctx.fill();
					ctx.beginPath();
					ctx.arc(this.cx + this.width / 2, this.cy + this.width / 2 + 3, 6, 0, 2 * Math.PI);
					ctx.fill();
					break;
				default:
					ctx.fillStyle = this.color
					ctx.beginPath();
					ctx.arc(this.cx, this.cy, this.wobblywidth, 0, 2 * Math.PI);
					ctx.fill();
					break;
			}
			ctx.restore()
		},
		onHit() {
			this.dead = true;
			explode({
				x: this.cx,
				y: this.cy,
				styles: ["white", this.color],
				size: 10,
			})
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
				// this.snakes.forEach((s) => {
				// 	head.vx += (head.x - s.x) * cohesion / 100
				// 	head.vy += (head.y - s.y) * cohesion / 100
				// })
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

				if (closestSpaceman.dead
					|| distanceBetweenPoints(
						closestSpaceman.cx,
						closestSpaceman.cy,
						head.cx,
						head.cy) > screen.height) {
					head.vx = 0
					head.vy = 3
					return
				}
				if (thingsAreColliding(head, closestSpaceman)) {
					closestSpaceman.onHit()
					this.grow(5)
				}
				this.seeking = closestSpaceman.id

				let cohesion = 0.0075

				head.vx -= (head.x - closestSpaceman.x) * cohesion
				head.vy -= (head.y - closestSpaceman.y) * cohesion

				if (head.vx > 4) head.vx = 4
				if (head.vx < -4) head.vx = -4
				if (head.vy > 4) head.vy = 4
				if (head.vy < -4) head.vy = -4
			}
			this.states.walking = {}
			this.states.walking.colors = picker(["#ff00ff", "#ffff00", "#00ffff"])
			this.states.walking.update = () => {
				const head = this.snake[0]

				const closestSpaceman = findClosestThing(head, this.spacemen.spacemen)

				if (!closestSpaceman) {
					this.state = this.states.angry
					this.seeking = 0
					return
				}

				if (!closestSpaceman.dead
					&& distanceBetweenPoints(
						closestSpaceman.cx,
						closestSpaceman.cy,
						head.cx,
						head.cy) <= screen.height) {
					this.state = this.states.hungry
					return
				}

				if (this.ticker % 25 == 0) {
					head.vx = randInt(8) - 4
					head.vy = randInt(4)
				}
			}
			this.state = this.states.walking
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
		grow(n) {
			for (let i = 0; i < n; i++) {
				const segment = Segment()
				segment.spawn({
					x: this.snake[this.snake.length - 1].x,
					y: this.snake[this.snake.length - 1].y,
					color: this.state.colors.next()
				})
				this.snake.push(segment)
			}
		},
		update() {

			// move body
			for (let i = this.snake.length - 1; i > 0; i--) {
				this.snake[i].x = this.snake[i - 1].x
				this.snake[i].y = this.snake[i - 1].y
				this.snake[i].wobblywidth = this.snake[i - 1].wobblywidth
				this.snake[i].update()
			}

			// move head
			this.state.update()
			const head = this.snake[0]
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
					this.snake[i].y = 0 - canvas.height * 3 + (this.snake[i].y - canvas.height / 3) - lowestSnakeY
				}
			}

			this.ship.collide(this.snake)
			// collisions
			let dead = 0
			// this.snake.forEach((x) => { if (x.dead) dead++ })
			for (let i = 0; i < this.snake.length; i++) {
				if (this.snake[i].dead) dead++
				this.snake[i].dead = false
			}
			if (dead > 0)
				this.snake = this.snake.slice(0, -dead)
			if (this.snake.length < 1) {
				this.dead = true
				return
			}

			this.ticker++
			if (this.ticker > 1000) this.ticker = 0
		},
		draw() {
			if (this.dead) return
			debugThing(ctx, this.snake[0], this.snake.length.toString())
			for (let i = this.snake.length - 1; i >= 0; i--) {
				let position = "body"
				if (i == this.snake.length - 1) position = "tail"
				if (i === 0) position = "head"
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
				length: 10
			})
		},
		spawnSingle({ ship, spacemen, x, y, length }) {
			const snake = Snake()
			this.snakes.push(snake)
			snake.spawn({ snakes: this.snakes, ship: ship, spacemen: spacemen, x: x, y: y, length: length })
		},
		update() {
			this.snakes = this.snakes.filter((x) => { return x.dead !== true })
			this.snakes.forEach((s) => s.update())
		},
		draw() {
			this.snakes.forEach((s) => s.draw())
		},
	}
}
