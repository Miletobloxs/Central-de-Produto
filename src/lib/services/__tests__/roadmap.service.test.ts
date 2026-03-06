import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roadmapService } from '../roadmap.service';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        epic: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        sprint: {
            updateMany: vi.fn(),
        }
    },
}));

describe('RoadmapService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should get all epics with their sprints', async () => {
        const mockEpics = [
            { id: 'epic-1', title: 'Epic 1', sprints: [] }
        ];
        (prisma.epic.findMany as any).mockResolvedValue(mockEpics);

        const result = await roadmapService.getEpics();
        expect(result).toEqual(mockEpics);
        expect(prisma.epic.findMany).toHaveBeenCalledWith({
            include: { sprints: true },
            orderBy: { createdAt: 'asc' }
        });
    });

    it('should create a new epic', async () => {
        const epicData = {
            title: 'New Epic',
            stream: 'Core',
            status: 'PLANNING' as any
        };
        (prisma.epic.create as any).mockResolvedValue({ id: 'epic-2', ...epicData });

        const result = await roadmapService.createEpic(epicData);
        expect(result.id).toBe('epic-2');
        expect(prisma.epic.create).toHaveBeenCalled();
    });

    it('should link sprints to an epic', async () => {
        (prisma.sprint.updateMany as any).mockResolvedValue({ count: 2 });

        await roadmapService.linkSprintsToEpic(['sprint-1', 'sprint-2'], 'epic-1');

        expect(prisma.sprint.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['sprint-1', 'sprint-2'] } },
            data: { epicId: 'epic-1' }
        });
    });
});
