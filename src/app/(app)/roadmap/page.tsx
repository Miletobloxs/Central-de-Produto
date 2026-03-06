"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Loader2, Layers } from "lucide-react";
import type { Sprint } from "@/types/product";

// ─── Local types ──────────────────────────────────────────────
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
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  sprints?: Sprint[];
}

// ─── Constants ────────────────────────────────────────────────
const STREAMS = [
  "Plataforma Core",
  "APIs e Integrações",
  "Mobile",
  "Analytics & Dados",
  "Segurança",
  "Dados & BI",
];

const COLORS = [
  { id: "blue", bg: "bg-blue-500" },
  { id: "purple", bg: "bg-purple-500" },
  { id: "amber", bg: "bg-amber-500" },
  { id: "emerald", bg: "bg-emerald-500" },
  { id: "pink", bg: "bg-pink-500" },
  { id: "slate", bg: "bg-slate-500" },
  { id: "rose", bg: "bg-rose-500" },
  { id: "orange", bg: "bg-orange-500" },
  { id: "teal", bg: "bg-teal-500" },
  { id: "indigo", bg: "bg-indigo-500" },
];

const STATUS_META: Record<EpicStatus, { label: string; color: string }> = {
  planned: { label: "Planejado", color: "text-purple-600 bg-purple-50" },
  in_progress: { label: "Em Progresso", color: "text-blue-600 bg-blue-50" },
  completed: { label: "Concluído", color: "text-emerald-600 bg-emerald-50" },
  delayed: { label: "Atrasado", color: "text-red-600 bg-red-50" },
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
  let minDate = new Date(now.getFullYear(), now.getMonth(), 1);
  let maxDate = new Date(now.getFullYear(), now.getMonth() + 11, 1);

  for (const e of epics) {
    if (e.start_date) {
      const d = new Date(e.start_date);
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      if (m < minDate) minDate = m;
    }
    if (e.end_date) {
      const d = new Date(e.end_date);
      const m = new Date(d.getFullYear(), d.getMonth(), 1);
      if (m > maxDate) maxDate = m;
    }
  }

  const totalMonths = Math.max(12, diffMonths(minDate, maxDate) + 1);
  const months = Array.from({ length: totalMonths }, (_, i) => {
    const d = new Date(minDate.getFullYear(), minDate.getMonth() + i, 1);
    return { label: d.toLocaleString("pt-BR", { month: "short" }), date: d };
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
  if (!epic.start_date) return null;
  const s = new Date(epic.start_date);
  const e = epic.end_date
    ? new Date(epic.end_date)
    : new Date(s.getFullYear(), s.getMonth() + 1, 0);
  const startOff = diffMonths(timelineStart, new Date(s.getFullYear(), s.getMonth(), 1));
  const endOff = diffMonths(timelineStart, new Date(e.getFullYear(), e.getMonth(), 1));
  const cs = Math.max(0, startOff);
  const ce = Math.min(totalMonths - 1, endOff);
  if (ce < 0 || cs >= totalMonths) return null;
  return {
    left: (cs / totalMonths) * 100,
    width: ((ce - cs + 1) / totalMonths) * 100,
  };
}

function colorBg(id: string) {
  return COLORS.find((c) => c.id === id)?.bg ?? "bg-blue-500";
}

// ─── EpicModal ────────────────────────────────────────────────
const INIT_FORM = {
  title: "",
  description: "",
  stream: STREAMS[0],
  status: "planned" as EpicStatus,
  priority: "medium" as EpicPriority,
  color: "blue",
  start_date: "",
  end_date: "",
};

import { createEpicAction, linkSprintsToEpicAction, getEpicsAction } from "@/lib/actions/roadmap.actions";

function EpicModal({
  allSprints,
  onClose,
  onCreated,
}: {
  allSprints: Sprint[];
  onClose: () => void;
  onCreated: (epic: Epic) => void;
}) {
  const [form, setForm] = useState(INIT_FORM);
  const [selectedSprintIds, setSelectedSprintIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toggleSprint(id: string) {
    setSelectedSprintIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    setError("");

    try {
      const epic = await createEpicAction({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        stream: form.stream,
        status: form.status as any,
        priority: form.priority,
        color: form.color,
        startDate: form.start_date ? new Date(form.start_date) : undefined,
        endDate: form.end_date ? new Date(form.end_date) : undefined,
      });

      if (selectedSprintIds.length > 0) {
        await linkSprintsToEpicAction(selectedSprintIds, epic.id);
      }

      const linkedSprints = allSprints.filter((s) => selectedSprintIds.includes(s.id));
      onCreated({ ...epic, sprints: linkedSprints } as any);
    } catch (err: any) {
      setError(err.message || "Erro ao criar épico");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Novo Épico</h2>
            <p className="text-xs text-gray-500 mt-0.5">Defina o épico e associe sprints</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Módulo de Pagamentos v2"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Objetivo e escopo deste épico..."
              rows={3}
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

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Data de Início</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Data de Fim</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Cor do Épico</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c.id }))}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${form.color === c.id
                    ? "ring-2 ring-offset-2 ring-gray-500 scale-110"
                    : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Sprints */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sprints associadas
            </label>
            <p className="text-[11px] text-gray-400 mb-2">
              Uma sprint pertence a apenas um épico. Você pode vincular várias sprints a este épico.
            </p>
            {allSprints.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Nenhuma sprint cadastrada ainda</p>
            ) : (
              <div className="border border-gray-100 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                {allSprints.map((sprint) => {
                  const checked = selectedSprintIds.includes(sprint.id);
                  const takenByOther = sprint.epic_id && !checked;
                  return (
                    <label
                      key={sprint.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${checked ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSprint(sprint.id)}
                        className="accent-blue-600 w-3.5 h-3.5 shrink-0"
                      />
                      <span className="text-sm text-gray-700 flex-1 truncate">{sprint.name}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${sprint.status === "active" ? "bg-blue-50 text-blue-600" :
                        sprint.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                        {sprint.status === "active" ? "Ativo" : sprint.status === "completed" ? "Concluído" : "Planejando"}
                      </span>
                      {takenByOther && (
                        <span className="text-[10px] text-amber-500 font-medium shrink-0">vinculada</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Criar Épico"}
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
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const epicData = await getEpicsAction();
      // Sprints ainda podem vir separadas se quisermos todas as sprints (mesmo sem épico)
      // para o modal de criação. No futuro podemos ter um SprintService.
      const supabase = createClient();
      const { data: sprintData } = await supabase.from("sprints").select("*").order("created_at", { ascending: true });

      setEpics(epicData as any);
      setAllSprints(sprintData ?? []);
    } catch (error) {
      console.error("Error fetching roadmap data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const { months, quarters, timelineStart, totalMonths } = useMemo(
    () => buildTimeline(epics),
    [epics]
  );

  const streams = useMemo(() => Array.from(new Set(epics.map((e) => e.stream))), [epics]);

  const stats = useMemo(() => ({
    total: epics.length,
    in_progress: epics.filter((e) => e.status === "in_progress").length,
    completed: epics.filter((e) => e.status === "completed").length,
    delayed: epics.filter((e) => e.status === "delayed").length,
  }), [epics]);

  function handleCreated(epic: Epic) {
    setEpics((prev) => [...prev, epic]);
    if (epic.sprints?.length) {
      const ids = new Set(epic.sprints.map((s) => s.id));
      setAllSprints((prev) =>
        prev.map((s) => (ids.has(s.id) ? { ...s, epic_id: epic.id } : s))
      );
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
          <span className="text-xs text-gray-400 ml-1">· Visão trimestral por épicos</span>
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

        {/* Timeline */}
        {epics.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: `${192 + totalMonths * 80}px` }}>
                {/* Quarter headers */}
                <div className="border-b border-gray-100 flex">
                  <div className="w-48 shrink-0 px-5 py-3 border-r border-gray-100 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stream</p>
                  </div>
                  <div className="flex flex-1">
                    {quarters.map((q) => (
                      <div
                        key={q.label}
                        className="text-center py-3 border-r border-gray-100 last:border-r-0 bg-gray-50"
                        style={{ flex: q.count }}
                      >
                        <p className="text-xs font-bold text-gray-700">{q.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Month sub-headers */}
                <div className="flex border-b border-gray-100">
                  <div className="w-48 shrink-0 border-r border-gray-100" />
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 text-center py-2 border-r border-gray-100 last:border-r-0"
                    >
                      <p className="text-[10px] font-medium text-gray-400 capitalize">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Stream rows */}
                {streams.map((stream) => {
                  const streamEpics = epics.filter((e) => e.stream === stream);
                  return (
                    <div key={stream} className="flex border-b border-gray-100 last:border-b-0 min-h-16">
                      <div className="w-48 shrink-0 px-5 py-4 border-r border-gray-100 flex items-center">
                        <p className="text-xs font-semibold text-gray-700">{stream}</p>
                      </div>
                      <div className="flex flex-1 relative py-3">
                        {months.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-gray-50 last:border-r-0" />
                        ))}
                        {streamEpics.map((epic) => {
                          const pos = epicPosition(epic, timelineStart, totalMonths);
                          if (!pos) return null;
                          return (
                            <div
                              key={epic.id}
                              className="absolute top-3 bottom-3 px-1 flex items-center"
                              style={{ left: `${pos.left}%`, width: `${pos.width}%` }}
                            >
                              <div
                                title={epic.name}
                                className={`${colorBg(epic.color)} rounded-lg px-3 py-1.5 w-full cursor-pointer opacity-90 hover:opacity-100 transition-opacity shadow-sm`}
                              >
                                <p className="text-[10px] font-bold text-white leading-snug truncate">
                                  {epic.name}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Epic list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Todos os Épicos</h2>
          </div>

          {epics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Layers size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold">Nenhum épico criado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Épicos agrupam sprints em iniciativas maiores do roadmap
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
              >
                <Plus size={14} />
                Criar primeiro épico
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {epics.map((epic) => {
                const sprintCount = epic.sprints?.length ?? 0;
                return (
                  <div
                    key={epic.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className={`w-2 h-8 rounded-full ${colorBg(epic.color)} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{epic.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {epic.stream}
                        {sprintCount > 0 && ` · ${sprintCount} sprint${sprintCount > 1 ? "s" : ""}`}
                        {epic.start_date && ` · ${new Date(epic.start_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`}
                        {epic.end_date && ` → ${new Date(epic.end_date).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}`}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${(PRIORITY_META[epic.priority as EpicPriority] ?? PRIORITY_META.medium).color}`}>
                      {(PRIORITY_META[epic.priority as EpicPriority] ?? PRIORITY_META.medium).label}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${(STATUS_META[epic.status as EpicStatus] ?? STATUS_META.planned).color}`}>
                      {(STATUS_META[epic.status as EpicStatus] ?? STATUS_META.planned).label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <EpicModal
          allSprints={allSprints}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
