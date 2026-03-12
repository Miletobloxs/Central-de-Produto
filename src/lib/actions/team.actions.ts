"use server";

// Note: We use dynamic import for teamService to avoid triggering Prisma initialization during build analysis of client components.
async function getTeamService() {
    const { teamService } = await import("@/lib/services/team.service");
    return teamService;
}
import { revalidatePath } from "next/cache";
import type { Permission } from "@/lib/services/access.service";
import { UserRole } from "@/lib/types/enums";

export async function getGroupsAction() {
    const teamService = await getTeamService();
    return await teamService.listGroups();
}

export async function createGroupAction(data: { name: string; description: string; permissions: Permission[] }) {
    const teamService = await getTeamService();
    const group = await teamService.createGroup(data.name, data.description, data.permissions);
    revalidatePath("/configuracoes");
    return group;
}

export async function updateGroupAction(id: string, data: { name?: string; description?: string; permissions?: Permission[] }) {
    const teamService = await getTeamService();
    const group = await teamService.updateGroup(id, data);
    revalidatePath("/configuracoes");
    return group;
}

export async function deleteGroupAction(id: string) {
    const teamService = await getTeamService();
    const result = await teamService.deleteGroup(id);
    revalidatePath("/configuracoes");
    return result;
}

export async function getUsersAction() {
    const teamService = await getTeamService();
    return await teamService.listUsers();
}

export async function assignUserToGroupAction(userId: string, groupId: string | null) {
    const teamService = await getTeamService();
    const result = await teamService.assignUserToGroup(userId, groupId);
    revalidatePath("/configuracoes");
    return result;
}

export async function updateUserAction(id: string, data: { role?: UserRole; groupId?: string | null }) {
    const teamService = await getTeamService();
    const result = await teamService.updateUser(id, data);
    revalidatePath("/configuracoes");
    return result;
}

export async function deleteUserAction(id: string) {
    const teamService = await getTeamService();
    const result = await teamService.deleteUser(id);
    revalidatePath("/configuracoes");
    return result;
}

export async function createInviteAction(data: { email: string; role: UserRole; groupId?: string | null }) {
    const teamService = await getTeamService();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const result = await teamService.createInvite({ ...data, baseUrl });
    revalidatePath("/configuracoes");
    return result;
}
export async function getTeamConfigurationAction() {
    const teamService = await getTeamService();
    console.log("DEBUG: [TEAM_ACTIONS] getTeamConfigurationAction called.");
    try {
        const [groups, users, invites] = await Promise.all([
            teamService.listGroups().catch((e: any) => {
                console.error("ERROR: [TEAM_ACTIONS] listGroups failed:", e);
                return [];
            }),
            teamService.listUsers().catch((e: any) => {
                console.error("ERROR: [TEAM_ACTIONS] listUsers failed:", e);
                return [];
            }),
            teamService.listAllInvites().catch((e: any) => {
                console.error("ERROR: [TEAM_ACTIONS] listAllInvites failed:", e);
                return [];
            })
        ]);
        return { groups, users, invites };
    } catch (error) {
        console.error("CRITICAL: [TEAM_ACTIONS] getTeamConfigurationAction failed:", error);
        return { groups: [], users: [], invites: [] };
    }
}

export async function deleteInviteAction(id: string) {
    const teamService = await getTeamService();
    const result = await teamService.deleteInvite(id);
    revalidatePath("/configuracoes");
    return result;
}

export async function seedGroupsAction() {
    const teamService = await getTeamService();
    console.log("DEBUG: [TEAM_ACTIONS] seedGroupsAction triggered.");
    try {
        const result = await teamService.ensureDefaultGroups();
        revalidatePath("/configuracoes");
        return { success: true, data: result };
    } catch (error) {
        console.error("ERROR: [TEAM_ACTIONS] seedGroupsAction failed:", error);
        return { success: false, error: "Falha ao inicializar grupos." };
    }
}
