// Wave management system - handles wave configuration and difficulty scaling

export class WaveManager {
	constructor() {
		this.currentWave = 1
	}

	// Get enemy counts for a given wave
	getWaveConfig(wave) {
		return {
			asteroids: Math.min(3 + wave, 10),
			galaxians: Math.min(4 + Math.floor(wave / 2), 12),
			defenders: Math.min(2 + Math.floor(wave / 3), 8),
			mothers: Math.min(1 + Math.floor(wave / 4), 4),
			pods: Math.min(2 + Math.floor(wave / 3), 6),
			mines: Math.min(2 + Math.floor(wave / 2), 8),
			speedMultiplier: 1 + (wave - 1) * 0.15,
			fireRateMultiplier: 1 + (wave - 1) * 0.1
		}
	}

	// Calculate difficulty multiplier for a wave
	getDifficultyMultiplier(wave) {
		return 1 + (wave - 1) * 0.15
	}

	// Calculate speed multiplier for a wave
	getSpeedMultiplier(wave) {
		return 1 + (wave - 1) * 0.15
	}

	// Check if wave is complete by counting enemies
	isWaveComplete(entities) {
		// Primary enemies that must be defeated to complete wave
		const primaryEnemies = [
			entities.asteroids?.asteroids || [],
			entities.galaxians?.galaxians || [],
			entities.defenders?.defenders || [],
			entities.mothers?.mothers || [],
			entities.pods?.pods || [],
			entities.swarmers?.swarmers || [],
			entities.mines?.mines || []
		]

		// Wave is complete when all primary enemy arrays are empty
		return primaryEnemies.every(enemyArray => enemyArray.length === 0)
	}

	// Get wave bonus score
	getWaveBonus(wave) {
		return wave * 1000
	}

	// Set current wave
	setWave(wave) {
		this.currentWave = wave
	}

	// Get current wave
	getWave() {
		return this.currentWave
	}
}
