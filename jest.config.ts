import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.spec.ts', '**/*.test.ts', '**/*.e2e-spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/**/*.test.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
