import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Canonical production routes live at the dustline.jp origin root.
  base: '/',
})
