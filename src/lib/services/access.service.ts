export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'BOARD' | 'DEVELOPER' | 'BLOXXS_TEAM' | 'INVESTIDOR' | 'ORIGINADOR' | 'DISTRIBUIDOR' | 'ASSESSOR';

export type Permission =
    | 'ORCHESTRATE_PRODUCT' // Somente Super Admin / Admin
    | 'MANAGE_TEAM'        // Somente Super Admin / Admin
    | 'CREATE_TASK'        // Admin / Dev
    | 'MOVE_CARDS'         // Admin / Dev
    | 'VIEW_TASKS'         // Todos internos
    | 'VIEW_REPORTS'       // Admin / Board / Super Admin
    | 'PARTICIPATE_REVIEWS'; // Internos

export interface UserAccessInfo {
    role: Role;
    group?: {
        permissions: Permission[];
    };
}

export class AccessService {
    /**
     * Valida se um usuário tem permissão para realizar uma ação.
     * Segue a hierarquia definida em RBAC_HIERARCHY.md
     */
    can(user: UserAccessInfo, permission: Permission): boolean {
        // 1. Super Admin e Admin: Acesso Total Operacional e de Equipe
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return true;
        }

        // 2. BOARD: Acesso privilegiado a Informações (Reports/Tasks) sem alteração de infra
        if (user.role === 'BOARD') {
            const boardPermissions: Permission[] = ['VIEW_REPORTS', 'VIEW_TASKS', 'PARTICIPATE_REVIEWS'];
            return boardPermissions.includes(permission);
        }

        // 3. DEVELOPER: Acesso Técnico à Execução
        if (user.role === 'DEVELOPER') {
            const devPermissions: Permission[] = ['CREATE_TASK', 'MOVE_CARDS', 'VIEW_TASKS', 'PARTICIPATE_REVIEWS'];
            return devPermissions.includes(permission);
        }

        // 4. BLOXXS_TEAM: Acesso Dinâmico via Grupos (Capability Overlay)
        if (user.role === 'BLOXXS_TEAM' && user.group?.permissions) {
            return user.group.permissions.includes(permission);
        }

        return false;
    }

    /**
     * Verifica se um cargo pode gerenciar outro (Governança).
     */
    canManageRole(currentRole: Role, targetRole: Role): boolean {
        if (currentRole === 'SUPER_ADMIN') return true;
        if (currentRole === 'ADMIN') {
            // Admin não mexe em Super Admin ou outro Admin
            return !['SUPER_ADMIN', 'ADMIN'].includes(targetRole);
        }
        return false;
    }
}

export const accessService = new AccessService();
