// things

// geometry & collisions

export const angleOfLineInRads = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1);

export const angleOfLineInDegs = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

export function distanceBetweenPoints(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function collisionBetweenCircles(x1, y1, r1, x2, y2, r2) {
	return (distanceBetweenPoints(x1, y1, x2, y2) < r1 + r2)
}

//

export function makeN(thing, n) {
	let things = []
	for (let i = 0; i < n; i++)
		things.push(thing())
	return things
}

export function debugThing(ctx, thing, text) {
	ctx.save()
	ctx.font = "16px sans-serif";
	ctx.fillStyle = "#00ff00";
	ctx.fillText(text, thing.x + 20, thing.y)
	ctx.restore()
}

export function findClosestThing(thing, things) {
	let closestThing
	let closestDistance = Number.MAX_VALUE
	for (let i = 0; i < things.length; i++) {
		const d = distanceBetweenPoints(thing.x, thing.y, things[i].x, things[i].y)
		if (d < closestDistance) {
			closestDistance = d
			closestThing = things[i]
		}
	}
	return closestThing
}

export function thingsAreColliding(thing1, thing2) {

	if (!thing1.colliders || !thing1.colliders) return false

	const colliders1 =
		(!Array.isArray(thing1.colliders))
			?
			[thing1.colliders]
			:
			thing1.colliders

	const colliders2 =
		(!Array.isArray(thing2.colliders))
			?
			[thing2.colliders]
			:
			thing2.colliders

	colliders1.forEach((c1) => {
		colliders2.forEach((c2) => {
			if (collisionBetweenCircles(
				c1.x, c1.y, c1.r,
				c2.x, c2.y, c2.r
			))
				return true
		})
	})

	return false
}
// random

export function randInt(n) {
	return Math.floor(Math.random() * n)
}

export function pick(xs) {
	return xs[randInt(xs.length)]
}

// animation

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
