import { ctx, game } from "../game.js";

const debug = false

export const Particle = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 10,
		height: 10,
		lifespan: 10,
		style: "white",
		dead: false,
		spawn({ x, y, width, height, vx, vy, lifespan, style }) {
			this.x = x
			this.y = y
			this.width = width
			this.height = height
			this.vx = vx
			this.vy = vy
			this.lifespan = lifespan
			this.tick = lifespan
			this.style = style
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

			ctx.fillStyle = this.style
			ctx.globalAlpha = this.tick / this.lifespan
			ctx.fillRect(this.x, this.y, this.width, this.height);
			ctx.globalAlpha = 1.0
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
				style: style
			})
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
