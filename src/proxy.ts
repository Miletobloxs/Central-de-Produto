import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    console.log("DEBUG: Proxy starting for:", request.nextUrl.pathname);
    // Sanitiza: remove espaços, \r e aspas que possam ter vindo do .env
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      ?.trim()
      .replace(/\r/g, "")
      .replace(/^["']|["']$/g, "");

    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?.trim()
      .replace(/\r/g, "")
      .replace(/^["']|["']$/g, "");

    // Se as vars não estiverem disponíveis ou o URL for inválido,
    // deixa o request passar — o layout (server component) cuida da auth.
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log("DEBUG: Missing Supabase keys in Proxy, allowing through...");
      return NextResponse.next({ request });
    }

    try {
      new URL(supabaseUrl);
    } catch {
      console.log("DEBUG: Invalid Supabase URL in Proxy, allowing through...");
      return NextResponse.next({ request });
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Atualiza a sessão — NÃO remover este getUser()
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Rotas públicas (auth)
    const isAuthRoute = pathname.startsWith("/login");

    if (isAuthRoute) {
      if (user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    // Protege todas as demais rotas
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("FATAL: Error in Proxy Middleware:", err);
    // Se o proxy explodir, deixa carregar a página — o Layout vai mostrar o erro de infra.
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
