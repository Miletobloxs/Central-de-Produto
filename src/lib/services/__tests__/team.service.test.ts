import { describe, it, expect, beforeEach, vi } from 'vitest';
import { teamService } from '../team.service';
import { prisma } from '@/lib/prisma';
import { Permission } from '../access.service';

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        teamGroup: {
            update: vi.fn(),
        },
    },
}));

describe('TeamService - Group Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateGroup', () => {
        it('deve atualizar o nome, descrição e permissões de um grupo existente', async () => {
            const groupId = 'group-123';
            const updateData = {
                name: 'Squad de Elite Updated',
                description: 'Nova descrição',
                permissions: ['ORCHESTRATE_PRODUCT', 'MOVE_CARDS'] as Permission[],
            };

            const mockUpdatedGroup = { id: groupId, ...updateData };
            (prisma.teamGroup.update as any).mockResolvedValue(mockUpdatedGroup);

            const result = await teamService.updateGroup(groupId, updateData);

            expect(prisma.teamGroup.update).toHaveBeenCalledWith({
                where: { id: groupId },
                data: updateData,
            });
            expect(result).toEqual(mockUpdatedGroup);
        });

        it('deve permitir atualizar apenas parte dos campos', async () => {
            const groupId = 'group-123';
            const updateData = {
                name: 'Nome Apenas',
            };

            (prisma.teamGroup.update as any).mockResolvedValue({ id: groupId, name: 'Nome Apenas' });

            await teamService.updateGroup(groupId, updateData);

            expect(prisma.teamGroup.update).toHaveBeenCalledWith({
                where: { id: groupId },
                data: updateData,
            });
        });
    });
});
