import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load .env.local
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  
  console.log('[Vite Config] Loaded env:', {
    DEEPGRAM_URL: env.VITE_DEEPGRAM_TOKEN_URL,
    GEMINI_URL: env.VITE_GEMINI_CMD_URL,
    VOICE_ENABLED: env.VITE_VOICE_ENABLED
  })

  return {
    plugins: [react()],
    // Optional: expose to frontend via define (not required, but safe)
    define: {
      '__VITE_DEEPGRAM_TOKEN_URL__': JSON.stringify(env.VITE_DEEPGRAM_TOKEN_URL),
      '__VITE_GEMINI_CMD_URL__': JSON.stringify(env.VITE_GEMINI_CMD_URL),
      '__VITE_VOICE_ENABLED__': JSON.stringify(env.VITE_VOICE_ENABLED)
    }
  }
})