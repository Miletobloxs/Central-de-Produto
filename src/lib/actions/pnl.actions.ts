"use server";

import { createClient } from "@/lib/supabase/server";
import { computeAllGates } from "@/lib/services/pnl.service";
import { revalidatePath } from "next/cache";

export async function computeEpicGatesAction(
  epicId: string,
): Promise<{ success: true; gates: any[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase client unavailable");

    // Fetch epic P&L fields
    const { data: epic, error: epicErr } = await supabase
      .from("epics")
      .select("id, fixed_cost_estimado, receita_desbloqueada, air_estimado, moat_classificacao, clientes_vinculados, rice_score")
      .eq("id", epicId)
      .single();

    if (epicErr || !epic) return { success: false, error: "Épico não encontrado." };

    // Fetch sprints to get kpi_negocio_alvo
    const { data: sprints } = await supabase
      .from("sprints")
      .select("kpi_negocio_alvo")
      .eq("epic_id", epicId);
    const kpiNegocioAlvo = (sprints ?? []).find((s: any) => s.kpi_negocio_alvo)?.kpi_negocio_alvo ?? null;

    // Fetch commercial clients to check G6
    const clientIds: string[] = epic.clientes_vinculados ?? [];
    let clientsWithContract: string[] = [];
    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from("commercial_clients")
        .select("id, contract_signed_at")
        .in("id", clientIds);
      clientsWithContract = (clients ?? [])
        .filter((c: any) => c.contract_signed_at)
        .map((c: any) => c.id);
    }

    const receita = Number(epic.receita_desbloqueada ?? 0);
    const fixed   = Number(epic.fixed_cost_estimado  ?? 0);
    const air     = Number(epic.air_estimado ?? 0);
    const aiCogs  = receita * (air / 100);

    const results = computeAllGates({
      riceScore: Number(epic.rice_score ?? 0),
      receita,
      fixed,
      aiCogs,
      moatClassificacao: epic.moat_classificacao,
      kpiNegocioAlvo,
      clientesVinculados: clientIds,
      clientsWithContract,
    });

    // Upsert gate checks (delete existing + insert fresh)
    await supabase.from("epic_gate_checks").delete().eq("epic_id", epicId);
    const rows = results.map((g) => ({
      epic_id:       epicId,
      gate_code:     g.code,
      status:        g.status,
      computed_value: g.computedValue ?? null,
      note:          g.note,
    }));
    const { data: inserted, error: insertErr } = await supabase
      .from("epic_gate_checks")
      .insert(rows)
      .select();

    if (insertErr) throw insertErr;

    revalidatePath("/pnl");
    return { success: true, gates: inserted ?? [] };
  } catch (err: any) {
    console.error("[computeEpicGatesAction]", err);
    return { success: false, error: err.message || "Erro ao computar gates." };
  }
}

export async function getEpicGatesAction(
  epicId: string,
): Promise<{ success: true; gates: any[] } | { success: false; error: string }> {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase client unavailable");

    const { data, error } = await supabase
      .from("epic_gate_checks")
      .select("*")
      .eq("epic_id", epicId)
      .order("gate_code");

    if (error) throw error;
    return { success: true, gates: data ?? [] };
  } catch (err: any) {
    console.error("[getEpicGatesAction]", err);
    return { success: false, error: err.message || "Erro ao buscar gates." };
  }
}
