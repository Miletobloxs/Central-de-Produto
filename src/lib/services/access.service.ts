export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DEVELOPER' | 'BLOXXS_TEAM' | 'INVESTIDOR' | 'ORIGINADOR';

export type Permission =
    | 'ORCHESTRATE_PRODUCT'
    | 'CREATE_TASK'
    | 'MOVE_CARDS'
    | 'VIEW_TASKS'
    | 'VIEW_REPORTS'
    | 'PARTICIPATE_REVIEWS';

export interface UserAccessInfo {
    role: Role;
    group?: {
        permissions: Permission[];
    };
}

export class AccessService {
    /**
     * Valida se um usuário tem permissão para realizar uma ação.
     */
    can(user: UserAccessInfo, permission: Permission): boolean {
        // 1. Admins e Super Admins têm acesso total
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return true;
        }

        // 2. Regras Estáticas para Desenvolvedores
        if (user.role === 'DEVELOPER') {
            const devPermissions: Permission[] = ['CREATE_TASK', 'MOVE_CARDS', 'VIEW_TASKS', 'VIEW_REPORTS'];
            return devPermissions.includes(permission);
        }

        // 3. Regras Dinâmicas para Time Bloxs (via Grupo)
        if (user.role === 'BLOXXS_TEAM' && user.group?.permissions) {
            return user.group.permissions.includes(permission);
        }

        return false;
    }
}

export const accessService = new AccessService();
