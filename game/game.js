
import { asteroids } from "./entities/asteroids.js";
import { defenders } from "./entities/defenders.js";
import { galaxians } from "./entities/galaxians.js";
import { mines } from "./entities/mines.js";
import { spaceship } from "./entities/ship.js";
import { starfield } from "./entities/stars.js";

const canvas = document.getElementById("canvas");
canvas.width = window.screen.availWidth - 32;
canvas.height = window.screen.availHeight - 32;

export const ctx = canvas.getContext("2d");
export const game = { speed: 1 }

let raf;
let running = false;

let stars
let ship
let baddies1
let baddies2
let baddies3
let baddies4

const gameLoop = (dt) => {
	// update
	stars.update(dt)
	baddies1.update(dt)
	baddies2.update(dt)
	baddies3.update(dt)
	baddies4.update(dt)
	ship.update(dt)

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
	baddies1.draw()
	baddies2.draw()
	baddies3.draw()
	baddies4.draw()
	ship.draw()

	raf = window.requestAnimationFrame(gameLoop);
}

const main = () => {

	stars = starfield()
	stars.spawn()

	ship = spaceship()
	ship.spawn()

	baddies1 = asteroids()
	baddies1.spawn()

	baddies2 = mines()
	baddies2.spawn()

	baddies3 = defenders()
	baddies3.spawn()

	baddies4 = galaxians()
	baddies4.spawn()


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
