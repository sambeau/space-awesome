// zap.js — minimal game library

// MATH BASICS

// Linear interpolation: lerp(0, 100, 0.5) → 50
export const lerp = ( a, b, t ) => a + ( b - a ) * t

// Keep value in range: clamp(150, 0, 100) → 100
export const clamp = ( value, min, max ) => Math.min( Math.max( value, min ), max )

// GEOMETRY & VECTORS

export const angleOfLineInRads = ( x1, y1, x2, y2 ) => Math.atan2( y2 - y1, x2 - x1 )

export const angleOfLineInDegs = ( x1, y1, x2, y2 ) => Math.atan2( y2 - y1, x2 - x1 ) * 180 / Math.PI

export function distanceBetweenPoints ( x1, y1, x2, y2 ) {
	return Math.sqrt( ( x2 - x1 ) ** 2 + ( y2 - y1 ) ** 2 )
}

// Normalize a vector to length 1
export function normalize ( x, y ) {
	const len = Math.sqrt( x * x + y * y )
	return len === 0 ? { x: 0, y: 0 } : { x: x / len, y: y / len }
}

// Get x,y velocity from angle: vectorFromAngle(Math.PI/2, 5) → moving down at speed 5
export function vectorFromAngle ( angleRads, length = 1 ) {
	return { x: Math.cos( angleRads ) * length, y: Math.sin( angleRads ) * length }
}

// Wrap angle to 0–2π range
export function wrapAngle ( angle ) {
	return ( ( angle % ( Math.PI * 2 ) ) + Math.PI * 2 ) % ( Math.PI * 2 )
}

// Which way to rotate? Returns -1, 0, or 1
export function rotationDirection ( current, target ) {
	const diff = wrapAngle( target - current )
	if ( diff < Math.PI ) return 1
	if ( diff > Math.PI ) return -1
	return 0
}

// COLLISIONS

export function collisionBetweenCircles ( x1, y1, r1, x2, y2, r2 ) {
	return ( distanceBetweenPoints( x1, y1, x2, y2 ) < r1 + r2 )
}

// Point inside rectangle?
export function pointInRect ( px, py, rx, ry, rw, rh ) {
	return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
}

// Rectangle vs rectangle (AABB)
export function rectsCollide ( x1, y1, w1, h1, x2, y2, w2, h2 ) {
	return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
}

// Rectangle vs circle collision
export function rectCircleCollide ( rx, ry, rw, rh, cx, cy, cr ) {
	// Find closest point on rectangle to circle center
	const closestX = clamp( cx, rx, rx + rw )
	const closestY = clamp( cy, ry, ry + rh )
	// Check if closest point is within circle radius
	const dx = cx - closestX
	const dy = cy - closestY
	return ( dx * dx + dy * dy ) < ( cr * cr )
}

export function moveDistanceAlongLine ( dx, x1, y1, x2, y2 ) {
	var a = { x: x2 - x1, y: y2 - y1 },
		mag = Math.sqrt( a.x * a.x + a.y * a.y )
	if ( mag == 0 ) {
		a.x = a.y = 0
	}
	else {
		a.x = a.x / mag * dx
		a.y = a.y / mag * dx
	}
	return { vx: a.x, vy: a.y }
}

// THINGS (entities/game objects)

export function makeN ( thing, n ) {
	let things = []
	for ( let i = 0; i < n; i++ )
		things.push( thing() )
	return things
}

export function debugThing ( ctx, thing, text ) {
	ctx.save()
	ctx.font = "16px sans-serif"
	ctx.fillStyle = "#00ff00"
	ctx.fillText( text, thing.x + 20, thing.y )
	ctx.restore()
}

export function findClosestThing ( thing, things ) {
	let closestThing
	let closestDistance = Number.MAX_VALUE
	for ( let i = 0; i < things.length; i++ ) {
		const d = distanceBetweenPoints( thing.x, thing.y, things[ i ].x, things[ i ].y )
		if ( d < closestDistance ) {
			closestDistance = d
			closestThing = things[ i ]
		}
	}
	return closestThing
}

// Check collision between two colliders (circle or rect)
function collidersCollide ( c1, c2 ) {
	const t1 = c1.type || "circle"
	const t2 = c2.type || "circle"

	// Circle vs Circle
	if ( t1 === "circle" && t2 === "circle" ) {
		return collisionBetweenCircles( c1.x, c1.y, c1.r, c2.x, c2.y, c2.r )
	}

	// Rect vs Rect
	if ( t1 === "rect" && t2 === "rect" ) {
		return rectsCollide( c1.x, c1.y, c1.w, c1.h, c2.x, c2.y, c2.w, c2.h )
	}

	// Circle vs Rect (or Rect vs Circle)
	if ( t1 === "circle" && t2 === "rect" ) {
		return rectCircleCollide( c2.x, c2.y, c2.w, c2.h, c1.x, c1.y, c1.r )
	}
	if ( t1 === "rect" && t2 === "circle" ) {
		return rectCircleCollide( c1.x, c1.y, c1.w, c1.h, c2.x, c2.y, c2.r )
	}

	return false
}

