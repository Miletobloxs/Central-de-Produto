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
            await teamService.syncUser(user.id, user.email!, user.user_metadata?.full_name || user.email);
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
        console.error("API Error [team/config]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'seed':
                const seedResult = await teamService.ensureDefaultGroups();
                return NextResponse.json({ success: true, data: seedResult });
            
            case 'createGroup':
                const group = await teamService.createGroup(data.name, data.description, data.permissions);
                return NextResponse.json(group);

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
