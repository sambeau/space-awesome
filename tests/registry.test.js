import { COLLISION, LAYER, UPDATE } from '../game/entities/constants.js'
// Tests for Registry.js - Entity registry system
import { describe, expect, test } from './harness.js'

import { createRegistry } from '../game/entities/Registry.js'

describe( 'Registry constants', () => {
	test( 'LAYER has expected values', () => {
		expect( LAYER.BACKGROUND ).toBe( 0 )
		expect( LAYER.BADDIES ).toBe( 2 )
		expect( LAYER.UI ).toBe( 8 )
	} )

	test( 'LAYER is ordered (lower = behind)', () => {
		expect( LAYER.BACKGROUND ).toBeLessThan( LAYER.BADDIES )
		expect( LAYER.BADDIES ).toBeLessThan( LAYER.SHIP )
		expect( LAYER.SHIP ).toBeLessThan( LAYER.UI )
	} )

	test( 'UPDATE has expected values', () => {
		expect( UPDATE.POWERUPS ).toBe( 0 )
		expect( UPDATE.BADDIES ).toBe( 2 )
		expect( UPDATE.UI ).toBe( 6 )
	} )

	test( 'COLLISION has string values', () => {
		expect( COLLISION.SHOOTABLE ).toBe( 'shootable' )
		expect( COLLISION.DEADLY ).toBe( 'deadly' )
		expect( COLLISION.COLLECTABLE ).toBe( 'collectable' )
	} )
} )

describe( 'createRegistry', () => {
	test( 'creates registry with empty containers', () => {
		const reg = createRegistry()
		expect( reg.refs ).toEqual( {} )
		expect( reg.entities ).toEqual( {} )
		expect( reg.meta ).toEqual( {} )
		expect( reg.factories ).toEqual( {} )
	} )

	test( 'has register method', () => {
		const reg = createRegistry()
		expect( typeof reg.register ).toBe( 'function' )
	} )

	test( 'has spawn method', () => {
		const reg = createRegistry()
		expect( typeof reg.spawn ).toBe( 'function' )
	} )

	test( 'has get method', () => {
		const reg = createRegistry()
		expect( typeof reg.get ).toBe( 'function' )
	} )
} )

describe( 'Registry.register', () => {
	const mockFactory = () => ( { name: 'testEntity', drawLayer: LAYER.BADDIES } )

	test( 'registers single factory', () => {
		const reg = createRegistry()
		reg.register( mockFactory )
		expect( reg.factories.testEntity ).toBe( mockFactory )
	} )

	test( 'registers array of factories', () => {
		const reg = createRegistry()
		const factory1 = () => ( { name: 'entity1' } )
		const factory2 = () => ( { name: 'entity2' } )
		reg.register( [ factory1, factory2 ] )
		expect( reg.factories.entity1 ).toBe( factory1 )
		expect( reg.factories.entity2 ).toBe( factory2 )
	} )

	test( 'creates empty entity array', () => {
		const reg = createRegistry()
		reg.register( mockFactory )
		expect( reg.entities.testEntity ).toEqual( [] )
	} )

	test( 'stores metadata', () => {
		const reg = createRegistry()
		const factory = () => ( {
			name: 'baddie',
			drawLayer: LAYER.BADDIES,
			updateGroup: UPDATE.BADDIES,
			collisionGroups: [ COLLISION.SHOOTABLE, COLLISION.DEADLY ]
		} )
		reg.register( factory )
		expect( reg.meta.baddie.drawLayer ).toBe( LAYER.BADDIES )
		expect( reg.meta.baddie.collisionGroups ).toContain( COLLISION.SHOOTABLE )
	} )

	test( 'uses defaults for missing metadata', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'basic' } ) )
		// Registry uses 0 as default for drawLayer/updateGroup (generic, not game-specific)
		expect( reg.meta.basic.drawLayer ).toBe( 0 )
		expect( reg.meta.basic.collisionGroups ).toEqual( [] )
	} )
} )

