import { canvas, ctx, game } from "../game.js";

const debug = false

let shotImage = new Image()
let shotImageLoaded = false
shotImage.src = "images/shot.png"
shotImage.onload = () => {
	shotImageLoaded = true
}

export const shot = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 6,
		height: 35,
		speed: 10,
		shooter: null,
		dead: false,
		spawn({ atx, aty, shooter }) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 4
			this.vy = this.speed
			this.shooter = shooter
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
				this.shooter.removeShot()
			} else
				this.y += this.vy + game.speed;
		},
		draw() {
			if (this.dead) return
			if (shotImageLoaded) {
				ctx.drawImage(shotImage, this.x, this.y, this.width, this.height);
			}
		},
	}
}
