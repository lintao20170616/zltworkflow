import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./client/spa/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: ['node_modules/**', 'dist/**', '*.config.*', '**/*.d.ts', 'test/**', 'app/**', 'config/**'],
      thresholds: {
        global: {
          lines: 50,
          functions: 50,
          branches: 40,
          statements: 50,
        },
      },
    },
    testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.vue'],
    exclude: ['node_modules/**', 'test/**', 'app/**', 'config/**'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'client/spa/apps/default'),
      '@spa': resolve(__dirname, 'client/spa'),
      '@app': resolve(__dirname, 'client/spa/apps/default'),
    },
  },
});
