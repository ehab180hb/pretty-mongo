module.exports = {
  forceExit: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  skipNodeResolution: true,
  globals: {
    'ts-jest': {},
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  unmockedModulePathPatterns: [],
  collectCoverageFrom: ['src/**/*.ts', '!**/*.test.ts'],
  rootDir: process.cwd(),
}
