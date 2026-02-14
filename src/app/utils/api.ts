import { projectId, publicAnonKey } from '/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-c0ec1358`;

/**
 * Enhanced fetch helper to handle Supabase Edge Function auth quirks.
 * Sends both Authorization (for gateway) and X-User-Token (for our middleware).
 */
export const apiFetch = async (path: string, options: RequestInit = {}, token?: string) => {
  const headers = new Headers(options.headers || {});
  
  // The Authorization header is used by the Supabase Gateway. 
  // It usually expects the anon key or service role key to allow execution.
  headers.set('Authorization', `Bearer ${publicAnonKey}`);
  
  // We pass the actual user session token in a custom header to bypass gateway JWT verification
  // and let our own Hono middleware handle the user lookup.
  if (token) {
    headers.set('X-User-Token', token);
  }
  
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const fullUrl = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  
  return fetch(fullUrl, {
    ...options,
    headers
  });
};
