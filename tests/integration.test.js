// Integration tests for entity registration
// Verifies all entity factories are properly exported and have correct metadata

import { COLLISION, LAYER } from '../game/entities/constants.js'
import { describe, expect, test } from './harness.js'

// Import all entity factories
import { asteroid } from '../game/entities/asteroids.js'
import { bomb } from '../game/entities/bombs.js'
import { bomber } from '../game/entities/bombers.js'
import { bullet } from '../game/entities/bullet.js'
import { createDirector } from '../game/zap/Director.js'
import { defender } from '../game/entities/defenders.js'
import { fireBomber } from '../game/entities/fireBombers.js'
import { galaxian } from '../game/entities/galaxians.js'
import { mine } from '../game/entities/mines.js'
import { mother } from '../game/entities/mothers.js'
import { mushroom } from '../game/entities/mushrooms.js'
import { pod } from '../game/entities/pods.js'
import { powerup } from '../game/entities/powerups.js'
import { shot } from '../game/entities/shot.js'
import { snake } from '../game/entities/snakes.js'
import { spaceman } from '../game/entities/spacemen.js'
import { swarmer } from '../game/entities/swarmers.js'

describe( 'Entity factory exports', () => {
	test( 'all factories are functions', () => {
		const factories = [
			asteroid, bomb, bomber, bullet, defender, fireBomber, galaxian, mine,
			mother, mushroom, pod, powerup, shot, snake, spaceman, swarmer
		]
		factories.forEach( f => {
			expect( typeof f ).toBe( 'function' )
		} )
	} )

	test( 'all factories return entities with names', () => {
		const factories = [
			asteroid, bomb, bomber, bullet, defender, fireBomber, galaxian, mine,
			mother, mushroom, pod, powerup, shot, snake, spaceman, swarmer
		]
		factories.forEach( f => {
			const entity = f()
			expect( entity.name ).toBeDefined()
		} )
	} )
} )

describe( 'Entity registration', () => {
	test( 'all factories register without error', () => {
		const reg = createDirector()
		expect( () => reg.register( [
			asteroid, bomb, bomber, bullet, defender, fireBomber, galaxian, mine,
			mother, mushroom, pod, powerup, shot, snake, spaceman, swarmer
		] ) ).not.toThrow()
	} )

	test( 'all registered entities have drawLayer', () => {
		const reg = createDirector()
		reg.register( [
			asteroid, bomb, bomber, bullet, defender, fireBomber, galaxian, mine,
			mother, mushroom, pod, powerup, shot, snake, spaceman, swarmer
		] )
		for ( const [ name, meta ] of Object.entries( reg.meta ) ) {
			expect( typeof meta.drawLayer ).toBe( 'number' )
		}
	} )

	test( 'all registered entities have collisionGroups array', () => {
		const reg = createDirector()
		reg.register( [
			asteroid, bomb, bomber, bullet, defender, fireBomber, galaxian, mine,
			mother, mushroom, pod, powerup, shot, snake, spaceman, swarmer
		] )
		for ( const [ name, meta ] of Object.entries( reg.meta ) ) {
			expect( Array.isArray( meta.collisionGroups ) ).toBe( true )
		}
	} )
} )

