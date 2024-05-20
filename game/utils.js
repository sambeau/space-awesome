export function randInt(n) {
	return Math.floor(Math.random() * n)
}

export function pick(xs) {
	return xs[randInt(xs.length)]
}
export function rotate(xs) {
	return {
		xs: xs,
		ticker: 0,
		next() {
			this.ticker++
			if (this.ticker == xs.length - 1)
				this.ticker = 0
			return xs[this.ticker]
		}
	}
}
