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

  // 2. Criar Usuários Super Admin oficiais
  const superAdmins = [
    { email: 'carlos.carneiro@bloxs.com.br', name: 'Carlos Carneiro' },
    { email: 'raphael.franco@bloxs.com.br', name: 'Raphael Franco' },
    { email: 'diego.sorrilha@bloxs.com.br', name: 'Diego Sorrilha' },
    { email: 'admin@bloxs.com.br', name: 'Central Admin' },
  ];

  for (const adminDef of superAdmins) {
    const adminUser = await prisma.user.upsert({
      where: { email: adminDef.email },
      update: {
        role: UserRole.SUPER_ADMIN,
        groupId: adminGroup.id,
        name: adminDef.name,
      },
      create: {
        email: adminDef.email,
        name: adminDef.name,
        role: UserRole.SUPER_ADMIN,
        groupId: adminGroup.id,
      },
    });
    console.log(`✅ Super Admin created/updated: ${adminUser.email}`);
  }
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
