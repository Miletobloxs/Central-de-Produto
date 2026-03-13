import { NextResponse } from "next/server";
import { teamService } from "@/lib/services/team.service";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/enums";

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
        const supabase = await createClient();
        const body = await request.json();
        const { action, id, data } = body;

        // 1. Ações Públicas (Exceções)
        if (['validateInvite', 'acceptInvite'].includes(action)) {
            switch (action) {
                case 'validateInvite':
                    const validInvite = await teamService.validateInvite(data.token);
                    return NextResponse.json(validInvite || { error: "Convite inválido" });
                case 'acceptInvite':
                    const userResult = await teamService.acceptInvite(data.token, data.supabaseUser);
                    return NextResponse.json(userResult);
            }
        }

        // 2. Trava de Autenticação para todas as outras ações
        if (!supabase) {
            return NextResponse.json({ error: "Falha ao inicializar Supabase" }, { status: 500 });
        }
        
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // 3. Trava de Role (Apenas ADMIN ou SUPER_ADMIN)
        const dbUser = await teamService.getUserById(authUser.id);
        const isAdmin = dbUser?.role === UserRole.ADMIN || dbUser?.role === UserRole.SUPER_ADMIN;

        if (!isAdmin) {
             return NextResponse.json({ error: "Acesso negado: Requer privilégios administrativos." }, { status: 403 });
        }

        // 4. Ações Administrativas
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
                const host = request.headers.get("host") || "central-de-produto.vercel.app";
                const protocol = host.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;
                const inviteResult = await teamService.createInvite({ ...data, baseUrl });
                return NextResponse.json(inviteResult);

            case 'deleteInvite':
                const deleteInviteResult = await teamService.deleteInvite(id);
                return NextResponse.json(deleteInviteResult);

            default:
                return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`API Error [team/config] POST:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
