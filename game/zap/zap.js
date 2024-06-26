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

export function moveDistanceAlongLine(dx, x1, y1, x2, y2) {
	var a = { x: x2 - x1, y: y2 - y1 },
		mag = Math.sqrt(a.x * a.x + a.y * a.y);
	if (mag == 0) {
		a.x = a.y = 0;
	}
	else {
		a.x = a.x / mag * dx;
		a.y = a.y / mag * dx;
	}
	return { vx: a.x, vy: a.y };
}

// things

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
	if (!thing1.collider || !thing1.collider) return false
	const colliders1 =
		(!Array.isArray(thing1.collider))
			?
			[thing1.collider]
			:
			thing1.collider

	const colliders2 =
		(!Array.isArray(thing2.collider))
			?
			[thing2.collider]
			:
			thing2.collider

	let colliding = false
	colliders1.forEach((c1) => {
		colliders2.forEach((c2) => {
			if (collisionBetweenCircles(
				c1.x, c1.y, c1.r,
				c2.x, c2.y, c2.r
			)) {
				colliding = true
			}
		})
	})

	return colliding
}
export function getColliderArea(thing) {
	if (!thing.collider) return 0
	const colliders =
		(!Array.isArray(thing.collider))
			?
			[thing.collider]
			:
			thing.collider
	let area = 0
	colliders.forEach((c) => {
		area += c.area
	})
	return area
}

export function thingIsOnScreen(thing, screen) {
	return (thing.x + thing.width + 1) > 0 &&
		(thing.x < screen.width) &&
		(thing.y + thing.height > 0) &&
		(thing.y < screen.height)
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

// audio helpers

export function stereoFromScreenX(screen, x) {
	return (x - screen.width / 2) / screen.width
}

// should really be distance from point, e.g. bottom middle
export function volumeFromY(screen, n, y) {
	if (y > 0) return 1.0
	return 1.0 - Math.abs(y) / (screen.height * n)
}

// bring sounds gradually on screen from the edges
export function volumeFromX(screen, n, x) {
	const M = screen.width / 2
	const R = Math.abs(x - M)
	const D = (screen.width * n - R)
	const V = (D / screen.width) / n
	if (V < 0) return 0
	return V
}
