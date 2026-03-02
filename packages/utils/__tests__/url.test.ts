/**
 * Unit Tests: URL Utilities
 * Functions tested: isAbsoluteUrl, getDomain
 * Source: packages/utils/src/url/index.ts
 */

import { isAbsoluteUrl, getDomain } from '../src/url/index';

// ==============================================================
// isAbsoluteUrl(url)
// ==============================================================
describe('isAbsoluteUrl()', () => {
    test('returns true for an http:// URL', () => {
        expect(isAbsoluteUrl('http://example.com')).toBe(true);
    });

    test('returns true for an https:// URL', () => {
        expect(isAbsoluteUrl('https://example.com')).toBe(true);
    });

    test('returns true for a URL with path and query params', () => {
        expect(isAbsoluteUrl('https://api.shaalmi.com/v1/products?page=1')).toBe(true);
    });

    test('returns false for a relative path starting with /', () => {
        expect(isAbsoluteUrl('/users/profile')).toBe(false);
    });

    test('returns false for a relative path without leading /', () => {
        expect(isAbsoluteUrl('users/profile')).toBe(false);
    });

    test('returns false for an ftp:// URL (only http/https are absolute)', () => {
        expect(isAbsoluteUrl('ftp://files.example.com')).toBe(false);
    });

    test('returns false for an empty string', () => {
        expect(isAbsoluteUrl('')).toBe(false);
    });

    test('is case-insensitive (HTTPS:// should match)', () => {
        expect(isAbsoluteUrl('HTTPS://example.com')).toBe(true);
    });
});

// ==============================================================
// getDomain(url)
// ==============================================================
describe('getDomain()', () => {
    test('extracts the hostname from a standard http URL', () => {
        expect(getDomain('http://example.com')).toBe('example.com');
    });

    test('extracts the hostname from a standard https URL', () => {
        expect(getDomain('https://example.com')).toBe('example.com');
    });

    test('extracts the hostname without the path', () => {
        expect(getDomain('https://example.com/products/list')).toBe('example.com');
    });

    test('extracts subdomain as part of the hostname', () => {
        expect(getDomain('https://api.shaalmi.com/v1')).toBe('api.shaalmi.com');
    });

    test('returns an empty string for an invalid URL', () => {
        expect(getDomain('not-a-valid-url')).toBe('');
    });

    test('returns an empty string for an empty string', () => {
        expect(getDomain('')).toBe('');
    });

    test('strips port from hostname (returns just the host)', () => {
        // URL.hostname does NOT include the port
        expect(getDomain('https://example.com:3000/path')).toBe('example.com');
    });
});
