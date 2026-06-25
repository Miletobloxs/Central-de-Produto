import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function FlagsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!member || !["ADMIN", "SUPER_ADMIN"].includes(member.role)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
