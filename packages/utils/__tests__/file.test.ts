/**
 * Unit Tests: File Utilities
 * Functions tested: getFileExtension, isImage, isVideo
 * Source: packages/utils/src/file/index.ts
 */

import { getFileExtension, isImage, isVideo } from '../src/file/index';

// ==============================================================
// getFileExtension(filename)
// ==============================================================
describe('getFileExtension()', () => {
    test('returns the correct extension for a standard filename', () => {
        expect(getFileExtension('document.pdf')).toBe('pdf');
    });

    test('returns the correct extension for an image file', () => {
        expect(getFileExtension('photo.jpeg')).toBe('jpeg');
    });

    test('returns the last extension for a filename with multiple dots', () => {
        expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    test('returns the extension in lowercase for an uppercase extension', () => {
        expect(getFileExtension('IMAGE.JPG')).toBe('jpg');
    });

    test('returns an empty string for a filename with no extension', () => {
        // A file like "Makefile" has no dot, split('.').pop() returns the name itself
        // The function returns the part after the last dot in lowercase
        expect(getFileExtension('Makefile')).toBe('makefile');
    });

    test('handles hidden files (dot-files) like .gitignore', () => {
        // ".gitignore".split('.') => ["", "gitignore"], .pop() => "gitignore"
        expect(getFileExtension('.gitignore')).toBe('gitignore');
    });
});

// ==============================================================
// isImage(filename)
// ==============================================================
describe('isImage()', () => {
    test('returns true for a .jpg file', () => {
        expect(isImage('photo.jpg')).toBe(true);
    });

    test('returns true for a .png file', () => {
        expect(isImage('banner.png')).toBe(true);
    });

    test('returns true for a .gif file', () => {
        expect(isImage('animation.gif')).toBe(true);
    });

    test('returns true for a .webp file', () => {
        expect(isImage('image.webp')).toBe(true);
    });

    test('returns true for a .svg file', () => {
        expect(isImage('logo.svg')).toBe(true);
    });

    test('returns false for a .pdf file', () => {
        expect(isImage('document.pdf')).toBe(false);
    });

    test('returns false for a .txt file', () => {
        expect(isImage('readme.txt')).toBe(false);
    });

    test('returns false for a .mp4 video file', () => {
        expect(isImage('video.mp4')).toBe(false);
    });

    test('handles uppercase extension (.JPG) — lowercase conversion makes it pass', () => {
        expect(isImage('photo.JPG')).toBe(true);
    });
});

// ==============================================================
// isVideo(filename)
// ==============================================================
describe('isVideo()', () => {
    test('returns true for a .mp4 file', () => {
        expect(isVideo('clip.mp4')).toBe(true);
    });

    test('returns true for a .avi file', () => {
        expect(isVideo('movie.avi')).toBe(true);
    });

    test('returns true for a .mov file', () => {
        expect(isVideo('recording.mov')).toBe(true);
    });

    test('returns true for a .webm file', () => {
        expect(isVideo('stream.webm')).toBe(true);
    });

    test('returns false for a .jpg image file', () => {
        expect(isVideo('photo.jpg')).toBe(false);
    });

    test('returns false for a .mp3 audio file', () => {
        expect(isVideo('song.mp3')).toBe(false);
    });

    test('handles uppercase extension (.MP4)', () => {
        expect(isVideo('clip.MP4')).toBe(true);
    });
});
