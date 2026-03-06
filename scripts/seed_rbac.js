const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding RBAC Groups...');

    const strategyGroup = await prisma.teamGroup.upsert({
        where: { name: 'Estratégia & PO' },
        update: {},
        create: {
            name: 'Estratégia & PO',
            description: 'Gestão estratégica de Roadmaps e OKRs',
            permissions: ['ORCHESTRATE_PRODUCT', 'VIEW_TASKS', 'VIEW_REPORTS', 'PARTICIPATE_REVIEWS'],
        },
    });

    const opsGroup = await prisma.teamGroup.upsert({
        where: { name: 'Operações Bloxs' },
        update: {},
        create: {
            name: 'Operações Bloxs',
            description: 'Acompanhamento de entregas e revisões',
            permissions: ['VIEW_TASKS', 'VIEW_REPORTS', 'PARTICIPATE_REVIEWS'],
        },
    });

    console.log('🌱 Seeding Product Data...');

    const objective = await prisma.objective.create({
        data: {
            title: 'Dominar o mercado de ativos reais',
            quarter: 'Q1 2026',
            status: 'on_track',
            owner: 'Carlos Carneiro',
            key_results: {
                create: [
                    { title: 'Atingir R$ 100M em originação', target_value: 100, current_value: 45, unit: 'M' },
                    { title: 'Reduzir churn para < 5%', target_value: 5, current_value: 3, unit: '%' }
                ]
            }
        }
    });

    const epic = await prisma.epic.create({
        data: {
            title: 'Plataforma Central de Produto',
            description: 'Unificação de todas as ferramentas de gestão',
            status: 'DEVELOPMENT',
            priority: 'HIGH',
            stream: 'Core',
            color: 'bg-blue-100 text-blue-700',
            okrId: objective.id
        }
    });

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
