import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three-core'
          }

          if (
            id.includes('node_modules/@react-three') ||
            id.includes('node_modules/@react-spring') ||
            id.includes('node_modules/three-stdlib') ||
            id.includes('node_modules/maath')
          ) {
            return 'globe-vendor'
          }

          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return 'react-vendor'
          }

          return undefined
        },
      },
    },
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
