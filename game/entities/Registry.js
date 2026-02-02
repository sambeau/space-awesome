// ═══════════════════════════════════════════════════════════════════════════
// ENTITY REGISTRY
// Centralized entity management with layer ordering and collision groups
// ═══════════════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────────────
// LAYER CONSTANTS - Draw order (lower = drawn first = behind)
// ───────────────────────────────────────────────────────────────────────────
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

// ───────────────────────────────────────────────────────────────────────────
// UPDATE GROUP CONSTANTS - Update order (if distinct order needed)
// ───────────────────────────────────────────────────────────────────────────
export const UPDATE = {
	POWERUPS: 0,
	STARS: 1,
	BADDIES: 2,
	SHIP: 3,
	PROJECTILES: 4,
	PARTICLES: 5,
	UI: 6
}

// ───────────────────────────────────────────────────────────────────────────
// COLLISION GROUP CONSTANTS - What things can collide with
// ───────────────────────────────────────────────────────────────────────────
export const COLLISION = {
	SHOOTABLE: 'shootable',     // ship weapons can hit
	DEADLY: 'deadly',           // kills ship on contact
	COLLECTABLE: 'collectable'  // ship can collect (powerups, spacemen)
}

// ───────────────────────────────────────────────────────────────────────────
// REGISTRY FACTORY
// ───────────────────────────────────────────────────────────────────────────

/**
 * Create a new entity registry
 * @returns {Object} Registry instance
 */
