
import { build, version } from "./version.js";

import { asteroids as Asteroids } from "./entities/asteroids.js";
import { defenders as Defenders } from "./entities/defenders.js";
import { galaxians as Galaxians } from "./entities/galaxians.js";
import { starfield as Starfield } from "./entities/stars.js";

import { Hud } from "./entities/hud.js";
import { Mines } from "./entities/mines.js";
import { Particles } from "./entities/particles.js";
import { Pods } from "./entities/pods.js";
import { Powerups } from "./entities/powerups.js";
import { spaceship as Spaceship } from "./entities/ship.js";
import { Snakes } from "./entities/snakes.js";
import { Spacemen } from "./entities/spacemen.js";
import { Swarmers } from "./entities/swarmers.js";

export const canvas = document.getElementById("canvas");
canvas.width = window.screen.availWidth - 32;
canvas.height = window.screen.availHeight - 32;

export const ctx = canvas.getContext("2d");
export const game = {
	version: version,
	build: build,
	over: false,
	lives: 3,
	score: 0,
	speed: 1,
	particles: null,
	fontLoaded: false,
	debug: false,
	showColliders: false,
	massConstant: 500, //460,
}

let font1 = new FontFace("Robotron", "url(fonts/WilliamsRobotron.woff2)");
let font2 = new FontFace("Defender", "url(fonts/Defender.woff2)");

font1.load().then(() => {
	document.fonts.add(font1);
	font2.load().then(() => {
		document.fonts.add(font2);
		game.fontLoaded = true
	});
});

let raf;
let stars
let ship
let asteroids
let mines
let spacemen
let pods
let swarmers
let defenders
let galaxians
let snakes
let powerups
let hud


let score = 0

let filterStrength = 20;
let lastDT = 0

