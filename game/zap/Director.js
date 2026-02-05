
// ENTITY DIRECTOR
// A generic, reusable entity management system with layer ordering and
// collision groups. Game-specific constants (LAYER, UPDATE, COLLISION) are
// defined separately in constants.js

/**
 * Create a new entity director
 * @returns {Object} Director instance
 */
export function createDirector () {
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
					drawLayer: drawLayer ?? 0,
					updateGroup: updateGroup ?? 0,
					collisionGroups: collisionGroups ?? [],
					isPrimaryEnemy: isPrimaryEnemy ?? false
				}
			}
			// Invalidate cached draw order when new types are registered
			this._typeDrawOrder = null
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

		// Cached type order for drawing (sorted by drawLayer)
		_typeDrawOrder: null,

		/**
		 * Get entity types sorted by draw layer (cached)
		 * @returns {string[]} Type names sorted by draw layer
		 */
		getTypeDrawOrder () {
			if ( !this._typeDrawOrder ) {
				this._typeDrawOrder = Object.keys( this.meta )
					.sort( ( a, b ) => this.meta[ a ].drawLayer - this.meta[ b ].drawLayer )
			}
			return this._typeDrawOrder
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

		// Optional callback before pruning dead entities (e.g., count saved spacemen)
		onBeforePrune: null,

		/**
		 * Remove dead entities from all arrays
		 */
		prune () {
			if ( this.onBeforePrune ) this.onBeforePrune( this )
			for ( const type of Object.keys( this.entities ) ) {
				this.entities[ type ] = this.entities[ type ].filter( e => !e.dead )
			}
		},

		/**
		 * Update all entities (after pruning dead ones)
		 * @param {number} dt - Delta time
		 */
		updateAll ( dt ) {
			this.prune()
			// Get types sorted by update group
			const types = Object.keys( this.entities )
			types.sort( ( a, b ) => this.meta[ a ].updateGroup - this.meta[ b ].updateGroup )

			for ( const type of types ) {
				for ( const entity of this.entities[ type ] ) {
					if ( entity.update ) entity.update( dt )
				}
			}
		},

		/**
		 * Draw all entities in layer order (optimized - no per-frame sort)
		 */
		drawAll () {
			// Use cached type order instead of sorting all entities every frame
			for ( const type of this.getTypeDrawOrder() ) {
				const entities = this.entities[ type ]
				for ( const entity of entities ) {
					if ( entity.draw && !entity.dead ) {
						entity.draw()
					}
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
		 * Update entities of a specific type (prunes dead first)
		 * @param {string} type - Entity type name
		 * @param {number} dt - Delta time
		 */
		updateType ( type, dt ) {
			const entities = this.entities[ type ]
			if ( !entities ) return

			// Prune dead entities first
			this.entities[ type ] = entities.filter( e => !e.dead )

			// Update remaining entities
			for ( const entity of this.entities[ type ] ) {
				if ( entity.update ) entity.update( dt )
			}
		},

		/**
		 * Draw entities of a specific type
		 * @param {string} type - Entity type name
		 */
		drawType ( type ) {
			const entities = this.entities[ type ]
			if ( !entities ) return

			for ( const entity of entities ) {
				if ( entity.draw && !entity.dead ) {
					entity.draw()
				}
			}
		},

		/**
		 * Clear entities of a specific type
		 * @param {string} type - Entity type name
		 */
		clearType ( type ) {
			if ( this.entities[ type ] ) {
				this.entities[ type ] = []
			}
		},

		/**
		 * Get all living entities for minimap display
		 * Returns flat array of all registered entities (excluding dead ones)
		 * For controllers with an all() method, includes their children instead of the controller itself
		 * @returns {Array} All living entities
		 */
		allForMinimap () {
			const result = []
			for ( const entities of Object.values( this.entities ) ) {
				for ( const entity of entities ) {
					if ( !entity.dead ) {
						// If entity has an all() method, include its children instead of itself
						// (e.g., snake controllers manage segments internally)
						if ( typeof entity.all === 'function' ) {
							for ( const child of entity.all() ) {
								if ( !child.dead ) {
									result.push( child )
								}
							}
						} else {
							result.push( entity )
						}
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
