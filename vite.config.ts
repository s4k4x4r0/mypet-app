import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // GitHub Pages（https://s4k4x4r0.github.io/mypet-app/）用のベースパス
  base: '/mypet-app/',
  plugins: [react()],
})
