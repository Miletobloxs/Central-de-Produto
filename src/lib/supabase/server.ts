import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

export async function createClient() {
  console.log("DEBUG: createClient (Server) starting...");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: Supabase environment variables are missing!");
    return null;
  }

  // Pre-rendering/Build-time check
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VITE_VERCEL_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL) {
     console.log("DEBUG: createClient (Server) skipping cookies during build phase.");
     return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { getAll: () => [], setAll: () => {} } });
  }

  try {
    const cookieStore = await cookies();
    console.log("DEBUG: cookieStore accessed.");

    const client = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch {
             return [];
          }
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorado em Server Components
          }
        },
      },
    });

    console.log("DEBUG: createClient (Server) initialized successfully.");
    return client;
  } catch (err) {
    console.warn("DEBUG: createClient - cookies() unavailable (likely during build/prerender):", err);
    // Return a degraded client for build-time compatibility
    return createServerClient(supabaseUrl, supabaseAnonKey, { 
      cookies: { getAll: () => [], setAll: () => {} } 
    });
  }
}
