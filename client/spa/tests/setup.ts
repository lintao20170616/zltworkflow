import { vi, beforeEach, afterEach } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    createRouter: vi.fn(),
    createWebHistory: vi.fn(),
  };
});

vi.mock('js-cookies', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});
