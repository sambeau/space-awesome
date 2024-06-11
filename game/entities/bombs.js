import { canvas, ctx, game } from "../game.js";
import { explode } from "./explosions.js";

const debug = false

let bombImage = new Image()
let bombImageLoaded = false
bombImage.src = "images/bomb.png"
bombImage.onload = () => {
	bombImageLoaded = true
}

export const bomb = () => {
	return {
		name: "bomb",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 6,
		height: 35,
		speed: 10,
		shooter: null,
		dead: false,
		collider: {
			type: "circle",
			ox: 3,
			oy: 32,
			r: 3,
			area: 5,
			colliding: false
		},
		spawn({ atx, aty, shooter }) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 4
			this.vy = this.speed
			this.shooter = shooter
			this.shooter.bombs++
		},
		outOfBoundsBottom() {
			if (this.y >= canvas.height) return true
			return false;
		},
		update(/*dt*/) {
			if (this.outOfBoundsBottom()) {
				this.y = 0
				this.vy = 0
				this.dead = true
				this.shooter.bombs--
				// this.shooter.removeShot()
			} else
				this.y += this.vy + game.speed;

			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

		},
		onHit() {
			this.dead = true
			this.shooter.bombs--
			explode({
				x: this.x + this.collider.ox,
				y: this.y + this.collider.oy,
				styles: [
					"#C546C0",
					"#D8799F",
					"#E49B94",
					"#FFFFFF",
					"#FFFFFF",
					"#FFFFFF",
				],
				size: 4,
			})
		},
		draw() {
			if (this.dead) return
			if (bombImageLoaded) {
				ctx.drawImage(bombImage, this.x, this.y, this.width, this.height);
			}
		},
	}
}
