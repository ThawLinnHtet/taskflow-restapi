import type { JestConfigWithTsJest } from "ts-jest";

const base: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,}/.+)\\.js$": ["$1.ts", "$1"],
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, diagnostics: { ignoreCodes: [151002] } }],
  },
  clearMocks: true,
};

const config: JestConfigWithTsJest = {
  projects: [
    {
      ...base,
      displayName: "unit",
      testMatch: ["<rootDir>/src/**/*.test.ts"],
      testPathIgnorePatterns: ["/integration/"],
    },
    {
      ...base,
      displayName: "integration",
      testMatch: ["<rootDir>/src/**/integration/**/*.test.ts"],
      globalSetup: "<rootDir>/src/__tests__/integration/globalSetup.ts",
      globalTeardown: "<rootDir>/src/__tests__/integration/globalTeardown.ts",
      testTimeout: 30000,
    },
  ],
  coverageThreshold: {
    global: {
      branches: 55,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

export default config;
