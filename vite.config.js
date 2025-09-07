import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  // IMPORTANT pour GitHub Pages: remplace par le nom exact du repo
  base: '/GainzOnly/',
  plugins: [react(), tailwindcss()],
})
