import { createClient } from "./supabase/server";
import { UserRole } from "./types/enums";
import { UserAccessInfo, Role } from "./services/access.service";

/**
 * Recupera o usuário atual e suas permissões, garantindo que a sessão seja válida.
 * Usa o Supabase client (sem Prisma) para evitar dependência da conexão direta ao banco.
 * Lança um erro se o usuário não estiver autenticado.
 */
export async function getRequiredSession(): Promise<UserAccessInfo & { id: string; email: string }> {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Configuração do Supabase ausente. Verifique as variáveis de ambiente.");
  }

  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    throw new Error("Não autorizado: Sessão inválida ou expirada.");
  }

  try {
    const { data: dbUser } = await supabase
      .from("User")
      .select('id, email, role, "groupId"')
      .eq("email", authUser.email)
      .single();

    if (!dbUser) {
      // User exists in Auth but not yet synced to internal DB
      return {
        id: authUser.id,
        email: authUser.email,
        role: UserRole.INVESTIDOR as Role,
      };
    }

    let groupPermissions: string[] | undefined;
    if (dbUser.groupId) {
      const { data: group } = await supabase
        .from("TeamGroup")
        .select("permissions")
        .eq("id", dbUser.groupId)
        .single();
      if (group && Array.isArray(group.permissions)) {
        groupPermissions = group.permissions;
      }
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      role: (dbUser.role as Role) || (UserRole.INVESTIDOR as Role),
      group: groupPermissions ? { permissions: groupPermissions } : undefined,
    };
  } catch {
    // Fallback when User table doesn't exist yet or query fails
    return {
      id: authUser.id,
      email: authUser.email,
      role: UserRole.INVESTIDOR as Role,
    };
  }
}
