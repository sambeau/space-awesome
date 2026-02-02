import { canvas, ctx, game } from "../game.js"

import { Minimap } from "./minimap.js"
import { picker } from "/zap/zap.js"

const debug = false

const top = 24
const padding = 20
const gap = 10
const pixel = 4


const smartBombImage1 = new Image()
const smartBombImage2 = new Image()
const smartBombImage3 = new Image()

smartBombImage1.src = "/images/smart-hud-icon-1.png"
smartBombImage2.src = "/images/smart-hud-icon-2.png"
smartBombImage3.src = "/images/smart-hud-icon-3.png"

export const SmartBombs = () => {
	return {
		smartbombs: null,
		images: null,
		init ( smartbombs ) {
			this.smartbombs = smartbombs
			this.images = picker( [ smartBombImage1, smartBombImage2, smartBombImage3 ] )
		},
		update () { },
		draw () {
			const width = 54 / 2
			const height = 26 / 2
			const x = canvas.width - width - padding
			const y = top + textHeight + pixel * 3 + gap * 2 + 55 / 2
			for ( let i = 0; i < this.smartbombs.charges; i++ ) {
				ctx.drawImage( this.images.any(), x - ( i * ( width + 5 ) ), y, width, height )
			}
		}
	}
}

const livesImage1 = new Image()
const livesImage2 = new Image()
const livesImage3 = new Image()

livesImage1.src = "/images/ship-hud-icon-1.png"
livesImage2.src = "/images/ship-hud-icon-2.png"
livesImage3.src = "/images/ship-hud-icon-3.png"

const textHeight = 13

export const Lives = () => {
	return {
		images: null,
		init () {
			this.images = picker( [ livesImage1, livesImage2, livesImage3 ] )
		},
		ticker: 0,
		update () {
			this.ticker++
		},
		draw () {
			const width = 42 / 2
			const height = 55 / 2
			const x = canvas.width - width - padding
			const y = top + textHeight + pixel * 3 + gap
			if ( game.lives == 1 ) {
				ctx.save()
				ctx.globalAlpha = Math.abs( Math.sin( this.ticker / 7.5 ) * 1.0 )
				ctx.drawImage( this.images.any(), x, y, width, height )
				ctx.restore()
			}
			else
				for ( let i = 0; i < game.lives; i++ ) {
					ctx.drawImage( this.images.any(), x - ( i * ( width + 5 ) ), y, width, height )
				}
		}
	}
}

const spacemanImage = new Image()
spacemanImage.src = "/images/spaceman-1.png"

const spacemanSavedImage1 = new Image()
const spacemanSavedImage2 = new Image()
const spacemanSavedImage3 = new Image()
spacemanSavedImage1.src = "/images/spaceman-saved-1.png"
spacemanSavedImage2.src = "/images/spaceman-saved-2.png"
spacemanSavedImage3.src = "/images/spaceman-saved-3.png"

export const Spacemen = () => {
	return {
		registry: null,
		getSaved: null,
		savedImages: null,
		init ( registry, getSaved ) {
			this.registry = registry
			this.getSaved = getSaved
			this.savedImages = picker( [
				spacemanSavedImage1,
				spacemanSavedImage2,
				spacemanSavedImage3
			] )

		},
		update () { },
		draw () {
			const width = 69 / 4
			const height = 69 / 4
			const x = canvas.width - width - padding

			// Calculate Y position: below minimap
			// Minimap: y = 52 + 15 + 55 = 122, height = canvas.height * 0.4
			const minimapTop = 52 + gap * 3 + 55
			const minimapHeight = canvas.height * 4 / 10
			const y = minimapTop + minimapHeight + gap

			const saved = this.getSaved()
			const remaining = this.registry.count( 'spaceman' )
			for ( let i = 0; i < saved; i++ ) {
				ctx.drawImage( this.savedImages.any(), x - ( i * ( width - 5 ) ), y, width, height )
			}
			for ( let i = saved; i < remaining + saved; i++ ) {
				ctx.drawImage( spacemanImage, x - ( i * ( width - 5 ) ), y, width, height )
			}
		}
	}
}


let once = false
export const Score = () => {
	return {
		scoreString: "",
		ticker: 0,
		init () {
		},
		update ( dt ) {
			this.scoreString = game.score.toString().padStart( 7, "0" )
			this.ticker++
		},
		draw () {
			ctx.font = "15px Robotron"
			const textMetrics = ctx.measureText( this.scoreString )
			if ( !once ) {
				once = true
			}
			const width = textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft
			const y = top + padding
			// const x = canvas.width / 2 - width / 2
			const x = canvas.width - width - padding
			// align right

			ctx.fillStyle = "#743BA6"
			ctx.fillText( this.scoreString, x, y + pixel * 2 )
			ctx.fillStyle = "#961EFF"
			ctx.fillText( this.scoreString, x, y + pixel )

			const highScore = game.highScoreManager.getHighScore()

			ctx.fillStyle = "#FF00FF"
			ctx.fillText( this.scoreString, x, y )
			if ( game.score > highScore ) {
				ctx.save()
				ctx.globalAlpha = Math.abs( Math.sin( this.ticker / 15 ) * 0.8 )
				ctx.fillStyle = "#FFFFFF"
				ctx.fillText( this.scoreString, x, y )
				ctx.restore()
			}
		}
	}
}

export const Hud = () => {
	return {
		score: null,
		registry: null,
		init ( ship, getSavedSpacemen, ents, registry = null ) {

			this.registry = registry

			this.score = Score()
			this.score.init()

			this.minimap = Minimap()
			this.minimap.init( ship, ents, registry )

			this.lives = Lives()
			this.lives.init()

			this.smartBombs = SmartBombs()
			this.smartBombs.init( ship.smartBomb )

			this.spacemen = Spacemen()
			this.spacemen.init( registry, getSavedSpacemen )
		},
		update ( dt ) {
			this.score.update()
			this.minimap.update()
			this.lives.update()
			// this.smartBombs.update()
		},
		draw () {
			this.score.draw()
			this.minimap.draw()
			this.smartBombs.draw()
			this.lives.draw()
			this.spacemen.draw()
			// Game over rendering now handled by GameOverState

			// Debug: Show audio context state
			if ( game.debug && typeof Howler !== 'undefined' && Howler.ctx ) {
				ctx.save()
				ctx.fillStyle = Howler.ctx.state === 'running' ? '#00FF00' : '#FF0000'
				ctx.font = '16px monospace'
				ctx.fillText( `Audio: ${Howler.ctx.state}`, 10, canvas.height - 10 )
				ctx.restore()
			}
		}
	}
}
