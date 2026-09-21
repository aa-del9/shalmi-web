/**
 * Unit Tests: Math Utilities
 * Functions tested: clamp, inRange, percentage
 * Source: packages/utils/src/math/index.ts
 */

import { clamp, inRange, percentage } from '../src/math/index';

// ==============================================================
// clamp(value, min, max)
// ==============================================================
describe('clamp()', () => {
    test('returns the value when it is within [min, max]', () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });

    test('returns the value when it equals the minimum boundary', () => {
        expect(clamp(0, 0, 10)).toBe(0);
    });

    test('returns the value when it equals the maximum boundary', () => {
        expect(clamp(10, 0, 10)).toBe(10);
    });

    test('returns min when value is below the minimum', () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });

    test('returns max when value is above the maximum', () => {
        expect(clamp(100, 0, 10)).toBe(10);
    });

    test('works with negative ranges', () => {
        expect(clamp(-3, -10, -1)).toBe(-3);
    });

    test('returns min if value is below a negative range', () => {
        expect(clamp(-20, -10, -1)).toBe(-10);
    });

    test('works when min equals max (degenerate range)', () => {
        expect(clamp(5, 7, 7)).toBe(7);
    });
});

// ==============================================================
// inRange(value, min, max)
// ==============================================================
describe('inRange()', () => {
    test('returns true when value is within range', () => {
        expect(inRange(5, 0, 10)).toBe(true);
    });

    test('returns true when value equals the minimum boundary', () => {
        expect(inRange(0, 0, 10)).toBe(true);
    });

    test('returns true when value equals the maximum boundary', () => {
        expect(inRange(10, 0, 10)).toBe(true);
    });

    test('returns false when value is below the minimum', () => {
        expect(inRange(-1, 0, 10)).toBe(false);
    });

    test('returns false when value is above the maximum', () => {
        expect(inRange(11, 0, 10)).toBe(false);
    });

    test('works with floating point values', () => {
        expect(inRange(0.5, 0, 1)).toBe(true);
    });
});

// ==============================================================
// percentage(value, total)
// ==============================================================
describe('percentage()', () => {
    test('correctly calculates percentage (50 out of 100 = 50%)', () => {
        expect(percentage(50, 100)).toBe(50);
    });

    test('correctly calculates percentage (1 out of 4 = 25%)', () => {
        expect(percentage(1, 4)).toBe(25);
    });

    test('returns 0 when value is 0', () => {
        expect(percentage(0, 100)).toBe(0);
    });

    test('returns 0 when total is 0 (safe division-by-zero guard)', () => {
        expect(percentage(50, 0)).toBe(0);
    });

    test('returns 100 when value equals total', () => {
        expect(percentage(200, 200)).toBe(100);
    });

    test('can return more than 100 when value exceeds total', () => {
        expect(percentage(150, 100)).toBe(150);
    });
});
