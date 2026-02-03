import { canvas, ctx, game } from "../game.js"

import { picker } from "/zap/zap.js"

const debug = true

const scale = 10
const top = 52
const padding = 20
const gap = 5
const pixel = 4

let ship
let entities
let director

let width
let height
let y
let x

const scannerLabel = "↑  SCANNER  ↑"
const humansLabel = "↑  SPACEMEN  ↑"

export let Minimap = () => {
	return {
		randomColors: null,
		randomColor: "white",
		ticker: 0,
		animationSpeed: 3,
		image: 0,
		init ( ship, ents, reg = null ) {
			this.ship = ship
			entities = ents
			director = reg

			width = canvas.width / scale
			height = canvas.height * 4 / scale
			y = top + gap * 3 + 55
			x = canvas.width - width - padding

			this.randomColors = picker( [
				"#ff00ff",
				"#ffff00",
				"#00ffff",
			] )
		},
		update ( dt ) {
			this.ticker++
			if ( this.ticker == 30 ) this.ticker = 0
			if ( this.ticker == this.animationSpeed ) {
				this.ticker = 0
				this.randomColor = this.randomColors.any()
			}
		},
		draw () {
			ctx.save()
			ctx.fillStyle = "white"
			ctx.globalAlpha = 0.8

			const gradient = ctx.createLinearGradient( 0, 0, 0, canvas.height )
			gradient.addColorStop( 0, "#320033" )
			gradient.addColorStop( 1, "#090932" )
			ctx.fillStyle = gradient

			// minimap
			ctx.fillRect( x, y, width, height )
			ctx.strokeStyle = "#FF00FF"
			ctx.roundRect( x, y, width, height, 8 )
			ctx.stroke()

			// spacemen
			ctx.roundRect( x, y + height + gap * 3, width, 35, 8 )
			ctx.stroke()

			// dash
			ctx.setLineDash( [ 5, 5 ] )
			ctx.beginPath()
			ctx.moveTo( x, y + height * ( 3 / 4 ) )
			ctx.lineTo( x + width, y + height * ( 3 / 4 ) )
			ctx.stroke()

			// scanner
			ctx.textBaseline = "middle"
			ctx.textAlign = "center"
			ctx.font = "12px StargateSmall"
			ctx.fillStyle = "#ffffff"
			ctx.fillText( scannerLabel, x + width / 2, y + height + ( gap * 3 / 2 ) )
			ctx.fillText( humansLabel, x + width / 2, y + height + ( gap * 3 / 2 ) + 50 )
			ctx.fillText( this.ship.shield.strength, x + width / 2, y + height + ( gap * 3 / 2 ) + 70 )

			// Get all minimap-visible entities - prefer director if available
			const allEnts = director
				? director.allForMinimap()
				: entities.flatMap( type => type.all() )

			allEnts.forEach( ( ent ) => {
				if ( ent.noMap ) return
				if ( ent.y > canvas.height * -3 && ent.y < canvas.height && !ent.dead ) {
					if ( ent.color )
						ctx.fillStyle = ent.color
					else
						ctx.fillStyle = "white"
					if ( ent.color == "random" ) {
						ctx.fillStyle = this.randomColor
					}
					if ( ent.name == "spaceman" ) {
						const sx = ent.x / scale + x
						const sy = ( ent.y + 3 * canvas.height ) / scale + y
						ctx.fillRect( sx - 1, sy - 2, 4 + 2, 4 + 4 )
					}
					else
						ctx.fillRect( ent.x / scale + x, ( ent.y + 3 * canvas.height ) / scale + y, 4, 4 )
				}
			} )
			ctx.fillStyle = "white"
			if ( ship && ship.x && !ship.dead && !game.over ) { // why doesn't this work? // because it should be this.ship!! TODO
				const shipx = ship.x / scale + x
				const shipy = ( ship.y + 3 * canvas.height + 2 ) / scale + y
				ctx.fillRect( shipx, shipy, 2, 4 )
				ctx.fillRect( shipx, shipy, 2, 4 )
				ctx.fillRect( shipx - 2, shipy + 4, 6, 2 )
			}
			ctx.restore()
		}
	}
}
