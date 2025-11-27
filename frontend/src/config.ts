// If VITE_API_URL is set (on Vercel), use it. Otherwise, use localhost.
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';