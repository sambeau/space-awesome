// Mock browser globals for Node environment
// These allow entity code to run in tests without a browser

global.canvas = { width: 800, height: 600 }
global.screen = { width: 800, height: 600 }
global.ctx = {
	save: () => { },
	restore: () => { },
	drawImage: () => { },
	fillRect: () => { },
	fillStyle: '',
	globalAlpha: 1,
	translate: () => { },
	rotate: () => { },
	beginPath: () => { },
	arc: () => { },
	fill: () => { }
}

global.Image = class {
	constructor() {
		this.onload = null
		this.src = ''
	}
}

global.Howl = class {
	constructor( config ) {
		this.src = config?.src
	}
	play () { return 1 }
	stop () { }
	volume () { }
	stereo () { }
	fade () { }
	loop () { }
}

global.Howler = {
	ctx: { state: 'running' }
}

// Mock document for offscreen canvas creation
global.document = {
	createElement: ( tag ) => {
		if ( tag === 'canvas' ) {
			return {
				width: 0,
				height: 0,
				getContext: () => global.ctx
			}
		}
		return {}
	}
}
