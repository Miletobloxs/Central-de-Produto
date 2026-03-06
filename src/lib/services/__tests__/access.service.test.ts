import { describe, it, expect } from 'vitest';
import { accessService, Role, Permission } from '../access.service';

describe('AccessService', () => {
    describe('Static Roles', () => {
        it('should allow everything for ADMIN', () => {
            expect(accessService.can({ role: 'ADMIN' }, 'ORCHESTRATE_PRODUCT')).toBe(true);
            expect(accessService.can({ role: 'ADMIN' }, 'CREATE_TASK')).toBe(true);
        });

        it('should only allow operational tasks for DEVELOPER', () => {
            expect(accessService.can({ role: 'DEVELOPER' }, 'CREATE_TASK')).toBe(true);
            expect(accessService.can({ role: 'DEVELOPER' }, 'ORCHESTRATE_PRODUCT')).toBe(false);
        });
    });

    describe('Dynamic Bloxs Team Groups', () => {
        it('should allow permissions defined in the custom group', () => {
            const user = {
                role: 'BLOXXS_TEAM',
                group: {
                    permissions: ['VIEW_TASKS', 'PARTICIPATE_REVIEWS'] as Permission[]
                }
            };

            expect(accessService.can(user, 'VIEW_TASKS')).toBe(true);
            expect(accessService.can(user, 'PARTICIPATE_REVIEWS')).toBe(true);
            expect(accessService.can(user, 'CREATE_TASK')).toBe(false);
        });

        it('should deny if user has no group but is BLOXXS_TEAM', () => {
            const user = { role: 'BLOXXS_TEAM' };
            expect(accessService.can(user, 'VIEW_TASKS')).toBe(false);
        });
    });
});
