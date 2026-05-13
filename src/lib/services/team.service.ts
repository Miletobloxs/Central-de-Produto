import { createAdminClient } from "@/lib/supabase/admin";
import type { Permission } from "./access.service";
import { UserRole, InviteStatus } from "@/lib/types/enums";
import { randomBytes } from "crypto";
import { mailService } from "./mail.service";

export interface TeamGroup {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
}

export interface TeamUser {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: UserRole;
    groupId: string | null;
}

export interface TeamInvite {
    id: string;
    email: string;
    role: UserRole;
    groupId: string | null;
    token: string;
    expiresAt: Date;
    status: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "Super Admin",
    [UserRole.ADMIN]: "Administrador",
    [UserRole.BOARD]: "Conselho (Board)",
    [UserRole.DEVELOPER]: "Desenvolvedor",
    [UserRole.BLOXXS_TEAM]: "Membro Bloxs",
    [UserRole.ORIGINADOR]: "Originador",
    [UserRole.DISTRIBUIDOR]: "Distribuidor",
    [UserRole.ASSESSOR]: "Assessor",
    [UserRole.INVESTIDOR]: "Investidor",
};

// Row types that match the DB columns
interface TeamMemberRow {
    id: string;
    email: string;
    name: string | null;
    role: string;
    group_id: string | null;
    image: string | null;
}

interface UserInviteRow {
    id: string;
    email: string;
    role: string;
    group_id: string | null;
    token: string;
    status: string;
    expires_at: string;
}

function mapMember(row: TeamMemberRow): TeamUser {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        image: row.image,
        role: row.role as UserRole,
        groupId: row.group_id,
    };
}

function mapInvite(row: UserInviteRow): TeamInvite {
    return {
        id: row.id,
        email: row.email,
        role: row.role as UserRole,
        groupId: row.group_id,
        token: row.token,
        status: row.status,
        expiresAt: new Date(row.expires_at),
    };
}

export class TeamService {
    private db() {
        return createAdminClient();
    }

    async getUserById(id: string): Promise<TeamUser | null> {
        const { data } = await this.db()
            .from("team_members")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        return data ? mapMember(data) : null;
    }

    async listGroups(): Promise<TeamGroup[]> {
        const { data, error } = await this.db()
            .from("team_groups")
            .select("*")
            .order("name");
        if (error) throw error;
        return (data ?? []) as TeamGroup[];
    }

    async createGroup(name: string, description: string, permissions: Permission[]): Promise<TeamGroup> {
        const { data, error } = await this.db()
            .from("team_groups")
            .insert({ name, description, permissions })
            .select()
            .single();
        if (error) throw error;
        return data as TeamGroup;
    }

    async updateGroup(id: string, patch: { name?: string; description?: string; permissions?: Permission[] }): Promise<TeamGroup> {
        const { data, error } = await this.db()
            .from("team_groups")
            .update(patch)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as TeamGroup;
    }

    async deleteGroup(id: string) {
        const { error } = await this.db()
            .from("team_groups")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    }

    async listUsers(): Promise<TeamUser[]> {
        const { data, error } = await this.db()
            .from("team_members")
            .select("*")
            .order("name");
        if (error) throw error;
        return (data ?? []).map(mapMember);
    }

    async assignUserToGroup(userId: string, groupId: string | null): Promise<TeamUser> {
        const { data, error } = await this.db()
            .from("team_members")
            .update({ group_id: groupId })
            .eq("id", userId)
            .select()
            .single();
        if (error) throw error;
        return mapMember(data);
    }

    async updateUser(id: string, patch: { role?: UserRole; groupId?: string | null }): Promise<TeamUser> {
        const dbPatch: Record<string, unknown> = {};
        if (patch.role !== undefined) dbPatch.role = patch.role;
        if (patch.groupId !== undefined) dbPatch.group_id = patch.groupId;

        const { data, error } = await this.db()
            .from("team_members")
            .update(dbPatch)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return mapMember(data);
    }

    async deleteUser(id: string) {
        const { error } = await this.db()
            .from("team_members")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    }

