import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  define: {
    // Gun.js requires process.env
    'process.env': {}
  },
  build: {
    target: 'es2020'
  }
})
