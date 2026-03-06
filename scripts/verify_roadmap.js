const { prisma } = require('../src/lib/prisma');

async function verifyRoadmap() {
    console.log('--- Verificando RoadmapService Integration ---');
    try {
        const epic = await prisma.epic.create({
            data: {
                title: 'Epic de Verificação',
                status: 'BACKLOG',
                stream: 'Core',
                color: 'blue'
            }
        });
        console.log('✅ Épico criado:', epic.id);

        const epics = await prisma.epic.findMany({
            include: { sprints: true }
        });
        console.log('✅ Épicos listados:', epics.length);

        // Cleanup
        await prisma.epic.delete({ where: { id: epic.id } });
        console.log('✅ Épico de teste removido.');
    } catch (err) {
        console.error('❌ Erro na verificação:', err);
    } finally {
        process.exit(0);
    }
}

verifyRoadmap();
