import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("PROXY: Missing Supabase environment variables");
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    console.log(`DEBUG: [MIDDLEWARE] Checking session for: ${request.nextUrl.pathname}`);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.warn("DEBUG: [MIDDLEWARE] Auth error:", authError.message);
    }

    const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
    const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard") || 
                           request.nextUrl.pathname.startsWith("/configuracoes") ||
                           request.nextUrl.pathname.startsWith("/sprints") ||
                           request.nextUrl.pathname.startsWith("/okrs");

    console.log(`DEBUG: [MIDDLEWARE] Path: ${request.nextUrl.pathname} | User: ${user?.email ?? "none"}`);

    if (!user && isDashboardRoute) {
      console.log("DEBUG: [MIDDLEWARE] Redirecting UNKNOWN user to /login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuthRoute) {
      console.log("DEBUG: [MIDDLEWARE] Redirecting AUTHED user to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (err) {
    console.error("CRITICAL: [MIDDLEWARE] Fatal exception:", err);
    return response;
  }

}

// Configurado para rodar em quase tudo do app
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
