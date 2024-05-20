export function randInt(n) {
	return Math.floor(Math.random() * n)
}

export function pick(xs) {
	return xs[randInt(xs.length)]
}
export function picker(xs) {
	return {
		xs: xs,
		ticker: 0,
		first() {
			return xs[0]
		},
		next() {
			this.ticker++
			if (this.ticker == xs.length)
				this.ticker = 0
			return this.xs[this.ticker]
		},
		any() {
			return pick(this.xs)
		}
	}
}
