import type { Config } from "jest";

const config: Config = {
  setupFilesAfterEnv: ["jest-extended/all"],
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testTimeout: 10000,
  reporters: ["jest-ci-spec-reporter"],
  collectCoverageFrom: ["src/**/*.ts"],
  coverageThreshold: {
    global: { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
  coveragePathIgnorePatterns: ["<rootDir>/tests/mock-utils.ts"],
};

export default config;
