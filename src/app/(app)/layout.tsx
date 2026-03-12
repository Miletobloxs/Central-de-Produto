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
  console.log("DEBUG: AppLayout execution started");
  
  const supabase = await createClient();
  
  if (!supabase) {
    console.error("DEBUG: AppLayout - Supabase client is NULL");
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-sm max-w-md">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Erro de Infraestrutura</h1>
          <p className="text-gray-500 text-sm mb-6">
            Não foi possível inicializar o cliente Supabase. Verifique os logs do servidor.
          </p>
          <a href="/login" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Tentar Novamente
          </a>
        </div>
      </div>
    );
  }

  let user = null;
  try {
    console.log("DEBUG: AppLayout - Fetching user...");
    const { data } = await supabase.auth.getUser();
    user = data?.user;
    console.log("DEBUG: AppLayout - User fetched:", user?.id || "None");
  } catch (err) {
    console.error("DEBUG: AppLayout - auth.getUser() FAIL:", err);
  }

  if (!user) {
    console.log("DEBUG: AppLayout - No user, redirecting to /login");
    redirect("/login");
  }

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

  return (
    <div className="flex h-screen bg-[#F4F6F8] overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header displayName={displayName} initials={initials} email={user.email ?? ""} />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <SupportFAB />
      </div>
    </div>
  );
}
