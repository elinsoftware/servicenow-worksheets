import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svgr(),react()],
  server:{
    proxy:{
      '/api': 'https://ven01993.service-now.com/', //add your ServiceNow instance URL here
    }
  },
  build: {
    assetsInlineLimit: 1000000
  }
})