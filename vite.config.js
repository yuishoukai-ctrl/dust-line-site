import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pdfAssetsPlugin from './scripts/pdf-assets-plugin.mjs'

export default defineConfig({
  plugins: [react(), pdfAssetsPlugin()],
  // Canonical production routes live at the dustline.jp origin root.
  base: '/',
})