export function createRegistry () {
	return {
		// Shared references (e.g., ship, floaters manager)
		refs: {},

		// Entity storage by type: { galaxian: [], bomb: [], ... }
		entities: {},

		// Metadata by type: { galaxian: { drawLayer, collisionGroups }, ... }
		meta: {},

		// Factory functions by type: { galaxian: galaxianFactory, ... }
		factories: {},

		/**
		 * Register one or more entity types
		 * @param {Function|Function[]} factoryOrArray - Factory function(s)
		 */
		register ( factoryOrArray ) {
			const factories = Array.isArray( factoryOrArray ) ? factoryOrArray : [ factoryOrArray ]
			for ( const factory of factories ) {
				// Create temp instance to get metadata
				const temp = factory()
				const { name, drawLayer, updateGroup, collisionGroups, isPrimaryEnemy } = temp

				if ( !name ) {
					throw new Error( 'Entity factory must return entity with name property' )
				}

				this.factories[ name ] = factory
				this.entities[ name ] = []
				this.meta[ name ] = {
					drawLayer: drawLayer ?? LAYER.BADDIES,
					updateGroup: updateGroup ?? UPDATE.BADDIES,
					collisionGroups: collisionGroups ?? [],
					isPrimaryEnemy: isPrimaryEnemy ?? false
				}
			}
		},

		/**
		 * Spawn an entity, auto-injecting refs + merging props
		 * @param {string} type - Entity type name
		 * @param {Object} props - Spawn properties (x, y, vx, vy, etc.)
		 * @returns {Object} Spawned entity
		 */
		spawn ( type, props = {} ) {
			const factory = this.factories[ type ]
			if ( !factory ) {
				throw new Error( `Unknown entity type: ${type}` )
			}

			const entity = factory()
			this.entities[ type ].push( entity )

			// Inject refs and call spawn if exists
			if ( entity.spawn ) {
				entity.spawn( { ...this.refs, ...props } )
			} else {
				// Merge props directly if no spawn method
				Object.assign( entity, props )
			}

			return entity
		},

		/**
		 * Get array of entities by type
		 * @param {string} type - Entity type name
		 * @returns {Array} Entities of that type
		 */
		get ( type ) {
			return this.entities[ type ] || []
		},

		/**
		 * Get all entities in a collision group
		 * @param {string} group - Collision group name
		 * @returns {Array} Entities in that group (excludes dead entities)
		 */
		byGroup ( group ) {
			const result = []
			for ( const [ type, entities ] of Object.entries( this.entities ) ) {
				if ( this.meta[ type ].collisionGroups.includes( group ) ) {
					for ( const entity of entities ) {
						if ( !entity.dead ) {
							result.push( entity )
						}
					}
				}
			}
			return result
		},

		/**
		 * Get all entities sorted by draw layer
		 * @returns {Array} All entities sorted for drawing
		 */
		allByLayer () {
			const all = []
			for ( const [ type, entities ] of Object.entries( this.entities ) ) {
				const layer = this.meta[ type ].drawLayer
				for ( const entity of entities ) {
					all.push( { entity, layer } )
				}
			}
			// Sort by layer, stable sort preserves order within layer
			all.sort( ( a, b ) => a.layer - b.layer )
			return all.map( x => x.entity )
		},

		/**
		 * Remove dead entities from all arrays
		 */
		prune () {
			for ( const type of Object.keys( this.entities ) ) {
				this.entities[ type ] = this.entities[ type ].filter( e => !e.dead )
			}
		},

		/**
		 * Update all entities (after pruning dead ones)
		 */
		updateAll () {
			this.prune()
			// Get types sorted by update group
			const types = Object.keys( this.entities )
			types.sort( ( a, b ) => this.meta[ a ].updateGroup - this.meta[ b ].updateGroup )

			for ( const type of types ) {
				for ( const entity of this.entities[ type ] ) {
					if ( entity.update ) entity.update()
				}
			}
		},

		/**
		 * Draw all entities in layer order
		 */
		drawAll () {
			const sorted = this.allByLayer()
			for ( const entity of sorted ) {
				if ( entity.draw && !entity.dead ) {
					entity.draw()
				}
			}
		},

		/**
		 * Draw entities at a specific layer only
		 * @param {number} layer - Layer constant (e.g., LAYER.BADDIES)
		 */
		drawLayer ( layer ) {
			for ( const [ type, entities ] of Object.entries( this.entities ) ) {
				if ( this.meta[ type ].drawLayer === layer ) {
					for ( const entity of entities ) {
						if ( entity.draw && !entity.dead ) {
							entity.draw()
						}
					}
				}
			}
		},

		/**
		 * Get all living entities for minimap display
		 * Returns flat array of all registered entities (excluding dead ones)
		 * @returns {Array} All living entities
		 */
		allForMinimap () {
			const result = []
			for ( const entities of Object.values( this.entities ) ) {
				for ( const entity of entities ) {
					if ( !entity.dead ) {
						result.push( entity )
					}
				}
			}
			return result
		},

		/**
		 * Set shared references available to all spawned entities
		 * @param {Object} references - { ship, floaters, ... }
		 */
		setRefs ( references ) {
			this.refs = { ...this.refs, ...references }
		},

		/**
		 * Clear all entities (for level reset)
		 */
		clear () {
			for ( const type of Object.keys( this.entities ) ) {
				this.entities[ type ] = []
			}
		},

		/**
		 * Check if all specified entity types have no living entities
		 * @param {...string} types - Entity type names to check
		 * @returns {boolean} True if all specified types are empty/dead
		 */
		allDead ( ...types ) {
			for ( const type of types ) {
				const entities = this.entities[ type ]
				if ( entities && entities.some( e => !e.dead ) ) {
					return false
				}
			}
			return true
		},

		/**
		 * Get count of living entities for a type
		 * @param {string} type - Entity type name
		 * @returns {number} Count of non-dead entities
		 */
		count ( type ) {
			const entities = this.entities[ type ]
			if ( !entities ) return 0
			return entities.filter( e => !e.dead ).length
		},

		/**
		 * Get total count of entities in specified collision groups
		 * @param {...string} groups - Collision group names
		 * @returns {number} Total count
		 */
		countByGroups ( ...groups ) {
			let total = 0
			for ( const [ type, entities ] of Object.entries( this.entities ) ) {
				const meta = this.meta[ type ]
				if ( groups.some( g => meta.collisionGroups.includes( g ) ) ) {
					total += entities.filter( e => !e.dead ).length
				}
			}
			return total
		},

		/**
		 * Check if all primary enemies are dead (for wave completion)
		 * @returns {boolean} True if no living primary enemies exist
		 */
		allPrimaryEnemiesDead () {
			for ( const [ type, meta ] of Object.entries( this.meta ) ) {
				if ( meta.isPrimaryEnemy ) {
					const entities = this.entities[ type ]
					if ( entities && entities.some( e => !e.dead ) ) {
						return false
					}
				}
			}
			return true
		},

		/**
		 * Get all primary enemy types that have been registered
		 * @returns {string[]} Array of entity type names
		 */
		getPrimaryEnemyTypes () {
			return Object.entries( this.meta )
				.filter( ( [ , meta ] ) => meta.isPrimaryEnemy )
				.map( ( [ type ] ) => type )
		},

		/**
		 * Sync external entity arrays into registry (for gradual migration)
		 * Allows managers to continue owning entities while registry tracks them
		 * @param {string} type - Entity type name (must be registered)
		 * @param {Array} entities - External entity array
		 */
		sync ( type, entities ) {
			if ( !this.factories[ type ] ) {
				throw new Error( `Cannot sync unknown type: ${type}. Register it first.` )
			}
			this.entities[ type ] = entities
		},

		/**
		 * Add a single entity to the registry (for manual tracking)
		 * Useful when manager creates entity but wants registry to track it
		 * @param {string} type - Entity type name
		 * @param {Object} entity - Entity instance
		 * @returns {Object} The same entity (for chaining)
		 */
		add ( type, entity ) {
			if ( !this.factories[ type ] ) {
				throw new Error( `Cannot add to unknown type: ${type}. Register it first.` )
			}
			this.entities[ type ].push( entity )
			return entity
		}
	}
}
