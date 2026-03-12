import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

export async function createClient() {
  console.log("DEBUG: [SUPABASE_SERVER] createClient starting...");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("CRITICAL: [SUPABASE_SERVER] Missing environment variables!");
    return null;
  }

  // Detect build or pre-render phases to avoid cookie access errors
  const isBuildPhase = 
    process.env.NEXT_PHASE === 'phase-production-build' || 
    (process.env.VITE_VERCEL_ENV === 'production' && typeof window === 'undefined' && !process.env.VERCEL);

  if (isBuildPhase) {
     console.log("DEBUG: [SUPABASE_SERVER] Skipping cookies during build phase.");
     return createServerClient(supabaseUrl, supabaseAnonKey, { 
       cookies: { getAll: () => [], setAll: () => {} } 
     });
  }

  try {
    const cookieStore = await cookies();
    console.log("DEBUG: [SUPABASE_SERVER] cookieStore accessed successfully.");

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          try {
            return cookieStore.getAll();
          } catch (e) {
             console.warn("DEBUG: [SUPABASE_SERVER] getAll cookies failed:", e);
             return [];
          }
        },
        setAll(cookiesToSet) {
          // Note: setAll is only effective in Middleware or Server Actions.
          // In Server Components/Layouts, it will likely throw or be ignored.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (err) {
            // This is expected in Server Components rendering.
            // We only log if it's a surprising error.
          }
        },
      },
    });
  } catch (err) {
    console.warn("DEBUG: [SUPABASE_SERVER] cookies() call failed (likely build-time):", err);
    return createServerClient(supabaseUrl, supabaseAnonKey, { 
      cookies: { getAll: () => [], setAll: () => {} } 
    });
  }
}

