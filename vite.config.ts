/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH is set by the deploy workflows (ADR-0005):
//   main:       /3d-quiz-game/
//   PR preview: /3d-quiz-game/pr-preview/pr-<N>/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
  },
});