describe( 'Primary enemy metadata', () => {
	test( 'galaxian is primary enemy', () => {
		const reg = createDirector()
		reg.register( galaxian )
		expect( reg.meta.galaxian.isPrimaryEnemy ).toBe( true )
	} )

	test( 'defender is primary enemy', () => {
		const reg = createDirector()
		reg.register( defender )
		expect( reg.meta.defender.isPrimaryEnemy ).toBe( true )
	} )

	test( 'pod is primary enemy', () => {
		const reg = createDirector()
		reg.register( pod )
		expect( reg.meta.pod.isPrimaryEnemy ).toBe( true )
	} )

	test( 'mother is primary enemy', () => {
		const reg = createDirector()
		reg.register( mother )
		expect( reg.meta.mother.isPrimaryEnemy ).toBe( true )
	} )

	test( 'bomber is primary enemy', () => {
		const reg = createDirector()
		reg.register( bomber )
		expect( reg.meta.bomber.isPrimaryEnemy ).toBe( true )
	} )

	test( 'fireBomber is primary enemy', () => {
		const reg = createDirector()
		reg.register( fireBomber )
		expect( reg.meta.fireBomber.isPrimaryEnemy ).toBe( true )
	} )

	test( 'snake (controller) is primary enemy', () => {
		const reg = createDirector()
		reg.register( snake )
		expect( reg.meta.snakeController.isPrimaryEnemy ).toBe( true )
	} )

	test( 'swarmer IS primary enemy', () => {
		const reg = createDirector()
		reg.register( swarmer )
		expect( reg.meta.swarmer.isPrimaryEnemy ).toBe( true )
	} )

	test( 'asteroid is NOT primary enemy', () => {
		const reg = createDirector()
		reg.register( asteroid )
		expect( reg.meta.asteroid.isPrimaryEnemy ).toBe( false )
	} )
} )

describe( 'Collision group metadata', () => {
	test( 'shootable enemies have SHOOTABLE collision group', () => {
		const reg = createDirector()
		reg.register( [ galaxian, defender, asteroid, pod, swarmer, mine, mother, bomber, fireBomber, mushroom, spaceman ] )
		for ( const name of [ 'galaxian', 'defender', 'asteroid', 'pod', 'swarmer', 'mine', 'mother', 'bomber', 'fireBomber', 'mushroom', 'spaceman' ] ) {
			expect( reg.meta[ name ].collisionGroups ).toContain( COLLISION.SHOOTABLE )
		}
	} )

	test( 'deadly enemies have DEADLY collision group', () => {
		const reg = createDirector()
		reg.register( [ galaxian, defender, asteroid, pod, swarmer, mine, mother, bomber, fireBomber, bomb, shot, mushroom ] )
		for ( const name of [ 'galaxian', 'defender', 'asteroid', 'pod', 'swarmer', 'mine', 'mother', 'bomber', 'fireBomber', 'bomb', 'shot', 'mushroom' ] ) {
			expect( reg.meta[ name ].collisionGroups ).toContain( COLLISION.DEADLY )
		}
	} )

	test( 'collectables have COLLECTABLE collision group', () => {
		const reg = createDirector()
		reg.register( [ spaceman, powerup ] )
		expect( reg.meta.spaceman.collisionGroups ).toContain( COLLISION.COLLECTABLE )
		expect( reg.meta.powerup.collisionGroups ).toContain( COLLISION.COLLECTABLE )
	} )

	test( 'bullet has no collision groups', () => {
		const reg = createDirector()
		reg.register( bullet )
		expect( reg.meta.bullet.collisionGroups ).toEqual( [] )
	} )
} )

