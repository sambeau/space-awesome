// GAME CONSTANTS
// Game-specific layer, update, and collision group definitions
// These are separate from Director.js to keep the director reusable

// LAYER CONSTANTS - Draw order (lower = drawn first = behind)
export const LAYER = {
	BACKGROUND: 0,    // stars
	DETRITUS: 1,      // mushrooms
	BADDIES: 2,       // enemies, spacemen
	POWERUPS: 3,
	SHIP: 4,
	PROJECTILES: 5,   // bullets, shots
	PARTICLES: 6,     // explosions
	FLOATERS: 7,      // floating score/text
	UI: 8             // hud, minimap
}

// UPDATE GROUP CONSTANTS - Update order (if distinct order needed)
export const UPDATE = {
	POWERUPS: 0,
	STARS: 1,
	BADDIES: 2,
	SHIP: 3,
	PROJECTILES: 4,
	PARTICLES: 5,
	UI: 6
}

// COLLISION GROUP CONSTANTS - What things can collide with
export const COLLISION = {
	SHOOTABLE: 'shootable',     // ship weapons can hit
	DEADLY: 'deadly',           // kills ship on contact
	COLLECTABLE: 'collectable'  // ship can collect (powerups, spacemen)
}
