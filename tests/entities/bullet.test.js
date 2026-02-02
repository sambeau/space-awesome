// Tests for bullet.js entity conversion

// We can't import bullet.js directly due to browser-style imports
// So we test the Entity system pieces separately, and verify bullet manually

import { createEntity, loadImages } from '../../game/zap/Entity.js'
import { describe, expect, test } from '../harness.js'

describe( 'bullet entity (via Entity.js)', () => {
	// Test that createEntity provides the mixins bullet needs
	test( 'createEntity provides syncCollider', () => {
		const entity = createEntity( {
			name: 'bullet',
			width: 6,
			height: 70,
			collider: { type: 'circle', ox: 3, oy: 5, r: 3, colliding: false }
		} )
		expect( typeof entity.syncCollider ).toBe( 'function' )
	} )

	test( 'createEntity provides tick', () => {
		const entity = createEntity( { name: 'bullet' } )
		expect( typeof entity.tick ).toBe( 'function' )
	} )

	test( 'syncCollider updates collider position', () => {
		const entity = createEntity( {
			name: 'bullet',
			collider: { type: 'circle', ox: 3, oy: 5, r: 3 }
		} )
		entity.x = 50
		entity.y = 100
		entity.syncCollider()
		expect( entity.collider.x ).toBe( 53 )  // 50 + 3
		expect( entity.collider.y ).toBe( 105 ) // 100 + 5
	} )

	test( 'tick increments ticks counter', () => {
		const entity = createEntity( { name: 'bullet' } )
		expect( entity.ticks ).toBe( 0 )
		entity.tick()
		expect( entity.ticks ).toBe( 1 )
	} )

	test( 'tick wraps at 1000', () => {
		const entity = createEntity( { name: 'bullet' } )
		entity.ticks = 999
		entity.tick()
		expect( entity.ticks ).toBe( 0 )
	} )

	test( 'loadImages returns images array and loaded function', () => {
		const assets = loadImages( [ 'images/bullet-long.png' ] )
		expect( Array.isArray( assets.images ) ).toBe( true )
		expect( typeof assets.loaded ).toBe( 'function' )
	} )
} )
