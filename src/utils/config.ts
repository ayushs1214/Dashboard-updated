export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  auth: {
    storageKey: 'milagro_auth_token',
    sessionKey: 'milagro_session',
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  }
};