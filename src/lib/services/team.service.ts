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
        return await (prisma as any).teamGroup.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { name: "asc" },
        });
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
        return await (prisma as any).user.findMany({
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

        // Enviar e-mail se baseUrl for fornecido
        if (baseUrl) {
            try {
                const inviteLink = `${baseUrl}/invite?token=${token}`;
                const roleLabel = ROLE_LABELS[data.role] || data.role;
                await mailService.sendInviteEmail(data.email, inviteLink, roleLabel);
            } catch (error) {
                console.error("Erro ao enviar e-mail de convite:", error);
            }
        }

        return invite;
    }

    /**
     * Lista convites pendentes e não expirados.
     */
    async listPendingInvites() {
        return await (prisma as any).userInvite.findMany({
            where: {
                status: InviteStatus.PENDENTE,
            },
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
}

export const teamService = new TeamService();
