"use server";

import { flagsService, type CreateFlagDTO } from "@/lib/services/flags.service";
import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth";
import { accessService } from "@/lib/services/access.service";

export async function getFlagsAction() {
    return await flagsService.getFlags();
}

export async function createFlagAction(data: CreateFlagDTO) {
    const user = await getRequiredSession();
    if (!accessService.can(user, 'MANAGE_FLAGS')) {
        throw new Error("Permissão insuficiente para criar feature flags.");
    }

    const flag = await flagsService.createFlag(data);
    revalidatePath("/flags");
    return flag;
}

export async function toggleFlagAction(id: string, environment: "dev" | "staging" | "prod", active: boolean) {
    const user = await getRequiredSession();
    if (!accessService.can(user, 'MANAGE_FLAGS')) {
        throw new Error("Permissão insuficiente para alterar o status das feature flags.");
    }

    const result = await flagsService.toggleFlag(id, environment, active);
    revalidatePath("/flags");
    return result;
}

export async function updateRolloutAction(id: string, rollout: number) {
    const user = await getRequiredSession();
    if (!accessService.can(user, 'MANAGE_FLAGS')) {
        throw new Error("Permissão insuficiente para alterar o rollout das feature flags.");
    }

    const result = await flagsService.updateRollout(id, rollout);
    revalidatePath("/flags");
    return result;
}
