
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
