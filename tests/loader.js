// Custom module loader for Node.js tests
// Intercepts game module imports and returns mocks

export async function resolve ( specifier, context, nextResolve ) {
	// Intercept game module paths
	if ( specifier.endsWith( '/game.js' ) || specifier.includes( 'game/game.js' ) ) {
		return { shortCircuit: true, url: 'mock:game' }
	}
	if ( specifier === '/zap/zap.js' || specifier.endsWith( '/zap.js' ) || specifier.includes( 'zap/zap.js' ) ) {
		return { shortCircuit: true, url: 'mock:zap' }
	}
	if ( specifier.includes( 'explosions.js' ) ) {
		return { shortCircuit: true, url: 'mock:explosions' }
	}
	return nextResolve( specifier, context )
}

export async function load ( url, context, nextLoad ) {
	if ( url === 'mock:game' ) {
		return {
			shortCircuit: true,
			format: 'module',
			source: `
				export const canvas = { width: 800, height: 600 }
				export const ctx = { 
					save: () => {}, restore: () => {}, drawImage: () => {},
					fillRect: () => {}, fillStyle: '', globalAlpha: 1,
					translate: () => {}, rotate: () => {}, beginPath: () => {},
					arc: () => {}, fill: () => {}
				}
				export const game = { 
					screenshake: { x: 0, y: 0 }, 
					speed: 0, 
					score: 0, 
					over: false,
					massConstant: 100
				}
			`
		}
	}
	if ( url === 'mock:zap' ) {
		return {
			shortCircuit: true,
			format: 'module',
			source: `
				export function getFrame( images, ticks, fps = 12 ) {
					return images[ Math.floor( ticks * fps / 60 ) % images.length ]
				}
				export function pick( arr ) { return arr[ 0 ] }
				export function picker( arr ) { 
					return { first: () => arr[0], next: () => arr[0], random: () => arr[0] }
				}
				export function randInt( n ) { return Math.floor( Math.random() * n ) }
				export function makeN( n, fn ) { return Array( n ).fill().map( fn ) }
				export function stereoFromScreenX( screen, x ) { return 0 }
				export function volumeFromX( screen, n, x ) { return 1 }
				export function volumeFromY( screen, n, y ) { return 1 }
				export function thingIsOnScreen( thing ) { return true }
				export function thingsAreColliding( a, b ) { return false }
				export function distanceBetweenPoints( x1, y1, x2, y2 ) { 
					return Math.sqrt( (x2-x1)**2 + (y2-y1)**2 )
				}
				export function findClosestThing( thing, things ) { return things[0] }
				export function moveDistanceAlongLine( x1, y1, x2, y2, dist ) { 
					return { x: x1, y: y1 }
				}
			`
		}
	}
	if ( url === 'mock:explosions' ) {
		return {
			shortCircuit: true,
			format: 'module',
			source: `export function explode( opts ) {}`
		}
	}
	return nextLoad( url, context )
}
