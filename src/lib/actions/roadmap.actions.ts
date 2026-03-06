"use server";

import { roadmapService, type CreateEpicDTO } from "@/lib/services/roadmap.service";
import { revalidatePath } from "next/cache";

export async function getEpicsAction() {
    return await roadmapService.getEpics();
}

export async function createEpicAction(data: CreateEpicDTO) {
    const epic = await roadmapService.createEpic(data);
    revalidatePath("/roadmap");
    return epic;
}

export async function linkSprintsToEpicAction(sprintIds: string[], epicId: string) {
    const result = await roadmapService.linkSprintsToEpic(sprintIds, epicId);
    revalidatePath("/roadmap");
    return result;
}
