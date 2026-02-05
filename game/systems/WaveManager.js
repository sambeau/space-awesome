// Wave management system - handles wave configuration and spawning
// Each wave is data-driven with spawn definitions, modifiers, and bonuses

import { randInt } from '../zap/zap.js'

// WAVE DEFINITIONS
// Each wave defines what to spawn and any modifiers

const WAVES = [

	// Wave 1 - Introduction
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			// { type: 'asteroid', count: 3, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 1 },
			// Mother ship
			{ type: 'mother', count: 1 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 5, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					// { y: randInt( ch * 3 ) + ch * 2 },
					// { y: randInt( ch * 3 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			{ type: 'pod', count: 1 },
			// Bombers
			{ type: 'bomber', count: 5 },
			// // Fire bombers
			// { type: 'fireBomber', count: 10 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			{ type: 'defender', count: 15 },
			// // Galaxians
			// { type: 'galaxian', count: 4 },
			// // Snake
			// {
			// 	type: 'snakeController', count: 1, props: ( ch, cw ) => [
			// 		{ x: cw * Math.random(), y: 200, length: 8 }
			// 	]
			// },
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					// { type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					// { type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					// { type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					// { type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 2 - try this
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			{ type: 'asteroid', count: 4, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 1 },
			// Mother ship
			{ type: 'mother', count: 1 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					// { y: randInt( ch * 3 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			// { type: 'pod', count: 1 },
			// Bombers
			// { type: 'bomber', count: 5 },
			// // Fire bombers
			// { type: 'fireBomber', count: 10 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			// { type: 'defender', count: 10 },
			// // Galaxians
			{ type: 'galaxian', count: 20 },
			// // Snake
			// {
			// 	type: 'snakeController', count: 1, props: ( ch, cw ) => [
			// 		{ x: cw * Math.random(), y: 200, length: 8 }
			// 	]
			// },
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					// { type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					// { type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					// { type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					// { type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 3 - Getting warmer
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			// { type: 'asteroid', count: 4, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 1 },
			// Mother ship
			{ type: 'mother', count: 2 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			{ type: 'pod', count: 1 },
			// Bombers
			{ type: 'bomber', count: 5 },
			// Fire bombers
			// { type: 'fireBomber', count: 10 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			{ type: 'defender', count: 20 },
			// // Galaxians
			// { type: 'galaxian', count: 20 },
			// // Snake
			// {
			// 	type: 'snakeController', count: 1, props: ( ch, cw ) => [
			// 		{ x: cw * Math.random(), y: 200, length: 8 }
			// 	]
			// },
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					// { type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					// { type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					// { type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 4 - Getting warmer
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			// { type: 'asteroid', count: 4, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 1 },
			// Mother ship
			{ type: 'mother', count: 2 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			{ type: 'pod', count: 1 },
			// Bombers
			{ type: 'bomber', count: 5 },
			// Fire bombers
			// { type: 'fireBomber', count: 10 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			{ type: 'defender', count: 10 },
			// // Galaxians
			// { type: 'galaxian', count: 20 },
			// Snake
			{
				type: 'snakeController', count: 1, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 200, length: 8 }
				]
			},
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					// { type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					// { type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 5 - Spikey
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			{ type: 'asteroid', count: 4, props: { size: 'L' } },
			// // Mine
			{ type: 'mine', count: 8 },
			// Mother ship
			{ type: 'mother', count: 1 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			// { type: 'pod', count: 1 },
			// Bombers
			// { type: 'bomber', count: 5 },
			// Fire bombers
			// { type: 'fireBomber', count: 10 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			// { type: 'defender', count: 10 },
			// // Galaxians
			{ type: 'galaxian', count: 10 },
			// Snake
			{
				type: 'snakeController', count: 1, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 200, length: 8 }
				]
			},
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					// { type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					// { type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 6 - Getting warmer
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			// { type: 'asteroid', count: 4, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 1 },
			// Mother ship
			{ type: 'mother', count: 1 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 9, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			{ type: 'pod', count: 2 },
			// Bombers
			{ type: 'bomber', count: 8 },
			// Fire bombers
			{ type: 'fireBomber', count: 2 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			{ type: 'defender', count: 10 },
			// // Galaxians
			// { type: 'galaxian', count: 20 },
			// Snake
			{
				type: 'snakeController', count: 1, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 200, length: 10 }
				]
			},
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 7 - Spikey 2
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			{ type: 'asteroid', count: 6, props: { size: 'L' } },
			// // Mine
			{ type: 'mine', count: 12 },
			// Mother ship
			{ type: 'mother', count: 2 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			// { type: 'pod', count: 1 },
			// Bombers
			// { type: 'bomber', count: 5 },
			// Fire bombers
			{ type: 'fireBomber', count: 3 },
			// // Screamers
			{ type: 'screamer', count: 2 },
			// // Defenders
			// { type: 'defender', count: 10 },
			// // Galaxians
			{ type: 'galaxian', count: 10 },
			// Snake
			{
				type: 'snakeController', count: 1, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 200, length: 8 }
				]
			},
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 3 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 8 - In a flap
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			{ type: 'asteroid', count: 0, props: { size: 'L' } },
			// // Mine
			{ type: 'mine', count: 0 },
			// Mother ship
			{ type: 'mother', count: 4 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 6, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					// { y: randInt( ch * 2 ) + ch * 4 },
					// { y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			// { type: 'pod', count: 1 },
			// Bombers
			// { type: 'bomber', count: 5 },
			// Fire bombers
			{ type: 'fireBomber', count: 5 },
			// // Screamers
			{ type: 'screamer', count: 5 },
			// // Defenders
			{ type: 'defender', count: 5 },
			// // Galaxians
			{ type: 'galaxian', count: 5 },
			// Snake
			// {
			// 	type: 'snakeController', count: 1, props: ( ch, cw ) => [
			// 		{ x: cw * Math.random(), y: 200, length: 8 }
			// 	]
			// },
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 3 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},
	// Wave 9 - Asteroids
	{
		name: 'First Contact',
		bonus: 1000,
		modifiers: {
			speedMultiplier: 1.0,
			fireRateMultiplier: 1.0
		},
		spawns: [
			// Asteroids
			{ type: 'asteroid', count: 10, props: { size: 'L' } },
			// // Mine
			// { type: 'mine', count: 0 },
			// Mother ship
			{ type: 'mother', count: 4 },
			// Spacemen - spread across vertical space
			{
				type: 'spaceman', count: 8, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 4 },
					{ y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			// Pods (spawn swarmers when killed)
			// { type: 'pod', count: 1 },
			// Bombers
			// { type: 'bomber', count: 5 },
			// Fire bombers
			{ type: 'fireBomber', count: 3 },
			// // Screamers
			// { type: 'screamer', count: 5 },
			// // Defenders
			// { type: 'defender', count: 5 },
			// // Galaxians
			// { type: 'galaxian', count: 5 },
			// Snake
			{
				type: 'snakeController', count: 4, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 50, length: 8 },
					{ x: cw * Math.random(), y: 100, length: 8 },
					{ x: cw * Math.random(), y: 200, length: 8 },
					{ x: cw * Math.random(), y: 300, length: 8 },
					{ x: cw * Math.random(), y: 400, length: 8 },
				]
			},
			// Powerups - various types spread across space
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 3 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	},



	// Wave 2 - More enemies, slightly faster
	{
		name: 'Growing Threat',
		bonus: 2000,
		modifiers: {
			speedMultiplier: 1.1,
			fireRateMultiplier: 1.05
		},
		spawns: [
			{ type: 'asteroid', count: 4, props: { size: 'L' } },
			{ type: 'mine', count: 2 },
			{ type: 'mother', count: 1 },
			{
				type: 'spaceman', count: 11, props: ( ch ) => [
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 2 ) },
					{ y: randInt( ch * 2 ) + ch * 4 },
					{ y: randInt( ch * 2 ) + ch * 4 }
				]
			},
			{ type: 'pod', count: 3 },
			{ type: 'bomber', count: 12 },
			{ type: 'fireBomber', count: 12 },
			{ type: 'defender', count: 5 },
			{ type: 'galaxian', count: 5 },
			{
				type: 'snakeController', count: 1, props: ( ch, cw ) => [
					{ x: cw * Math.random(), y: 200, length: 10 }
				]
			},
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	}

	// Add more waves here...
]

