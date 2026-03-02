/**
 * Unit Tests: String Utilities
 * Functions tested: capitalize, truncate, computeInitials, slugify
 * Source: packages/utils/src/string/index.ts
 */

import { capitalize, truncate, computeInitials, slugify } from '../src/string/index';

// ==============================================================
// capitalize(str)
// ==============================================================
describe('capitalize()', () => {
    test('capitalizes the first letter of a lowercase string', () => {
        expect(capitalize('hello')).toBe('Hello');
    });

    test('does not change an already capitalized string', () => {
        expect(capitalize('Hello')).toBe('Hello');
    });

    test('capitalizes first letter and leaves the rest untouched', () => {
        expect(capitalize('hELLO WORLD')).toBe('HELLO WORLD');
    });

    test('handles a single character', () => {
        expect(capitalize('a')).toBe('A');
    });

    test('handles a string that is already all uppercase', () => {
        expect(capitalize('ABC')).toBe('ABC');
    });

    test('handles an empty string without throwing', () => {
        expect(capitalize('')).toBe('');
    });
});

// ==============================================================
// truncate(str, maxLength)
// ==============================================================
describe('truncate()', () => {
    test('returns the original string when it is shorter than maxLength', () => {
        expect(truncate('hello', 10)).toBe('hello');
    });

    test('returns the original string when its length equals maxLength', () => {
        expect(truncate('hello', 5)).toBe('hello');
    });

    test('truncates and appends "..." when string exceeds maxLength', () => {
        expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    test('produces a result with length equal to maxLength after truncation', () => {
        const result = truncate('This is a long string', 10);
        expect(result.length).toBe(10);
        expect(result).toBe('This is...');
    });

    test('handles empty string without throwing', () => {
        expect(truncate('', 5)).toBe('');
    });
});

// ==============================================================
// computeInitials(name)
// ==============================================================
describe('computeInitials()', () => {
    test('returns uppercase 2-letter initials for a first and last name', () => {
        expect(computeInitials('John Doe')).toBe('JD');
    });

    test('returns a single uppercase letter for a single name', () => {
        expect(computeInitials('John')).toBe('J');
    });

    test('only takes the first 2 words when more than 2 names are provided', () => {
        expect(computeInitials('John Michael Doe')).toBe('JM');
    });

    test('double space between words means second initial is from empty segment (implementation splits on single space)', () => {
        // The implementation does .split(' ') not .split(/\s+/)
        // 'John  Doe'.split(' ') => ['John', '', 'Doe']
        // '' [0] is undefined => filtered out, so only 'J' is produced
        expect(computeInitials('John  Doe')).toBe('J');
    });

    test('returns an empty string for an empty input', () => {
        expect(computeInitials('')).toBe('');
    });

    test('returns uppercase initials even for lowercase input', () => {
        expect(computeInitials('alice smith')).toBe('AS');
    });
});

// ==============================================================
// slugify(str)
// ==============================================================
describe('slugify()', () => {
    test('converts spaces to hyphens and lowercases the string', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    test('removes special characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });

    test('handles multiple consecutive spaces', () => {
        expect(slugify('Hello   World')).toBe('hello-world');
    });

    test('trims leading and trailing spaces', () => {
        expect(slugify('  Hello World  ')).toBe('hello-world');
    });

    test('handles strings with hyphens already', () => {
        expect(slugify('hello-world')).toBe('hello-world');
    });

    test('handles an empty string', () => {
        expect(slugify('')).toBe('');
    });

    test('converts a product title to a URL-safe slug', () => {
        expect(slugify('Best Basmati Rice (5kg)')).toBe('best-basmati-rice-5kg');
    });
});
