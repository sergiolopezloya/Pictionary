/**
 * Jest configuration for React Native TypeScript project
 * Configured for testing React Native components and TypeScript code
 */

module.exports = {
  // Use React Native preset
  preset: 'react-native',

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js|jsx)',
    '**/*.(test|spec).(ts|tsx|js|jsx)',
  ],

  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts',
  ],

  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/types/**',
    '!src/**/index.ts',
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Coverage reporters
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary',
  ],

  // Coverage directory
  coverageDirectory: 'coverage',

  // Test environment
  testEnvironment: 'node',

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|rive-react-native)/)',
  ],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/src'],

  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },

  // Mock specific modules
  moduleNameMapping: {
    // Mock React Native modules that don't work in Jest
    '^react-native$': '<rootDir>/src/__tests__/mocks/react-native.js',
    '^rive-react-native$': '<rootDir>/src/__tests__/mocks/rive-react-native.js',
  },

  // Test timeout
  testTimeout: 10000,

  // Max workers for parallel testing
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Error on deprecated features
  errorOnDeprecated: true,

  // Notify mode
  notify: false,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
