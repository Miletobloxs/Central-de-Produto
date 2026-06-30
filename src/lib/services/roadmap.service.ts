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
    // P&L fields (028_pnl_fields.sql)
    fixedCostEstimado?: number;
    receitaDesbloqueada?: number;
    airEstimado?: number;
    tipoCustoDominante?: string;
    moatClassificacao?: string;
    tipoProduto?: string;
    clientesVinculados?: string[];
    riceScore?: number;
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
        // P&L fields
        fixedCostEstimado: row.fixed_cost_estimado != null ? Number(row.fixed_cost_estimado) : 0,
        receitaDesbloqueada: row.receita_desbloqueada != null ? Number(row.receita_desbloqueada) : 0,
        airEstimado: row.air_estimado != null ? Number(row.air_estimado) : 0,
        tipoCustoDominante: row.tipo_custo_dominante ?? null,
        moatClassificacao: row.moat_classificacao ?? null,
        tipoProduto: row.tipo_produto ?? null,
        clientesVinculados: row.clientes_vinculados ?? [],
        riceScore: row.rice_score != null ? Number(row.rice_score) : 0,
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
                ...(data.fixedCostEstimado !== undefined && { fixed_cost_estimado: data.fixedCostEstimado }),
                ...(data.receitaDesbloqueada !== undefined && { receita_desbloqueada: data.receitaDesbloqueada }),
                ...(data.airEstimado !== undefined && { air_estimado: data.airEstimado }),
                ...(data.tipoCustoDominante !== undefined && { tipo_custo_dominante: data.tipoCustoDominante }),
                ...(data.moatClassificacao !== undefined && { moat_classificacao: data.moatClassificacao }),
                ...(data.tipoProduto !== undefined && { tipo_produto: data.tipoProduto }),
                ...(data.clientesVinculados !== undefined && { clientes_vinculados: data.clientesVinculados }),
                ...(data.riceScore !== undefined && { rice_score: data.riceScore }),
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
        // P&L patch fields
        if (data.fixedCostEstimado !== undefined) patch.fixed_cost_estimado = data.fixedCostEstimado;
        if (data.receitaDesbloqueada !== undefined) patch.receita_desbloqueada = data.receitaDesbloqueada;
        if (data.airEstimado !== undefined) patch.air_estimado = data.airEstimado;
        if (data.tipoCustoDominante !== undefined) patch.tipo_custo_dominante = data.tipoCustoDominante;
        if (data.moatClassificacao !== undefined) patch.moat_classificacao = data.moatClassificacao;
        if (data.tipoProduto !== undefined) patch.tipo_produto = data.tipoProduto;
        if (data.clientesVinculados !== undefined) patch.clientes_vinculados = data.clientesVinculados;
        if (data.riceScore !== undefined) patch.rice_score = data.riceScore;

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
