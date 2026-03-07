"use server";

import { getRequiredSession } from "@/lib/auth";

/**
 * Server Action para retornar as informações de acesso do usuário logado.
 * Útil para componentes Client-side verificarem permissões de UI.
 */
export async function getCurrentUserAction() {
    try {
        const user = await getRequiredSession();
        return user;
    } catch (error) {
        return null;
    }
}
