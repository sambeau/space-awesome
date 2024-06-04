import { canvas, ctx, game } from "../game.js";
import { Minimap } from "./minimap.js";
import { picker } from "/zap/zap.js";

const debug = false

const top = 24
const padding = 20
const gap = 10
const pixel = 4


const smartBombImage1 = new Image()
const smartBombImage2 = new Image()
const smartBombImage3 = new Image()

smartBombImage1.src = "/images/smart-hud-icon-1.png"
smartBombImage2.src = "/images/smart-hud-icon-2.png"
smartBombImage3.src = "/images/smart-hud-icon-3.png"

export const SmartBombs = () => {
	return {
		smartbombs: null,
		images: null,
		init(smartbombs) {
			this.smartbombs = smartbombs
			this.images = picker([smartBombImage1, smartBombImage2, smartBombImage3])
		},
		update() { },
		draw() {
			const width = 54 / 2
			const height = 26 / 2
			const x = canvas.width - width - padding
			const y = top + textHeight + pixel * 3 + gap * 2 + 55 / 2
			for (let i = 0; i < this.smartbombs.charges; i++) {
				ctx.drawImage(this.images.any(), x - (i * (width + 5)), y, width, height)
			}
		}
	}
}

const livesImage1 = new Image()
const livesImage2 = new Image()
const livesImage3 = new Image()

livesImage1.src = "/images/ship-hud-icon-1.png"
livesImage2.src = "/images/ship-hud-icon-2.png"
livesImage3.src = "/images/ship-hud-icon-3.png"

const textHeight = 13

export const Lives = () => {
	return {
		images: null,
		init() {
			this.images = picker([livesImage1, livesImage2, livesImage3])
		},
		update() { },
		draw() {
			const width = 42 / 2
			const height = 55 / 2
			const x = canvas.width - width - padding
			const y = top + textHeight + pixel * 3 + gap
			for (let i = 0; i < game.lives; i++) {
				ctx.drawImage(this.images.any(), x - (i * (width + 5)), y, width, height)
			}
		}
	}
}

const spacemanImage = new Image()
spacemanImage.src = "/images/spaceman-1.png"

const spacemanSavedImage1 = new Image()
const spacemanSavedImage2 = new Image()
const spacemanSavedImage3 = new Image()
spacemanSavedImage1.src = "/images/spaceman-saved-1.png"
spacemanSavedImage2.src = "/images/spaceman-saved-2.png"
spacemanSavedImage3.src = "/images/spaceman-saved-3.png"

export const Spacemen = () => {
	return {
		spacemen: null,
		savedImages: null,
		init(spacemen) {
			this.spacemen = spacemen
			this.savedImages = picker([
				spacemanSavedImage1,
				spacemanSavedImage2,
				spacemanSavedImage3
			])

		},
		update() { },
		draw() {
			const width = 69 / 4
			const height = 69 / 4
			const x = canvas.width - width - padding
			const y = 485
			for (let i = 0; i < this.spacemen.saved; i++) {
				ctx.drawImage(this.savedImages.any(), x - (i * (width - 5)), y, width, height)
			}
			for (let i = this.spacemen.saved; i < this.spacemen.count() + this.spacemen.saved; i++) {
				ctx.drawImage(spacemanImage, x - (i * (width - 5)), y, width, height)
			}

		}
	}
}


let once = false
export const Score = () => {
	return {
		scoreString: "",
		init() {
		},
		update(dt) {
			this.scoreString = game.score.toString().padStart(7, "0")
		},
		draw() {
			ctx.font = "15px Robotron";
			const textMetrics = ctx.measureText(this.scoreString);
			if (!once) {
				once = true
			}
			const width = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft
			const y = top + padding
			// const x = canvas.width / 2 - width / 2
			const x = canvas.width - width - padding
			// align right

			ctx.fillStyle = "#743BA6";
			ctx.fillText(this.scoreString, x, y + pixel * 2);
			ctx.fillStyle = "#961EFF";
			ctx.fillText(this.scoreString, x, y + pixel);
			ctx.fillStyle = "#FF00FF";
			ctx.fillText(this.scoreString, x, y);
		}
	}
}

export const Hud = () => {
	return {
		score: null,
		init(ship, spacemen, ents) {
			this.score = Score()

			this.minimap = Minimap()
			this.minimap.init(ship, ents)

			this.lives = Lives()
			this.lives.init()

			this.smartBombs = SmartBombs()
			this.smartBombs.init(ship.smartBomb)

			this.spacemen = Spacemen()
			this.spacemen.init(spacemen)
		},
		update(dt) {
			this.score.update()
			this.minimap.update()
			// this.smartBombs.update()
			// this.lives.update()
		},
		draw() {
			this.score.draw()
			this.minimap.draw()
			this.smartBombs.draw()
			this.lives.draw()
			this.spacemen.draw()
		}
	}
}
