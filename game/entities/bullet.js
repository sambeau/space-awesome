import { ctx } from "../game.js";

const debug = false

export const bullet = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		speed: 20,
		image: new Image(),
		imageLoaded: false,
		ship: null,
		dead: false,
		spawn({ atx, aty, ship }) {
			this.width = 6
			this.height = 35
			this.x = atx - this.width / 2
			this.y = aty + this.height / 2
			this.vy = -this.speed
			this.ship = ship
			this.image.onload = () => {
				this.imageLoaded = true
			}
			this.image.src = "images/bullet.png"
		},
		outOfBoundsTop() {
			if (this.y <= 0 - this.height) return true
			return false;
		},
		update(/*dt*/) {
			if (this.outOfBoundsTop()) {
				this.y = 0
				this.vy = 0
				this.dead = true
				this.ship.removeBullet()
			} else
				this.y += this.vy;
		},
		draw() {
			if (this.dead) return
			if (this.imageLoaded) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
			}
			// 			if (debug) {
			// 				ctx.font = "16px sans-serif";
			// 				ctx.fillStyle = "#00ff00";
			// 				ctx.fillText(`Bullet: x: ${this.x} y: ${this.y}  vx: ${this.vx} vy: ${this.vy}`, 5, 40);
			// 				ctx.strokeStyle = "rgb(255 0 0 / 100%)";
			//
			// 				ctx.strokeRect(this.x, this.y, this.width, this.height)
			// 			}

		},
	}
}
