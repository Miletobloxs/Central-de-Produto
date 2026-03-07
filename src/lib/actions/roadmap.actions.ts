"use server";

import { roadmapService, type CreateEpicDTO } from "@/lib/services/roadmap.service";
import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth";
import { accessService } from "@/lib/services/access.service";

export async function getEpicsAction() {
    return await roadmapService.getEpics();
}

export async function createEpicAction(data: CreateEpicDTO) {
    const user = await getRequiredSession();
    if (!accessService.can(user, 'MANAGE_ROADMAP')) {
        throw new Error("Permissão insuficiente para criar épicos no roadmap.");
    }

    const epic = await roadmapService.createEpic(data);
    revalidatePath("/roadmap");
    return epic;
}

export async function linkSprintsToEpicAction(sprintIds: string[], epicId: string) {
    const user = await getRequiredSession();
    if (!accessService.can(user, 'MANAGE_ROADMAP')) {
        throw new Error("Permissão insuficiente para vincular sprints.");
    }

    const result = await roadmapService.linkSprintsToEpic(sprintIds, epicId);
    revalidatePath("/roadmap");
    return result;
}