describe( 'Registry.spawn', () => {
	test( 'creates and stores entity', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', x: 0, y: 0 } ) )
		const enemy = reg.spawn( 'enemy', { x: 100, y: 200 } )
		expect( reg.entities.enemy.length ).toBe( 1 )
		expect( reg.entities.enemy[ 0 ] ).toBe( enemy )
	} )

	test( 'calls spawn method with props and refs', () => {
		const reg = createRegistry()
		let receivedProps = null
		reg.register( () => ( {
			name: 'tracked',
			spawn ( props ) { receivedProps = props }
		} ) )
		reg.setRefs( { ship: 'mockShip' } )
		reg.spawn( 'tracked', { x: 50 } )
		expect( receivedProps.ship ).toBe( 'mockShip' )
		expect( receivedProps.x ).toBe( 50 )
	} )

	test( 'assigns props directly if no spawn method', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'simple', x: 0 } ) )
		const entity = reg.spawn( 'simple', { x: 999 } )
		expect( entity.x ).toBe( 999 )
	} )
} )

describe( 'Registry.get', () => {
	test( 'returns entities by type', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'item' } ) )
		reg.spawn( 'item' )
		reg.spawn( 'item' )
		expect( reg.get( 'item' ).length ).toBe( 2 )
	} )

	test( 'returns empty array for unknown type', () => {
		const reg = createRegistry()
		expect( reg.get( 'nonexistent' ) ).toEqual( [] )
	} )
} )

describe( 'Registry.byGroup', () => {
	test( 'returns entities in collision group', () => {
		const reg = createRegistry()
		reg.register( () => ( {
			name: 'shootable1',
			collisionGroups: [ COLLISION.SHOOTABLE ]
		} ) )
		reg.register( () => ( {
			name: 'notShootable',
			collisionGroups: [ COLLISION.COLLECTABLE ]
		} ) )
		reg.spawn( 'shootable1' )
		reg.spawn( 'notShootable' )
		const shootables = reg.byGroup( COLLISION.SHOOTABLE )
		expect( shootables.length ).toBe( 1 )
	} )

	test( 'excludes dead entities', () => {
		const reg = createRegistry()
		reg.register( () => ( {
			name: 'enemy',
			dead: false,
			collisionGroups: [ COLLISION.DEADLY ]
		} ) )
		const e1 = reg.spawn( 'enemy' )
		const e2 = reg.spawn( 'enemy' )
		e1.dead = true
		const deadly = reg.byGroup( COLLISION.DEADLY )
		expect( deadly.length ).toBe( 1 )
		expect( deadly[ 0 ] ).toBe( e2 )
	} )
} )

describe( 'Registry.prune', () => {
	test( 'removes dead entities', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'mortal', dead: false } ) )
		const e1 = reg.spawn( 'mortal' )
		const e2 = reg.spawn( 'mortal' )
		e1.dead = true
		reg.prune()
		expect( reg.get( 'mortal' ).length ).toBe( 1 )
		expect( reg.get( 'mortal' )[ 0 ] ).toBe( e2 )
	} )
} )

describe( 'Registry.clear', () => {
	test( 'removes all entities', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'type1' } ) )
		reg.register( () => ( { name: 'type2' } ) )
		reg.spawn( 'type1' )
		reg.spawn( 'type2' )
		reg.clear()
		expect( reg.get( 'type1' ) ).toEqual( [] )
		expect( reg.get( 'type2' ) ).toEqual( [] )
	} )
} )

describe( 'Registry.allByLayer', () => {
	test( 'sorts entities by draw layer', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'front', drawLayer: LAYER.UI } ) )
		reg.register( () => ( { name: 'back', drawLayer: LAYER.BACKGROUND } ) )
		reg.spawn( 'front' )
		reg.spawn( 'back' )
		const sorted = reg.allByLayer()
		expect( sorted[ 0 ].name ).toBe( 'back' )
		expect( sorted[ 1 ].name ).toBe( 'front' )
	} )
} )

