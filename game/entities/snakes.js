import { canvas, ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import {
	debugThing, distanceBetweenPoints,
	findClosestThing, randInt, stereoFromScreenX, thingsAreColliding, volumeFromY
} from "/zap/zap.js";

var eatenSound = new Howl({ src: ['/sounds/eaten.mp3'] });
eatenSound.volume(0.2)
var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.025)

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
		score: 50,
		snake: null,
		spawn({ snake, x, y }) {
			this.snake = snake
			this.x = x
			this.y = y
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
			ctx.globalAlpha = 1.0
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
			bangSound.play()
			bangSound.stereo(stereoFromScreenX(screen, this.x))

			this.dead = true;
			console.log(this)
			this.snake.split(this.x, this.y)
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
		score: 1000,
		headScore: 500,
		init() {
			this.states.angry = {}
			this.states.angry.colors = ["#190533", "#190533", "#190533", "#ffff00", "#ffff00", "#ffff00"]
			this.states.angry.update = () => {
				if (game.over)
					this.states.walking.update()

				let cohesion = 0.1
				const head = this.snake[0]

				head.vx -= (head.x - this.ship.x) * cohesion
				head.vy -= (head.y - this.ship.y) * cohesion
				this.snakes.snakes.forEach((s) => {
					head.vx += (head.x - s.x) * cohesion / 100
					head.vy += (head.y - s.y) * cohesion / 100
				})
				if (head.vx > 5) head.vx = 5
				if (head.vx < -5) head.vx = -5
				if (head.vy > 5) head.vy = 5
				if (head.vy < -4) head.vy = -4
			}
			//
			this.states.fleeLeft = {}
			this.states.fleeLeft.colors = [
				"#00ffff",
				"#ff00ff",
				"#ffff00",
				"#ffffff",
			]
			this.states.fleeLeft.update = () => {
				const head = this.snake[0]
				head.vx = -15
				head.vy = randInt(10) - 5

				if (head.x + head.width + head.vx + 1 < 0)
					this.state = this.states.hungry
			}
			//
			this.states.fleeRight = {}
			this.states.fleeRight.colors = [
				"#00ffff",
				"#ff00ff",
				"#ffff00",
				"#ffffff",
			]
			this.states.fleeRight.update = () => {
				const head = this.snake[0]
				head.vx = 15
				head.vy = randInt(10) - 5
				if (head.x + head.vx > canvas.width)
					this.state = this.states.hungry
			}
			//
			this.states.hungry = {}
			this.states.hungry.colors = ["#ff00ff",
				"#ff00ff",
				"#ffff00",
				"#ffff00",
				"#00ffff",
				"#00ffff"
			]
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
					eatenSound.play()
					eatenSound.stereo(stereoFromScreenX(screen, this.x))
					eatenSound.volume(0.2 * volumeFromY(screen, 3, this.y)) // 3==screens

					closestSpaceman.onEat()
					this.grow(5)
				}
				this.seeking = closestSpaceman.id

				let cohesion = 0.0175

				head.vx -= (head.x - closestSpaceman.x) * cohesion
				head.vy -= (head.y - closestSpaceman.y) * cohesion
				this.snakes.snakes.forEach((s) => {
					head.vx += (head.x - s.x) * cohesion / 100
					head.vy += (head.y - s.y) * cohesion / 100
				})

				if (head.vx > 5) head.vx = 5
				if (head.vx < -5) head.vx = -5
				if (head.vy > 5) head.vy = 5
				if (head.vy < -5) head.vy = -5
			}
			//
			this.states.walking = {}
			this.states.walking.colors = [
				"#ff00ff",
				"#ffff00",
				"#ffff00",
				"#00ffff",
				"#00ffff"
			]
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
				let cohesion = 0.05

				this.snakes.snakes.forEach((s) => {
					head.vx += (head.x - s.x) * cohesion / 100
					head.vy += (head.y - s.y) * cohesion / 100
				})

			}

			this.state = this.states.walking
		},
		all() {
			return this.snake
		},
		spawn({ snakes, ship, spacemen, x, y, length, state }) {
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
				this.snake[i].spawn({ snake: this, x: this.x, y: this.y })
			}

			if (state == "fleeLeft") this.state = this.states.fleeLeft
			if (state == "fleeRight") this.state = this.states.fleeRight
		},
		grow(n) {
			for (let i = 0; i < n; i++) {
				const segment = Segment()
				segment.spawn({
					snake: this,
					x: this.snake[this.snake.length - 1].x,
					y: this.snake[this.snake.length - 1].y,
				})
				this.snake.push(segment)
			}
		},
		split(x, y) {

			if (
				!this.dead
				&& this.snake.length > 20
				&& this.state !== this.states.fleeLeft
				&& this.state !== this.states.fleeRight
			) {
				this.dead = true
				this.snakes.spawnSingle({ ship: this.ship, spacemen: this.spacemen, x: x, y: y, length: this.snake.length / 2 - 1, state: "fleeLeft" })
				this.snakes.spawnSingle({ ship: this.ship, spacemen: this.spacemen, x: x, y: y, length: this.snake.length / 2 - 1, state: "fleeRight" })
			}

		},
		update() {
			// move body
			if (this.ticker % 300 == 0) this.grow(1) // keep on growing!

			for (let i = this.snake.length - 1; i > 0; i--) {
				// if (distanceBetweenPoints(
				// 	this.snake[i].x,
				// 	this.snake[i].y,
				// 	this.snake[i - 1].x,
				// 	this.snake[i - 1].y
				// ) > this.snake[i].width * 0.5
				// ) {
				this.snake[i].x = this.snake[i - 1].x
				this.snake[i].y = this.snake[i - 1].y
				// }
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

			this.ship.collideWeaponsWith(this.snake)
			// collisions
			let dead = 0
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

			const colors = this.state.colors
			const n = colors.length

			if (this.state == this.states.fleeLeft
				|| this.state == this.states.fleeRight)
				for (let i = 0; i < this.snake.length; i++) // flash
					this.snake[i].color = colors[randInt(this.snake.length)]
			else
				for (let i = 0; i < this.snake.length; i++)
					this.snake[i].color = colors[(i % n + n) % n]
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
				snakes: this,
				spacemen: spacemen,
				x: canvas.width * Math.random(),
				y: 200,//Math.random() * (canvas.height / 2 - canvas.height * 3),
				length: 8
			})
		},
		spawnSingle({ ship, spacemen, x, y, length, state }) {
			const snake = Snake()
			this.snakes.push(snake)
			snake.spawn({ snakes: this, ship: ship, spacemen: spacemen, x: x, y: y, length: length, state: state })
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
