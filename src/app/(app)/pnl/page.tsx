"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { DollarSign, RefreshCw, Loader2, TrendingUp, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { calcGEM, calcAIRpct, gateR1, gateR2, gateR3 } from "@/lib/services/pnl.service";
import { computeEpicGatesAction } from "@/lib/actions/pnl.actions";
import type { GateStatus } from "@/lib/services/pnl.service";

// ─── Types ────────────────────────────────────────────────────

interface EpicPnlRow {
  id: string;
  name: string;
  stream: string;
  status: string;
  fixed_cost_estimado: number;
  receita_desbloqueada: number;
  air_estimado: number;
  rice_score: number;
  moat_classificacao: string | null;
  tipo_produto: string | null;
}

interface GateCheckRow {
  epic_id: string;
  gate_code: string;
  status: GateStatus;
  computed_value: number | null;
  note: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────

const GATE_ICON: Record<GateStatus, React.ReactNode> = {
  pass:    <CheckCircle  size={13} className="text-emerald-500 shrink-0" />,
  warn:    <AlertTriangle size={13} className="text-amber-500  shrink-0" />,
  fail:    <XCircle      size={13} className="text-red-500    shrink-0" />,
  pending: <Clock        size={13} className="text-gray-400   shrink-0" />,
};

const GATE_BG: Record<GateStatus, string> = {
  pass:    "bg-emerald-50 border-emerald-100",
  warn:    "bg-amber-50  border-amber-100",
  fail:    "bg-red-50    border-red-100",
  pending: "bg-gray-50   border-gray-100",
};

const STATUS_COLOR: Record<string, string> = {
  planned:     "text-purple-600 bg-purple-50",
  in_progress: "text-blue-600   bg-blue-50",
  completed:   "text-emerald-600 bg-emerald-50",
  delayed:     "text-red-600    bg-red-50",
};
const STATUS_LABEL: Record<string, string> = {
  planned: "Planejado", in_progress: "Em Progresso", completed: "Concluído", delayed: "Atrasado",
};

const DOT: Record<GateStatus, string> = {
  pass: "bg-emerald-400", warn: "bg-amber-400", fail: "bg-red-400", pending: "bg-gray-300",
};

function fmtBRL(v: number) {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Page ─────────────────────────────────────────────────────

export default function PnlPage() {
  const supabase = createClient();
  const [epics, setEpics] = useState<EpicPnlRow[]>([]);
  const [gates, setGates] = useState<GateCheckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: epicData }, { data: gateData }] = await Promise.all([
      supabase
        .from("epics")
        .select("id, name, stream, status, fixed_cost_estimado, receita_desbloqueada, air_estimado, rice_score, moat_classificacao, tipo_produto")
        .order("created_at", { ascending: true }),
      supabase.from("epic_gate_checks").select("*"),
    ]);
    setEpics((epicData ?? []).map((e: any) => ({
      ...e,
      fixed_cost_estimado:  Number(e.fixed_cost_estimado  ?? 0),
      receita_desbloqueada: Number(e.receita_desbloqueada ?? 0),
      air_estimado:         Number(e.air_estimado         ?? 0),
      rice_score:           Number(e.rice_score           ?? 0),
    })));
    setGates((gateData ?? []) as GateCheckRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCompute(epicId: string) {
    setComputing(epicId);
    const result = await computeEpicGatesAction(epicId);
    if (result.success) {
      setGates((prev) => [
        ...prev.filter((g) => g.epic_id !== epicId),
        ...result.gates,
      ]);
    }
    setComputing(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
          <DollarSign size={14} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900">P&amp;L de Produto</span>
          <span className="text-xs text-gray-400 ml-2">· Inteligência econômica por épico</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> pass</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />  warn</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />    fail</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />  pending</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-3">
        {epics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <DollarSign size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-semibold">Nenhum épico cadastrado</p>
            <p className="text-xs mt-1">Crie épicos no Roadmap para visualizar o P&amp;L</p>
          </div>
        ) : (
          epics.map((epic) => {
            const epicGates = gates.filter((g) => g.epic_id === epic.id);
            const receita   = epic.receita_desbloqueada;
            const fixed     = epic.fixed_cost_estimado;
            const airPct    = epic.air_estimado / 100;
            const aiCogs    = receita * airPct;
            const gem       = calcGEM(receita, fixed, aiCogs);
            const airCalc   = calcAIRpct(receita, aiCogs);
            const hasPnl    = receita > 0 || fixed > 0 || epic.rice_score > 0;

            const gemStatus  = gateR3(gem);
            const airStatus  = gateR2(airCalc);
            const riceStatus = gateR1(epic.rice_score);

            const isExpanded = expandedId === epic.id;
            const isComputing = computing === epic.id;

            return (
              <div
                key={epic.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId((v) => v === epic.id ? null : epic.id)}
                >
                  {/* Epic info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-gray-900 truncate">{epic.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${STATUS_COLOR[epic.status] ?? "text-gray-500 bg-gray-50"}`}>
                        {STATUS_LABEL[epic.status] ?? epic.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{epic.stream}</p>
                  </div>

                  {/* P&L metrics */}
                  {hasPnl ? (
                    <div className="flex items-center gap-5 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${DOT[gemStatus]}`} />
                          <span className="text-sm font-bold text-gray-800">{(gem * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-[10px] text-gray-400">GEM</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${DOT[airStatus]}`} />
                          <span className="text-sm font-bold text-gray-800">{(airCalc * 100).toFixed(1)}%</span>
                        </div>
                        <p className="text-[10px] text-gray-400">AIR%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${DOT[riceStatus]}`} />
                          <span className="text-sm font-bold text-gray-800">{epic.rice_score}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">RICE</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic shrink-0">sem dados financeiros</span>
                  )}

                  {/* Gate pills */}
                  <div className="flex items-center gap-1 shrink-0">
                    {epicGates.length === 0 ? (
                      <span className="text-[10px] text-gray-400 italic">gates não computados</span>
                    ) : (
                      epicGates.map((g) => (
                        <div key={g.gate_code} className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${GATE_BG[g.status]}`}>
                          {GATE_ICON[g.status]}
                          <span>{g.gate_code}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Compute button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCompute(epic.id); }}
                    disabled={isComputing}
                    title="Recomputar gates"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 shrink-0"
                  >
                    {isComputing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  </button>
                </div>

                {/* Expanded gate details */}
                {isExpanded && (
                  <div className="border-t border-gray-50 px-5 py-4">
                    {hasPnl && (
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-[10px] text-gray-400 mb-0.5">Receita desbloqueada</p>
                          <p className="text-sm font-bold text-gray-800">R$ {fmtBRL(receita)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-[10px] text-gray-400 mb-0.5">Custo fixo estimado</p>
                          <p className="text-sm font-bold text-gray-800">R$ {fmtBRL(fixed)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                          <p className="text-[10px] text-gray-400 mb-0.5">Moat</p>
                          <p className="text-sm font-bold text-gray-800 capitalize">{epic.moat_classificacao?.replace(/_/g, " ") ?? "—"}</p>
                        </div>
                      </div>
                    )}

                    {epicGates.length === 0 ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>Clique em <RefreshCw size={10} className="inline" /> para computar os gates deste épico.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {epicGates.map((g) => (
                          <div key={g.gate_code} className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${GATE_BG[g.status]}`}>
                            {GATE_ICON[g.status]}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-700">{g.gate_code}</p>
                              {g.note && <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{g.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Alert banner: AIR > 40% warning */}
      {epics.some((e) => {
        const air = e.air_estimado / 100;
        const aiCogs = e.receita_desbloqueada * air;
        return calcAIRpct(e.receita_desbloqueada, aiCogs) > 0.40;
      }) && (
        <div className="shrink-0 mx-6 mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs text-red-700">
          <AlertTriangle size={14} className="text-red-500 shrink-0" />
          <span>
            <strong>Atenção:</strong> um ou mais épicos possuem AIR% acima de 40% — risco de modelo AI inviável.
            Revise os custos de IA nas configurações do épico.
          </span>
        </div>
      )}
    </div>
  );
}
