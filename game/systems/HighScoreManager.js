// High score manager with localStorage persistence

export class HighScoreManager {
	constructor() {
		this.storageKey = 'zap-highscore'
		this.highScore = this.loadHighScore()
	}

	// Load high score from localStorage
	loadHighScore() {
		try {
			const stored = localStorage.getItem(this.storageKey)
			return stored ? parseInt(stored, 10) : 0
		} catch (e) {
			console.error('Failed to load high score:', e)
			return 0
		}
	}

	// Save high score to localStorage
	saveHighScore(score) {
		try {
			localStorage.setItem(this.storageKey, score.toString())
			this.highScore = score
			console.log('High score saved:', score)
		} catch (e) {
			console.error('Failed to save high score:', e)
		}
	}

	// Get current high score
	getHighScore() {
		return this.highScore
	}

	// Check if score is a new high score and update if so
	checkAndUpdateHighScore(score) {
		if (score > this.highScore) {
			this.saveHighScore(score)
			return true // New high score!
		}
		return false
	}
}
