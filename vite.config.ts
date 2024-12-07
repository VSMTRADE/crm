import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/rest/v1': {
        target: 'https://hpxizaqzxiodifaijqym.supabase.co',
        changeOrigin: true,
        secure: false,
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhweGl6YXF6eGlvZGlmYWlqcXltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MTc1NjMsImV4cCI6MjA0ODk5MzU2M30.jQnmMxfizfZFEqqlQ2j_HbDrArlWy45KA1ghQ3uAvcQ'
        }
      }
    }
  }
})
