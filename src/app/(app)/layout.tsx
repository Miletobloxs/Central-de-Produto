import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import SupportFAB from "@/components/layout/SupportFAB";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("DEBUG: [APP_LAYOUT] Layout rendering started.");
  
  const supabase = await createClient();
  
  if (!supabase) {
    console.error("CRITICAL: [APP_LAYOUT] Supabase client initialization FAILED.");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erro de Infraestrutura</h1>
          <p className="text-gray-500 text-sm mb-6">
            Não foi possível inicializar o cliente Supabase. Verifique os logs da Vercel para mais detalhes.
          </p>
          <a href="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Tentar Novamente
          </a>
        </div>
      </div>
    );
  }

  console.log("DEBUG: [APP_LAYOUT] Supabase client initialized. Checking session...");

  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn("DEBUG: [APP_LAYOUT] auth.getUser() returned error:", error.message);
    }
    user = data?.user;
    console.log("DEBUG: [APP_LAYOUT] User session check complete. User ID:", user?.id || "None");
  } catch (err) {
    console.error("CRITICAL: [APP_LAYOUT] Uncaught exception in auth.getUser():", err);
    // In some edge cases on Vercel, this might throw if cookies are corrupted or malformed.
  }

  if (!user) {
    console.log("DEBUG: [APP_LAYOUT] No active session. Redirecting to /login...");
    redirect("/login");
  }

  // ── USER SYNCHRONIZATION ──
  // Ensure the user exists in our Postgres 'users' table with their latest metadata.
  const { teamService } = await import("@/lib/services/team.service");
  await teamService.syncUser(user);

  const displayName =
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Usuário";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  console.log("DEBUG: [APP_LAYOUT] Layout rendering successful for user:", user.email);

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header displayName={displayName} initials={initials} email={user.email ?? ""} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <SupportFAB />
      </div>
    </div>
  );
}

