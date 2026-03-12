import { prisma } from "@/lib/prisma";
import type { Permission } from "./access.service";
import { UserRole, InviteStatus } from "@prisma/client";
import crypto from "crypto";
import { mailService } from "./mail.service";

export interface TeamGroup {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    _count?: {
        users: number;
    };
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

export class TeamService {
    /**
     * Lista todos os grupos com contagem de usuários.
     */
    async listGroups(): Promise<TeamGroup[]> {
        console.log("DEBUG: [TEAM_SERVICE] listGroups called.");
        try {
            const groups = await (prisma as any).teamGroup.findMany({
                include: {
                    _count: {
                        select: { users: true },
                    },
                },
                orderBy: { name: "asc" },
            });
            console.log(`DEBUG: [TEAM_SERVICE] listGroups found ${groups.length} groups.`);
            return groups;
        } catch (error) {
            console.error("ERROR: [TEAM_SERVICE] listGroups failed:", error);
            throw error;
        }
    }

    /**
     * Cria um novo grupo dinâmico.
     */
    async createGroup(name: string, description: string, permissions: Permission[]) {
        return await (prisma as any).teamGroup.create({
            data: {
                name,
                description,
                permissions,
            },
        });
    }

    /**
     * Atualiza um grupo existente.
     */
    async updateGroup(id: string, data: { name?: string; description?: string; permissions?: Permission[] }) {
        return await (prisma as any).teamGroup.update({
            where: { id },
            data,
        });
    }

    /**
     * Exclui um grupo.
     */
    async deleteGroup(id: string) {
        return await (prisma as any).teamGroup.delete({
            where: { id },
        });
    }

    /**
     * Lista usuários para vinculação a grupos.
     */
    async listUsers() {
        console.log("DEBUG: [TEAM_SERVICE] listUsers called.");
        try {
            const users = await (prisma as any).user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    groupId: true,
                    avatar: true,
                },
                orderBy: { name: "asc" },
            });
            console.log(`DEBUG: [TEAM_SERVICE] listUsers found ${users.length} users.`);
            return users;
        } catch (error) {
            console.error("ERROR: [TEAM_SERVICE] listUsers failed:", error);
            throw error;
        }
    }

    /**
     * Atribui um usuário a um grupo.
     */
    async assignUserToGroup(userId: string, groupId: string | null) {
        return await (prisma as any).user.update({
            where: { id: userId },
            data: { groupId },
        });
    }

    /**
     * Atualiza dados de um usuário (Cargo/Grupo).
     */
    async updateUser(id: string, data: { role?: UserRole; groupId?: string | null }) {
        return await (prisma as any).user.update({
            where: { id },
            data,
        });
    }

    /**
     * Exclui um usuário colaborador.
     */
    async deleteUser(id: string) {
        return await (prisma as any).user.delete({
            where: { id },
        });
    }

    /**
     * Gera um novo convite para colaborador e envia por e-mail.
     */
    async createInvite(data: { email: string; role: UserRole; groupId?: string | null; baseUrl?: string }) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expiração de 24h

        const { baseUrl, ...dbData } = data;

        const invite = await (prisma as any).userInvite.create({
            data: {
                ...dbData,
                token,
                expiresAt,
                status: InviteStatus.PENDENTE,
            },
        });

        let emailSent = false;

        // Enviar e-mail se baseUrl for fornecido
        if (baseUrl) {
            try {
                const inviteLink = `${baseUrl}/invite?token=${token}`;
                const roleLabel = ROLE_LABELS[data.role] || data.role;
                emailSent = await mailService.sendInviteEmail(data.email, inviteLink, roleLabel);
            } catch (error) {
                console.error("Erro ao enviar e-mail de convite:", error);
                emailSent = false;
            }
        }

        return { invite, emailSent };
    }

    /**
     * Lista convites pendentes e não expirados.
     */
    async listPendingInvites() {
        return await (prisma as any).userInvite.findMany({
            where: {
                status: InviteStatus.PENDENTE,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Lista TODOS os convites para histórico.
     */
    async listAllInvites() {
        return await (prisma as any).userInvite.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Valida um token de convite.
     */
    async validateInvite(token: string) {
        const invite = await (prisma as any).userInvite.findUnique({
            where: { token },
        });

        if (!invite) return null;

        if (invite.status !== InviteStatus.PENDENTE || new Date() > invite.expiresAt) {
            return null;
        }

        return invite;
    }

    /**
     * Exclui um convite pendente.
     */
    async deleteInvite(id: string) {
        return await (prisma as any).userInvite.delete({
            where: { id },
        });
    }

    /**
     * Sincroniza um usuário do Supabase Auth para a tabela interna.
     */
    async syncUser(supabaseUser: { id: string, email?: string, user_metadata?: any }) {
        if (!supabaseUser.email) return null;

        console.log(`DEBUG: [TEAM_SERVICE] Syncing user: ${supabaseUser.email}`);

        try {
            const name = supabaseUser.user_metadata?.name || 
                         supabaseUser.user_metadata?.full_name || 
                         supabaseUser.email.split('@')[0];

            return await (prisma as any).user.upsert({
                where: { email: supabaseUser.email },
                update: {
                    name: name,
                    // Note: We don't overwrite the role or groupId here to maintain persistence
                },
                create: {
                    id: supabaseUser.id,
                    email: supabaseUser.email,
                    name: name,
                    role: UserRole.BLOXXS_TEAM, // Default role for new synced users
                }
            });
        } catch (error) {
            console.error("ERROR: [TEAM_SERVICE] syncUser failed:", error);
            return null;
        }
    }

    /**
     * Garante que os grupos padrão existam.
     */
    async ensureDefaultGroups() {
        console.log("DEBUG: [TEAM_SERVICE] ensureDefaultGroups called.");
        try {
            const adminGroup = await (prisma as any).teamGroup.upsert({
                where: { name: 'Administradores' },
                update: {},
                create: {
                    name: 'Administradores',
                    description: 'Grupo com acesso total ao sistema.',
                    permissions: [
                        'ORCHESTRATE_PRODUCT',
                        'MANAGE_TEAM',
                        'CREATE_TASK',
                        'MOVE_CARDS',
                        'VIEW_TASKS',
                        'VIEW_REPORTS',
                        'PARTICIPATE_REVIEWS',
                        'MANAGE_FLAGS',
                        'MANAGE_ROADMAP',
                    ],
                },
            });
            console.log("DEBUG: [TEAM_SERVICE] Default groups ensured.");
            return adminGroup;
        } catch (error) {
            console.error("ERROR: [TEAM_SERVICE] ensureDefaultGroups failed:", error);
            throw error;
        }
    }
}

export const teamService = new TeamService();
