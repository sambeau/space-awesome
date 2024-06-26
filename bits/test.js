// function travel(dx, x1, y1, x2, y2) {
// 	var a = { x: x2 - x1, y: y2 - y1 },
// 		mag = Math.sqrt(a.x * a.x + a.y * a.y);
// 	if (mag == 0) {
// 		a.x = a.y = 0;
// 	}
// 	else {
// 		a.x = a.x / mag * dx;
// 		a.y = a.y / mag * dx;
// 	}
// 	return { vx: a.x, vy: a.y };
// }
//
//
// console.log(travel(5, 0, 0, 10, 10))
// console.log(travel(5, 0, 0, 10, 20))
// console.log(travel(5, 20, 20, 10, 20))


// const snake = [{}, {}, {}, {}, {}, {}]
// const colors = ["red", "blue"]
// const n = colors.length
// for (let i = 0; i < snake.length; i++) {
// 	snake[i].color = colors[(i % n + n) % n]
// }
// console.log(snake)

function volumeFromXPos(W, n, x) {
	const M = W / 2
	const R = Math.abs(x - M)
	const D = (W * n - R)
	const V = (D / W) / n
	if (V < 0) return 0
	return V
}

const W = 100
for (x = -W; x <= W * 2; x += W / 10) {
	console.log(volumeFromXPos(W, 1.5, x))
	// console.log(
	// 	x.toString().padStart(4, " "),
	// 	R.toString().padStart(4, " "),
	// 	D.toString().padStart(4, " "),
	// 	V.toString().padStart(4, " "),
	// )
}
