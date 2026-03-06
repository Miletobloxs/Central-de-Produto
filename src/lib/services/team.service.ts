import { prisma } from "@/lib/prisma";
import type { Permission } from "./access.service";
import { UserRole, InviteStatus } from "@prisma/client";
import crypto from "crypto";

export interface TeamGroup {
    id: string;
    name: string;
    description: string | null;
    permissions: string[];
    _count?: {
        users: number;
    };
}

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
     * Gera um novo convite para colaborador.
     */
    async createInvite(data: { email: string; role: UserRole; groupId?: string | null }) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // Expiração de 24h

        return await (prisma as any).userInvite.create({
            data: {
                ...data,
                token,
                expiresAt,
                status: InviteStatus.PENDENTE,
            },
        });
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

        // Verificar status e expiração
        if (invite.status !== InviteStatus.PENDENTE || new Date() > invite.expiresAt) {
            // Opcional: Marcar como expirado no banco se necessário
            return null;
        }

        return invite;
    }
}

export const teamService = new TeamService();
