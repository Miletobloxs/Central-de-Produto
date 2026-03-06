const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing Supabase Environment Variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const prisma = new PrismaClient();

async function createAdmin(email, password, name) {
    console.log(`🚀 Processing Admin: ${email}...`);

    let userId;

    // 1. Check if user already exists in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
        process.exit(1);
    }

    const existingAuthUser = users.find(u => u.email === email);

    if (existingAuthUser) {
        console.log('ℹ️ User already exists in Auth. ID:', existingAuthUser.id);
        userId = existingAuthUser.id;
    } else {
        console.log('✨ Creating new user in Auth...');
        const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        });

        if (createError) {
            console.error('❌ Error creating user in Auth:', createError.message);
            process.exit(1);
        }
        userId = newAuthUser.user.id;
    }

    // 2. Sync with Prisma
    console.log('🔄 Syncing with Prisma...');
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            id: userId,
            role: 'ADMIN',
            name
        },
        create: {
            id: userId,
            email,
            role: 'ADMIN',
            name
        }
    });

    console.log('✅ Admin User Ready:', user);
}

const email = process.env.TEST_ADMIN_EMAIL || 'admin@bloxs.com.br';
const password = process.env.TEST_ADMIN_PASSWORD || 'bloxs123';
const name = 'Admin Bloxs';

createAdmin(email, password, name)
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
