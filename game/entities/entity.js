export function makeN(thing, n) {
	let things = []
	for (let i = 0; i < n; i++)
		things.push(thing())
	return things
}

export function distanceBetweenCircles(x1, y1, r1, x2, y2, r2) {
	return Math.sqrt((x2 - x1) ^ 2 + (y2 - y1) ^ 2) - (r2 + r1)
}

export function collisionBetweenCircles(x1, y1, r1, x2, y2, r2) {
	return (distanceBetweenCircles(x1, y1, r1, x2, y2, r2) < 0)
}
