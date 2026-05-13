"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2, Layers, Calendar, Target, Zap, ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import type { Sprint } from "@/types/product";
import { getCurrentUserAction } from "@/lib/actions/auth.actions";
import { accessService, UserAccessInfo } from "@/lib/services/access.service";
import { createEpicAction, linkSprintsToEpicAction, getEpicsAction } from "@/lib/actions/roadmap.actions";

// ─── Types ────────────────────────────────────────────────────
type EpicStatus = "planned" | "in_progress" | "completed" | "delayed";
type EpicPriority = "low" | "medium" | "high";

interface Epic {
  id: string;
  name: string;
  description?: string;
  stream: string;
  status: string;
  priority: string;
  color: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  sprints?: Sprint[];
  objectiveIds?: string[];
}

interface Objective {
  id: string;
  title: string;
  quarter: string;
  epic_id?: string | null;
}

// ─── Constants ────────────────────────────────────────────────
const STREAMS = [
  "Plataforma Core", "APIs e Integrações", "Mobile",
  "Analytics & Dados", "Segurança", "Dados & BI",
];

const COLORS = [
  { id: "blue", bg: "bg-blue-500", hex: "#3b82f6" },
  { id: "purple", bg: "bg-purple-500", hex: "#a855f7" },
  { id: "amber", bg: "bg-amber-500", hex: "#f59e0b" },
  { id: "emerald", bg: "bg-emerald-500", hex: "#10b981" },
  { id: "pink", bg: "bg-pink-500", hex: "#ec4899" },
  { id: "slate", bg: "bg-slate-500", hex: "#64748b" },
  { id: "rose", bg: "bg-rose-500", hex: "#f43f5e" },
  { id: "orange", bg: "bg-orange-500", hex: "#f97316" },
  { id: "teal", bg: "bg-teal-500", hex: "#14b8a6" },
  { id: "indigo", bg: "bg-indigo-500", hex: "#6366f1" },
];

