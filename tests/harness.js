// ═══════════════════════════════════════════════════════════════════════════
// MINIMAL TEST HARNESS
// Run with: node tests/run.js
// ═══════════════════════════════════════════════════════════════════════════

let passed = 0
let failed = 0
let currentSuite = ''
const failures = []

export function describe ( name, fn ) {
	currentSuite = name
	console.log( `\n📦 ${name}` )
	fn()
}

export function test ( name, fn ) {
	try {
		fn()
		passed++
		console.log( `  ✅ ${name}` )
	} catch ( e ) {
		failed++
		console.log( `  ❌ ${name}` )
		failures.push( { suite: currentSuite, test: name, error: e.message } )
	}
}

// Alias
export const it = test

export function expect ( actual ) {
	return {
		toBe ( expected ) {
			if ( actual !== expected ) {
				throw new Error( `Expected ${JSON.stringify( expected )}, got ${JSON.stringify( actual )}` )
			}
		},
		toEqual ( expected ) {
			const a = JSON.stringify( actual )
			const e = JSON.stringify( expected )
			if ( a !== e ) {
				throw new Error( `Expected ${e}, got ${a}` )
			}
		},
		toBeDefined () {
			if ( actual === undefined ) {
				throw new Error( `Expected value to be defined, got undefined` )
			}
		},
		toBeUndefined () {
			if ( actual !== undefined ) {
				throw new Error( `Expected undefined, got ${JSON.stringify( actual )}` )
			}
		},
		toBeTruthy () {
			if ( !actual ) {
				throw new Error( `Expected truthy value, got ${JSON.stringify( actual )}` )
			}
		},
		toBeFalsy () {
			if ( actual ) {
				throw new Error( `Expected falsy value, got ${JSON.stringify( actual )}` )
			}
		},
		toContain ( item ) {
			if ( !actual.includes( item ) ) {
				throw new Error( `Expected ${JSON.stringify( actual )} to contain ${JSON.stringify( item )}` )
			}
		},
		toBeGreaterThan ( expected ) {
			if ( actual <= expected ) {
				throw new Error( `Expected ${actual} to be greater than ${expected}` )
			}
		},
		toBeLessThan ( expected ) {
			if ( actual >= expected ) {
				throw new Error( `Expected ${actual} to be less than ${expected}` )
			}
		},
		toThrow () {
			if ( typeof actual !== 'function' ) {
				throw new Error( `Expected a function` )
			}
			let threw = false
			try {
				actual()
			} catch ( e ) {
				threw = true
			}
			if ( !threw ) {
				throw new Error( `Expected function to throw` )
			}
		},
		not: {
			toBe ( expected ) {
				if ( actual === expected ) {
					throw new Error( `Expected ${JSON.stringify( actual )} not to be ${JSON.stringify( expected )}` )
				}
			},
			toContain ( item ) {
				if ( actual.includes( item ) ) {
					throw new Error( `Expected ${JSON.stringify( actual )} not to contain ${JSON.stringify( item )}` )
				}
			},
			toThrow () {
				if ( typeof actual !== 'function' ) {
					throw new Error( `Expected a function` )
				}
				try {
					actual()
				} catch ( e ) {
					throw new Error( `Expected function not to throw, but it threw: ${e.message}` )
				}
			}
		}
	}
}

export function summary () {
	console.log( '\n' + '═'.repeat( 50 ) )
	if ( failed === 0 ) {
		console.log( `✅ All ${passed} tests passed!` )
	} else {
		console.log( `❌ ${failed} failed, ${passed} passed` )
		console.log( '\nFailures:' )
		for ( const f of failures ) {
			console.log( `  ${f.suite} > ${f.test}` )
			console.log( `    ${f.error}` )
		}
	}
	console.log( '═'.repeat( 50 ) + '\n' )
	return failed === 0
}

// Export for checking results
export function getResults () {
	return { passed, failed, failures }
}
