// Player death state - handles explosion sequence and respawn/game over logic

import { BaseState } from './BaseState.js'

// Sound effects will be created lazily when Howler is available
let gameOverSound = null
let epicSound = null
let impactSound = null
let hugeExplosionSound = null

function initSounds() {
	if (typeof Howl === 'undefined') return false

	if (!gameOverSound) {
		gameOverSound = new Howl({ src: ['/sounds/game-over.mp3'] })
		epicSound = new Howl({ src: ['/sounds/epic.mp3'] })
		impactSound = new Howl({ src: ['/sounds/impact.mp3'] })
		hugeExplosionSound = new Howl({ src: ['/sounds/huge-explosion.mp3'] })

		impactSound.volume(0.33)
		gameOverSound.volume(1.0)
		epicSound.volume(0.33)
		hugeExplosionSound.volume(0.33)
	}
	return true
}

export class PlayerDeathState extends BaseState {
	constructor(game) {
		super(game)
		this.wave = 1
		this.lives = 3
		this.score = 0
		this.sequenceComplete = false
	}

	enter(data = {}) {
		super.enter(data)

		this.wave = data.wave || 1
		this.lives = data.lives || 3
		this.score = data.score || 0
		this.sequenceComplete = false

		// Decrement lives
		this.lives--

		// Start explosion sequence
		this.runExplosionSequence()
	}

	runExplosionSequence() {
		const canvas = this.game.canvas
		const isGameOver = this.lives <= 0

		// Initialize sounds if not already done
		initSounds()

		// Play initial sounds
		if (hugeExplosionSound) hugeExplosionSound.play()
		if (epicSound) epicSound.play()
		canvas.classList.add("game-over-shake")

		// Create explosion effect (matching original from ship.js)
		const explosion = () => {
			if (impactSound) impactSound.play()
			for (let i = 100; i > 4; i = i / 2) {
				this.game.particles.spawnCircle({
					points: i,
					cx: this.game.canvas.width / 2,
					cy: this.game.canvas.height / 2,
					width: 20,
					height: 20,
					speed: i / 2,
					lifespan: 50,
					style: "glitter"
				})
			}
		}

		// Run explosion sequence with timing from ship.js
		explosion()
		setTimeout(() => {
			explosion()
			setTimeout(() => {
				explosion()
				setTimeout(() => {
					explosion()
					setTimeout(() => {
						explosion()
						setTimeout(() => {
							explosion()

							if (isGameOver) {
								// Game over path
								setTimeout(() => {
									explosion()
									setTimeout(() => {
										canvas.classList.remove("game-over-shake")
										setTimeout(() => {
											if (gameOverSound) gameOverSound.play()
											this.game.speed = 2
											this.sequenceComplete = true
											// Transition to game over state after sound plays
											setTimeout(() => {
												this.game.stateManager.transition('gameOver', {
													score: this.score
												})
											}, 2000)
										}, 5300)
									}, 500)
								}, 500)
							} else {
								// Respawn path
								this.game.speed = 2
								canvas.classList.remove("game-over-shake")
								this.sequenceComplete = true

								// Transition back to play state with remaining lives
								setTimeout(() => {
									this.game.stateManager.transition('play', {
										wave: this.wave,
										lives: this.lives,
										score: this.score
									})
								}, 1000)
							}
						}, 400)
					}, 300)
				}, 200)
			}, 100)
		}, 100)
	}

	update(dt) {
		// Update stars and particles during explosion
		if (this.game.stars) {
			this.game.stars.update(dt)
		}
		if (this.game.particles) {
			this.game.particles.update(dt)
		}
	}

	draw() {
		// Draw background to clear previous frame
		const ctx = this.game.ctx
		const canvas = this.game.canvas

		ctx.globalAlpha = 1.0
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		// Draw background gradient
		ctx.save()
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
		gradient.addColorStop(0, " #FF00FF")
		gradient.addColorStop(1, "rgba(39,45,255,1.0)")
		ctx.fillStyle = gradient
		ctx.globalAlpha = 0.2
		ctx.fillRect(0, 0, canvas.width, canvas.height)
		ctx.restore()

		// Draw stars behind explosion
		if (this.game.stars) {
			this.game.stars.draw()
		}

		// Draw particles during explosion
		if (this.game.particles) {
			this.game.particles.draw()
		}
	}

	exit() {
		super.exit()
	}
}
