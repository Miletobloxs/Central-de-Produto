import { NextResponse } from "next/server";
import { teamService } from "@/lib/services/team.service";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { UserRole } from "@/lib/types/enums";
import { randomBytes } from "crypto";

// Anon client for public reads (no service role needed, requires RLS policy)
function createAnonClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}

// ── GET — load team data using authenticated client (no service role needed) ──
export async function GET() {
    try {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase unavailable");

        const [{ data: groupData }, { data: userData }, { data: inviteData }] = await Promise.all([
            supabase.from("team_groups").select("*").order("name"),
            supabase.from("team_members").select("*").order("name"),
            supabase.from("user_invites").select("*").order("created_at", { ascending: false }),
        ]);

        const groups = groupData ?? [];
        const users = (userData ?? []).map((u: any) => ({
            id: u.id, email: u.email, name: u.name,
            image: u.image, role: u.role, groupId: u.group_id,
        }));
        const invites = (inviteData ?? []).map((i: any) => ({
            id: i.id, email: i.email, role: i.role,
            groupId: i.group_id, token: i.token,
            status: i.status, expiresAt: i.expires_at,
        }));

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

        // ── Public actions (no auth required) ────────────────────────────────
        if (action === "validateInvite") {
            // Uses anon client — requires migration 024 (public read on user_invites)
            const anon = createAnonClient();
            const { data: row } = await anon
                .from("user_invites")
                .select("id, email, role, group_id, token, status, expires_at")
                .eq("token", data.token)
                .eq("status", "pendente")
                .gt("expires_at", new Date().toISOString())
                .maybeSingle();

            if (!row) return NextResponse.json({ error: "Convite inválido ou expirado" });
            return NextResponse.json({
                id: row.id, email: row.email, role: row.role,
                groupId: row.group_id, token: row.token,
                status: row.status, expiresAt: row.expires_at,
            });
        }

        if (action === "acceptInvite") {
            const { token, password, supabaseUser } = data;

            // Legacy path: old frontend already created the Supabase auth user
            if (!password && supabaseUser) {
                const user = await teamService.acceptInvite(token, supabaseUser);
                return NextResponse.json(user);
            }

            // New path: server creates auth user with email auto-confirmed
            const invite = await teamService.validateInvite(token);
            if (!invite) return NextResponse.json({ error: "Convite inválido ou expirado" }, { status: 400 });

            const admin = createAdminClient();
            let supabaseUserId: string;

            const { data: created, error: createErr } = await admin.auth.admin.createUser({
                email: invite.email,
                password,
                email_confirm: true,
                user_metadata: { name: invite.email.split("@")[0] },
            });

            if (createErr) {
                // User already exists — find them and update password
                const { data: userList } = await admin.auth.admin.listUsers({ perPage: 1000 });
                const existing = (userList as any)?.users?.find((u: any) => u.email === invite.email);
                if (!existing) return NextResponse.json({ error: createErr.message }, { status: 400 });
                supabaseUserId = existing.id;
                await admin.auth.admin.updateUserById(supabaseUserId, { password, email_confirm: true });
            } else {
                supabaseUserId = created.user.id;
            }

            const user = await teamService.acceptInvite(token, {
                id: supabaseUserId,
                email: invite.email,
                user_metadata: { name: invite.email.split("@")[0] },
            });
            return NextResponse.json(user);
        }

        // ── Authenticated admin actions ───────────────────────────────────────
        const supabase = await createClient();
        if (!supabase) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

        // Check admin role using the authenticated client (no service role needed)
        const { data: member } = await supabase
            .from("team_members")
            .select("role")
            .eq("id", authUser.id)
            .maybeSingle();

        const isAdmin = member?.role === UserRole.ADMIN || member?.role === UserRole.SUPER_ADMIN;
        if (!isAdmin) {
            return NextResponse.json({ error: "Acesso negado: requer privilégios administrativos." }, { status: 403 });
        }

        switch (action) {
            case "seed": {
                const { data: result, error } = await supabase
                    .from("team_groups")
                    .upsert({
                        name: "Administradores",
                        description: "Grupo com acesso total ao sistema.",
                        permissions: [
                            "ORCHESTRATE_PRODUCT", "MANAGE_TEAM", "CREATE_TASK",
                            "MOVE_CARDS", "VIEW_TASKS", "VIEW_REPORTS",
                            "PARTICIPATE_REVIEWS", "MANAGE_FLAGS", "MANAGE_ROADMAP",
                        ],
                    }, { onConflict: "name" })
                    .select().single();
                if (error) throw error;
                return NextResponse.json({ success: true, data: result });
            }

            case "createGroup": {
                const { data: group, error } = await supabase
                    .from("team_groups")
                    .insert({ name: data.name, description: data.description ?? "", permissions: data.permissions ?? [] })
                    .select().single();
                if (error) throw error;
                return NextResponse.json(group);
            }

            case "updateGroup": {
                const { data: group, error } = await supabase
                    .from("team_groups")
                    .update({ name: data.name, description: data.description, permissions: data.permissions })
                    .eq("id", id).select().single();
                if (error) throw error;
                return NextResponse.json(group);
            }

            case "deleteGroup": {
                const { error } = await supabase.from("team_groups").delete().eq("id", id);
                if (error) throw error;
                return NextResponse.json({ success: true });
            }

            case "assignUser": {
                const { data: user, error } = await supabase
                    .from("team_members")
                    .update({ group_id: data.groupId })
                    .eq("id", data.userId).select().single();
                if (error) throw error;
                return NextResponse.json({ ...user, groupId: (user as any).group_id });
            }

            case "updateUser": {
                const patch: any = {};
                if (data.role !== undefined) patch.role = data.role;
                if (data.groupId !== undefined) patch.group_id = data.groupId;
                const { data: user, error } = await supabase
                    .from("team_members")
                    .update(patch).eq("id", id).select().single();
                if (error) throw error;
                return NextResponse.json({ ...user, groupId: (user as any).group_id });
            }

            case "deleteUser": {
                const { error } = await supabase.from("team_members").delete().eq("id", id);
                if (error) throw error;
                return NextResponse.json({ success: true });
            }

            case "createInvite": {
                const host = request.headers.get("host") || "central-de-produto.vercel.app";
                const protocol = host.includes("localhost") ? "http" : "https";
                const baseUrl = `${protocol}://${host}`;

                const token = randomBytes(32).toString("hex");
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

                const { data: inviteRow, error } = await supabase
                    .from("user_invites")
                    .insert({
                        email: data.email,
                        role: data.role,
                        group_id: data.groupId ?? null,
                        token,
                        status: "pendente",
                        expires_at: expiresAt.toISOString(),
                    })
                    .select().single();
                if (error) throw error;

                return NextResponse.json({
                    invite: {
                        id: inviteRow.id, email: inviteRow.email, role: inviteRow.role,
                        groupId: inviteRow.group_id, token: inviteRow.token,
                        status: inviteRow.status, expiresAt: inviteRow.expires_at,
                    },
                    emailSent: false,
                    inviteLink: `${baseUrl}/invite?token=${token}`,
                });
            }

            case "deleteInvite": {
                const { error } = await supabase.from("user_invites").delete().eq("id", id);
                if (error) throw error;
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("[team/config] POST:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
