import { canvas, ctx, game } from "../game.js";
import { moveDistanceAlongLine, picker } from "../zap/zap.js";
import { explode } from "./explosions.js";

const debug = false
let imagesLoaded = 0

const image1 = new Image()
const image2 = new Image()
const image3 = new Image()
const image4 = new Image()

image1.src = "images/bomb-1.png"
image2.src = "images/bomb-2.png"
image3.src = "images/bomb-3.png"
image4.src = "images/bomb-4.png"

image1.onload = () => { imagesLoaded++ }
image2.onload = () => { imagesLoaded++ }
image3.onload = () => { imagesLoaded++ }
image4.onload = () => { imagesLoaded++ }

const allImagesLoaded = 4
const bombImages = [
	image1,
	image2,
	image3,
	image4,
]
let bombWidth = 10
let bombSpeed = 10

export const bomb = () => {
	return {
		name: "bomb",
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		width: bombWidth,
		height: bombWidth,
		speed: bombSpeed,
		bomber: null,
		dead: false,
		collider: {
			type: "circle",
			ox: bombWidth / 2,
			oy: bombWidth / 2,
			r: bombWidth / 2,
			area: 10,
			colliding: false
		},
		images: picker(bombImages),
		spawn({ ship, atx, aty, bomber }) {
			this.ship = ship
			this.bomber = bomber

			this.x = atx - this.width / 2
			this.y = aty + this.height / 2

			const { vx, vy } = moveDistanceAlongLine(
				this.speed,
				this.x, this.y,
				this.ship.x, this.ship.y
			)
			this.vx = vx
			this.vy = vy
			this.bomber.bombs++
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
				this.bomber.bombs--
			} else {
				this.x += this.vx
				this.y += this.vy + game.speed;
			}
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy

		},
		onHit() {
			this.dead = true
			this.bomber.bombs--
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
			if (imagesLoaded == allImagesLoaded) {
				ctx.drawImage(this.images.any(), this.x, this.y, this.width, this.height);
			}
		},
	}
}
