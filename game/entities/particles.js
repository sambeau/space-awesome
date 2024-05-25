import { ctx, game } from "../game.js";
import { picker } from "../utils.js";

const debug = false

function circleOfPoints() {
	let points = []
	for (let i = 0; i < n; i++) {
		points[i] = {
			x: centerX + radius * Math.cos((i * 2 * Math.PI) / n),
			y: centerY + radius * -Math.sin((i * 2 * Math.PI) / n),
		}
	}
	return points
}

const randomColors = picker(["#ffffff", "#00ffff", "#ff00ff", "#ffff00"])

export const Particle = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 10,
		height: 10,
		lifespan: 10,
		fillStyle: "white",
		dead: false,
		spawn({ x, y, width, height, vx, vy, lifespan, fillStyle }) {
			this.x = x
			this.y = y
			this.width = width
			this.height = height
			this.vx = vx
			this.vy = vy
			this.lifespan = lifespan
			this.tick = lifespan
			this.fillStyle = fillStyle
			if (this.fillStyle == "random")
				this.fillStyle = randomColors.any()
		},
		update(/*dt*/) {
			this.tick--
			if (this.tick === 0) {
				this.dead = true
			} else {
				this.x += this.vx
				this.y += this.vy + game.speed;
			}

		},
		draw() {
			if (this.dead) return
			if (this.lifespan <= 0) return

			ctx.save()
			ctx.fillStyle = this.fillStyle
			ctx.globalAlpha = this.tick / this.lifespan
			ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.globalAlpha = 1.0
			ctx.restore()
		},
	}
}

export const Particles = () => {
	return {
		particles: [],
		noParticles: 0,
		spawnSingle({ x, y, width, height, vx, vy, lifespan, style }) {
			const particle = Particle()
			this.particles.push(particle)
			particle.spawn({
				x: x,
				y: y,
				width: width,
				height: height,
				vx: vx,
				vy: vy,
				lifespan: lifespan,
				fillStyle: style
			})
		},
		spawnCircle({ points, cx, cy, width, height, speed, lifespan, style }) {
			speed = speed ? speed : 1
			console.log("spawnCircle", { points, cx, cy, width, height, speed, lifespan, style })
			let radius = 1
			for (let i = 0; i < points; i++) {
				let vx = radius * Math.cos((i * 2 * Math.PI) / points)
				let vy = radius * -Math.sin((i * 2 * Math.PI) / points)
				console.log(
					"spawnSingle", {
					x: cx,
					y: cy,
					width: width,
					height: height,
					vx: vx * speed,
					vy: vy * speed,
					lifespan: lifespan,
					style: style,
				})
				this.spawnSingle({
					x: cx,
					y: cy,
					width: width,
					height: height,
					vx: vx * speed,
					vy: vy * speed,
					lifespan: lifespan,
					style: style,
				})
			}
		},
		update(dt) {
			this.particles = this.particles.filter((b) => { return b.dead !== true })
			this.particles.forEach((x) => x.update(dt))
			this.noParticles = this.particles.length
		},
		draw() {
			this.particles.forEach((x) => x.draw())
		}
	}
}
