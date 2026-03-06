import { teamService } from "../src/lib/services/team.service";

async function verify() {
    console.log('🚀 Verifying TeamService...');
    try {
        const groups = await teamService.listGroups();
        console.log('✅ Found groups:', groups.length);

        // Create verify group
        const newGroup = await teamService.createGroup(
            'Grupo de Verificação ' + Date.now(),
            'Testando integração Prisma via script',
            ['VIEW_TASKS']
        );
        console.log('✨ Group created successfully:', newGroup.name);

        const finalGroups = await teamService.listGroups();
        console.log('📊 Total groups now:', finalGroups.length);
    } catch (e) {
        console.error('❌ Integration failed:', e);
    }
}

verify();
