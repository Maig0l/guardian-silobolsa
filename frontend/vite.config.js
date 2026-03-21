import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  server: {
    proxy: {
      // En dev, redirige /api → http://localhost:3000/api
      // Así evitamos CORS y no necesitamos hardcodear la URL en el frontend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
