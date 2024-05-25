import { canvas, ctx } from "../game.js";

const debug = true

const scale = 10
const top = 52
const padding = 20
const pixel = 4

let width
let height
let y
let x

let entities

export let Minimap = () => {
	return {
		init(ents) {
			entities = ents
		},
		update(dt) {
			width = canvas.width / scale
			height = canvas.height * 3 / scale
			y = top + padding
			x = canvas.width - width - padding
		},
		draw() {
			ctx.save()
			ctx.fillStyle = "white"
			ctx.globalAlpha = 0.8
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			gradient.addColorStop(0, "#320033");
			gradient.addColorStop(1, "#090932");
			ctx.fillStyle = gradient;
			ctx.fillRect(x, y, width, height);
			ctx.strokeStyle = "#FF00FF";
			ctx.strokeRect(x, y, width, height)
			entities.forEach((type) => {
				type.forEach((ent) => {
					if (ent.y > canvas.height * -2 && ent.y < canvas.height && !ent.dead) {
						ctx.fillStyle = "white";
						ctx.fillRect(ent.x / scale + x, (ent.y + 2 * canvas.height) / scale + y, 4, 4);
					}
				})
			})

			ctx.restore()
		}
	}
}
