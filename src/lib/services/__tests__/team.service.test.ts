import { describe, it, expect, beforeEach, vi } from 'vitest';
import { teamService } from '../team.service';
import { prisma } from '@/lib/prisma';
import { Permission } from '../access.service';

// Mock do Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        teamGroup: {
            update: vi.fn(),
            delete: vi.fn(),
        },
        user: {
            update: vi.fn(),
            delete: vi.fn(),
        },
        userInvite: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findMany: vi.fn(),
            update: vi.fn(),
        }
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

    describe('deleteGroup', () => {
        it('deve excluir um grupo pelo ID', async () => {
            const groupId = 'group-123';
            (prisma.teamGroup.delete as any).mockResolvedValue({ id: groupId });

            await teamService.deleteGroup(groupId);

            expect(prisma.teamGroup.delete).toHaveBeenCalledWith({
                where: { id: groupId },
            });
        });
    });

    describe('User Management', () => {
        it('deve atualizar o cargo e grupo de um usuário', async () => {
            const userId = 'user-123';
            const updateData = {
                role: 'ADMIN' as any,
                groupId: 'group-123',
            };

            (prisma.user.update as any).mockResolvedValue({ id: userId, ...updateData });

            await (teamService as any).updateUser(userId, updateData);

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: updateData,
            });
        });

        it('deve excluir um usuário pelo ID', async () => {
            const userId = 'user-123';
            (prisma.user.delete as any).mockResolvedValue({ id: userId });

            await (teamService as any).deleteUser(userId);

            expect(prisma.user.delete).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });
    });

    describe('Invite Management', () => {
        it('deve criar um convite com expiração de 24h e token único', async () => {
            const inviteData = {
                email: 'novo@bloxs.com.br',
                role: 'DEVELOPER' as any,
                groupId: 'group-1'
            };

            const mockInvite = {
                id: 'invite-1',
                ...inviteData,
                token: 'random-token',
                status: 'PENDENTE',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

            (prisma.userInvite.create as any).mockResolvedValue(mockInvite);

            const result = await (teamService as any).createInvite(inviteData);

            expect(prisma.userInvite.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    email: inviteData.email,
                    role: inviteData.role,
                    groupId: inviteData.groupId,
                    token: expect.any(String),
                    expiresAt: expect.any(Date)
                })
            }));
            expect(result.token).toBeDefined();
        });

        it('deve listar apenas convites pendentes', async () => {
            const mockInvites = [
                { id: '1', status: 'PENDENTE', email: 'a@b.com' },
                { id: '2', status: 'PENDENTE', email: 'c@d.com' }
            ];
            (prisma.userInvite.findMany as any).mockResolvedValue(mockInvites);

            const result = await (teamService as any).listPendingInvites();

            expect(prisma.userInvite.findMany).toHaveBeenCalledWith({
                where: { status: 'PENDENTE' },
                orderBy: { createdAt: 'desc' }
            });
            expect(result).toHaveLength(2);
        });

        it('deve validar um convite ativo e não expirado', async () => {
            const token = 'valid-token';
            const mockInvite = {
                id: '1',
                token,
                status: 'PENDENTE',
                expiresAt: new Date(Date.now() + 10000)
            };
            (prisma.userInvite.findUnique as any).mockResolvedValue(mockInvite);

            const result = await (teamService as any).validateInvite(token);

            expect(result).toEqual(mockInvite);
        });

        it('deve retornar null para convites expirados', async () => {
            const token = 'expired-token';
            const mockInvite = {
                id: '1',
                token,
                status: 'PENDENTE',
                expiresAt: new Date(Date.now() - 10000)
            };
            (prisma.userInvite.findUnique as any).mockResolvedValue(mockInvite);

            const result = await (teamService as any).validateInvite(token);

            expect(result).toBeNull();
        });
    });
});
