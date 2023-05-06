import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import linaria from '@linaria/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    linaria({
      include: ['**/*.{ts,tsx}'],
      babelOptions: {
        presets: ['@babel/preset-typescript', '@babel/preset-react']
      }
    })
  ],
  clearScreen: false,
  server: {
    port: 3000
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG
  }
})
