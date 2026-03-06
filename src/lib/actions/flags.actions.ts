"use server";

import { flagsService, type CreateFlagDTO } from "@/lib/services/flags.service";
import { revalidatePath } from "next/cache";

export async function getFlagsAction() {
    return await flagsService.getFlags();
}

export async function createFlagAction(data: CreateFlagDTO) {
    const flag = await flagsService.createFlag(data);
    revalidatePath("/flags");
    return flag;
}

export async function toggleFlagAction(id: string, environment: "dev" | "staging" | "prod", active: boolean) {
    const result = await flagsService.toggleFlag(id, environment, active);
    revalidatePath("/flags");
    return result;
}

export async function updateRolloutAction(id: string, rollout: number) {
    const result = await flagsService.updateRollout(id, rollout);
    revalidatePath("/flags");
    return result;
}
