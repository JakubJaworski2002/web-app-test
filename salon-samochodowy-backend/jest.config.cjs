module.exports = {
    testEnvironment: 'node',
    // Brak transformacji – pliki .js traktowane jako ESM natywnie
    // (uruchamiane przez node --experimental-vm-modules)
    transform: {},
    testMatch: [
        '<rootDir>/tests/**/*.test.ts',
        '<rootDir>/tests/**/*.test.js',
    ],
    collectCoverageFrom: [
        '**/*.{js,ts}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/tests/**',
    ],
};