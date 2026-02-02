import { getFrame } from "./zap.js"

// Re-export getFrame so existing imports from Entity.js still work
export { getFrame }

// ASSET LOADERS
// Centralized image and sound loading with caching

const imageCache = {}

/**
 * Load images with automatic caching.
 * @param {string[]} paths - Array of image paths
 * @returns {{ images: Image[], loaded: () => boolean }}
 */
export function loadImages ( paths ) {
	const images = paths.map( src => {
		if ( !imageCache[ src ] ) {
			const img = new Image()
			img.src = src
			imageCache[ src ] = { img, loaded: false }
			img.onload = () => { imageCache[ src ].loaded = true }
		}
		return imageCache[ src ].img
	} )
	return {
		images,
		loaded: () => paths.every( src => imageCache[ src ]?.loaded )
	}
}

const soundCache = {}

/**
 * Load a sound with caching. Same src+volume combo returns cached instance.
 * @param {string} src - Sound file path
 * @param {number} volume - Volume level (0-1)
 * @returns {Howl}
 */
export function loadSound ( src, volume = 0.25 ) {
	const key = `${src}:${volume}`
	if ( !soundCache[ key ] ) {
		const sound = new Howl( { src: [ src ] } )
		sound.volume( volume )
		soundCache[ key ] = sound
	}
	return soundCache[ key ]
}

// SHARED BEHAVIORS
// Common methods that most entities need

/**
 * Standard tick counter that wraps at 1000
 */
export const tickMixin = {
	ticks: 0,
	tick () {
		this.ticks = ( this.ticks + 1 ) % 1000
	}
}

/**
 * Standard bounds checking methods
 */
export const boundsMixin = {
	outOfBoundsB () {
		return this.y > canvas.height + this.height
	},
	outOfBoundsL () {
		return this.x + this.width < 0
	},
	outOfBoundsR () {
		return this.x > canvas.width
	},
	outOfBoundsV () {
		return this.outOfBoundsB()
	}
}

/**
 * Sync collider position with entity position.
 * Works with single collider or array of colliders.
 */
export const colliderMixin = {
	syncCollider () {
		if ( Array.isArray( this.collider ) ) {
			this.collider.forEach( c => {
				c.x = this.x + c.ox
				c.y = this.y + c.oy
			} )
		} else if ( this.collider ) {
			this.collider.x = this.x + this.collider.ox
			this.collider.y = this.y + this.collider.oy
		}
	}
}

/**
 * Standard screen wrapping behavior:
 * - Off bottom → reset to far above screen
 * - Off left → wrap to right
 * - Off right → wrap to left
 */
export const wrapMixin = {
	wrapScreen () {
		if ( this.outOfBoundsB() ) {
			this.y = -canvas.height * 3
			if ( this.collider ) {
				if ( Array.isArray( this.collider ) ) {
					this.collider.forEach( c => c.colliding = false )
				} else {
					this.collider.colliding = false
				}
			}
		}
		if ( this.outOfBoundsL() ) this.x = canvas.width
		if ( this.outOfBoundsR() ) this.x = -this.width
	}
}

// ENTITY FACTORY
// Creates a base entity with common properties and behaviors

/**
 * Create a base entity with standard properties and behaviors.
 * Spread this into your entity and override/extend as needed.
 * 
 * @param {Object} config
 * @param {string} config.name - Entity name
 * @param {number} config.width - Width in pixels
 * @param {number} config.height - Height in pixels
 * @param {number} config.score - Points when killed
 * @param {Object|Object[]} config.collider - Collider definition(s)
 * @returns {Object} Base entity object
 * 
 * @example
 * const pod = () => {
 *     return {
 *         ...createEntity({ name: "pod", width: 48, height: 48, score: 1000 }),
 *         // your custom properties and methods...
 *     }
 * }
 */
export function createEntity ( config = {} ) {
	return {
		// Identity
		name: config.name || "entity",

		// Position & velocity
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,

		// Dimensions
		width: config.width || 48,
		height: config.height || 48,

		// State
		dead: false,
		score: config.score || 0,

		// Collider (deep copy to avoid shared state)
		collider: config.collider ? JSON.parse( JSON.stringify( config.collider ) ) : null,

		// Director metadata
		drawLayer: config.drawLayer ?? 2,                  // Default to BADDIES
		collisionGroups: config.collisionGroups || [],     // e.g., ['shootable', 'deadly']
		isPrimaryEnemy: config.isPrimaryEnemy ?? false,    // For wave completion tracking

		// Mix in shared behaviors
		...tickMixin,
		...boundsMixin,
		...colliderMixin,
		...wrapMixin,
	}
}

// DRAW HELPERS
// Common drawing patterns

/**
 * Draw a sprite with rotation based on ticks.
 * Creates an offscreen canvas, applies rotation, draws image, then blits to main ctx.
 * 
 * @param {CanvasRenderingContext2D} ctx - Main canvas context
 * @param {Object} entity - Entity with x, y, width, height, ticks, rotation
 * @param {Image} image - Image to draw
 */
export function drawRotated ( ctx, entity, image ) {
	const offscreen = document.createElement( "canvas" )
	offscreen.width = entity.width
	offscreen.height = entity.height
	const offCtx = offscreen.getContext( "2d" )

	offCtx.translate( entity.width / 2, entity.height / 2 )
	offCtx.rotate( ( ( entity.ticks / 1000 ) * entity.rotation ) * Math.PI * 2 )
	offCtx.translate( -entity.width / 2, -entity.height / 2 )

	offCtx.drawImage( image, 0, 0, entity.width, entity.height )
	ctx.drawImage( offscreen, entity.x, entity.y, entity.width, entity.height )
}

// Note: getFrame() moved to zap.js but re-exported above for compatibility
