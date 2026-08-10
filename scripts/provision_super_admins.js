const { PrismaClient, UserRole } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.DEFAULT_SUPER_ADMIN_PASSWORD || 'BloxsAdmin@2026';

const SUPER_ADMIN_USERS = [
  { email: 'carlos.carneiro@bloxs.com.br', name: 'Carlos Carneiro' },
  { email: 'raphael.franco@bloxs.com.br', name: 'Raphael Franco' },
  { email: 'diego.sorrilha@bloxs.com.br', name: 'Diego Sorrilha' },
];

async function provisionSuperAdmins() {
  console.log('🚀 Iniciando provisionamento de Super Admins...');
  console.log(`🔑 Senha padrão configurada: ${DEFAULT_PASSWORD}`);

  // 1. Garantir que o grupo de Administradores existe
  const adminGroup = await prisma.teamGroup.upsert({
    where: { name: 'Administradores' },
    update: {},
    create: {
      name: 'Administradores',
      description: 'Grupo com acesso total e gestão do sistema.',
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
  console.log(`✅ Grupo verificado: ${adminGroup.name} (${adminGroup.id})`);

  // 2. Tentar conexão com Supabase Auth Admin se chave de serviço estiver presente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseAdmin = null;

  if (supabaseUrl && serviceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    console.log('⚡ Client Supabase Admin inicializado via SUPABASE_SERVICE_ROLE_KEY');
  } else {
    console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY não configurada no .env. Cadastrando perfis diretamente no Prisma DB.');
  }

  // 3. Iterar e cadastrar os 3 Super Admins
  for (const userDef of SUPER_ADMIN_USERS) {
    let authUserId = null;

    if (supabaseAdmin) {
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = listData?.users?.find(u => u.email === userDef.email);

        if (existingAuth) {
          console.log(`ℹ️ Usuário Supabase Auth existente para ${userDef.email} (ID: ${existingAuth.id})`);
          authUserId = existingAuth.id;
          // Atualizar senha
          await supabaseAdmin.auth.admin.updateUserById(existingAuth.id, {
            password: DEFAULT_PASSWORD,
            user_metadata: { name: userDef.name }
          });
          console.log(`🔐 Senha atualizada no Supabase Auth para ${userDef.email}`);
        } else {
          const { data: newAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userDef.email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: { name: userDef.name }
          });

          if (createError) {
            console.warn(`⚠️ Aviso ao criar no Supabase Auth para ${userDef.email}: ${createError.message}`);
          } else if (newAuth?.user) {
            authUserId = newAuth.user.id;
            console.log(`✨ Criado no Supabase Auth: ${userDef.email} (ID: ${authUserId})`);
          }
        }
      } catch (err) {
        console.warn(`⚠️ Supabase Auth Error (${userDef.email}):`, err.message);
      }
    }

    // Upsert no Prisma
    const prismaData = {
      email: userDef.email,
      name: userDef.name,
      role: 'SUPER_ADMIN',
      groupId: adminGroup.id,
    };

    if (authUserId) {
      prismaData.id = authUserId;
    }

    const user = await prisma.user.upsert({
      where: { email: userDef.email },
      update: {
        role: 'SUPER_ADMIN',
        groupId: adminGroup.id,
        name: userDef.name,
        ...(authUserId ? { id: authUserId } : {}),
      },
      create: prismaData,
    });

    console.log(`✅ Super Admin configurado no Prisma: ${user.email} (Role: ${user.role})`);
  }

  console.log('\n🎉 Todos os 3 Super Admins foram configurados com sucesso!');
}

provisionSuperAdmins()
  .catch((e) => {
    console.error('❌ Erro no provisionamento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
