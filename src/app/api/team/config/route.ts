import { NextResponse } from "next/server";
import { teamService } from "@/lib/services/team.service";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const supabase = await createClient();
        
        if (!supabase) {
            throw new Error("Failed to initialize Supabase client");
        }

        // Get current user to ensure sync
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            // Force sync of the current user to Postgres
            await teamService.syncUser(user);
        }

        const [groups, users, invites] = await Promise.all([
            teamService.listGroups().catch(() => []),
            teamService.listUsers().catch(() => []),
            teamService.listAllInvites().catch(() => [])
        ]);

        return NextResponse.json({
            groups: groups || [],
            users: users || [],
            invites: invites || []
        });
    } catch (error: any) {
        console.error("API Error [team/config] GET:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, id, data } = body;

        switch (action) {
            case 'seed':
                const seedResult = await teamService.ensureDefaultGroups();
                return NextResponse.json({ success: true, data: seedResult });
            
            case 'createGroup':
                const newGroup = await teamService.createGroup(data.name, data.description, data.permissions);
                return NextResponse.json(newGroup);

            case 'updateGroup':
                const updatedGroup = await teamService.updateGroup(id, data);
                return NextResponse.json(updatedGroup);

            case 'deleteGroup':
                const deleteGroupResult = await teamService.deleteGroup(id);
                return NextResponse.json(deleteGroupResult);

            case 'assignUser':
                const assignResult = await teamService.assignUserToGroup(data.userId, data.groupId);
                return NextResponse.json(assignResult);

            case 'updateUser':
                const updateUserResult = await teamService.updateUser(id, data);
                return NextResponse.json(updateUserResult);

            case 'deleteUser':
                const deleteUserResult = await teamService.deleteUser(id);
                return NextResponse.json(deleteUserResult);

            case 'createInvite':
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const inviteResult = await teamService.createInvite({ ...data, baseUrl });
                return NextResponse.json(inviteResult);

            case 'deleteInvite':
                const deleteInviteResult = await teamService.deleteInvite(id);
                return NextResponse.json(deleteInviteResult);

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`API Error [team/config] POST:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
