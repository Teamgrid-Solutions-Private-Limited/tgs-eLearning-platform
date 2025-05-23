import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'/authoring-tool',
  server: {
    host: 'localhost', // Change to '0.0.0.0' if you want external access
    port: 5174,        // Change to your desired port (default is 5173)
  },
})