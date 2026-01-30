// Audio manager to handle Howler AudioContext state

export class AudioManager {
	constructor() {
		this.audioContextResumed = false
		this.setupAudioResume()
	}

	setupAudioResume() {
		// Resume audio context on any user interaction
		const resumeAudio = () => {
			if (typeof Howler !== 'undefined' && Howler.ctx) {
				const ctx = Howler.ctx

				console.log('AudioContext state:', ctx.state)

				if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
					console.log('Resuming suspended AudioContext...')
					ctx.resume().then(() => {
						console.log('AudioContext resumed successfully')
						this.audioContextResumed = true
					}).catch(err => {
						console.error('Failed to resume AudioContext:', err)
					})
				} else if (ctx.state === 'running') {
					console.log('AudioContext already running')
					this.audioContextResumed = true
				}
			}
		}

		// Try to resume on various user interactions
		const events = ['click', 'touchstart', 'keydown']
		events.forEach(event => {
			document.addEventListener(event, () => {
				if (!this.audioContextResumed) {
					resumeAudio()
				}
			}, { once: true, capture: true })
		})

		// Also check on page visibility change
		document.addEventListener('visibilitychange', () => {
			if (!document.hidden) {
				resumeAudio()
			}
		})
	}

	// Check if audio is ready to play
	isAudioReady() {
		if (typeof Howler === 'undefined') return false
		if (!Howler.ctx) return false
		return Howler.ctx.state === 'running'
	}

	// Force resume audio context
	forceResume() {
		if (typeof Howler !== 'undefined' && Howler.ctx) {
			const ctx = Howler.ctx
			// Only resume if suspended, otherwise just resolve
			if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
				console.log('Force resuming AudioContext from state:', ctx.state)
				return ctx.resume()
			} else if (ctx.state === 'running') {
				console.log('AudioContext already running, no resume needed')
				return Promise.resolve()
			}
		}
		return Promise.resolve()
	}
}
