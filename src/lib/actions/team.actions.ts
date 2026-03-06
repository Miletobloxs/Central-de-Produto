"use server";

import { teamService } from "@/lib/services/team.service";
import { revalidatePath } from "next/cache";
import type { Permission } from "@/lib/services/access.service";

export async function getGroupsAction() {
    return await teamService.listGroups();
}

export async function createGroupAction(data: { name: string; description: string; permissions: Permission[] }) {
    const group = await teamService.createGroup(data.name, data.description, data.permissions);
    revalidatePath("/equipe/grupos");
    return group;
}

export async function updateGroupAction(id: string, data: { name?: string; description?: string; permissions?: Permission[] }) {
    const group = await teamService.updateGroup(id, data);
    revalidatePath("/equipe/grupos");
    return group;
}

export async function getUsersAction() {
    return await teamService.listUsers();
}

export async function assignUserToGroupAction(userId: string, groupId: string | null) {
    const result = await teamService.assignUserToGroup(userId, groupId);
    revalidatePath("/equipe/grupos");
    return result;
}
