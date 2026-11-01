import { defineConfig } from 'vitest/config';

// Fixa o fuso em UTC-3 para os testes pegarem bugs de timezone,
// independente de onde rodam (máquina local ou CI, que é UTC)
process.env.TZ = 'America/Sao_Paulo';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    fileParallelism: false,
  },
});