describe( 'Registry.allForMinimap', () => {
	test( 'returns all living entities', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', dead: false } ) )
		reg.register( () => ( { name: 'powerup', dead: false } ) )
		reg.spawn( 'enemy' )
		reg.spawn( 'enemy' )
		reg.spawn( 'powerup' )
		const all = reg.allForMinimap()
		expect( all.length ).toBe( 3 )
	} )

	test( 'excludes dead entities', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', dead: false } ) )
		const e1 = reg.spawn( 'enemy' )
		const e2 = reg.spawn( 'enemy' )
		e1.dead = true
		const all = reg.allForMinimap()
		expect( all.length ).toBe( 1 )
		expect( all[ 0 ] ).toBe( e2 )
	} )

	test( 'returns empty array when no entities', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy' } ) )
		expect( reg.allForMinimap() ).toEqual( [] )
	} )
} )

describe( 'Registry.allDead', () => {
	test( 'returns true when no entities exist', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy' } ) )
		expect( reg.allDead( 'enemy' ) ).toBe( true )
	} )

	test( 'returns false when living entities exist', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', dead: false } ) )
		reg.spawn( 'enemy' )
		expect( reg.allDead( 'enemy' ) ).toBe( false )
	} )

	test( 'returns true when all entities are dead', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', dead: false } ) )
		const e = reg.spawn( 'enemy' )
		e.dead = true
		expect( reg.allDead( 'enemy' ) ).toBe( true )
	} )

	test( 'checks multiple types', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'type1' } ) )
		reg.register( () => ( { name: 'type2' } ) )
		reg.spawn( 'type1' )
		expect( reg.allDead( 'type1', 'type2' ) ).toBe( false )
	} )
} )

describe( 'Registry.count', () => {
	test( 'returns 0 for unknown type', () => {
		const reg = createRegistry()
		expect( reg.count( 'nonexistent' ) ).toBe( 0 )
	} )

	test( 'counts living entities only', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'enemy', dead: false } ) )
		const e1 = reg.spawn( 'enemy' )
		reg.spawn( 'enemy' )
		e1.dead = true
		expect( reg.count( 'enemy' ) ).toBe( 1 )
	} )
} )

describe( 'Registry.countByGroups', () => {
	test( 'counts entities in specified collision groups', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'shootable1', collisionGroups: [ COLLISION.SHOOTABLE ] } ) )
		reg.register( () => ( { name: 'deadly1', collisionGroups: [ COLLISION.DEADLY ] } ) )
		reg.spawn( 'shootable1' )
		reg.spawn( 'shootable1' )
		reg.spawn( 'deadly1' )
		expect( reg.countByGroups( COLLISION.SHOOTABLE ) ).toBe( 2 )
		expect( reg.countByGroups( COLLISION.DEADLY ) ).toBe( 1 )
		expect( reg.countByGroups( COLLISION.SHOOTABLE, COLLISION.DEADLY ) ).toBe( 3 )
	} )
} )

describe( 'Registry.isPrimaryEnemy', () => {
	test( 'stores isPrimaryEnemy metadata', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'galaxian', isPrimaryEnemy: true } ) )
		reg.register( () => ( { name: 'asteroid', isPrimaryEnemy: false } ) )
		expect( reg.meta.galaxian.isPrimaryEnemy ).toBe( true )
		expect( reg.meta.asteroid.isPrimaryEnemy ).toBe( false )
	} )

	test( 'defaults isPrimaryEnemy to false', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'mushroom' } ) )
		expect( reg.meta.mushroom.isPrimaryEnemy ).toBe( false )
	} )
} )

