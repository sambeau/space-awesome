import { game } from "../game.js";
import { pick } from "/zap/zap.js"

const getColorIndicesForCoord = (imageData, x, y, width) => {
	const red = y * (width * 4) + x * 4;
	return [
		imageData.data[red],
		imageData.data[red + 1],
		imageData.data[red + 2],
		imageData.data[red + 3]
	]
}


// const gsize = 7
// const i = new Image()
// i.src = "images/defender1.png"
// i.onload = () => {
// 	const c = document.createElement("canvas")
// 	c.width = gsize;
// 	c.height = gsize;
// 	const cx = c.getContext("2d");
// 	cx.drawImage(i, 0, 0, gsize, gsize)
// 	console.log(c)
// 	console.log(cx)
// 	const imageData = cx.getImageData(0, 0, gsize, gsize);
// 	console.log(imageData)
// 	// // Iterate through every pixel
// 	const rsize = 10
// 	for (let y = 0; y < imageData.height; y++) {
// 		for (let x = 0; x < imageData.width; x++) {
// 			const rgba = getColorIndicesForCoord(imageData, x, y, gsize)
// 			let fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`
// 			console.log(fillStyle)
// 			ctx.fillStyle = fillStyle
// 			ctx.fillRect(x * rsize, y * rsize, rsize, rsize)
// 		}
// 	}
// 	ctx.putImageData(imageData, 500, 500);
// }


// export Explosions = () => {
// 	return {
// 		explosions: [],
// 	}
// }

export const explode = ({ x, y, styles, size }) => {
	[
		// [15, 0],
		// [-15, 0],
		// [10, 0],
		// [-10, 0],
		// [5, 0],
		// [-5, 0],
		// [2, 0],
		// [-2, 0],

		[0, -15],
		[15, 0],
		[0, 15],
		[-15, 0],
		[15, -15],
		[-15, 15],
		[-15, -15],
		[15, 15],

		[0, -10],
		[10, 0],
		[0, 10],
		[-10, 0],
		[10, -10],
		[-10, 10],
		[-10, -10],
		[10, 10],

		[0, -5],
		[5, 0],
		[0, 5],
		[-5, 0],
		[5, -5],
		[-5, 5],
		[-5, -5],
		[5, 5],

		[0, -2],
		[2, 0],
		[0, 2],
		[-2, 0],
		[2, -2],
		[-2, 2],
		[-2, -2],
		[2, 2],

	].forEach(([vx, vy]) => {
		const rsize = size * Math.random() + size * Math.random() + Math.random() * 2
		game.particles.spawnSingle({
			x: x,
			y: y,
			width: rsize,
			height: rsize,
			vx: vx * 2 + Math.random() * 3,
			vy: vy * 2 + Math.random() * 3,
			lifespan: 100,
			style: pick(styles)
		})
	}
	)
}
