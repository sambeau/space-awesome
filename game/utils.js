export function randInt(n) {
	return Math.floor(Math.random() * n)
}
export function pick(xs) {
	return xs[randInt(xs.length)]
}