describe( 'Registry.allPrimaryEnemiesDead', () => {
	test( 'returns true when no primary enemies registered', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'asteroid', isPrimaryEnemy: false } ) )
		reg.spawn( 'asteroid' )
		expect( reg.allPrimaryEnemiesDead() ).toBe( true )
	} )

	test( 'returns false when primary enemies exist', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'galaxian', isPrimaryEnemy: true } ) )
		reg.spawn( 'galaxian' )
		expect( reg.allPrimaryEnemiesDead() ).toBe( false )
	} )

	test( 'returns true when all primary enemies are dead', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'galaxian', isPrimaryEnemy: true } ) )
		const g = reg.spawn( 'galaxian' )
		g.dead = true
		expect( reg.allPrimaryEnemiesDead() ).toBe( true )
	} )
} )

describe( 'Registry.getPrimaryEnemyTypes', () => {
	test( 'returns list of primary enemy type names', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'galaxian', isPrimaryEnemy: true } ) )
		reg.register( () => ( { name: 'defender', isPrimaryEnemy: true } ) )
		reg.register( () => ( { name: 'asteroid', isPrimaryEnemy: false } ) )
		const types = reg.getPrimaryEnemyTypes()
		expect( types ).toContain( 'galaxian' )
		expect( types ).toContain( 'defender' )
		expect( types ).not.toContain( 'asteroid' )
	} )
} )

describe( 'Registry.sync', () => {
	test( 'syncs external array to registry', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'spaceman' } ) )
		const externalArray = [ { name: 'spaceman', x: 100 }, { name: 'spaceman', x: 200 } ]
		reg.sync( 'spaceman', externalArray )
		expect( reg.get( 'spaceman' ) ).toBe( externalArray )
	} )

	test( 'throws for unknown type', () => {
		const reg = createRegistry()
		expect( () => reg.sync( 'unknown', [] ) ).toThrow()
	} )

	test( 'synced entities work with allDead', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'pod', isPrimaryEnemy: true } ) )
		const external = [ { name: 'pod', dead: false }, { name: 'pod', dead: true } ]
		reg.sync( 'pod', external )
		expect( reg.allDead( 'pod' ) ).toBe( false )
		external[ 0 ].dead = true
		expect( reg.allDead( 'pod' ) ).toBe( true )
	} )

	test( 'synced entities work with allPrimaryEnemiesDead', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'galaxian', isPrimaryEnemy: true } ) )
		const external = [ { name: 'galaxian', dead: false } ]
		reg.sync( 'galaxian', external )
		expect( reg.allPrimaryEnemiesDead() ).toBe( false )
		external[ 0 ].dead = true
		expect( reg.allPrimaryEnemiesDead() ).toBe( true )
	} )
} )

describe( 'Registry.add', () => {
	test( 'adds entity to registry', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'bullet' } ) )
		const bullet = { name: 'bullet', x: 50 }
		reg.add( 'bullet', bullet )
		expect( reg.get( 'bullet' ) ).toContain( bullet )
	} )

	test( 'returns the entity for chaining', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'bullet' } ) )
		const bullet = { name: 'bullet' }
		const result = reg.add( 'bullet', bullet )
		expect( result ).toBe( bullet )
	} )

	test( 'throws for unknown type', () => {
		const reg = createRegistry()
		expect( () => reg.add( 'unknown', {} ) ).toThrow()
	} )

	test( 'added entities are prunable', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'shot' } ) )
		const s1 = { name: 'shot', dead: false }
		const s2 = { name: 'shot', dead: true }
		reg.add( 'shot', s1 )
		reg.add( 'shot', s2 )
		reg.prune()
		expect( reg.get( 'shot' ) ).toContain( s1 )
		expect( reg.get( 'shot' ) ).not.toContain( s2 )
	} )
} )
describe( 'Registry.updateAll', () => {
	test( 'calls update on all entities', () => {
		const reg = createRegistry()
		let updateCount = 0
		reg.register( () => ( {
			name: 'updatable',
			update: () => { updateCount++ }
		} ) )
		reg.spawn( 'updatable' )
		reg.spawn( 'updatable' )
		reg.updateAll()
		expect( updateCount ).toBe( 2 )
	} )

	test( 'prunes dead entities before updating', () => {
		const reg = createRegistry()
		let updateCount = 0
		reg.register( () => ( {
			name: 'mortal',
			dead: false,
			update: () => { updateCount++ }
		} ) )
		const e1 = reg.spawn( 'mortal' )
		reg.spawn( 'mortal' )
		e1.dead = true
		reg.updateAll()
		expect( updateCount ).toBe( 1 )
		expect( reg.get( 'mortal' ).length ).toBe( 1 )
	} )

	test( 'updates in updateGroup order', () => {
		const reg = createRegistry()
		const order = []
		reg.register( () => ( {
			name: 'last',
			updateGroup: UPDATE.UI,
			update: () => { order.push( 'last' ) }
		} ) )
		reg.register( () => ( {
			name: 'first',
			updateGroup: UPDATE.POWERUPS,
			update: () => { order.push( 'first' ) }
		} ) )
		reg.spawn( 'last' )
		reg.spawn( 'first' )
		reg.updateAll()
		expect( order ).toEqual( [ 'first', 'last' ] )
	} )

	test( 'handles entities without update method', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'static' } ) )
		reg.spawn( 'static' )
		expect( () => reg.updateAll() ).not.toThrow()
	} )
} )

