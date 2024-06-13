import { ctx } from "../game.js";
import { picker } from "/zap/zap.js";

let numImagesLoaded = 0
const images = {}
const scores = ['250', '500', '1000', '1500', '2000']
const scoreTypes = [1, 2, 3]
// const allScoresLoadedCount = scores.length * powerupsAnimations.length


// var pickupSound = new Howl({ src: ['/sounds/pick-up.mp3'] });
// pickupSound.volume(0.33)
//
// var levelUpSound = new Howl({ src: ['/sounds/level-up.mp3'] });
// levelUpSound.volume(0.33)

scores.forEach((s) => {
	images[s] = []
	scoreTypes.forEach((i) => {
		images[s][i - 1] = new Image()
		images[s][i - 1].onload = () => { numImagesLoaded++ }
		images[s][i - 1].src = `images/score-${s}-${i}.png`
	})
})

const sizes = {
	250: { width: 175 / 2, height: 80 / 2 },
	500: { width: 175 / 2, height: 80 / 2 },
	1000: { width: 208 / 2, height: 80 / 2 },
	1500: { width: 208 / 2, height: 80 / 2 },
	2000: { width: 240 / 2, height: 80 / 2 },
}
const score = () => {
	return {
		name: "score",
		cx: 0,
		cy: 0,
		images: null,
		image: null,
		ticks: 0,
		dead: false,
		tick() {
			this.ticks++
			if (this.ticks === 600)
				this.ticks = 0
			return this.tick
		},

		spawn({ cx, cy, type }) {
			// console.log(cx, cy, type)
			// console.log(sizes)
			// console.log(images)
			// console.log(kill)
			this.cx = cx
			this.cy = cy
			this.width = sizes[type].width
			this.height = sizes[type].height
			this.hw = sizes[type].width / 2
			this.hh = sizes[type].height / 2
			this.images = picker(images[type])
			this.image = this.images.first()
			this.alpha = 1
		},
		update() {
			if (this.ticks > 60)
				this.dead = true

			if (this.ticks > 20)
				this.alpha *= 0.9


			if (this.ticks % 10 == 0)
				this.image = this.images.next()

			this.cy -= 5

			this.tick()
		},
		draw() {
			const x = this.cx - this.hw
			const y = this.cy - this.hh
			ctx.save()
			ctx.globalAlpha = this.alpha
			ctx.drawImage(this.image, x, y, this.width, this.height)
			ctx.restore()
			// console.log(this)
			// console.log(this.image, x, y, this.width, this.height)
			// console.log(exit)
		},
	}
}

export const Scores = () => {
	return {
		scores: [],
		all() {
			return this.scores
		},
		count() {
			return this.scores.length
		},
		spawnSingle({ cx, cy, type }) {
			let a = score()
			this.scores.push(a)
			a.spawn({ cx: cx, cy: cy, type })
		},
		update(dt) {
			this.scores = this.scores.filter((x) => { return x.dead !== true })
			this.scores.forEach((x) => x.update(dt))
		},
		draw() {
			this.scores.forEach((x) => x.draw())
		}
	}
}
