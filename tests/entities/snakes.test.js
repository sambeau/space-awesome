// Tests for snakes.js entity conversion
// Tests Entity system features used by snake segment entity

import { createEntity, loadSound } from '../../game/entities/Entity.js'
import { describe, expect, test } from '../harness.js'

describe( 'snake segment (via Entity.js)', () => {
	test( 'createEntity provides tick mixin', () => {
		const entity = createEntity( {
			name: 'snake',
			width: 16,
			height: 16,
			collider: { type: 'circle', x: 0, y: 0, r: 8 }
		} )
		expect( typeof entity.tick ).toBe( 'function' )
	} )

	test( 'createEntity sets initial ticks to 0', () => {
		const entity = createEntity( { name: 'snake' } )
		expect( entity.ticks ).toBe( 0 )
	} )

	test( 'tick increments ticks counter', () => {
		const entity = createEntity( { name: 'snake' } )
		entity.tick()
		entity.tick()
		entity.tick()
		expect( entity.ticks ).toBe( 3 )
	} )

	test( 'loadSound returns sound object with play method', () => {
		const sound = loadSound( '/sounds/bang.mp3', { volume: 0.1 } )
		expect( typeof sound.play ).toBe( 'function' )
	} )

	test( 'loadSound returns sound object with volume method', () => {
		const sound = loadSound( '/sounds/eaten.mp3', { volume: 0.2 } )
		expect( typeof sound.volume ).toBe( 'function' )
	} )

	test( 'loadSound returns sound object with stereo method', () => {
		const sound = loadSound( '/sounds/eaten.mp3' )
		expect( typeof sound.stereo ).toBe( 'function' )
	} )
} )