// DEFAULT WAVE GENERATOR
// For waves beyond defined ones, generate procedurally

function generateWave ( waveNumber ) {
	const difficulty = 1 + ( waveNumber - 1 ) * 0.15

	return {
		name: `Wave ${waveNumber}`,
		bonus: waveNumber * 1000,
		modifiers: {
			speedMultiplier: Math.min( difficulty, 2.0 ),
			fireRateMultiplier: Math.min( 1 + ( waveNumber - 1 ) * 0.1, 1.8 )
		},
		spawns: [
			{ type: 'asteroid', count: Math.min( 3 + waveNumber, 10 ), props: { size: 'L' } },
			{ type: 'mine', count: Math.min( 1 + Math.floor( waveNumber / 2 ), 8 ) },
			{ type: 'mother', count: Math.min( 1 + Math.floor( waveNumber / 4 ), 4 ) },
			{
				type: 'spaceman', count: 11, props: ( ch ) => [
					{ y: randInt( ch * 2 ) },
					{ y: randInt( ch * 2 ) + ch },
					{ y: randInt( ch * 2 ) + ch },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 1 },
					{ y: randInt( ch * 2 ) + ch * 4 }
					{ y: randInt( ch * 2 ) + ch * 4 },
					{ y: randInt( ch * 2 ) + ch * 4 },
					{ y: randInt( ch * 2 ) + ch * 4 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 3 ) + ch * 1 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 3 ) + ch * 2 },
					{ y: randInt( ch * 4 ) + ch * 3 },
					{ y: randInt( ch * 4 ) + ch * 3 },
				]
			},
			{ type: 'pod', count: Math.min( 2 + Math.floor( waveNumber / 3 ), 6 ) },
			{ type: 'bomber', count: Math.min( 10 + waveNumber, 20 ) },
			{ type: 'fireBomber', count: Math.min( 10 + waveNumber, 20 ) },
			{ type: 'defender', count: Math.min( 4 + Math.floor( waveNumber / 2 ), 12 ) },
			{ type: 'galaxian', count: Math.min( 4 + Math.floor( waveNumber / 2 ), 12 ) },
			{
				type: 'snakeController', count: Math.min( 1 + Math.floor( waveNumber / 3 ), 3 ), props: ( ch, cw ) => {
					const snakes = []
					const count = Math.min( 1 + Math.floor( waveNumber / 3 ), 3 )
					for ( let i = 0; i < count; i++ ) {
						snakes.push( { x: cw * Math.random(), y: 200 + i * 100, length: 8 + waveNumber } )
					}
					return snakes
				}
			},
			{
				type: 'powerup', count: 7, props: ( ch ) => [
					{ type: 'bullet', y: randInt( ch * 4 ) + ch * 3 },
					{ type: 'bullet', y: randInt( ch * 3 ) + ch * 2 },
					{ type: 'life', y: randInt( ch * 3 ) + ch * 1 },
					{ type: 'smart', y: randInt( ch * 2 ) + ch * 1 },
					{ type: 'shield', y: randInt( ch * 2 ) },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 },
					{ type: 'shield', y: randInt( ch * 2 ) + ch * 4 }
				]
			}
		]
	}
}

