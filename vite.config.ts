import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { crx } from '@crxjs/vite-plugin'
import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        content: 'src/content.ts',
        background: 'src/background.ts',
      }
    }
  },
  define: {
    'process.env': {
      VITE_OPENAI_API_KEY: JSON.stringify(process.env.VITE_OPENAI_API_KEY),
      VITE_GEMINI_API_KEY: JSON.stringify(process.env.VITE_GEMINI_API_KEY),
      VITE_HF_API_KEY: JSON.stringify(process.env.VITE_HF_API_KEY),
    }
  }
})
