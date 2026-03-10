import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase environment variables are missing!");
    throw new Error("Missing Supabase configuration");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignorado em Server Components — o middleware cuida da atualização
        }
      },
    },
  });
}
