import type { Config } from "jest";

const config: Config = {
  setupFilesAfterEnv: ["jest-extended/all"],
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testTimeout: 120000,
  reporters: ["jest-ci-spec-reporter"],
};

export default config;
