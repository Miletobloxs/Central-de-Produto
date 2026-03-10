import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Criar Grupo de Administradores
  const adminGroup = await prisma.teamGroup.upsert({
    where: { name: 'Administradores' },
    update: {},
    create: {
      name: 'Administradores',
      description: 'Grupo com acesso total ao sistema.',
      permissions: [
        'ORCHESTRATE_PRODUCT',
        'MANAGE_TEAM',
        'CREATE_TASK',
        'MOVE_CARDS',
        'VIEW_TASKS',
        'VIEW_REPORTS',
        'PARTICIPATE_REVIEWS',
        'MANAGE_FLAGS',
        'MANAGE_ROADMAP',
      ],
    },
  });

  console.log(`✅ Group created: ${adminGroup.name}`);

  // 2. Criar Usuário Super Admin (ID deve bater com o Supabase Auth se possível)
  // Nota: O e-mail é o campo de vínculo principal no middleware e auth logic atual.
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bloxs.com.br' },
    update: {
      role: UserRole.SUPER_ADMIN,
      groupId: adminGroup.id,
    },
    create: {
      email: 'admin@bloxs.com.br',
      name: 'Central Admin',
      role: UserRole.SUPER_ADMIN,
      groupId: adminGroup.id,
    },
  });

  console.log(`✅ Admin user created/updated: ${adminUser.email}`);
  console.log('✨ Seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
