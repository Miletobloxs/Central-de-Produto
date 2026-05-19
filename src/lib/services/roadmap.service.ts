import { createClient } from "@/lib/supabase/server";

export interface CreateEpicDTO {
    name: string;
    description?: string;
    stream?: string;
    status?: string;
    priority?: string;
    color?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface UpdateEpicDTO extends Partial<CreateEpicDTO> {
    id: string;
}

function mapEpicRow(row: any) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? null,
        stream: row.stream,
        status: row.status,
        priority: row.priority,
        color: row.color,
        startDate: row.start_date ?? null,
        endDate: row.end_date ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sprints: row.sprints ?? [],
    };
}

export class RoadmapService {
    async getEpics() {
        const supabase = await createClient();
        if (!supabase) return [];

        const { data, error } = await supabase
            .from("epics")
            .select("*, sprints(*)")
            .order("created_at", { ascending: true });

        if (error) throw error;
        return (data ?? []).map(mapEpicRow);
    }

    async getEpicsList() {
        const supabase = await createClient();
        if (!supabase) return [];

        const { data } = await supabase
            .from("epics")
            .select("id, name, color, status")
            .order("name", { ascending: true });

        return data ?? [];
    }

    async createEpic(data: CreateEpicDTO) {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client unavailable");

        const { data: epic, error } = await supabase
            .from("epics")
            .insert({
                name: data.name,
                description: data.description ?? null,
                stream: data.stream ?? "Plataforma Core",
                status: data.status ?? "planned",
                priority: data.priority ?? "medium",
                color: data.color ?? "blue",
                start_date: data.startDate
                    ? new Date(data.startDate).toISOString().split("T")[0]
                    : null,
                end_date: data.endDate
                    ? new Date(data.endDate).toISOString().split("T")[0]
                    : null,
            })
            .select("*, sprints(*)")
            .single();

        if (error) throw error;
        return mapEpicRow(epic);
    }

    async updateEpic(data: UpdateEpicDTO) {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client unavailable");

        const patch: Record<string, unknown> = {};
        if (data.name !== undefined) patch.name = data.name;
        if (data.description !== undefined) patch.description = data.description ?? null;
        if (data.stream !== undefined) patch.stream = data.stream;
        if (data.status !== undefined) patch.status = data.status;
        if (data.priority !== undefined) patch.priority = data.priority;
        if (data.color !== undefined) patch.color = data.color;
        if ("startDate" in data) patch.start_date = data.startDate ? new Date(data.startDate).toISOString().split("T")[0] : null;
        if ("endDate" in data) patch.end_date = data.endDate ? new Date(data.endDate).toISOString().split("T")[0] : null;

        const { data: epic, error } = await supabase
            .from("epics")
            .update(patch)
            .eq("id", data.id)
            .select("*, sprints(*)")
            .single();

        if (error) throw error;
        return mapEpicRow(epic);
    }

    async linkSprintsToEpic(sprintIds: string[], epicId: string) {
        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase client unavailable");

        const { error } = await supabase
            .from("sprints")
            .update({ epic_id: epicId })
            .in("id", sprintIds);

        if (error) throw error;
        return { count: sprintIds.length };
    }
}

export const roadmapService = new RoadmapService();
