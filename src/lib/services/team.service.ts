import { prisma } from "@/lib/prisma";
import type { Permission } from "./access.service";
import { UserRole } from "@prisma/client";

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
}

export const teamService = new TeamService();
