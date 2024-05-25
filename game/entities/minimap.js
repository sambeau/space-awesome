import { canvas, ctx } from "../game.js";
import { randInt } from "../utils.js";

const debug = true

const scale = 10
const top = 52
const padding = 20
const pixel = 4

let ship
let entities

let width
let height
let y
let x


export let Minimap = () => {
	return {
		init(_ship, ents) {
			ship = _ship
			entities = ents
			// console.log(ship)

			width = canvas.width / scale
			height = canvas.height * 4 / scale
			y = top + padding * 2
			x = canvas.width - width - padding
		},
		update(dt) {

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
			ctx.roundRect(x, y, width, height, 8)
			ctx.stroke();

			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(x, height);
			ctx.lineTo(x + width, height);
			ctx.stroke();

			entities.forEach((type) => {
				(type.all()).forEach((ent) => {
					if (ent.y > canvas.height * -3 && ent.y < canvas.height && !ent.dead) {
						if (ent.color)
							ctx.fillStyle = ent.color;
						else
							ctx.fillStyle = "white";
						if (ent.color == "random") {
							ctx.fillStyle = `rgb(${randInt(255) + 1},${randInt(255) + 1},${randInt(255) + 1})`
						}
						ctx.fillRect(ent.x / scale + x, (ent.y + 3 * canvas.height) / scale + y, 4, 4);
					}
				})
			})
			ctx.fillStyle = "white";
			if (ship && ship.x) {
				const shipx = ship.x / scale + x
				const shipy = (ship.y + 3 * canvas.height + 2) / scale + y
				ctx.fillRect(shipx, shipy, 2, 4)
				ctx.fillRect(shipx, shipy, 2, 4)
				ctx.fillRect(shipx - 2, shipy + 4, 6, 2)
				// let shipPath = new Path2D();
				// shipPath.moveTo(shipx, shipy)
				// shipPath.lineTo(shipx + 1, shipy + 1)
				// shipPath.lineTo(shipx - 1, shipy + 1)
				// shipPath.lineTo(shipx, shipy)
				// shipPath.closePath()
				// ctx.fill(shipPath);
			}
			ctx.restore()
		}
	}
}
