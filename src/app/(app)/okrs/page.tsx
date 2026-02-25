"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Objective, KeyResult, OKRStatus } from "@/types/product";
import {
  Target,
  Plus,
  ChevronDown,
  ChevronRight,
  Loader2,
  X,
  TrendingUp,
  Check,
  RefreshCw,
} from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────
const QUARTERS = ["Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026"];

const STATUS_CONFIG: Record<OKRStatus, { label: string; color: string; dot: string }> = {
  on_track:  { label: "No Prazo",  color: "text-emerald-600 bg-emerald-50", dot: "bg-emerald-500" },
  at_risk:   { label: "Em Risco",  color: "text-amber-600 bg-amber-50",    dot: "bg-amber-400"  },
  off_track: { label: "Atrasado",  color: "text-red-600 bg-red-50",        dot: "bg-red-500"    },
  completed: { label: "Concluído", color: "text-gray-500 bg-gray-100",     dot: "bg-gray-400"   },
};

// ─── Progress Ring ────────────────────────────────────────────
function Ring({ pct, size = 40 }: { pct: number; size?: number }) {
  const r = size * 0.38;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#f3f4f6" strokeWidth={4} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={4} fill="none"
        strokeDasharray={c} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Check-in Modal ───────────────────────────────────────────
function CheckinModal({
  kr,
  onClose,
  onSave,
}: {
  kr: KeyResult;
  onClose: () => void;
  onSave: (value: number, note: string) => void;
}) {
  const [value, setValue] = useState(String(kr.current_value));
  const [note, setNote] = useState("");
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">Check-in de Progresso</h3>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{kr.title}</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Valor atual ({kr.unit})
            </label>
            <input
              autoFocus
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder={String(kr.target_value)}
            />
            <p className="text-[10px] text-gray-400 mt-1">Meta: {kr.target_value}{kr.unit}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Nota (opcional)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400 resize-none"
              placeholder="O que mudou?"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(parseFloat(value) || 0, note)}
            className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700"
          >
            Salvar Check-in
          </button>
          <button onClick={onClose} className="px-4 text-sm text-gray-500 hover:text-gray-700">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function OKRsPage() {
  const supabase = createClient();

  const [quarter, setQuarter] = useState("Q1 2026");
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [checkingIn, setCheckingIn] = useState<KeyResult | null>(null);

  // New objective form
  const [addingObj, setAddingObj] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState("");

  // New KR form per objective
  const [addingKRFor, setAddingKRFor] = useState<string | null>(null);
  const [newKRTitle, setNewKRTitle] = useState("");
  const [newKRTarget, setNewKRTarget] = useState("100");
  const [newKRUnit, setNewKRUnit] = useState("%");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: objs } = await supabase
      .from("objectives")
      .select("*, key_results(*)")
      .eq("quarter", quarter)
      .order("created_at", { ascending: true });
    setObjectives(objs ?? []);
    if (objs && objs.length > 0) {
      setExpanded(new Set(objs.map((o: Objective) => o.id)));
    }
    setLoading(false);
  }, [supabase, quarter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function createObjective() {
    if (!newObjTitle.trim()) return;
    const { data } = await supabase
      .from("objectives")
      .insert({ title: newObjTitle.trim(), quarter, status: "on_track" })
      .select()
      .single();
    if (data) setObjectives((prev) => [...prev, { ...data, key_results: [] }]);
    setNewObjTitle("");
    setAddingObj(false);
  }

  async function deleteObjective(id: string) {
    await supabase.from("objectives").delete().eq("id", id);
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  }

  async function createKR(objectiveId: string) {
    if (!newKRTitle.trim()) return;
    const { data } = await supabase
      .from("key_results")
      .insert({
        title: newKRTitle.trim(),
        objective_id: objectiveId,
        target_value: parseFloat(newKRTarget) || 100,
        current_value: 0,
        unit: newKRUnit,
        status: "on_track",
      })
      .select()
      .single();
    if (data) {
      setObjectives((prev) =>
        prev.map((o) =>
          o.id === objectiveId
            ? { ...o, key_results: [...(o.key_results ?? []), data] }
            : o
        )
      );
    }
    setNewKRTitle("");
    setNewKRTarget("100");
    setAddingKRFor(null);
  }

  async function deleteKR(objectiveId: string, krId: string) {
    await supabase.from("key_results").delete().eq("id", krId);
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === objectiveId
          ? { ...o, key_results: (o.key_results ?? []).filter((kr) => kr.id !== krId) }
          : o
      )
    );
  }

  async function saveCheckin(kr: KeyResult, value: number, note: string) {
    // Insert check-in record
    await supabase.from("checkins").insert({
      key_result_id: kr.id,
      value,
      note: note || null,
    });

    // Update KR current value
    const newStatus: OKRStatus =
      value >= kr.target_value ? "completed"
      : value / kr.target_value >= 0.7 ? "on_track"
      : value / kr.target_value >= 0.4 ? "at_risk"
      : "off_track";

    await supabase
      .from("key_results")
      .update({ current_value: value, status: newStatus })
      .eq("id", kr.id);

    setObjectives((prev) =>
      prev.map((o) => ({
        ...o,
        key_results: (o.key_results ?? []).map((k) =>
          k.id === kr.id ? { ...k, current_value: value, status: newStatus } : k
        ),
      }))
    );
    setCheckingIn(null);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function objProgress(obj: Objective) {
    const krs = obj.key_results ?? [];
    if (krs.length === 0) return 0;
    const avg = krs.reduce((s, kr) => s + Math.min(100, (kr.current_value / (kr.target_value || 1)) * 100), 0) / krs.length;
    return Math.round(avg);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  const overallProgress = objectives.length
    ? Math.round(objectives.reduce((s, o) => s + objProgress(o), 0) / objectives.length)
    : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Target size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">OKRs & Metas</span>
        </div>

        {/* Quarter selector */}
        <div className="flex gap-1">
          {QUARTERS.map((q) => (
            <button
              key={q}
              onClick={() => setQuarter(q)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                quarter === q ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="font-semibold">{overallProgress}%</span>
            <span>progresso geral</span>
          </div>
          <button
            onClick={() => setAddingObj(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-700"
          >
            <Plus size={13} /> Objetivo
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* New objective form */}
        {addingObj && (
          <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-sm">
            <input
              autoFocus
              value={newObjTitle}
              onChange={(e) => setNewObjTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createObjective(); if (e.key === "Escape") setAddingObj(false); }}
              placeholder="Título do objetivo…"
              className="w-full text-sm font-medium outline-none placeholder-gray-400 text-gray-800 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={createObjective} disabled={!newObjTitle.trim()} className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                Criar Objetivo
              </button>
              <button onClick={() => setAddingObj(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {objectives.length === 0 && !addingObj ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Target size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Sem objetivos em {quarter}</p>
              <p className="text-sm text-gray-400 mt-1">Crie um objetivo para começar</p>
            </div>
            <button onClick={() => setAddingObj(true)} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700">
              Criar Objetivo
            </button>
          </div>
        ) : (
          objectives.map((obj) => {
            const pct = objProgress(obj);
            const isOpen = expanded.has(obj.id);
            const st = STATUS_CONFIG[obj.status];
            return (
              <div key={obj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Objective header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpand(obj.id)}
                >
                  <Ring pct={pct} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900 truncate">{obj.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(obj.key_results ?? []).length} Key Results · {pct}% concluído
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteObjective(obj.id); }}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                    {isOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  </div>
                </div>

                {/* Key Results */}
                {isOpen && (
                  <div className="border-t border-gray-50 px-4 pb-4 space-y-2 pt-3">
                    {(obj.key_results ?? []).map((kr) => {
                      const krPct = Math.min(100, Math.round((kr.current_value / (kr.target_value || 1)) * 100));
                      const krSt = STATUS_CONFIG[kr.status];
                      return (
                        <div key={kr.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50/70 group">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-semibold text-gray-700 truncate">{kr.title}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${krSt.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full inline-block ${krSt.dot}`} />
                                {krSt.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${krPct}%`,
                                    background: krPct >= 70 ? "#22c55e" : krPct >= 40 ? "#f59e0b" : "#ef4444",
                                  }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 shrink-0">
                                {kr.current_value}{kr.unit} / {kr.target_value}{kr.unit}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => setCheckingIn(kr)}
                              className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                            >
                              <RefreshCw size={10} /> Check-in
                            </button>
                            <button
                              onClick={() => deleteKR(obj.id, kr.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Add KR form */}
                    {addingKRFor === obj.id ? (
                      <div className="bg-white rounded-xl border border-blue-200 p-3 space-y-2">
                        <input
                          autoFocus
                          value={newKRTitle}
                          onChange={(e) => setNewKRTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Escape") setAddingKRFor(null); }}
                          placeholder="Título do Key Result…"
                          className="w-full text-xs outline-none placeholder-gray-400 text-gray-800"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={newKRTarget}
                            onChange={(e) => setNewKRTarget(e.target.value)}
                            className="w-20 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                            placeholder="Meta"
                          />
                          <input
                            value={newKRUnit}
                            onChange={(e) => setNewKRUnit(e.target.value)}
                            className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                            placeholder="Unidade"
                          />
                          <button
                            onClick={() => createKR(obj.id)}
                            disabled={!newKRTitle.trim()}
                            className="flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Check size={11} /> Salvar
                          </button>
                          <button onClick={() => setAddingKRFor(null)} className="text-xs text-gray-400 hover:text-gray-600">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingKRFor(obj.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors py-1"
                      >
                        <Plus size={12} /> Adicionar Key Result
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {checkingIn && (
        <CheckinModal
          kr={checkingIn}
          onClose={() => setCheckingIn(null)}
          onSave={(v, n) => saveCheckin(checkingIn, v, n)}
        />
      )}
    </div>
  );
}
