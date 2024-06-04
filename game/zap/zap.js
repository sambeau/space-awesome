export function makeN(thing, n) {
	let things = []
	for (let i = 0; i < n; i++)
		things.push(thing())
	return things
}

export function distanceBetweenCircles(x1, y1, x2, y2) { /// this is really points, not circles
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function collisionBetweenCircles(x1, y1, r1, x2, y2, r2) {
	return (distanceBetweenCircles(x1, y1, x2, y2) < r1 + r2)
}

export function randInt(n) {
	return Math.floor(Math.random() * n)
}

export function pick(xs) {
	return xs[randInt(xs.length)]
}

export function picker(xs, props) {
	return {
		xs: xs,
		ticker: 0,
		inc: 1,
		start: props ? props.start : 0,
		end: props ? props.end : 0,
		first() {
			return xs[0]
		},
		last() {
			return xs[xs.length - 1]
		},
		next() {
			const it = this.xs[this.ticker]
			this.ticker++
			if (this.ticker == xs.length)
				this.ticker = 0
			return it
		},
		any() {
			return pick(this.xs)
		},
		bounce() {
			if (this.ticker == xs.length - 1) {
				this.inc = -1
			}
			if (this.ticker == 0) {
				this.inc = 1
			}
			this.ticker += this.inc
			return this.xs[this.ticker]
		},
		bounceHold() {
			let image = this.xs[0]
			// beginning
			if (this.ticker <= this.start)
				image = this.xs[0]
			else
				// end
				if (this.ticker >= this.start + xs.length - 1)
					image = this.xs[xs.length - 1]
				// mid
				else
					image = this.xs[this.ticker - this.start]

			if (this.ticker == 0) this.inc = 1
			if (this.ticker == xs.length + this.start + this.end - 1) this.inc = -1

			this.ticker += this.inc

			return image

		},
	}
}
