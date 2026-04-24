import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/postcss' // Yeni paket

export default defineConfig({
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()], // Tailwind'i buraya ekledik
    },
  },
  server: {
    port: 5174, // Portu 5174 yaptık
  },
})