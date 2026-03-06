import { prisma } from "@/lib/prisma";
import type { RoadmapStatus } from "@prisma/client";

export interface CreateEpicDTO {
    title: string;
    description?: string;
    stream?: string;
    status: RoadmapStatus;
    priority?: string;
    color?: string;
    startDate?: Date;
    endDate?: Date;
}

export class RoadmapService {
    /**
     * Lista todos os épicos com suas sprints associadas.
     */
    async getEpics() {
        return await prisma.epic.findMany({
            include: {
                sprints: true,
            },
            orderBy: { createdAt: "asc" },
        });
    }

    /**
     * Cria um novo épico no roadmap.
     */
    async createEpic(data: CreateEpicDTO) {
        return await prisma.epic.create({
            data: {
                title: data.title,
                description: data.description,
                stream: data.stream,
                status: data.status,
                priority: data.priority ?? "MEDIUM",
                color: data.color ?? "blue",
                startDate: data.startDate,
                endDate: data.endDate,
            },
            include: {
                sprints: true,
            }
        });
    }

    /**
     * Vincula múltiplas sprints a um épico.
     */
    async linkSprintsToEpic(sprintIds: string[], epicId: string) {
        return await prisma.sprint.updateMany({
            where: {
                id: { in: sprintIds },
            },
            data: {
                epicId: epicId,
            },
        });
    }
}

export const roadmapService = new RoadmapService();
