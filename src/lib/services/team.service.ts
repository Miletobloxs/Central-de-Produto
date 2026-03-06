import { prisma } from "@/lib/prisma";
import type { Permission } from "./access.service";

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
        return await prisma.teamGroup.findMany({
            include: {
                _count: {
                    select: { users: true },
                },
            },
            orderBy: { name: "asc" },
        }) as any;
    }

    /**
     * Cria um novo grupo dinâmico.
     */
    async createGroup(name: string, description: string, permissions: Permission[]) {
        return await prisma.teamGroup.create({
            data: {
                name,
                description,
                permissions,
            },
        });
    }

    /**
     * Lista usuários para vinculação a grupos.
     */
    async listUsers() {
        return await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                groupId: true,
            },
            orderBy: { name: "asc" },
        });
    }

    /**
     * Atribui um usuário a um grupo.
     */
    async assignUserToGroup(userId: string, groupId: string | null) {
        return await prisma.user.update({
            where: { id: userId },
            data: { groupId },
        });
    }
}

export const teamService = new TeamService();
