import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ConfiguracoesPage from '../page';
import { getGroupsAction, getUsersAction } from '@/lib/actions/team.actions';

// Mock das Server Actions
vi.mock('@/lib/actions/team.actions', () => ({
    getGroupsAction: vi.fn(() => Promise.resolve([])),
    createGroupAction: vi.fn(),
    updateGroupAction: vi.fn(),
    deleteGroupAction: vi.fn(),
    getUsersAction: vi.fn(() => Promise.resolve([])),
    updateUserAction: vi.fn(),
    deleteUserAction: vi.fn(),
}));

describe('ConfiguracoesPage - Admin Control Flow', () => {
    it('deve exibir botões de Editar e Excluir para colaboradores', async () => {
        (getUsersAction as any).mockResolvedValue([
            { id: 'u1', name: 'User 1', email: 'u1@test.com', role: 'DEVELOPER', groupId: null }
        ]);

        render(<ConfiguracoesPage />);

        // Aguarda carregar
        await waitFor(() => expect(screen.getByText('User 1')).toBeDefined());

        // Verifica botões de ação (títulos dos botões via aria-label ou title)
        expect(screen.getByTitle('Editar Colaborador')).toBeDefined();
        expect(screen.getByTitle('Excluir Colaborador')).toBeDefined();
    });

    it('deve exibir botão de Excluir para grupos', async () => {
        (getGroupsAction as any).mockResolvedValue([
            { id: 'g1', name: 'Grupo VIP', description: 'Desc', permissions: [], _count: { users: 0 } }
        ]);

        render(<ConfiguracoesPage />);

        // Muda para aba Grupos
        const groupsSubTab = screen.getByText('Configuração de Grupos');
        fireEvent.click(groupsSubTab);

        await waitFor(() => expect(screen.getByText('Grupo VIP')).toBeDefined());

        // Verifica botão de Excluir Grupo
        expect(screen.getByTitle('Excluir Grupo')).toBeDefined();
    });
});
