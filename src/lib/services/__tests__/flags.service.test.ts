import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flagsService } from '../flags.service';
import { prisma } from '@/lib/prisma';

// Mock do prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        featureFlag: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('FlagsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all feature flags', async () => {
        const mockFlags = [
            { id: '1', key: 'test_flag', label: 'Test Flag', active: true, type: 'release' },
        ];
        (prisma.featureFlag.findMany as any).mockResolvedValue(mockFlags);

        const result = await flagsService.getFlags();
        expect(result).toEqual(mockFlags);
        expect(prisma.featureFlag.findMany).toHaveBeenCalled();
    });

    it('should create a new feature flag', async () => {
        const flagData = {
            key: 'new_flag',
            label: 'New Flag',
            type: 'release' as const,
            rollout: 50,
        };
        (prisma.featureFlag.create as any).mockResolvedValue({ id: '2', ...flagData });

        const result = await flagsService.createFlag(flagData);
        expect(result.key).toBe('new_flag');
        expect(prisma.featureFlag.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ key: 'new_flag' }),
        });
    });

    it('should toggle flag isDev status', async () => {
        (prisma.featureFlag.update as any).mockResolvedValue({ id: '1', isDev: false });

        const result = await flagsService.toggleFlag('1', false);
        expect(result.isDev).toBe(false);
        expect(prisma.featureFlag.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { isDev: false },
        });
    });

    it('should update rollout percentage', async () => {
        (prisma.featureFlag.update as any).mockResolvedValue({ id: '1', rollout: 75 });

        const result = await flagsService.updateRollout('1', 75);
        expect(result.rollout).toBe(75);
        expect(prisma.featureFlag.update).toHaveBeenCalledWith({
            where: { id: '1' },
            data: { rollout: 75 },
        });
    });
});