describe( 'Layer metadata', () => {
	test( 'enemies are in BADDIES layer', () => {
		const reg = createDirector()
		reg.register( [ galaxian, defender, asteroid, pod, swarmer, mine, mother, spaceman ] )
		for ( const name of [ 'galaxian', 'defender', 'asteroid', 'pod', 'swarmer', 'mine', 'mother', 'spaceman' ] ) {
			expect( reg.meta[ name ].drawLayer ).toBe( LAYER.BADDIES )
		}
	} )

	test( 'projectiles are in PROJECTILES layer', () => {
		const reg = createDirector()
		reg.register( [ bullet, shot, bomb ] )
		expect( reg.meta.bullet.drawLayer ).toBe( LAYER.PROJECTILES )
		expect( reg.meta.shot.drawLayer ).toBe( LAYER.PROJECTILES )
		expect( reg.meta.bomb.drawLayer ).toBe( LAYER.PROJECTILES )
	} )

	test( 'powerup is in POWERUPS layer', () => {
		const reg = createDirector()
		reg.register( powerup )
		expect( reg.meta.powerup.drawLayer ).toBe( LAYER.POWERUPS )
	} )

	test( 'mushroom is in DETRITUS layer', () => {
		const reg = createDirector()
		reg.register( mushroom )
		expect( reg.meta.mushroom.drawLayer ).toBe( LAYER.DETRITUS )
	} )
} )
describe( 'Registry spawn', () => {
	test( 'spawn creates entity of correct type', () => {
		const reg = createDirector()
		reg.register( bullet )
		const b = reg.spawn( 'bullet' )
		expect( b.name ).toBe( 'bullet' )
	} )

	test( 'spawn adds entity to entities array', () => {
		const reg = createDirector()
		reg.register( bullet )
		const b = reg.spawn( 'bullet' )
		expect( reg.get( 'bullet' ) ).toContain( b )
	} )

	test( 'spawn calls entity spawn method with props', () => {
		const reg = createDirector()
		reg.register( bullet )
		const b = reg.spawn( 'bullet', { atx: 100, aty: 200, ship: { removeBullet: () => { } } } )
		// Bullet spawn sets x based on atx
		expect( b.x ).toBe( 100 - b.width / 2 )
	} )

	test( 'spawn merges refs into props', () => {
		const reg = createDirector()
		const mockShip = { x: 50, y: 50, removeBullet: () => { } }
		reg.setRefs( { ship: mockShip } )
		reg.register( bullet )
		// bullet.spawn expects ship in props
		const b = reg.spawn( 'bullet', { atx: 100, aty: 200 } )
		expect( b.ship ).toBe( mockShip )
	} )

	test( 'spawn multiple entities of same type', () => {
		const reg = createDirector()
		reg.register( bullet )
		const mockShip = { removeBullet: () => { } }
		reg.spawn( 'bullet', { atx: 10, aty: 10, ship: mockShip } )
		reg.spawn( 'bullet', { atx: 20, aty: 20, ship: mockShip } )
		reg.spawn( 'bullet', { atx: 30, aty: 30, ship: mockShip } )
		expect( reg.get( 'bullet' ).length ).toBe( 3 )
	} )

	test( 'spawn different entity types', () => {
		const reg = createDirector()
		reg.register( [ bullet, galaxian ] )
		reg.spawn( 'bullet', { atx: 10, aty: 10, ship: { removeBullet: () => { } } } )
		reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )
		expect( reg.get( 'bullet' ).length ).toBe( 1 )
		expect( reg.get( 'galaxian' ).length ).toBe( 1 )
	} )

	test( 'spawn throws for unregistered type', () => {
		const reg = createDirector()
		expect( () => reg.spawn( 'unknown' ) ).toThrow()
	} )
} )

describe( 'Registry byGroup with spawned entities', () => {
	test( 'byGroup returns spawned shootable entities', () => {
		const reg = createDirector()
		reg.register( [ galaxian, bullet ] )
		const g = reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )
		reg.spawn( 'bullet', { atx: 10, aty: 10, ship: { removeBullet: () => { } } } )
		const shootables = reg.byGroup( COLLISION.SHOOTABLE )
		expect( shootables ).toContain( g )
		expect( shootables.length ).toBe( 1 ) // bullet is not shootable
	} )

	test( 'byGroup returns spawned deadly entities', () => {
		const reg = createDirector()
		reg.register( [ galaxian, shot ] )
		const g = reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )
		const s = reg.spawn( 'shot', { atx: 100, aty: 100, shooter: { shots: 0 } } )
		const deadly = reg.byGroup( COLLISION.DEADLY )
		expect( deadly ).toContain( g )
		expect( deadly ).toContain( s )
	} )
} )

