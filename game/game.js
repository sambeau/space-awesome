
import { asteroids as Asteroids } from "./entities/asteroids.js";
import { defenders as Defenders } from "./entities/defenders.js";
import { galaxians as Galaxians } from "./entities/galaxians.js";
import { mines as Mines } from "./entities/mines.js";
import { Particles } from "./entities/particles.js";
import { spaceship as Spaceship } from "./entities/ship.js";
import { starfield as Starfield } from "./entities/stars.js";

export const canvas = document.getElementById("canvas");
canvas.width = window.screen.availWidth - 32;
canvas.height = window.screen.availHeight - 32;

export const ctx = canvas.getContext("2d");
export const game = {
	speed: 1,
	particles: null
}

let raf;
let debug = false
let showColliders = false

let stars
let ship
let asteroids
let mines
let defenders
let galaxians

let score = 0

let filterStrength = 20;
let frameTime = 0, lastLoop = new Date, thisLoop;

const gameLoop = (dt) => {

	// collisions
	ship.collide(asteroids.asteroids)
	ship.collide(galaxians.galaxians)
	ship.collide(defenders.defenders)
	ship.collide(mines.mines)

	// update
	stars.update(dt)
	asteroids.update(dt)
	mines.update(dt)
	defenders.update(dt)
	galaxians.update(dt)
	ship.update(dt)
	game.particles.update(dt)

	// clear
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// add background gradient
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, " #FF00FF");
	gradient.addColorStop(1, "rgba(39,45,255,1.0)");
	ctx.fillStyle = gradient;
	ctx.globalAlpha = 0.2;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1.0;

	// draw entities
	stars.draw()
	asteroids.draw()
	mines.draw()
	defenders.draw()
	galaxians.draw()
	ship.draw()
	game.particles.draw()

	if (debug) {
		const noStars = stars.stars1.length + stars.stars2.length + stars.stars3.length
		const noGalaxians = galaxians.galaxians.length
		const noShots = galaxians.noShots < 10 ? "0" + galaxians.noShots : galaxians.noShots
		const noDefenders = defenders.defenders.length
		const noMines = mines.mines.length
		const noAsteroids = asteroids.asteroids.length
		const noBullets = ship.bullets.length < 10 ? "0" + ship.bullets.length : ship.bullets.length
		const noGuns = ship.guns
		const fps = (1000 / frameTime).toFixed(0) + " fps"

		ctx.font = "16px sans-serif";
		ctx.fillStyle = "#00ff00";
		ctx.fillText(`Stars: ${noStars} | Galaxians: ${noGalaxians} | Defenders: ${noDefenders} | Mines: ${noMines} | Asteroids: ${noAsteroids} | Bullets: ${noBullets} | Shots: ${noShots} | Guns: ${noGuns}`, 88, 28);
		ctx.strokeStyle = "#00ff00";
		ctx.beginPath();
		ctx.roundRect(80, 6, 708, 32, 8);
		ctx.stroke();

		ctx.fillText(`${fps}`, 14, 28);
		ctx.beginPath();
		ctx.roundRect(6, 6, 64, 32, 8);
		ctx.stroke();

		if (showColliders) {
			ctx.fillStyle = "rgba(0,255,0,0.5)";
			ctx.lineWidth = 2;
			[
				ship.bullets,
				asteroids.asteroids,
				galaxians.galaxians,
				mines.mines,
				defenders.defenders,
			].forEach((ent) => {
				ent.forEach((e) => {
					ctx.beginPath();
					ctx.arc(e.collider.x, e.collider.y, e.collider.r, 0, 2 * Math.PI);
					if (e.collider.colliding)
						ctx.fill();
					else
						ctx.stroke();
				})
			})
		}
	}

	var thisFrameTime = (thisLoop = new Date) - lastLoop;
	frameTime += (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
	raf = window.requestAnimationFrame(gameLoop);
}

const main = () => {

	stars = Starfield()
	stars.spawn()

	game.particles = Particles()

	ship = Spaceship()
	ship.spawn()

	asteroids = Asteroids()
	asteroids.spawn()

	mines = Mines()
	mines.spawn()

	defenders = Defenders()
	defenders.spawn({ ship: ship })

	galaxians = Galaxians()
	galaxians.spawn({ ship: ship })

	window.addEventListener(
		"keydown",
		(event) => {
			if (event.defaultPrevented) {
				return; // Do nothing if event already handled
			}
			console.log(event.code)
			switch (event.code) {
				case "KeyS":
				case "ArrowDown":
					ship.fire()
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
				case "Space":
					ship.fire()
					break;
				case "Digit1":
					console.log("guns 1")
					ship.guns = 1
					break;
				case "Digit2":
					console.log("guns 2")
					ship.guns = 2
					break;
				case "Digit3":
					console.log("guns 3")
					ship.guns = 3
					break;
				case "Backquote":
					if (debug) debug = false
					else debug = true
					break;
				case "KeyZ":
					if (showColliders) showColliders = false
					else showColliders = true
					break;
				case "KeyQ":
					galaxians.spawnSingle({ ship: ship })
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
				// case " ":
				// 	// Handle "fire!"
				// 	break;
			}
		}
	)

	raf = window.requestAnimationFrame(gameLoop);
}

main()