export function thingsAreColliding ( thing1, thing2 ) {
	if ( !thing1.collider || !thing2.collider ) return false
	const colliders1 =
		( !Array.isArray( thing1.collider ) )
			?
			[ thing1.collider ]
			:
			thing1.collider

	const colliders2 =
		( !Array.isArray( thing2.collider ) )
			?
			[ thing2.collider ]
			:
			thing2.collider

	let colliding = false
	colliders1.forEach( ( c1 ) => {
		colliders2.forEach( ( c2 ) => {
			if ( collidersCollide( c1, c2 ) ) {
				colliding = true
			}
		} )
	} )

	return colliding
}
export function getColliderArea ( thing ) {
	if ( !thing.collider ) return 0
	const colliders =
		( !Array.isArray( thing.collider ) )
			?
			[ thing.collider ]
			:
			thing.collider
	let area = 0
	colliders.forEach( ( c ) => {
		area += c.area || 0
	} )
	return area
}

export function thingIsOnScreen ( thing, screen ) {
	return ( thing.x + thing.width + 1 ) > 0 &&
		( thing.x < screen.width ) &&
		( thing.y + thing.height > 0 ) &&
		( thing.y < screen.height )
}

// RANDOM

// Random int: 0 to n-1
export function randInt ( n ) {
	return Math.floor( Math.random() * n )
}

// Random int in range (inclusive): randRange(5, 10) → 5, 6, 7, 8, 9, or 10
export function randRange ( min, max ) {
	return Math.floor( Math.random() * ( max - min + 1 ) ) + min
}

// Random float in range: randFloat(0.5, 1.5) → e.g. 0.823
export function randFloat ( min, max ) {
	return Math.random() * ( max - min ) + min
}

// Pick random item from array
export function pick ( xs ) {
	return xs[ randInt( xs.length ) ]
}

// Shuffle array (returns new array)
export function shuffle ( array ) {
	const a = [ ...array ]
	for ( let i = a.length - 1; i > 0; i-- ) {
		const j = Math.floor( Math.random() * ( i + 1 ) );
		[ a[ i ], a[ j ] ] = [ a[ j ], a[ i ] ]
	}
	return a
}

// ANIMATION & EASING

// Easing functions: t goes 0→1, output goes 0→1 but curved
export const easeInQuad = ( t ) => t * t
export const easeOutQuad = ( t ) => t * ( 2 - t )
export const easeInOutQuad = ( t ) => t < 0.5 ? 2 * t * t : -1 + ( 4 - 2 * t ) * t

// Get animation frame index from ticks: getFrame(ticks, 4, 5) → 0,1,2,3,0,1...
export function getFrame ( ticks, frameCount, speed = 5 ) {
	return Math.floor( ( ticks % ( frameCount * speed ) ) / speed )
}

// Frame picker for sprite animation
export function picker ( xs, props ) {
	return {
		xs: xs,
		ticker: 0,
		inc: 1,
		start: props ? props.start : 0,
		end: props ? props.end : 0,
		first () {
			return xs[ 0 ]
		},
		last () {
			return xs[ xs.length - 1 ]
		},
		next () {
			const it = this.xs[ this.ticker ]
			this.ticker++
			if ( this.ticker == xs.length )
				this.ticker = 0
			return it
		},
		any () {
			return pick( this.xs )
		},
		bounce () {
			if ( this.ticker == xs.length - 1 ) {
				this.inc = -1
			}
			if ( this.ticker == 0 ) {
				this.inc = 1
			}
			this.ticker += this.inc
			return this.xs[ this.ticker ]
		},
		bounceHold () {
			let image = this.xs[ 0 ]
			// beginning
			if ( this.ticker <= this.start )
				image = this.xs[ 0 ]
			else
				// end
				if ( this.ticker >= this.start + xs.length - 1 )
					image = this.xs[ xs.length - 1 ]
				// mid
				else
					image = this.xs[ this.ticker - this.start ]

			if ( this.ticker == 0 ) this.inc = 1
			if ( this.ticker == xs.length + this.start + this.end - 1 ) this.inc = -1

			this.ticker += this.inc

			return image

		},
	}
}

// AUDIO HELPERS

export function stereoFromScreenX ( screen, x ) {
	return ( x - screen.width / 2 ) / screen.width
}

// should really be distance from point, e.g. bottom middle
export function volumeFromY ( screen, n, y ) {
	if ( y > 0 ) return 1.0
	return 1.0 - Math.abs( y ) / ( screen.height * n )
}

// bring sounds gradually on screen from the edges
export function volumeFromX ( screen, n, x ) {
	const M = screen.width / 2
	const R = Math.abs( x - M )
	const D = ( screen.width * n - R )
	const V = ( D / screen.width ) / n
	if ( V < 0 ) return 0
	return V
}
