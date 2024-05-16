import { ctx } from "../game.js";

const debug = false


const bulletImage = new Image()
let bulletImageLoaded = false
bulletImage.src = "images/bullet-long.png"
bulletImage.onload = () => {
	bulletImageLoaded = true
}

export const bullet = () => {
	return {
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: 6,
		height: 70,
		speed: 20,
		image: bulletImage,
		imageLoaded: false,
		ship: null,
		dead: false,
		spawn({ atx, aty, ship }) {
			this.x = atx - this.width / 2
			this.y = aty + this.height / 3
			this.vy = -this.speed
			this.ship = ship
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
			if (bulletImageLoaded) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
			}
		},
	}
}