describe( 'Registry byGroup with synced entities', () => {
	test( 'byGroup returns synced shootable entities', () => {
		const reg = createDirector()
		reg.register( [ mushroom, asteroid ] )
		const m = mushroom()
		const a = asteroid()
		// Sync external arrays (like manager.mushrooms would have)
		reg.sync( 'mushroom', [ m ] )
		reg.sync( 'asteroid', [ a ] )
		const shootables = reg.byGroup( COLLISION.SHOOTABLE )
		expect( shootables ).toContain( m )
		expect( shootables ).toContain( a )
		expect( shootables.length ).toBe( 2 )
	} )

	test( 'byGroup returns synced deadly entities', () => {
		const reg = createDirector()
		reg.register( [ mushroom, asteroid ] )
		const m = mushroom()
		const a = asteroid()
		reg.sync( 'mushroom', [ m ] )
		reg.sync( 'asteroid', [ a ] )
		const deadly = reg.byGroup( COLLISION.DEADLY )
		expect( deadly ).toContain( m )
		expect( deadly ).toContain( a )
	} )

	test( 'byGroup excludes dead synced entities', () => {
		const reg = createDirector()
		reg.register( mushroom )
		const m1 = mushroom()
		const m2 = mushroom()
		m1.dead = true
		reg.sync( 'mushroom', [ m1, m2 ] )
		const shootables = reg.byGroup( COLLISION.SHOOTABLE )
		expect( shootables ).not.toContain( m1 )
		expect( shootables ).toContain( m2 )
		expect( shootables.length ).toBe( 1 )
	} )
} )

describe( 'Registry prune with spawned entities', () => {
	test( 'prune removes dead spawned entities', () => {
		const reg = createDirector()
		reg.register( bullet )
		const mockShip = { removeBullet: () => { } }
		const b1 = reg.spawn( 'bullet', { atx: 10, aty: 10, ship: mockShip } )
		const b2 = reg.spawn( 'bullet', { atx: 20, aty: 20, ship: mockShip } )
		b1.dead = true
		reg.prune()
		expect( reg.get( 'bullet' ) ).not.toContain( b1 )
		expect( reg.get( 'bullet' ) ).toContain( b2 )
		expect( reg.get( 'bullet' ).length ).toBe( 1 )
	} )
} )

describe( 'Registry allByLayer with spawned entities', () => {
	test( 'allByLayer sorts spawned entities by draw layer', () => {
		const reg = createDirector()
		reg.register( [ mushroom, galaxian, bullet, powerup ] )
		// Spawn in random order
		const g = reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )       // BADDIES (2)
		const b = reg.spawn( 'bullet', { atx: 10, aty: 10, ship: { removeBullet: () => { } } } )  // PROJECTILES (5)
		const m = reg.spawn( 'mushroom', {} )                              // DETRITUS (1)
		const p = reg.spawn( 'powerup', { ship: { x: 0, y: 0 } } )        // POWERUPS (3)

		const sorted = reg.allByLayer()
		const indices = {
			mushroom: sorted.findIndex( e => e.name === 'mushroom' ),
			galaxian: sorted.findIndex( e => e.name === 'galaxian' ),
			powerup: sorted.findIndex( e => e.name === 'powerup' ),
			bullet: sorted.findIndex( e => e.name === 'bullet' )
		}

		// Lower layer = earlier in array
		expect( indices.mushroom ).toBeLessThan( indices.galaxian )
		expect( indices.galaxian ).toBeLessThan( indices.powerup )
		expect( indices.powerup ).toBeLessThan( indices.bullet )
	} )
} )

describe( 'Registry primary enemy tracking', () => {
	test( 'allPrimaryEnemiesDead returns false with living primary enemies', () => {
		const reg = createDirector()
		reg.register( [ galaxian, swarmer ] )
		reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )
		reg.spawn( 'swarmer', { ship: { x: 0, y: 0 } } )
		expect( reg.allPrimaryEnemiesDead() ).toBe( false )
	} )

	test( 'allPrimaryEnemiesDead returns true when primary enemies dead', () => {
		const reg = createDirector()
		reg.register( [ galaxian, swarmer ] )
		const g = reg.spawn( 'galaxian', { ship: { x: 0, y: 0 } } )
		const s = reg.spawn( 'swarmer', { ship: { x: 0, y: 0 } } )
		g.dead = true
		s.dead = true  // swarmer is also primary now
		reg.prune()
		expect( reg.allPrimaryEnemiesDead() ).toBe( true )
	} )
} )