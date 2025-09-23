import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock environment variables
Object.defineProperty(import.meta, "env", {
  value: {
    VITE_SUPABASE_URL: "http://localhost:54321",
    VITE_SUPABASE_ANON_KEY: "test-key",
    VITE_DEBUG_CONSOLE: "false",
    ...import.meta.env,
  },
});

// Mock Supabase client to prevent real API calls during tests
vi.mock("../services/dynamic-supabase", () => ({
  initializeDynamicService: vi.fn(),
  getProductLines: vi.fn(),
  getProducts: vi.fn(),
  getProductOptions: vi.fn(),
  getRules: vi.fn(),
  getConfigurationUI: vi.fn(),
}));

// Mock Zustand store to provide test data
vi.mock("../store", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Individual hook mocks will be set up in specific test files
  };
});
