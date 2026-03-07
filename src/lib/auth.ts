import { createClient } from "./supabase/server";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";
import { UserAccessInfo, Role } from "./services/access.service";

/**
 * Recupera o usuário atual e suas permissões, garantindo que a sessão seja válida.
 * Lança um erro se o usuário não estiver autenticado.
 */
export async function getRequiredSession(): Promise<UserAccessInfo & { id: string; email: string }> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    throw new Error("Não autorizado: Sessão inválida ou expirada.");
  }

  const dbUser = await (prisma as any).user.findUnique({
    where: { email: authUser.email },
    include: {
      group: {
        select: {
          permissions: true,
        },
      },
    },
  });

  if (!dbUser) {
    // Caso o usuário exista no Auth mas não no banco (raro, mas possível em transição)
    return {
      id: authUser.id,
      email: authUser.email,
      role: UserRole.INVESTIDOR as Role,
    };
  }

  return {
    id: dbUser.id,
    email: dbUser.email,
    role: dbUser.role as Role,
    group: dbUser.group ? {
      permissions: dbUser.group.permissions as string[],
    } : undefined,
  };
}
