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
      .from("team_members")
      .select("id, email, role, group_id")
      .eq("id", authUser.id)
      .single();

    if (!dbUser) {
      return {
        id: authUser.id,
        email: authUser.email,
        role: UserRole.INVESTIDOR as Role,
      };
    }

    let groupPermissions: string[] | undefined;
    if (dbUser.group_id) {
      const { data: group } = await supabase
        .from("team_groups")
        .select("permissions")
        .eq("id", dbUser.group_id)
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
    return {
      id: authUser.id,
      email: authUser.email,
      role: UserRole.INVESTIDOR as Role,
    };
  }
}
