import { canvas, ctx, game } from "../game.js";
import { Minimap } from "./minimap.js";

const debug = false

const top = 24
const padding = 20
const pixel = 4

export const Score = () => {
	return {
		scoreString: "",
		init() {
		},
		update(dt) {
			this.scoreString = game.score.toString().padStart(8, "0")
		},
		draw() {
			ctx.font = "16px Robotron";
			const textMetrics = ctx.measureText(this.scoreString);
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
		init(ents) {
			this.score = Score()
			this.minimap = Minimap()
			this.minimap.init(ents)
		},
		update(dt) {
			this.score.update()
			this.minimap.update()
		},
		draw() {
			this.score.draw()
			this.minimap.draw()
		}
	}
}
