import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['ts/**/*.spec.ts', 'ts/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'ts/index.ts'),
      name: 'VerovioEditor',
      fileName: 'verovio-editor',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
