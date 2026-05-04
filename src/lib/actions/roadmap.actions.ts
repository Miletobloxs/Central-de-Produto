"use server";

import { roadmapService, type CreateEpicDTO } from "@/lib/services/roadmap.service";
import { revalidatePath } from "next/cache";
import { getRequiredSession } from "@/lib/auth";
import { accessService } from "@/lib/services/access.service";

export async function getEpicsAction() {
    try {
        return await roadmapService.getEpics();
    } catch (err: any) {
        console.error("[getEpicsAction]", err);
        return [];
    }
}

export async function getEpicsListAction() {
    try {
        return await roadmapService.getEpicsList();
    } catch (err: any) {
        console.error("[getEpicsListAction]", err);
        return [];
    }
}

export async function createEpicAction(data: CreateEpicDTO): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const user = await getRequiredSession();
        if (!accessService.can(user, 'MANAGE_ROADMAP')) {
            return { success: false, error: "Permissão insuficiente para criar épicos no roadmap." };
        }
        const epic = await roadmapService.createEpic(data);
        revalidatePath("/roadmap");
        return { success: true, data: epic };
    } catch (err: any) {
        console.error("[createEpicAction]", err);
        return { success: false, error: err.message || "Erro ao criar épico." };
    }
}

export async function linkSprintsToEpicAction(sprintIds: string[], epicId: string): Promise<{ success: true; data: any } | { success: false; error: string }> {
    try {
        const user = await getRequiredSession();
        if (!accessService.can(user, 'MANAGE_ROADMAP')) {
            return { success: false, error: "Permissão insuficiente para vincular sprints." };
        }
        const result = await roadmapService.linkSprintsToEpic(sprintIds, epicId);
        revalidatePath("/roadmap");
        return { success: true, data: result };
    } catch (err: any) {
        console.error("[linkSprintsToEpicAction]", err);
        return { success: false, error: err.message || "Erro ao vincular sprints." };
    }
}
