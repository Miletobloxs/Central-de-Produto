"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ChevronRight, Star, AlertTriangle, TrendingUp, Plus, X,
  Loader2, Clock, Edit2, Zap,
} from "lucide-react";
import type { Sprint, Task } from "@/types/product";

// ─── Types ────────────────────────────────────────────────────
interface ReviewHighlight {
  member: string;
  highlight: string;
}

interface ReviewFormData {
  theme: string;
  blockers: string[];
  learnings: string[];
  highlights: ReviewHighlight[];
  next_theme: string;
  next_items: string[];
}

interface SprintReviewRow extends ReviewFormData {
  id: string;
  sprint_id: string;
}

const INIT_FORM: ReviewFormData = {
  theme: "",
  blockers: [],
  learnings: [],
  highlights: [],
  next_theme: "",
  next_items: [],
};

// ─── ArrayInput ───────────────────────────────────────────────
function ArrayInput({
  label, items, onChange, placeholder,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
            <p className="text-xs text-gray-700 flex-1 leading-relaxed">{item}</p>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0"
            >
              <X size={11} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
        >
          + Add
        </button>
      </div>
    </div>
  );
}

// ─── ReviewEditor (drawer) ────────────────────────────────────
function ReviewEditor({
  sprint, initial, onSave, onClose,
}: {
  sprint: Sprint;
  initial: ReviewFormData;
  onSave: (data: ReviewFormData) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ReviewFormData>(initial);
  const [newMember, setNewMember] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ReviewFormData>(key: K, val: ReviewFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addHighlight() {
    if (!newMember.trim() || !newHighlight.trim()) return;
    set("highlights", [...form.highlights, { member: newMember.trim(), highlight: newHighlight.trim() }]);
    setNewMember("");
    setNewHighlight("");
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm">
      <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Review da Sprint</h2>
            <p className="text-xs text-gray-500 mt-0.5">{sprint.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tema / Foco da Sprint</label>
            <input
              value={form.theme}
              onChange={(e) => set("theme", e.target.value)}
              placeholder="Ex: Performance & Estabilidade"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <ArrayInput
            label="Blockers"
            items={form.blockers}
            onChange={(v) => set("blockers", v)}
            placeholder="Descreva um blocker que ocorreu..."
          />

          <ArrayInput
            label="Aprendizados"
            items={form.learnings}
            onChange={(v) => set("learnings", v)}
            placeholder="O que a equipe aprendeu nesta sprint?"
          />

          {/* Highlights */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Destaques do Time</label>
            <div className="space-y-2 mb-3">
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 group bg-amber-50 rounded-xl px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700">{h.member}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{h.highlight}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity shrink-0 mt-0.5"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-gray-100 rounded-xl p-3 space-y-2">
              <input
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Nome do membro"
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
              <textarea
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addHighlight(); } }}
                placeholder="Destaque ou contribuição..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700"
              >
                + Adicionar destaque
              </button>
            </div>
          </div>

          {/* Next sprint */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Próximo Sprint — Tema</label>
            <input
              value={form.next_theme}
              onChange={(e) => set("next_theme", e.target.value)}
              placeholder="Ex: Módulo de Relatórios"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <ArrayInput
            label="Próximo Sprint — Principais Itens"
            items={form.next_items}
            onChange={(v) => set("next_items", v)}
            placeholder="Ex: Feature X (13pts)"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar Review"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function SprintReviewPage() {
  const supabase = createClient();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [reviews, setReviews] = useState<SprintReviewRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoadingPage(true);
    const [{ data: sprintData }, { data: reviewData }] = await Promise.all([
      supabase.from("sprints").select("*").order("created_at", { ascending: false }),
      supabase.from("sprint_reviews").select("*"),
    ]);
    const s = sprintData ?? [];
    setSprints(s);
    setReviews((reviewData as SprintReviewRow[]) ?? []);
    if (s.length > 0) setSelectedId((prev) => prev ?? s[0].id);
    setLoadingPage(false);
  }, [supabase]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  useEffect(() => {
    if (!selectedId) return;
    setLoadingTasks(true);
    supabase
      .from("tasks")
      .select("*")
      .eq("sprint_id", selectedId)
      .is("parent_task_id", null)
      .then(({ data }: { data: Task[] | null }) => {
        setTasks(data ?? []);
        setLoadingTasks(false);
      });
  }, [selectedId, supabase]);

  const selectedSprint = sprints.find((s) => s.id === selectedId);
  const selectedReview = reviews.find((r) => r.sprint_id === selectedId);

  // Computed stats from tasks
  const doneTasks    = tasks.filter((t) => t.status === "done");
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const velocity     = doneTasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const planned      = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const completion   = planned > 0 ? Math.round((velocity / planned) * 100) : 0;

  // Ring SVG
  const R = 36;
  const circ = 2 * Math.PI * R;
  const offset = circ - (completion / 100) * circ;
  const ringColor = completion >= 90 ? "#22c55e" : completion >= 70 ? "#f59e0b" : "#ef4444";

  // Done tasks grouped by epic
  const byEpic = doneTasks.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.epic ?? "Sem épico";
    return { ...acc, [key]: [...(acc[key] ?? []), t] };
  }, {});

  async function handleGenerateReview() {
    if (!selectedId) return;
    const { data, error } = await supabase
      .from("sprint_reviews")
      .insert({ sprint_id: selectedId, blockers: [], learnings: [], highlights: [], next_items: [] })
      .select()
      .single();
    if (!error && data) {
      setReviews((prev) => [...prev, data as SprintReviewRow]);
      setShowEditor(true);
    }
  }

  async function handleSaveReview(form: ReviewFormData) {
    if (!selectedReview) return;
    const { data } = await supabase
      .from("sprint_reviews")
      .update({
        theme:      form.theme      || null,
        blockers:   form.blockers,
        learnings:  form.learnings,
        highlights: form.highlights,
        next_theme: form.next_theme || null,
        next_items: form.next_items,
      })
      .eq("id", selectedReview.id)
      .select()
      .single();
    if (data) {
      setReviews((prev) => prev.map((r) => r.id === selectedReview.id ? (data as SprintReviewRow) : r));
    }
    setShowEditor(false);
  }

  if (loadingPage) {
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
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Sprint Review</span>
          <span className="text-xs text-gray-400 ml-1">· Relatório executivo por sprint</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedSprint && !selectedReview && (
            <button
              onClick={handleGenerateReview}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              Gerar Review
            </button>
          )}
          {selectedReview && (
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 bg-white rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors"
            >
              <Edit2 size={13} />
              Editar Review
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {sprints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Zap size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Nenhuma sprint cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Crie sprints na aba Sprints para gerar reviews</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-5 p-6">
          {/* Sprint sidebar */}
          <div className="w-60 shrink-0 space-y-2">
            {sprints.map((sprint) => {
              const isSelected = selectedId === sprint.id;
              const hasReview  = reviews.some((r) => r.sprint_id === sprint.id);
              return (
                <button
                  key={sprint.id}
                  onClick={() => setSelectedId(sprint.id)}
                  className={`w-full text-left rounded-2xl px-4 py-4 border transition-all ${
                    isSelected
                      ? "bg-white border-blue-200 shadow-md"
                      : "bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900 truncate flex-1">{sprint.name}</span>
                    {isSelected && <ChevronRight size={14} className="text-blue-600 shrink-0 ml-1" />}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      sprint.status === "active"    ? "bg-blue-50 text-blue-600" :
                      sprint.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {sprint.status === "active" ? "Ativo" : sprint.status === "completed" ? "Concluído" : "Planejando"}
                    </span>
                    {hasReview && (
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                        Review
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Review panel */}
          {selectedSprint && (
            <div className="flex-1 min-w-0 space-y-4">
              {loadingTasks ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                </div>
              ) : (
                <>
                  {/* Header card */}
                  <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-6">
                      {/* Completion ring */}
                      <div className="relative w-24 h-24 shrink-0">
                        <svg width="96" height="96" viewBox="0 0 96 96">
                          <circle cx="48" cy="48" r={R} fill="none" stroke="#f3f4f6" strokeWidth="7" />
                          <circle
                            cx="48" cy="48" r={R} fill="none"
                            stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                            strokeDasharray={circ} strokeDashoffset={offset}
                            transform="rotate(-90 48 48)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-gray-900">{completion}%</span>
                          <span className="text-[9px] text-gray-400 font-semibold">completo</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedSprint.name}</h2>
                        {selectedReview?.theme && (
                          <p className="text-sm font-semibold text-blue-600 mb-2">{selectedReview.theme}</p>
                        )}
                        {selectedSprint.goal && (
                          <p className="text-xs text-gray-500 mb-3 leading-relaxed">{selectedSprint.goal}</p>
                        )}
                        <div className="flex items-center gap-5 flex-wrap">
                          {[
                            { label: "Velocity",  value: `${velocity} pts` },
                            { label: "Planejado", value: `${planned} pts` },
                            { label: "Entregues", value: `${doneTasks.length} tasks` },
                            { label: "Pendentes", value: `${pendingTasks.length} tasks` },
                          ].map((s) => (
                            <div key={s.label}>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                              <p className="text-sm font-bold text-gray-800">{s.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivered tasks grouped by epic */}
                  {doneTasks.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">O que foi entregue</p>
                        <p className="text-xs text-gray-400 mt-0.5">{doneTasks.length} tasks · {velocity} story points</p>
                      </div>
                      <div className="p-6 space-y-5">
                        {Object.entries(byEpic).map(([epic, epTasks]) => (
                          <div key={epic}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                                {epic}
                              </span>
                              <span className="text-xs text-gray-400">
                                {epTasks.length} {epTasks.length === 1 ? "task" : "tasks"} · {epTasks.reduce((a, t) => a + (t.story_points ?? 0), 0)} pts
                              </span>
                            </div>
                            <div className="space-y-1.5 ml-1">
                              {epTasks.map((task) => (
                                <div key={task.id} className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  </div>
                                  <p className="text-xs text-gray-700 flex-1 truncate">{task.title}</p>
                                  <span className="text-[10px] font-bold text-gray-400 shrink-0">{task.story_points}pt</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending tasks */}
                  {pendingTasks.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" />
                        <p className="text-sm font-bold text-gray-900">Não concluídas</p>
                        <span className="text-xs text-gray-400 ml-1">
                          · {pendingTasks.reduce((a, t) => a + (t.story_points ?? 0), 0)} pts carregados para frente
                        </span>
                      </div>
                      <div className="px-6 py-4 space-y-1.5">
                        {pendingTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                            <p className="text-xs text-gray-500 flex-1 truncate">{task.title}</p>
                            <span className="text-[10px] font-bold text-gray-400 shrink-0">{task.story_points}pt</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Narrative sections (review exists) */}
                  {selectedReview ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Blockers */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                            <AlertTriangle size={13} className="text-amber-500" />
                            <p className="text-sm font-bold text-gray-900">Blockers</p>
                          </div>
                          {selectedReview.blockers.length === 0 ? (
                            <p className="px-5 py-4 text-xs text-gray-400 italic">Nenhum blocker registrado</p>
                          ) : (
                            <div className="px-5 py-4 space-y-2">
                              {selectedReview.blockers.map((b, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  <p className="text-xs text-gray-600 leading-relaxed">{b}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Learnings */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                            <TrendingUp size={13} className="text-blue-500" />
                            <p className="text-sm font-bold text-gray-900">Aprendizados</p>
                          </div>
                          {selectedReview.learnings.length === 0 ? (
                            <p className="px-5 py-4 text-xs text-gray-400 italic">Nenhum aprendizado registrado</p>
                          ) : (
                            <div className="px-5 py-4 space-y-2">
                              {selectedReview.learnings.map((l, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                  <p className="text-xs text-gray-600 leading-relaxed">{l}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team Highlights */}
                      {selectedReview.highlights.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                            <Star size={14} className="text-amber-500" />
                            <p className="text-sm font-bold text-gray-900">Destaques do Time</p>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {selectedReview.highlights.map((h, i) => {
                              const initials = h.member.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                              return (
                                <div key={i} className="flex items-start gap-3 px-5 py-4">
                                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[9px] font-bold shrink-0">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-700 mb-0.5">{h.member}</p>
                                    <p className="text-xs text-gray-500 leading-relaxed">{h.highlight}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Next sprint preview */}
                      {selectedReview.next_theme && (
                        <div className="bg-gray-900 rounded-2xl px-6 py-5 text-white">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Próximo Sprint
                          </p>
                          <p className="text-base font-bold mb-3">{selectedReview.next_theme}</p>
                          {selectedReview.next_items.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {selectedReview.next_items.map((item, i) => (
                                <span key={i} className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg">
                                  {item}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* No review yet */
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 flex flex-col items-center justify-center gap-4 text-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Zap size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Sem review registrada para esta sprint</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Clique em "Gerar Review" para registrar destaques, blockers e aprendizados
                        </p>
                      </div>
                      <button
                        onClick={handleGenerateReview}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={14} />
                        Gerar Review
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor drawer */}
      {showEditor && selectedSprint && selectedReview && (
        <ReviewEditor
          sprint={selectedSprint}
          initial={{
            theme:      selectedReview.theme      ?? "",
            blockers:   selectedReview.blockers   ?? [],
            learnings:  selectedReview.learnings  ?? [],
            highlights: selectedReview.highlights ?? [],
            next_theme: selectedReview.next_theme ?? "",
            next_items: selectedReview.next_items ?? [],
          }}
          onSave={handleSaveReview}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
