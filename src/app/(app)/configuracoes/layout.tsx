import { redirect } from "next/navigation";
import { getRequiredSession } from "@/lib/auth";

export default async function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  if (process.env.BYPASS_AUTH === "true") {
    return <>{children}</>;
  }

  try {
    const session = await getRequiredSession();
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.role)) {
      redirect("/dashboard");
    }
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    redirect("/login");
  }

  return <>{children}</>;
}
