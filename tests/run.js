#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// TEST RUNNER
// Run with: node --experimental-loader ./tests/loader.js tests/run.js
// ═══════════════════════════════════════════════════════════════════════════

// Load setup first (mocks browser globals)
import './setup.js'
// Phase 0: Entity conversion tests
import './entities/bullet.test.js'
import './entities/shot.test.js'
import './entities/snakes.test.js'
// Phase 1: Director tests
import './director.test.js'
// Phase 3: Integration tests
import './integration.test.js'

// Import test harness
import { describe, expect, summary, test } from './harness.js'

// Make available globally for test files
global.describe = describe
global.test = test
global.expect = expect

// ───────────────────────────────────────────────────────────────────────────
// Import and run test files
// Add new test files here as they're created
// ───────────────────────────────────────────────────────────────────────────

console.log( '🧪 Running tests...\n' )



// Phase 2: Entity metadata tests  
// import './entities/metadata.test.js'


// ───────────────────────────────────────────────────────────────────────────
// SMOKE TEST - verify harness works
// ───────────────────────────────────────────────────────────────────────────

describe( 'Test Harness', () => {
	test( 'expect().toBe() works', () => {
		expect( 1 + 1 ).toBe( 2 )
	} )

	test( 'expect().toEqual() works for objects', () => {
		expect( { a: 1 } ).toEqual( { a: 1 } )
	} )

	test( 'expect().toBeDefined() works', () => {
		expect( {} ).toBeDefined()
	} )

	test( 'expect().toContain() works for arrays', () => {
		expect( [ 1, 2, 3 ] ).toContain( 2 )
	} )

	test( 'expect().toBeTruthy() works', () => {
		expect( true ).toBeTruthy()
		expect( 1 ).toBeTruthy()
		expect( 'hello' ).toBeTruthy()
	} )

	test( 'expect().toBeFalsy() works', () => {
		expect( false ).toBeFalsy()
		expect( 0 ).toBeFalsy()
		expect( null ).toBeFalsy()
	} )

	test( 'expect().not.toBe() works', () => {
		expect( 1 ).not.toBe( 2 )
	} )

	test( 'expect().not.toContain() works', () => {
		expect( [ 1, 2, 3 ] ).not.toContain( 4 )
	} )
} )

// ───────────────────────────────────────────────────────────────────────────
// Print summary and exit
// ───────────────────────────────────────────────────────────────────────────

const success = summary()
process.exit( success ? 0 : 1 )
