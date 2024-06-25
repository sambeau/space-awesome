import { canvas, ctx, game } from "../game.js";
import { explode } from "./explosions.js";
import { stereoFromScreenX } from "/zap/zap.js";


let numImagesLoaded = 0
const mushroomImage = {}
const mushroomColors = ['white', 'black', 'yellow']
const mushroomSizes = [1, 2, 3, 4]
const allAsteroidsLoadedCount = mushroomColors.length * mushroomSizes.length

mushroomColors.forEach((c) => {
	mushroomImage[c] = []
	mushroomSizes.forEach((s, i) => {
		mushroomImage[c][i] = new Image()
		mushroomImage[c][i].onload = () => { numImagesLoaded++ }
		mushroomImage[c][i].src = `images/mushroom-${c}-${s}.png`
	})
})
var bangSound = new Howl({ src: ['/sounds/bang.mp3'] });
bangSound.volume(0.25)

const explodeColors = {
	'white': ["#ffffff", "#ffffff", "#00ffff", "#00ffff", "#ffffff"],
	'black': ["#ffffff", "#310933", "#FFFF00", "#FFFF00", "#ffffff"],
	'yellow': ["#ffffff", "#ffffff", "#ffff00", "#ffff00", "#7C6877"],
}
const hudColor = {
	'white': "#ffffff",
	'black': "#FFFF00",
	'yellow': "#ffff00",
}

const mushroom = () => {
	return {
		name: "mushroom",
		color: "#ffffff",
		type: 'yellow',
		score: 50,
		x: 0,
		y: 0,
		width: 40,
		height: 40,
		collider: [{
			type: "circle",
			ox: 10,
			oy: 10,
			r: 10,
		}, {
			type: "circle",
			ox: 30,
			oy: 10,
			r: 10,
		}, {
			type: "circle",
			ox: 20,
			oy: 30,
			r: 10,
		}],
		halfCollider: [{
			type: "circle",
			ox: 10,
			oy: 10,
			r: 10,
		}, {
			type: "circle",
			ox: 30,
			oy: 10,
			r: 10,
		}],
		HP: 4,
		tick() {
			this.ticks += 1
			if (this.ticks === 1000)
				this.ticks = 0
			return this.tick
		},
		spawn({ cx, cy, type }) {
			this.x = cx - this.width / 2
			this.y = cy - this.height / 2
			this.type = type
			this.collider.forEach((c) => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
				c.area = Math.round(Math.PI * c.r * c.r / game.massConstant)
			})
			this.color = hudColor[type]
		},
		outOfBoundsV() {
			if (this.y > canvas.height + this.height) return true
			return false;
		},
		update(/*dt*/) {
			this.y += game.speed

			this.collider.forEach((c) => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
			})

			if (this.outOfBoundsV()) {
				this.y = 0 - canvas.height * 3
			}
		},
		draw() {
			// debugThing(ctx, this, `${this.HP}, ${getColliderArea(this)}`)
			ctx.drawImage(mushroomImage[this.type][4 - this.HP], this.x, this.y, this.width, this.height)
		},
		onHit(smartbomb, crash) {
			bangSound.play()
			bangSound.stereo(stereoFromScreenX(screen, this.x))
			this.HP -= 1
			if (this.HP == 0 || crash) {
				this.dead = true
				game.score += this.score
			} else {
				if (this.collider !== this.halfCollider) {
					this.collider = this.halfCollider
					this.collider.forEach((c) => {
						c.x = this.x + c.ox
						c.y = this.y + c.oy
						c.area = Math.round(Math.PI * c.r * c.r / game.massConstant)
					})
				}
			}

			explode({
				x: this.x + this.width / 2,
				y: this.y + this.height / 2,
				styles: explodeColors[this.type],
				size: 6,
			})
		}
	}
};


export const Mushrooms = () => {
	return {
		mushrooms: [],
		all() {
			return this.mushrooms
		},
		spawnSingle({ cx, cy, type }) {
			let m = mushroom()
			this.mushrooms.push(m)
			m.spawn({ cx: cx, cy: cy, type: type })
		},
		update(dt) {
			this.mushrooms = this.mushrooms.filter((b) => { return b.dead !== true })
			this.mushrooms.forEach((x) => x.update(dt))
		},
		draw() {
			this.mushrooms.forEach((x) => x.draw())
		}
	}
}