const gameLoop = (dt) => {
	lastDT = dt
	const frameTime = dt - lastDT

	const startTime = new Date()

	// collisions
	ship.collideWeaponsWithAll(
		[
			asteroids.asteroids,
			galaxians.galaxians,
			defenders.defenders,
			pods.pods,
			swarmers.swarmers,
			mines.mines,
			spacemen.spacemen
		])
	// crashes
	ship.crashIntoAll(
		[
			asteroids.asteroids,
			galaxians.galaxians,
			defenders.defenders,
			pods.pods,
			swarmers.swarmers,
			mines.mines,
			galaxians.shots,
			defenders.bombs,
			swarmers.bombs,
			snakes.all()
		])


	ship.collect(powerups.powerups)
	ship.collect(spacemen.spacemen)

	// update
	powerups.update(dt)
	stars.update(dt)
	asteroids.update(dt)
	mines.update(dt)
	spacemen.update(dt)
	pods.update(dt)
	swarmers.update(dt)
	defenders.update(dt)
	galaxians.update(dt)
	snakes.update(dt)
	ship.update(dt)
	game.particles.update(dt)

	hud.update(dt)

	// clear
	// if (ship.smartBomb.dead)
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// add background gradient
	ctx.globalAlpha = 1.0;
	ctx.save()
	const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
	gradient.addColorStop(0, " #FF00FF");
	gradient.addColorStop(1, "rgba(39,45,255,1.0)");
	ctx.fillStyle = gradient;
	ctx.globalAlpha = 0.2;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.restore()

	// draw entities
	stars.draw()
	snakes.draw()
	asteroids.draw()
	mines.draw()
	spacemen.draw()
	pods.draw()
	swarmers.draw()
	defenders.draw()
	galaxians.draw()
	powerups.draw()
	ship.draw()
	game.particles.draw()

	hud.draw()

	if (game.debug) {
		const noStars = stars.stars1.length + stars.stars2.length + stars.stars3.length
		const noGalaxians = galaxians.galaxians.length
		const noShots = galaxians.noShots.toString().padStart(2, "0")
		const noDefenders = defenders.defenders.length
		const nopods = pods.pods.length
		const noAsteroids = asteroids.asteroids.length
		const noBullets = ship.bullets.length.toString().padStart(2, "0")
		const noGuns = ship.guns
		const fps = (1000 / frameTime).toFixed(0) + " fps"
		const score = game.score.toString().padStart(8, "0")
		const noParticles = game.particles.noParticles.toString().padStart(4, "0")

		if (game.fontLoaded) {

			ctx.save()
			ctx.font = "16px sans-serif";
			ctx.fillStyle = "#00ff00";
			ctx.fillText(`Stars: ${noStars} | Galaxians: ${noGalaxians} | Defenders: ${noDefenders} | Pods: ${nopods} | Swarmers: ${nopods} | Asteroids: ${noAsteroids} | Bullets: ${noBullets} | Shots: ${noShots} | Guns: ${noGuns}`, 88, 28);
			ctx.strokeStyle = "#00ff00";
			ctx.beginPath();
			ctx.roundRect(80, 6, 708, 32, 8);
			ctx.stroke();

			ctx.fillText(`${fps}`, 14, 28);
			ctx.beginPath();
			ctx.roundRect(6, 6, 64, 32, 8);
			ctx.stroke();

			ctx.fillText(`Particles: ${noParticles}`, 14, 70);
			ctx.beginPath();
			ctx.roundRect(6, 50, 124, 32, 8);
			ctx.stroke();

			ctx.fillText(`Score: ${score}`, 150, 70);
			ctx.beginPath();
			ctx.roundRect(140, 50, 142, 32, 8);
			ctx.stroke()
			ctx.restore()
		}
		if (game.showColliders) {
			ctx.save()
			ctx.strokeStyle = "rgba(0,255,0,1.0)";
			ctx.lineWidth = 2;
			[
				ship.bullets,
				asteroids.asteroids,
				galaxians.galaxians,
				pods.pods,
				swarmers.swarmers,
				defenders.defenders,
				powerups.powerups,
				mines.mines,
				snakes.all(),
				spacemen.spacemen,
				galaxians.shots,
			].forEach((ent) => {
				ent.forEach((e) => {
					ctx.beginPath();
					ctx.arc(e.collider.x, e.collider.y, e.collider.r, 0, 2 * Math.PI);
					ctx.stroke();

				})
			})
			ctx.beginPath();
			ctx.arc(ship.collider[0].x, ship.collider[0].y, ship.collider[0].r, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(ship.collider[1].x, ship.collider[1].y, ship.collider[1].r, 0, 2 * Math.PI);
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(ship.shield.collider.x, ship.shield.collider.y, ship.shield.collider.r, 0, 2 * Math.PI);
			ctx.stroke();
			if (ship.shield.strength > 0)
				ctx.fillText(`${ship.shield.strength}`, ship.shield.collider.x + ship.shield.collider.r / 2, ship.shield.collider.y - ship.shield.collider.r / 2)

			ctx.restore()
		}
	}

	const endTime = new Date()
	const timeTaken = endTime - startTime
	ctx.fillText(`${Math.floor(timeTaken)}`, 10, 30)

	ctx.fillText(build, 10, 60)

	raf = window.requestAnimationFrame(gameLoop);
}

const main = () => {

	stars = Starfield()
	stars.spawn()

	game.particles = Particles()

	ship = Spaceship()

	asteroids = Asteroids()
	asteroids.spawn()

	mines = Mines()
	mines.spawn({ ship: ship })

	spacemen = Spacemen()
	spacemen.spawn({ ship: ship })

	swarmers = Swarmers()
	pods = Pods()
	pods.spawn({ swarmers: swarmers, ship: ship })

	defenders = Defenders()
	defenders.spawn({ ship: ship })

	galaxians = Galaxians()
	galaxians.spawn({ ship: ship })

	snakes = Snakes()
	snakes.spawn({ ship: ship, spacemen: spacemen })

	powerups = Powerups()
	powerups.spawn({ ship: ship })

	ship.spawn([
		asteroids,
		pods,
		swarmers,
		defenders,
		galaxians,
		powerups,
		spacemen,
		snakes,
		mines
	])


	hud = Hud()
	hud.init(ship, spacemen, [
		asteroids,
		pods,
		swarmers,
		defenders,
		galaxians,
		powerups,
		spacemen,
		snakes,
		mines
	])

	window.addEventListener(
		"keydown",
		(event) => {
			if (event.defaultPrevented) {
				return; // Do nothing if event already handled
			}
			// console.log(event.code)
			switch (event.code) {
				case "ArrowDown":
					ship.flameOn = false
					ship.break = true
					break;
				case "ArrowUp":
					// Handle "forward"
					ship.flameOn = true
					break;
				case "ArrowLeft":
					// Handle "turn left"
					ship.turn = -12.5 //move to ship
					break;
				case "ArrowRight":
					// Handle "turn right"
					ship.turn = 12.5 //move to ship
					break;
				case "Space":
					ship.startFiring()
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
					if (game.debug) game.debug = false
					else game.debug = true
					break;
				case "KeyZ":
					if (game.showColliders) game.showColliders = false
					else game.showColliders = true
					break;
				case "KeyW":
					asteroids.spawnSingle({})
					break;
				case "KeyQ":
					galaxians.spawnSingle({ ship: ship })
					break;
				case "Slash":
					ship.boostShields()
					break;
				case "Enter":
					ship.fireSmartBomb()
					break;
			}
		},
		true
	)
	window.addEventListener(
		"keyup",
		(event) => {
			if (event.defaultPrevented) {
				return; // Do nothing if event already handled
			}

			switch (event.code) {
				case "ArrowDown":
					ship.break = false
				case "ArrowUp":
					// Handle "forward"
					ship.flameOn = false
					break;
				case "ArrowLeft":
					// Handle "turn left"
					ship.turn = 0
					break;
				case "ArrowRight":
					// Handle "turn right"
					ship.turn = 0
					break;
				case "Space":
					ship.stopFiring()
					break;
			}
		},
		true
	)

	raf = window.requestAnimationFrame(gameLoop);
}

main()
