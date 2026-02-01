import { createEntity } from "./Entity.js"
import { ctx } from "../game.js"
import { picker } from "/zap/zap.js"

// ═══════════════════════════════════════════════════════════════════════════
// FLOATER ASSETS
// ═══════════════════════════════════════════════════════════════════════════

let numImagesLoaded = 0
const images = {}
const floaterNames = [ '250', '500', '1000', '1500', '2000', '1up', 'bomb' ]
const floaterTypes = [ 1, 2, 3 ]

floaterNames.forEach( ( s ) => {
	images[ s ] = []
	floaterTypes.forEach( ( i ) => {
		images[ s ][ i - 1 ] = new Image()
		images[ s ][ i - 1 ].onload = () => { numImagesLoaded++ }
		images[ s ][ i - 1 ].src = `images/floater-${s}-${i}.png`
	} )
} )

const sizes = {
	250: { width: 175 / 2, height: 80 / 2 },
	500: { width: 175 / 2, height: 80 / 2 },
	1000: { width: 208 / 2, height: 80 / 2 },
	1500: { width: 208 / 2, height: 80 / 2 },
	2000: { width: 240 / 2, height: 80 / 2 },
	'1up': { width: 175 / 2, height: 80 / 2 },
	'bomb': { width: 160 / 2, height: 80 / 2 },
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATER ENTITY
// Score popup text that floats up and fades out
// ═══════════════════════════════════════════════════════════════════════════

const floater = () => {
	return {
		...createEntity( { name: "floater" } ),

		// Floater-specific properties
		cx: 0,
		cy: 0,
		hw: 0,
		hh: 0,
		images: null,
		image: null,
		alpha: 1,

		spawn ( { cx, cy, type } ) {
			this.cx = cx
			this.cy = cy
			this.width = sizes[ type ].width
			this.height = sizes[ type ].height
			this.hw = sizes[ type ].width / 2
			this.hh = sizes[ type ].height / 2
			this.images = picker( images[ type ] )
			this.image = this.images.first()
			this.alpha = 1
		},

		update () {
			// Mark dead after 90 ticks
			if ( this.ticks > 90 )
				this.dead = true

			// Start fading after 20 ticks
			if ( this.ticks > 20 )
				this.alpha *= 0.95

			// Cycle through images every 10 ticks
			if ( this.ticks % 10 === 0 )
				this.image = this.images.next()

			// Float upward
			this.cy -= 5

			this.tick()
		},

		draw () {
			const x = this.cx - this.hw
			const y = this.cy - this.hh
			ctx.save()
			ctx.globalAlpha = this.alpha
			ctx.drawImage( this.image, x, y, this.width, this.height )
			ctx.restore()
		},
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATERS MANAGER
// ═══════════════════════════════════════════════════════════════════════════

export const Floaters = () => {
	return {
		floaters: [],

		all () {
			return this.floaters
		},

		count () {
			return this.floaters.length
		},

		spawnSingle ( { cx, cy, type } ) {
			let a = floater()
			this.floaters.push( a )
			a.spawn( { cx, cy, type } )
		},

		update ( dt ) {
			this.floaters = this.floaters.filter( ( x ) => x.dead !== true )
			this.floaters.forEach( ( x ) => x.update( dt ) )
		},

		draw () {
			this.floaters.forEach( ( x ) => x.draw() )
		}
	}
}
