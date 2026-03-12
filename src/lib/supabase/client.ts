import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./env";

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      console.warn("DEBUG: Supabase env vars missing during SSR/SSG. Returning null.");
    }
    return null as any;
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
