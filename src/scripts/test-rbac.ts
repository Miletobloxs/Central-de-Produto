import { accessService, UserAccessInfo, Permission } from "../lib/services/access.service";
import { UserRole } from "@prisma/client";

function testPermission(user: UserAccessInfo, permission: Permission, expected: boolean) {
    const result = accessService.can(user, permission);
    console.log(`[TEST] User ${user.role} -> ${permission}: ${result === expected ? "✅ PASS" : "❌ FAIL"} (Expected ${expected}, got ${result})`);
}

const superAdmin: UserAccessInfo = { role: UserRole.SUPER_ADMIN as any };
const admin: UserAccessInfo = { role: UserRole.ADMIN as any };
const dev: UserAccessInfo = { role: UserRole.DEVELOPER as any };
const board: UserAccessInfo = { role: UserRole.BOARD as any };
const bloxxsTeam: UserAccessInfo = { role: UserRole.BLOXXS_TEAM as any };

console.log("--- GOVERNANÇA ESTRITA: TESTES DE PERMISSÃO ---");

// Flags
testPermission(superAdmin, 'MANAGE_FLAGS', true);
testPermission(admin, 'MANAGE_FLAGS', true);
testPermission(dev, 'MANAGE_FLAGS', false);
testPermission(board, 'MANAGE_FLAGS', false);

// Roadmap
testPermission(superAdmin, 'MANAGE_ROADMAP', true);
testPermission(admin, 'MANAGE_ROADMAP', true);
testPermission(dev, 'MANAGE_ROADMAP', false);
testPermission(board, 'MANAGE_ROADMAP', false);

// Dev Standard Access
testPermission(dev, 'VIEW_TASKS', true);
testPermission(dev, 'CREATE_TASK', true);

// Overlay (Grupo de Permissão)
const devWithFlags: UserAccessInfo = {
    role: UserRole.DEVELOPER as any,
    group: { permissions: ['MANAGE_FLAGS'] }
};
testPermission(devWithFlags, 'MANAGE_FLAGS', true);

const bloxxsWithRoadmap: UserAccessInfo = {
    role: UserRole.BLOXXS_TEAM as any,
    group: { permissions: ['MANAGE_ROADMAP'] }
};
testPermission(bloxxsWithRoadmap, 'MANAGE_ROADMAP', true);

console.log("--- FINAL DOS TESTES ---");
