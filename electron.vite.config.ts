import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer'),
        '@shared': resolve('src/shared'),
      },
    },
    plugins: [react()],
    build: {
      outDir: resolve('out/renderer'),
      emptyOutDir: true,
    },
  },
})
