// Tests for shot.js entity conversion
// Tests Entity system features used by shot entity

import { createEntity, loadImages } from '../../game/entities/Entity.js'
import { describe, expect, test } from '../harness.js'

describe( 'shot entity (via Entity.js)', () => {
	test( 'createEntity provides syncCollider', () => {
		const entity = createEntity( {
			name: 'shot',
			width: 6,
			height: 35,
			collider: { type: 'circle', ox: 3, oy: 32, r: 3, area: 5, colliding: false }
		} )
		expect( typeof entity.syncCollider ).toBe( 'function' )
	} )

	test( 'createEntity provides tick', () => {
		const entity = createEntity( { name: 'shot' } )
		expect( typeof entity.tick ).toBe( 'function' )
	} )

	test( 'syncCollider updates collider position', () => {
		const entity = createEntity( {
			name: 'shot',
			collider: { type: 'circle', ox: 3, oy: 32, r: 3 }
		} )
		entity.x = 100
		entity.y = 200
		entity.syncCollider()
		expect( entity.collider.x ).toBe( 103 )  // 100 + 3
		expect( entity.collider.y ).toBe( 232 ) // 200 + 32
	} )

	test( 'tick increments ticks counter', () => {
		const entity = createEntity( { name: 'shot' } )
		expect( entity.ticks ).toBe( 0 )
		entity.tick()
		expect( entity.ticks ).toBe( 1 )
	} )

	test( 'loadImages returns single image in array', () => {
		const assets = loadImages( [ 'images/shot.png' ] )
		expect( assets.images.length ).toBe( 1 )
		expect( typeof assets.loaded ).toBe( 'function' )
	} )
} )