// WAVE MANAGER

export class WaveManager {
	constructor() {
		this.waves = WAVES
	}

	/**
	 * Get wave configuration
	 * @param {number} waveNumber - 1-indexed wave number
	 * @returns {Object} Wave config with name, bonus, modifiers, spawns
	 */
	getWave ( waveNumber ) {
		// Use defined wave if available, otherwise generate
		if ( waveNumber <= this.waves.length ) {
			return this.waves[ waveNumber - 1 ]
		}
		return generateWave( waveNumber )
	}

	/**
	 * Spawn all entities for a wave
	 * @param {Object} registry - Entity registry
	 * @param {number} waveNumber - Wave to spawn
	 * @param {Object} canvas - Canvas for dimensions
	 */
	spawnWave ( registry, waveNumber, canvas ) {
		const wave = this.getWave( waveNumber )
		const ch = canvas.height
		const cw = canvas.width

		for ( const spawn of wave.spawns ) {
			// Handle props - can be object, function returning array, or undefined
			let propsArray
			let count = spawn.count

			if ( typeof spawn.props === 'function' ) {
				propsArray = spawn.props( ch, cw )
				// Use array length as count when props is a function returning an array
				// This prevents phantom entities when count doesn't match array size
				count = propsArray.length
			} else if ( spawn.props ) {
				// Single props object - use for all spawns
				propsArray = Array( count ).fill( spawn.props )
			} else {
				// No props
				propsArray = Array( count ).fill( {} )
			}

			// Spawn entities
			for ( let i = 0; i < count; i++ ) {
				const props = propsArray[ i ] || {}
				registry.spawn( spawn.type, props )
			}
		}

		return wave
	}

	/**
	 * Get wave bonus score
	 * @param {number} waveNumber - Wave number
	 * @returns {number} Bonus score for completing wave
	 */
	getBonus ( waveNumber ) {
		return this.getWave( waveNumber ).bonus
	}

	/**
	 * Get wave name
	 * @param {number} waveNumber - Wave number
	 * @returns {string} Wave name
	 */
	getName ( waveNumber ) {
		return this.getWave( waveNumber ).name
	}

	/**
	 * Get wave modifiers
	 * @param {number} waveNumber - Wave number
	 * @returns {Object} Modifiers like speedMultiplier, fireRateMultiplier
	 */
	getModifiers ( waveNumber ) {
		return this.getWave( waveNumber ).modifiers
	}
}