describe( 'Registry.drawAll', () => {
	test( 'calls draw on all entities', () => {
		const reg = createRegistry()
		let drawCount = 0
		reg.register( () => ( {
			name: 'drawable',
			draw: () => { drawCount++ }
		} ) )
		reg.spawn( 'drawable' )
		reg.spawn( 'drawable' )
		reg.drawAll()
		expect( drawCount ).toBe( 2 )
	} )

	test( 'draws in layer order', () => {
		const reg = createRegistry()
		const order = []
		reg.register( () => ( {
			name: 'front',
			drawLayer: LAYER.UI,
			draw: () => { order.push( 'front' ) }
		} ) )
		reg.register( () => ( {
			name: 'back',
			drawLayer: LAYER.BACKGROUND,
			draw: () => { order.push( 'back' ) }
		} ) )
		reg.spawn( 'front' )
		reg.spawn( 'back' )
		reg.drawAll()
		expect( order ).toEqual( [ 'back', 'front' ] )
	} )

	test( 'skips dead entities', () => {
		const reg = createRegistry()
		let drawCount = 0
		reg.register( () => ( {
			name: 'mortal',
			dead: false,
			draw: () => { drawCount++ }
		} ) )
		const e1 = reg.spawn( 'mortal' )
		reg.spawn( 'mortal' )
		e1.dead = true
		reg.drawAll()
		expect( drawCount ).toBe( 1 )
	} )

	test( 'handles entities without draw method', () => {
		const reg = createRegistry()
		reg.register( () => ( { name: 'invisible' } ) )
		reg.spawn( 'invisible' )
		expect( () => reg.drawAll() ).not.toThrow()
	} )
} )

describe( 'Registry.drawLayer', () => {
	test( 'only draws entities at specified layer', () => {
		const reg = createRegistry()
		const drawn = []
		reg.register( () => ( {
			name: 'bg',
			drawLayer: LAYER.BACKGROUND,
			draw: () => { drawn.push( 'bg' ) }
		} ) )
		reg.register( () => ( {
			name: 'fg',
			drawLayer: LAYER.BADDIES,
			draw: () => { drawn.push( 'fg' ) }
		} ) )
		reg.spawn( 'bg' )
		reg.spawn( 'fg' )
		reg.drawLayer( LAYER.BACKGROUND )
		expect( drawn ).toEqual( [ 'bg' ] )
	} )

	test( 'skips dead entities', () => {
		const reg = createRegistry()
		let drawCount = 0
		reg.register( () => ( {
			name: 'baddie',
			drawLayer: LAYER.BADDIES,
			dead: false,
			draw: () => { drawCount++ }
		} ) )
		const e1 = reg.spawn( 'baddie' )
		reg.spawn( 'baddie' )
		e1.dead = true
		reg.drawLayer( LAYER.BADDIES )
		expect( drawCount ).toBe( 1 )
	} )
} )