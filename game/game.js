import { build, version } from "./version.js"

// Import state system
import { StateManager } from "./states/StateManager.js"
import { TitleState } from "./states/TitleState.js"
import { PlayState } from "./states/PlayState.js"
import { PlayerDeathState } from "./states/PlayerDeathState.js"
import { WaveTransitionState } from "./states/WaveTransitionState.js"
import { GameOverState } from "./states/GameOverState.js"
import { NewHighScoreState } from "./states/NewHighScoreState.js"
import { starfield as Starfield } from "./entities/stars.js"
import { AudioManager } from "./audioManager.js"
import { HighScoreManager } from "./systems/HighScoreManager.js"

// Setup canvas
export const canvas = document.getElementById("canvas")
canvas.width = window.screen.availWidth - 32
canvas.height = window.screen.availHeight - 32

export const ctx = canvas.getContext("2d")

// Game state object
export const game = {
	version: version,
	build: build,
	over: false,
	lives: 3,
	score: 0,
	speed: 1,
	particles: null,
	stars: null, // Shared stars across all states
	fontLoaded: false,
	debug: false,
	showColliders: false,
	massConstant: 400,
	canvas: canvas,
	ctx: ctx,
	stateManager: null,
	audioManager: null,
	highScoreManager: null
}

// Legacy GameStates export for ship.js (will be removed after ship.js is updated)
export const GameStates = Object.freeze({
	IN_CREDITS: Symbol("IN_CREDITS"),
	IN_START: Symbol("IN_START"),
	IN_PLAY: Symbol("IN_PLAY"),
	IN_RESTART: Symbol("IN_RESTART"),
	IN_GAMEOVER: Symbol("IN_GAMEOVER"),
})

// Load fonts
let font1 = new FontFace("Robotron", "url(fonts/WilliamsRobotron.woff2)")
let font2 = new FontFace("Defender", "url(fonts/Defender.woff2)")

font1.load().then(() => {
	document.fonts.add(font1)
	font2.load().then(() => {
		document.fonts.add(font2)
		game.fontLoaded = true
	})
})

// Initialize shared resources
game.stars = Starfield()
game.stars.spawn()

// Initialize audio manager to handle AudioContext state
game.audioManager = new AudioManager()

// Initialize high score manager
game.highScoreManager = new HighScoreManager()

// Initialize state manager
game.stateManager = new StateManager(game)

// Register all states
game.stateManager.register('title', new TitleState(game))
game.stateManager.register('play', new PlayState(game))
game.stateManager.register('playerDeath', new PlayerDeathState(game))
game.stateManager.register('waveTransition', new WaveTransitionState(game))
game.stateManager.register('gameOver', new GameOverState(game))
game.stateManager.register('newHighScore', new NewHighScoreState(game))

// Track time for delta calculation
let lastTime = 0

// Main game loop
const gameLoop = (timestamp) => {
	// Calculate delta time, cap to prevent huge jumps on first frame or after tab switch
	let dt = timestamp - lastTime
	lastTime = timestamp
	
	// Cap dt to ~3 frames worth (50ms) to prevent timing issues
	if (dt > 50) dt = 50

	// Update and draw current state
	game.stateManager.update(dt)
	game.stateManager.draw()

	// Continue loop
	window.requestAnimationFrame(gameLoop)
}

// Start the game
const main = () => {
	game.stateManager.transition('title')
	window.requestAnimationFrame(gameLoop)
}

main()
