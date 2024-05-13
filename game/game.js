const canvas = document.getElementById("canvas");
canvas.width = window.screen.availWidth - 32;
canvas.height = window.screen.availHeight - 32;
const ctx = canvas.getContext("2d");
let raf;
let running = false;
let gameSpeed = 1;


let stars
let ship

function randInt(n) {
	return Math.floor(Math.random() * n)
}
function pick(xs) {
	return xs[randInt(xs.length)]
}
function makeN(thing, n) {
	let things = []
	for (i = 0; i < n; i++)
		things.push(thing())
	return things
}

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
			this.y += this.vy + gameSpeed;
			if (this.outOfBoundsV()) {
				this.y = 0
				this.x = randInt(canvas.width)
				this.radius = (randInt(this.size) + 1)
				this.width = (1 * this.radius)
				this.height = (1 * this.radius)
			}
		},
		draw() {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fillStyle = this.color;
			ctx.fill();
		},
	}
};


const starfield = () => {
	return {
		stars1: [],
		stars2: [],
		stars3: [],
		spawn() {
			this.stars1 = makeN(star, 200)
			this.stars2 = makeN(star, 50)
			this.stars3 = makeN(star, 12)
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

const flames = () => {
	return {
		x: 0,
		y: 0,
		width: 20,
		height: 100,
		offsetx: 0,
		offsety: 0,
		flameOn: false,
		flame1: new Image(),
		flame1Loaded: false,
		flame2: new Image(),
		flame2Loaded: false,
		flamecounter: 0,
		brightflame: false,
		flamelength: 10,

		spawn({ offsetx, offsety }) {
			this.offsetx = offsetx
			this.offsety = offsety
			this.flame1.onload = () => {
				this.flame1Loaded = true
			}
			this.flame2.onload = () => {
				this.flame2Loaded = true
			}
			this.flame1.src = "images/flame1.png"
			this.flame2.src = "images/flame2.png"
		},
		update({ parentx, parenty, flameOn }) {
			this.flameOn = flameOn
			this.flamecounter += 1
			if (this.flamecounter == this.flamelength) {
				if (this.brightflame)
					this.brightflame = false
				else
					this.brightflame = true
				this.flamecounter = 0
				this.flamelength = 1 + randInt(10) + randInt(10)
			}
			this.x = parentx + this.offsetx
			this.y = parenty + this.offsety
		},
		draw() {
			if (this.flame1Loaded && this.flame2Loaded && this.flameOn) {
				if (!randInt(5) == 0)
					if (this.brightflame)
						ctx.drawImage(this.flame2, this.x, this.y, this.width, this.height);
					else
						ctx.drawImage(this.flame1, this.x, this.y, this.width, this.height);
			}

		},
	}
}
const spaceship = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		image: new Image(),
		imageLoaded: false,
		flames: flames(),
		flameOn: false,
		turn: 0,
		spawn() {
			this.width = 66
			this.height = 85
			this.image.onload = () => {
				this.imageLoaded = true
			}
			this.image.src = "images/ship.png"
			this.y = canvas.height - this.height * 2;
			this.x = canvas.width / 2;
			this.flames.spawn({ offsetx: 23, offsety: 74 })
		},
		outOfBoundsTop() {
			if (this.y >= canvas.height) return true
			return false;
		},
		outOfBoundsBottom() {
			if (this.y <= 0) return true
			return false;
		},
		outOfBoundsLeft() {
			if (this.x <= 0) return true
			return false
		},
		outOfBoundsRight() {
			if (this.x >= canvas.width) return true
			return false
		},
		outOfBoundsV() {
			return this.outOfBoundsTop() || this.outOfBoundsBottom()
		},
		outOfBoundsH() {
			return this.outOfBoundsLeft() || this.outOfBoundsRight()
		},
		update(/*dt*/) {
			if (this.flameOn) {
				if (!this.outOfBoundsV()) {
					this.vy = -3
					if (gameSpeed < 10) gameSpeed *= 1.025
				}
			}
			if (!this.flameOn) {
				if (this.outOfBoundsV()) {
					this.vy = 0
				}
				else this.vy = 4
				if (gameSpeed > 1) gameSpeed *= 0.99
			}
			if (this.turn !== 0) {
				if (!this.outOfBoundsH()) {
					this.x += this.turn
				}
			}

			this.y += this.vy;
			this.x += this.vx;

			if (this.outOfBoundsH()) {
				this.vx = 0
			}
			this.flames.update({ parentx: this.x, parenty: this.y, flameOn: this.flameOn })
		},
		draw() {
			if (this.imageLoaded) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
				this.flames.draw()
			}
			ctx.strokeStyle = "rgb(255 0 0 / 100%)";
			ctx.strokeRect(this.x, this.y, this.width, this.height)
		},
	}
}


const gameLoop = (dt) => {
	// update
	stars.update(dt)
	ship.update(dt)

	// clear
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// draw
	stars.draw()
	ship.draw()

	raf = window.requestAnimationFrame(gameLoop);
}

const main = () => {

	stars = starfield()
	stars.spawn()

	ship = spaceship()
	ship.spawn()

	window.addEventListener(
		"keydown",
		(event) => {
			if (event.defaultPrevented) {
				return; // Do nothing if event already handled
			}

			switch (event.code) {
				case "KeyS":
				case "ArrowDown":
					// Handle "back"
					break;
				case "KeyW":
				case "ArrowUp":
					// Handle "forward"
					ship.flameOn = true
					break;
				case "KeyA":
				case "ArrowLeft":
					// Handle "turn left"
					ship.turn = -10
					break;
				case "KeyD":
				case "ArrowRight":
					// Handle "turn right"
					ship.turn = 10
					break;
			}
		}
	)
	window.addEventListener(
		"keyup",
		(event) => {
			if (event.defaultPrevented) {
				return; // Do nothing if event already handled
			}

			switch (event.code) {
				case "KeyS":
				case "ArrowDown":
					// Handle "back"
					break;
				case "KeyW":
				case "ArrowUp":
					// Handle "forward"
					ship.flameOn = false
					break;
				case "KeyA":
				case "ArrowLeft":
					// Handle "turn left"
					ship.turn = 0
					break;
				case "KeyD":
				case "ArrowRight":
					// Handle "turn right"
					ship.turn = 0
					break;
			}
		}
	)

	raf = window.requestAnimationFrame(gameLoop);
}
main()
