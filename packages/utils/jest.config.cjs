/** @type {import('jest').Config} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    module: 'CommonJS',
                    moduleResolution: 'node',
                    esModuleInterop: true,
                    strict: true,
                    lib: ['es2022', 'DOM'],
                    target: 'ES2022',
                    skipLibCheck: true,
                },
            },
        ],
    },
    testMatch: ['**/__tests__/**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    // Map workspace package imports to their source files
    moduleNameMapper: {
        '^@repo/constants/(.*)$': '<rootDir>/../constants/src/$1/index.ts',
        '^@repo/types/(.*)$': '<rootDir>/../types/src/$1/index.ts',
    },
};

module.exports = config;
