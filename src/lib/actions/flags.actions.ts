"use server";

import { flagsService, type CreateFlagDTO } from "@/lib/services/flags.service";
import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth";
import { accessService } from "@/lib/services/access.service";

export async function getFlagsAction() {
    return await flagsService.getFlags();
}

export async function createFlagAction(data: CreateFlagDTO): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const user = await getRequiredSession();
        if (!accessService.can(user, 'MANAGE_FLAGS')) {
            return { success: false, error: "Permissão insuficiente para criar feature flags." };
        }
        const flag = await flagsService.createFlag(data);
        revalidatePath("/flags");
        return { success: true, data: flag };
    } catch (err: any) {
        console.error("[createFlagAction]", err);
        return { success: false, error: err.message || "Erro ao criar flag." };
    }
}

export async function toggleFlagAction(id: string, environment: "dev" | "staging" | "prod", active: boolean): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const user = await getRequiredSession();
        if (!accessService.can(user, 'MANAGE_FLAGS')) {
            return { success: false, error: "Permissão insuficiente para alterar o status das feature flags." };
        }
        const result = await flagsService.toggleFlag(id, environment, active);
        revalidatePath("/flags");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("[toggleFlagAction]", err);
        return { success: false, error: err.message || "Erro ao alterar flag." };
    }
}

export async function updateRolloutAction(id: string, rollout: number): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const user = await getRequiredSession();
        if (!accessService.can(user, 'MANAGE_FLAGS')) {
            return { success: false, error: "Permissão insuficiente para alterar o rollout das feature flags." };
        }
        const result = await flagsService.updateRollout(id, rollout);
        revalidatePath("/flags");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("[updateRolloutAction]", err);
        return { success: false, error: err.message || "Erro ao atualizar rollout." };
    }
}
