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

// Mock Supabase-backed option loaders to prevent real API calls during tests
vi.mock("../services/product-options", () => ({
  fetchProductLines: vi.fn().mockResolvedValue([]),
  fetchProductOptions: vi.fn().mockResolvedValue({
    mirrorControls: [],
    frameColors: [],
    frameThickness: [],
    mirrorStyles: [],
    mountingOptions: [],
    lightingOptions: [],
    colorTemperatures: [],
    lightOutputs: [],
    drivers: [],
    accessoryOptions: [],
    sizes: [],
  }),
}));

// Mock Zustand store to provide test data
vi.mock("../store", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    // Individual hook mocks will be set up in specific test files
  };
});