const STATUS_META: Record<EpicStatus, { label: string; color: string }> = {
  planned: { label: "Planejado", color: "text-purple-600 bg-purple-50 border-purple-100" },
  in_progress: { label: "Em Progresso", color: "text-blue-600 bg-blue-50 border-blue-100" },
  completed: { label: "Concluído", color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  delayed: { label: "Atrasado", color: "text-red-600 bg-red-50 border-red-100" },
};

const PRIORITY_META: Record<EpicPriority, { label: string; color: string }> = {
  high: { label: "Alta", color: "text-red-600 bg-red-50 border-red-200" },
  medium: { label: "Média", color: "text-amber-600 bg-amber-50 border-amber-200" },
  low: { label: "Baixa", color: "text-gray-500 bg-gray-50 border-gray-200" },
};

// ─── Timeline helpers ─────────────────────────────────────────
function diffMonths(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function buildTimeline(epics: Epic[]) {
  const now = new Date();
  let minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let maxDate = new Date(now.getFullYear(), now.getMonth() + 10, 1);

  for (const e of epics) {
    if (e.startDate) {
      const d = new Date(e.startDate);
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      if (m < minDate) minDate = m;
    }
    if (e.endDate) {
      const d = new Date(e.endDate);
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      if (m > maxDate) maxDate = m;
    }
  }

  const totalMonths = Math.max(12, diffMonths(minDate, maxDate) + 2);
  const months = Array.from({ length: totalMonths }, (_, i) => {
    const d = new Date(minDate.getFullYear(), minDate.getMonth() + i, 1);
    return { label: d.toLocaleString("pt-BR", { month: "short", year: "2-digit" }), date: d };
  });

  const quarters: { label: string; count: number }[] = [];
  for (const m of months) {
    const q = Math.floor(m.date.getMonth() / 3) + 1;
    const label = `Q${q} ${m.date.getFullYear()}`;
    if (!quarters.length || quarters[quarters.length - 1].label !== label) {
      quarters.push({ label, count: 1 });
    } else {
      quarters[quarters.length - 1].count++;
    }
  }

  return { months, quarters, timelineStart: minDate, totalMonths };
}

function epicPosition(epic: Epic, timelineStart: Date, totalMonths: number) {
  if (!epic.startDate) return null;
  const s = new Date(epic.startDate);
  const e = epic.endDate ? new Date(epic.endDate) : new Date(s.getFullYear(), s.getMonth() + 1, 0);
  const startOff = diffMonths(timelineStart, new Date(s.getFullYear(), s.getMonth(), 1));
  const endOff = diffMonths(timelineStart, new Date(e.getFullYear(), e.getMonth(), 1));
  const cs = Math.max(0, startOff);
  const ce = Math.min(totalMonths - 1, endOff);
  if (ce < cs) return null;
  return {
    left: (cs / totalMonths) * 100,
    width: Math.max(((ce - cs + 1) / totalMonths) * 100, 1),
  };
}

function colorHex(id: string) {
  return COLORS.find((c) => c.id === id)?.hex ?? "#3b82f6";
}
function colorBg(id: string) {
  return COLORS.find((c) => c.id === id)?.bg ?? "bg-blue-500";
}

// Assigns epics into non-overlapping lanes so bars never visually collide.
function buildLanes(streamEpics: Epic[], timelineStart: Date, totalMonths: number): Epic[][] {
  const lanes: Epic[][] = [];
  for (const epic of streamEpics) {
    const pos = epicPosition(epic, timelineStart, totalMonths);
    if (!pos) continue;
    let placed = false;
    for (const lane of lanes) {
      const overlaps = lane.some((e) => {
        const ep = epicPosition(e, timelineStart, totalMonths);
        if (!ep) return false;
        return pos.left < ep.left + ep.width && pos.left + pos.width > ep.left;
      });
      if (!overlaps) { lane.push(epic); placed = true; break; }
    }
    if (!placed) lanes.push([epic]);
  }
  return lanes.length ? lanes : [[]];
}

// ─── Painel de detalhes do Épico (somente leitura) ───────────
function EpicDetailPanel({
  epic,
  allObjectives,
  onClose,
}: {
  epic: Epic;
  allObjectives: Objective[];
  onClose: () => void;
}) {
  const hex = colorHex(epic.color);
  const statusMeta = STATUS_META[epic.status as EpicStatus] ?? STATUS_META.planned;
  const priorityMeta = PRIORITY_META[epic.priority as EpicPriority] ?? PRIORITY_META.medium;
  const linkedObjs = allObjectives.filter((o) => epic.objectiveIds?.includes(o.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e: { stopPropagation(): void }) => e.stopPropagation()}
      >
        {/* Header com cor do épico */}
        <div className="flex items-start justify-between px-6 py-5 shrink-0" style={{ borderBottom: `3px solid ${hex}` }}>
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: hex }} />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-snug">{epic.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{epic.stream}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 ml-3 shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status + Prioridade */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityMeta.color}`}>
              Prioridade {priorityMeta.label}
            </span>
          </div>

          {/* Descrição */}
          {epic.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Descrição</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{epic.description}</p>
            </div>
          )}

          {/* Datas */}
          {(epic.startDate || epic.endDate) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Período no Roadmap</p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar size={13} className="text-blue-500 shrink-0" />
                {epic.startDate && (
                  <span>{new Date(epic.startDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                )}
                {epic.startDate && epic.endDate && <span className="text-gray-400">→</span>}
                {epic.endDate && (
                  <span>{new Date(epic.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                )}
              </div>
            </div>
          )}
          {!epic.startDate && (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
              <AlertCircle size={13} className="shrink-0" />
              Este épico não tem datas definidas e não aparece no timeline.
            </div>
          )}

          {/* Sprints vinculadas */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Sprints vinculadas
              {(epic.sprints?.length ?? 0) > 0 && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px] normal-case">
                  {epic.sprints!.length}
                </span>
              )}
            </p>
            {(epic.sprints?.length ?? 0) === 0 ? (
              <p className="text-xs text-gray-400">Nenhuma sprint vinculada</p>
            ) : (
              <div className="space-y-1.5">
                {epic.sprints!.map((sprint) => (
                  <div key={sprint.id} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
                    <Zap size={11} className="text-blue-500 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{sprint.name}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                      sprint.status === "active" ? "bg-blue-50 text-blue-600" :
                      sprint.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      sprint.status === "review" ? "bg-purple-50 text-purple-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {sprint.status === "active" ? "Ativo" : sprint.status === "completed" ? "Concluído" : sprint.status === "review" ? "Em Review" : "Planejando"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OKRs vinculados */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              OKRs vinculados
              {linkedObjs.length > 0 && (
                <span className="ml-1.5 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-[10px] normal-case">
                  {linkedObjs.length}
                </span>
              )}
            </p>
            {linkedObjs.length === 0 ? (
              <p className="text-xs text-gray-400">Nenhum OKR vinculado</p>
            ) : (
              <div className="space-y-1.5">
                {linkedObjs.map((obj) => (
                  <div key={obj.id} className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
                    <Target size={11} className="text-purple-500 shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{obj.title}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{obj.quarter}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de criação de Épico ────────────────────────────────
const INIT_FORM = {
  title: "", description: "", stream: STREAMS[0],
  status: "planned" as EpicStatus, priority: "medium" as EpicPriority,
  color: "blue", start_date: "", end_date: "",
};

function EpicModal({
  allSprints, allObjectives, onClose, onCreated,
}: {
  allSprints: Sprint[];
  allObjectives: Objective[];
  onClose: () => void;
  onCreated: (epic: Epic, linkedObjIds: string[]) => void;
}) {
  const supabase = createClient();
  const [form, setForm] = useState(INIT_FORM);
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [selectedObjIds, setSelectedObjIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sprintsOpen, setSprintsOpen] = useState(true);
  const [objsOpen, setObjsOpen] = useState(true);

  function toggleSprint(id: string) {
    setSelectedSprintIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }
  function toggleObj(id: string) {
    setSelectedObjIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Título é obrigatório"); return; }
    if (!form.start_date) { setError("Data de início é obrigatória para exibir no timeline"); return; }
    setSaving(true);
    setError("");

    try {
      const result = await createEpicAction({
        name: form.title.trim(),
        description: form.description.trim() || undefined,
        stream: form.stream,
        status: form.status,
        priority: form.priority,
        color: form.color,
        startDate: new Date(form.start_date),
        endDate: form.end_date ? new Date(form.end_date) : undefined,
      });

      if (!result.success) { setError(result.error); return; }

      const epic = result.data;

      // Link sprints
      if (selectedSprintIds.length > 0) {
        await linkSprintsToEpicAction(selectedSprintIds, epic.id);
      }

      // Link objectives via Supabase client
      if (selectedObjIds.length > 0) {
        await supabase
          .from("objectives")
          .update({ epic_id: epic.id })
          .in("id", selectedObjIds);
      }

      const linkedSprints = allSprints.filter((s) => selectedSprintIds.includes(s.id));
      onCreated({ ...epic, sprints: linkedSprints, objectiveIds: selectedObjIds }, selectedObjIds);
    } catch (err: any) {
      setError(err.message || "Erro ao criar épico");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Novo Épico</h2>
            <p className="text-xs text-gray-500 mt-0.5">Vincule sprints, OKRs e defina as datas do roadmap</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Módulo de Pagamentos v2"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Objetivo e escopo deste épico..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
            />
          </div>

          {/* Stream */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stream / Área</label>
            <select
              value={form.stream}
              onChange={(e) => setForm((f) => ({ ...f, stream: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
            >
              {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EpicStatus }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
              >
                {(Object.entries(STATUS_META) as [EpicStatus, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Prioridade</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as EpicPriority }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
              >
                {(Object.entries(PRIORITY_META) as [EpicPriority, { label: string }][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Datas — obrigatório para o timeline */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" />
              Datas no Roadmap *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Início</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Fim</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
            </div>
            <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
              <AlertCircle size={10} />
              A data de início é necessária para o épico aparecer no timeline do roadmap
            </p>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Cor do Épico</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.id} type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.id }))}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    form.color === c.id ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Sprints */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setSprintsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Zap size={13} className="text-blue-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Sprints vinculadas
                  {selectedSprintIds.length > 0 && (
                    <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]">
                      {selectedSprintIds.length}
                    </span>
                  )}
                </span>
              </div>
              {sprintsOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {sprintsOpen && (
              <div className="max-h-40 overflow-y-auto">
                {allSprints.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-3">Nenhuma sprint cadastrada</p>
                ) : (
                  allSprints.map((sprint) => {
                    const checked = selectedSprintIds.includes(sprint.id);
                    return (
                      <label
                        key={sprint.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t border-gray-50 transition-colors ${
                          checked ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox" checked={checked} onChange={() => toggleSprint(sprint.id)}
                          className="accent-blue-600 w-3.5 h-3.5 shrink-0"
                        />
                        <span className="text-sm text-gray-700 flex-1 truncate">{sprint.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                          sprint.status === "active" ? "bg-blue-50 text-blue-600" :
                          sprint.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                          sprint.status === "review" ? "bg-purple-50 text-purple-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {sprint.status === "active" ? "Ativo" : sprint.status === "completed" ? "Concluído" : sprint.status === "review" ? "Em Review" : "Planejando"}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* OKRs */}
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setObjsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Target size={13} className="text-purple-500" />
                <span className="text-xs font-semibold text-gray-700">
                  OKRs vinculados
                  {selectedObjIds.length > 0 && (
                    <span className="ml-1.5 bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full text-[10px]">
                      {selectedObjIds.length}
                    </span>
                  )}
                </span>
              </div>
              {objsOpen ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {objsOpen && (
              <div className="max-h-48 overflow-y-auto">
                {allObjectives.length === 0 ? (
                  <p className="text-xs text-gray-400 px-4 py-3">Nenhum objetivo cadastrado. Crie OKRs primeiro.</p>
                ) : (
                  allObjectives.map((obj) => {
                    const checked = selectedObjIds.includes(obj.id);
                    return (
                      <label
                        key={obj.id}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-t border-gray-50 transition-colors ${
                          checked ? "bg-purple-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox" checked={checked} onChange={() => toggleObj(obj.id)}
                          className="accent-purple-600 w-3.5 h-3.5 shrink-0"
                        />
                        <span className="text-sm text-gray-700 flex-1 truncate">{obj.title}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{obj.quarter}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Criando..." : "Criar Épico"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function RoadmapPage() {
  const supabase = createClient();
  const [epics, setEpics] = useState<Epic[]>([]);
  const [allSprints, setAllSprints] = useState<Sprint[]>([]);
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [user, setUser] = useState<UserAccessInfo | null>(null);

  const canManage = useMemo(() => {
    if (!user) return false;
    return accessService.can(user, "MANAGE_ROADMAP");
  }, [user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [epicData, sprintRes, objRes] = await Promise.all([
        getEpicsAction(),
        supabase.from("sprints").select("*").order("created_at", { ascending: true }),
        supabase.from("objectives").select("id, title, quarter, epic_id").order("created_at", { ascending: true }),
      ]);

      // Enrich epics with their linked objective IDs
      const objs: Objective[] = objRes.data ?? [];
      const enriched = (epicData as Epic[]).map((epic) => ({
        ...epic,
        objectiveIds: objs.filter((o) => o.epic_id === epic.id).map((o) => o.id),
      }));

      setEpics(enriched);
      setAllSprints(sprintRes.data ?? []);
      setAllObjectives(objs);
    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    getCurrentUserAction().then((u) => setUser(u ?? null));
  }, [fetchData]);

  const { months, quarters, timelineStart, totalMonths } = useMemo(
    () => buildTimeline(epics),
    [epics]
  );

  const streams = useMemo(
    () => Array.from(new Set(epics.filter((e) => e.startDate).map((e) => e.stream))),
    [epics]
  );

  const epicsWithoutDates = useMemo(
    () => epics.filter((e) => !e.startDate),
    [epics]
  );

  const stats = useMemo(() => ({
    total: epics.length,
    in_progress: epics.filter((e) => e.status === "in_progress").length,
    completed: epics.filter((e) => e.status === "completed").length,
    delayed: epics.filter((e) => e.status === "delayed").length,
  }), [epics]);

  function handleCreated(epic: Epic, linkedObjIds: string[]) {
    setEpics((prev) => [...prev, { ...epic, objectiveIds: linkedObjIds }]);
    if (epic.sprints?.length) {
      const ids = new Set(epic.sprints.map((s) => s.id));
      setAllSprints((prev) => prev.map((s) => (ids.has(s.id) ? { ...s, epic_id: epic.id } : s)));
    }
    if (linkedObjIds.length) {
      setAllObjectives((prev) => prev.map((o) =>
        linkedObjIds.includes(o.id) ? { ...o, epic_id: epic.id } : o
      ));
    }
    setShowModal(false);
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
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Layers size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Roadmap do Produto</span>
          <span className="text-xs text-gray-400 ml-1">· {epics.length} épicos</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Novo Épico
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total de Épicos", value: stats.total, color: "text-gray-900" },
            { label: "Em Progresso", value: stats.in_progress, color: "text-blue-600" },
            { label: "Concluídos", value: stats.completed, color: "text-emerald-600" },
            { label: "Atrasados", value: stats.delayed, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Timeline (only epics with dates) */}
        {streams.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
              <Calendar size={13} className="text-blue-500" />
              <h2 className="text-sm font-bold text-gray-900">Timeline do Roadmap</h2>
              <span className="text-xs text-gray-400">{epics.filter((e) => e.startDate).length} épicos com datas</span>
            </div>
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${192 + totalMonths * 80}px` }}>
                {/* Quarter headers */}
                <div className="border-b border-gray-100 flex">
                  <div className="w-48 shrink-0 px-5 py-2 border-r border-gray-100 bg-gray-50" />
                  <div className="flex flex-1">
                    {quarters.map((q) => (
                      <div key={q.label} className="text-center py-2 border-r border-gray-100 last:border-r-0 bg-gray-50" style={{ flex: q.count }}>
                        <p className="text-[11px] font-bold text-gray-600">{q.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Month sub-headers */}
                <div className="flex border-b border-gray-100">
                  <div className="w-48 shrink-0 border-r border-gray-100" />
                  {months.map((m, i) => (
                    <div key={i} className="flex-1 text-center py-1.5 border-r border-gray-100 last:border-r-0">
                      <p className="text-[10px] font-medium text-gray-400 capitalize">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Stream rows — lane-based to prevent epic overlap */}
                {streams.map((stream) => {
                  const streamEpics = epics.filter((e) => e.stream === stream && e.startDate);
                  const lanes = buildLanes(streamEpics, timelineStart, totalMonths);
                  return (
                    <div key={stream} className="flex border-b border-gray-100 last:border-b-0">
                      {/* Stream label spans all lanes */}
                      <div
                        className="w-48 shrink-0 px-5 border-r border-gray-100 flex items-center"
                        style={{ minHeight: `${lanes.length * 44}px` }}
                      >
                        <p className="text-xs font-semibold text-gray-700">{stream}</p>
                      </div>
                      {/* One sub-row per lane */}
                      <div className="flex-1 flex flex-col">
                        {lanes.map((lane, laneIdx) => (
                          <div
                            key={laneIdx}
                            className="relative"
                            style={{ height: "44px", borderTop: laneIdx > 0 ? "1px solid #f9fafb" : "none" }}
                          >
                            {/* Month grid lines */}
                            {months.map((_, i) => (
                              <div
                                key={i}
                                className="absolute top-0 bottom-0 border-r border-gray-50"
                                style={{ left: `${(i / totalMonths) * 100}%`, width: `${(1 / totalMonths) * 100}%` }}
                              />
                            ))}
                            {/* Epics in this lane */}
                            {lane.map((epic) => {
                              const pos = epicPosition(epic, timelineStart, totalMonths);
                              if (!pos) return null;
                              const hex = colorHex(epic.color);
                              return (
                                <div
                                  key={epic.id}
                                  className="absolute top-2 bottom-2 px-1 flex items-center"
                                  style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                                >
                                  <div
                                    title={`${epic.name}${epic.sprints?.length ? ` · ${epic.sprints.length} sprint(s)` : ""}${epic.objectiveIds?.length ? ` · ${epic.objectiveIds.length} OKR(s)` : ""}`}
                                    className="rounded-lg px-3 py-1.5 w-full cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
                                    style={{ background: hex }}
                                    onClick={() => setSelectedEpic(epic)}
                                  >
                                    <p className="text-[10px] font-bold text-white leading-snug truncate">{epic.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {(epic.sprints?.length ?? 0) > 0 && (
                                        <span className="text-[9px] text-white/80 flex items-center gap-0.5">
                                          <Zap size={8} />{epic.sprints!.length}
                                        </span>
                                      )}
                                      {(epic.objectiveIds?.length ?? 0) > 0 && (
                                        <span className="text-[9px] text-white/80 flex items-center gap-0.5">
                                          <Target size={8} />{epic.objectiveIds!.length}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : epics.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Layers size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Nenhum épico criado</p>
              <p className="text-sm text-gray-400 mt-1">Crie um épico para visualizar o roadmap timeline</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} /> Criar primeiro épico
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Épicos sem datas não aparecem no timeline</p>
              <p className="text-xs text-amber-600 mt-0.5">
                {epics.length} épico{epics.length > 1 ? "s" : ""} cadastrado{epics.length > 1 ? "s" : ""}, mas nenhum tem data de início definida.
                Edite os épicos abaixo para adicionar datas e visualizar o timeline.
              </p>
            </div>
          </div>
        )}

        {/* Épicos sem datas — aviso */}
        {epicsWithoutDates.length > 0 && streams.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 flex items-center gap-3">
            <AlertCircle size={14} className="text-amber-500 shrink-0" />
            <p className="text-xs text-amber-700">
              <span className="font-semibold">{epicsWithoutDates.length} épico{epicsWithoutDates.length > 1 ? "s" : ""}</span> sem datas definidas — não aparecem no timeline:&nbsp;
              {epicsWithoutDates.map((e) => e.name).join(", ")}
            </p>
          </div>
        )}

        {/* Epic List */}
        {epics.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Todos os Épicos</h2>
              <span className="text-xs text-gray-400">{epics.length} épico{epics.length > 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {epics.map((epic) => {
                const sprintCount = epic.sprints?.length ?? 0;
                const okrCount = epic.objectiveIds?.length ?? 0;
                const statusMeta = STATUS_META[epic.status as EpicStatus] ?? STATUS_META.planned;
                const priorityMeta = PRIORITY_META[epic.priority as EpicPriority] ?? PRIORITY_META.medium;
                return (
                  <div key={epic.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => setSelectedEpic(epic)}>
                    <div className={`w-2 h-10 rounded-full ${colorBg(epic.color)} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{epic.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500">{epic.stream}</span>
                        {epic.startDate && (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar size={9} />
                            {new Date(epic.startDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                            {epic.endDate && ` → ${new Date(epic.endDate).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`}
                          </span>
                        )}
                        {sprintCount > 0 && (
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Zap size={9} /> {sprintCount} sprint{sprintCount > 1 ? "s" : ""}
                          </span>
                        )}
                        {okrCount > 0 && (
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Target size={9} /> {okrCount} OKR{okrCount > 1 ? "s" : ""}
                          </span>
                        )}
                        {!epic.startDate && (
                          <span className="text-[10px] text-amber-500 flex items-center gap-1">
                            <AlertCircle size={9} /> sem datas
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${priorityMeta.color}`}>
                      {priorityMeta.label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <EpicModal
          allSprints={allSprints}
          allObjectives={allObjectives}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedEpic && (
        <EpicDetailPanel
          epic={selectedEpic}
          allObjectives={allObjectives}
          onClose={() => setSelectedEpic(null)}
        />
      )}
    </div>
  );
}