    async syncUser(supabaseUser: { id: string; email?: string; user_metadata?: any }): Promise<TeamUser | null> {
        if (!supabaseUser.email) return null;

        const name =
            supabaseUser.user_metadata?.name ||
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email.split("@")[0];

        const { count } = await this.db()
            .from("team_members")
            .select("*", { count: "exact", head: true });

        const defaultRole = count === 0 ? UserRole.SUPER_ADMIN : UserRole.BLOXXS_TEAM;

        const { data, error } = await this.db()
            .from("team_members")
            .upsert(
                { id: supabaseUser.id, email: supabaseUser.email, name, role: defaultRole },
                { onConflict: "email", ignoreDuplicates: false }
            )
            .select()
            .single();

        if (error) {
            console.error("[TeamService] syncUser failed:", error);
            return null;
        }
        return mapMember(data);
    }

    async createInvite(data: { email: string; role: UserRole; groupId?: string | null; baseUrl?: string }): Promise<{ invite: TeamInvite; emailSent: boolean }> {
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { data: row, error } = await this.db()
            .from("user_invites")
            .insert({
                email: data.email,
                role: data.role,
                group_id: data.groupId ?? null,
                token,
                status: InviteStatus.PENDENTE,
                expires_at: expiresAt.toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        let emailSent = false;
        if (data.baseUrl) {
            try {
                const inviteLink = `${data.baseUrl}/invite?token=${token}`;
                const roleLabel = ROLE_LABELS[data.role] || data.role;
                emailSent = await mailService.sendInviteEmail(data.email, inviteLink, roleLabel);
            } catch (err) {
                console.error("[TeamService] sendInviteEmail failed:", err);
            }
        }

        return { invite: mapInvite(row), emailSent };
    }

    async listAllInvites(): Promise<TeamInvite[]> {
        const { data, error } = await this.db()
            .from("user_invites")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []).map(mapInvite);
    }

    async validateInvite(token: string): Promise<TeamInvite | null> {
        const { data } = await this.db()
            .from("user_invites")
            .select("*")
            .eq("token", token)
            .maybeSingle();

        if (!data) return null;
        if (data.status !== InviteStatus.PENDENTE) return null;
        if (new Date() > new Date(data.expires_at)) return null;

        return mapInvite(data);
    }

    async deleteInvite(id: string) {
        const { error } = await this.db()
            .from("user_invites")
            .delete()
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    }

    async acceptInvite(token: string, supabaseUser: { id: string; email: string; user_metadata?: any }): Promise<TeamUser> {
        const invite = await this.validateInvite(token);
        if (!invite) throw new Error("Convite inválido ou expirado.");
        if (invite.email !== supabaseUser.email) throw new Error("Este convite foi enviado para outro e-mail.");

        const name =
            supabaseUser.user_metadata?.name ||
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email.split("@")[0];

        const { data, error } = await this.db()
            .from("team_members")
            .upsert(
                {
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    name,
                    role: invite.role,
                    group_id: invite.groupId,
                },
                { onConflict: "email" }
            )
            .select()
            .single();

        if (error) throw error;

        await this.db()
            .from("user_invites")
            .update({ status: InviteStatus.ACEITO })
            .eq("id", invite.id);

        return mapMember(data);
    }

    async ensureDefaultGroups(): Promise<TeamGroup> {
        const { data, error } = await this.db()
            .from("team_groups")
            .upsert(
                {
                    name: "Administradores",
                    description: "Grupo com acesso total ao sistema.",
                    permissions: [
                        "ORCHESTRATE_PRODUCT",
                        "MANAGE_TEAM",
                        "CREATE_TASK",
                        "MOVE_CARDS",
                        "VIEW_TASKS",
                        "VIEW_REPORTS",
                        "PARTICIPATE_REVIEWS",
                        "MANAGE_FLAGS",
                        "MANAGE_ROADMAP",
                    ],
                },
                { onConflict: "name" }
            )
            .select()
            .single();

        if (error) throw error;
        return data as TeamGroup;
    }
}

export const teamService = new TeamService();
