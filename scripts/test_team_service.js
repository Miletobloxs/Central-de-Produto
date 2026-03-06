const { TeamService } = require('./src/lib/services/team.service');
const { PrismaClient } = require('@prisma/client');

async function testTeamService() {
    const teamService = new TeamService();
    console.log('🧪 Testing TeamService...');

    try {
        const groups = await teamService.listGroups();
        console.log('✅ Current groups:', groups.length);

        const newGroup = await teamService.createGroup(
            'Teste de Grupo',
            'Criado via script de verificação',
            ['VIEW_REPORTS', 'CREATE_TASK']
        );
        console.log('✅ Group created:', newGroup.name);

        const updatedGroups = await teamService.listGroups();
        console.log('✅ Final groups count:', updatedGroups.length);
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testTeamService();
