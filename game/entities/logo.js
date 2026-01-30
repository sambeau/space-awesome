import { ctx } from "../game.js";
import { picker } from "/zap/zap.js";

let numImagesLoaded = 0
const logoImages = []
const imageStates = [1, 2, 3]
const allImagesLoadedCount = imageStates.length

imageStates.forEach((i) => {
	logoImages[i - 1] = new Image()
	logoImages[i - 1].onload = () => { numImagesLoaded++ }
	logoImages[i - 1].src = `images/logo-${i}.png`
})

export const Logo = () => {
	return {
		states: null,
		image: null,
		x: 0,
		y: 0,
		width: 1466 / 2,
		height: 634 / 2,
		animationSpeed: 5,
		ticker: 0,
		ticker2: 0,
		tick() {
			this.ticker2++
			this.ticker++
			if (this.ticker == this.animationSpeed) {
				this.ticker = 0
				this.animate()
			}
		},
		spawn() {
			this.states = picker(logoImages)
			this.image = this.states.first()
			this.x = screen.width / 2 - this.width / 2
			this.y = screen.height / 2 - this.height / 2 - 64
		},
		update(/*dt*/) {
			this.tick()
		},
		draw() {
			if (numImagesLoaded >= allImagesLoadedCount) {
				ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
			}
			this.drawText()

		},
		drawText() {
			ctx.save()
			ctx.globalAlpha = Math.abs(Math.sin(this.ticker2 / 30) * 0.8)
			ctx.font = "18px Robotron";
			ctx.fillStyle = "#FF00FF";
			ctx.textBaseline = 'middle';
			// ctx.textAlign = 'center';
			ctx.fillText('PRESS SPACE TO START', canvas.width / 2 - 230, canvas.height / 2 + this.height / 2 + 32 * 5);
			ctx.restore()
		},
		animate() {
			this.image = this.states.next()
		},
	}
};
