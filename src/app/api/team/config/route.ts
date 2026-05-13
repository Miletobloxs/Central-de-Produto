import { NextResponse } from "next/server";
import { teamService } from "@/lib/services/team.service";
import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/enums";

export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) throw new Error("Falha ao inicializar Supabase");

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await teamService.syncUser(user).catch((e) =>
                console.error("[team/config] syncUser failed:", e)
            );
        }

        const [groups, users, invites] = await Promise.all([
            teamService.listGroups().catch(() => []),
            teamService.listUsers().catch(() => []),
            teamService.listAllInvites().catch(() => []),
        ]);

        return NextResponse.json({ groups, users, invites });
    } catch (error: any) {
        console.error("[team/config] GET:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, id, data } = body;

        // Public actions — no auth required (invite flow)
        if (action === "validateInvite") {
            const invite = await teamService.validateInvite(data.token);
            return NextResponse.json(invite ?? { error: "Convite inválido ou expirado" });
        }
        if (action === "acceptInvite") {
            const user = await teamService.acceptInvite(data.token, data.supabaseUser);
            return NextResponse.json(user);
        }

        // All other actions require authentication
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Falha ao inicializar Supabase" }, { status: 500 });

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        // Sync the current user (handles first-time bootstrap)
        const dbUser = await teamService.syncUser(authUser).catch(() => null);
        const isAdmin = dbUser?.role === UserRole.ADMIN || dbUser?.role === UserRole.SUPER_ADMIN;

        if (!isAdmin) {
            return NextResponse.json({ error: "Acesso negado: requer privilégios administrativos." }, { status: 403 });
        }

        switch (action) {
            case "seed": {
                const result = await teamService.ensureDefaultGroups();
                return NextResponse.json({ success: true, data: result });
            }
            case "createGroup": {
                const group = await teamService.createGroup(data.name, data.description ?? "", data.permissions ?? []);
                return NextResponse.json(group);
            }
            case "updateGroup": {
                const group = await teamService.updateGroup(id, data);
                return NextResponse.json(group);
            }
            case "deleteGroup": {
                const result = await teamService.deleteGroup(id);
                return NextResponse.json(result);
            }
            case "assignUser": {
                const result = await teamService.assignUserToGroup(data.userId, data.groupId);
                return NextResponse.json(result);
            }
            case "updateUser": {
                const result = await teamService.updateUser(id, data);
                return NextResponse.json(result);
            }
            case "deleteUser": {
                const result = await teamService.deleteUser(id);
                return NextResponse.json(result);
            }
            case "createInvite": {
                const host = request.headers.get("host") || "central-de-produto.vercel.app";
                const protocol = host.includes("localhost") ? "http" : "https";
                const result = await teamService.createInvite({ ...data, baseUrl: `${protocol}://${host}` });
                return NextResponse.json(result);
            }
            case "deleteInvite": {
                const result = await teamService.deleteInvite(id);
                return NextResponse.json(result);
            }
            default:
                return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("[team/config] POST:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
