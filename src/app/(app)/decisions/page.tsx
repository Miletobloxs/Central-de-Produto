"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  XCircle,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
  X,
  BookOpen,
} from "lucide-react";

type DecisionStatus   = "accepted" | "open" | "deprecated" | "superseded";
type DecisionCategory = "produto" | "arquitetura" | "estrategia" | "processo";

interface DecisionAlternative {
  option: string;
  reason: string;
}

interface Decision {
  id: string;
  adr_number: number;
  title: string;
  status: DecisionStatus;
  category: DecisionCategory;
  decided_by: string | null;
  participants: string[];
  context: string | null;
  decision: string | null;
  rationale: string | null;
  alternatives: DecisionAlternative[];
  consequences: string | null;
  epic_link: string | null;
  tags: string[];
  decided_at: string;
  created_at: string;
}

const statusConfig: Record<DecisionStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  accepted:   { label: "Aceita",         color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  open:       { label: "Em Discussão",   color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   icon: Clock        },
  deprecated: { label: "Depreciada",     color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200",     icon: XCircle      },
  superseded: { label: "Substituída",    color: "text-gray-500",    bg: "bg-gray-50",    border: "border-gray-200",    icon: XCircle      },
};

const categoryConfig: Record<DecisionCategory, { label: string; color: string; bg: string; dot: string }> = {
  produto:      { label: "Produto",      color: "text-blue-600",    bg: "bg-blue-50",    dot: "bg-blue-500"    },
  arquitetura:  { label: "Arquitetura",  color: "text-purple-600",  bg: "bg-purple-50",  dot: "bg-purple-500"  },
  estrategia:   { label: "Estratégia",   color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-500"   },
  processo:     { label: "Processo",     color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-amber-200 text-amber-800",
  "bg-purple-200 text-purple-800",
  "bg-emerald-200 text-emerald-800",
  "bg-blue-200 text-blue-800",
  "bg-pink-200 text-pink-800",
];
function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffff;
  return avatarColors[h % avatarColors.length];
}

// ─── New Decision Modal ────────────────────────────────────────
function NewDecisionModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (d: Decision) => void;
}) {
  const supabase = createClient();

  const [title,        setTitle]        = useState("");
  const [status,       setStatus]       = useState<DecisionStatus>("open");
  const [category,     setCategory]     = useState<DecisionCategory>("produto");
  const [decidedBy,    setDecidedBy]    = useState("");
  const [partInput,    setPartInput]    = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [context,      setContext]      = useState("");
  const [decision,     setDecision]     = useState("");
  const [rationale,    setRationale]    = useState("");
  const [alternatives, setAlternatives] = useState<DecisionAlternative[]>([{ option: "", reason: "" }]);
  const [consequences, setConsequences] = useState("");
  const [epicLink,     setEpicLink]     = useState("");
  const [tagInput,     setTagInput]     = useState("");
  const [tags,         setTags]         = useState<string[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");

  function addParticipant() {
    const v = partInput.trim();
    if (v && !participants.includes(v)) setParticipants((p) => [...p, v]);
    setPartInput("");
  }

  function addTag() {
    const v = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (v && !tags.includes(v)) setTags((p) => [...p, v]);
    setTagInput("");
  }

  function updateAlt(i: number, field: keyof DecisionAlternative, val: string) {
    setAlternatives((prev) => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  }

  function addAlt()    { setAlternatives((p) => [...p, { option: "", reason: "" }]); }
  function removeAlt(i: number) { setAlternatives((p) => p.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    setError("");

    const payload = {
      title:        title.trim(),
      status,
      category,
      decided_by:   decidedBy.trim() || null,
      participants,
      context:      context.trim()      || null,
      decision:     decision.trim()     || null,
      rationale:    rationale.trim()    || null,
      alternatives: alternatives.filter((a) => a.option.trim()),
      consequences: consequences.trim() || null,
      epic_link:    epicLink.trim()     || null,
      tags,
    };

    const { data, error: err } = await supabase
      .from("decisions")
      .insert(payload)
      .select()
      .single();

    if (err || !data) { setError(err?.message ?? "Erro ao salvar"); setSaving(false); return; }
    onCreated(data as Decision);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Nova Decisão (ADR)</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Adotar feature flags como padrão de rollout"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Status + Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DecisionStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                <option value="open">Em Discussão</option>
                <option value="accepted">Aceita</option>
                <option value="deprecated">Depreciada</option>
                <option value="superseded">Substituída</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DecisionCategory)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
              >
                <option value="produto">Produto</option>
                <option value="arquitetura">Arquitetura</option>
                <option value="estrategia">Estratégia</option>
                <option value="processo">Processo</option>
              </select>
            </div>
          </div>

          {/* Decidido por + Participantes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Decidido por</label>
              <input
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
                placeholder="Ex: André M."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Participantes</label>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  value={partInput}
                  onChange={(e) => setPartInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addParticipant(); } }}
                  placeholder="Nome..."
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button type="button" onClick={addParticipant} className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
                  + Add
                </button>
              </div>
              {participants.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {participants.map((p) => (
                    <span key={p} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {p}
                      <button type="button" onClick={() => setParticipants((prev) => prev.filter((x) => x !== p))}>
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contexto */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Contexto</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              placeholder="Descreva o problema ou situação que gerou esta decisão..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          {/* Decisão */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Decisão</label>
            <textarea
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={3}
              placeholder="O que foi decidido fazer?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          {/* Justificativa */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Justificativa</label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Por que esta foi a melhor decisão?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          {/* Alternativas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-700">Alternativas descartadas</label>
              <button type="button" onClick={addAlt} className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                + Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {alternatives.map((alt, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      value={alt.option}
                      onChange={(e) => updateAlt(i, "option", e.target.value)}
                      placeholder="Opção alternativa"
                      className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                      value={alt.reason}
                      onChange={(e) => updateAlt(i, "reason", e.target.value)}
                      placeholder="Motivo de descarte"
                      className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  {alternatives.length > 1 && (
                    <button type="button" onClick={() => removeAlt(i)} className="mt-1.5 text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consequências */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Consequências</label>
            <textarea
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              rows={2}
              placeholder="Quais os trade-offs e impactos desta decisão?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>

          {/* Epic Link + Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Épico vinculado</label>
              <input
                value={epicLink}
                onChange={(e) => setEpicLink(e.target.value)}
                placeholder="Ex: Pagamentos"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tags</label>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="tag..."
                  className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button type="button" onClick={addTag} className="px-2.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50">
                  + Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      #{t}
                      <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Salvando..." : "Salvar Decisão"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function DecisionsPage() {
  const supabase = createClient();

  const [decisions,       setDecisions]       = useState<Decision[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [categoryFilter,  setCategoryFilter]  = useState<DecisionCategory | "all">("all");
  const [search,          setSearch]          = useState("");
  const [expanded,        setExpanded]        = useState<string | null>(null);
  const [showModal,       setShowModal]       = useState(false);

  const fetchDecisions = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("decisions")
      .select("*")
      .order("adr_number", { ascending: false });
    const rows = (data ?? []) as Decision[];
    setDecisions(rows);
    if (rows.length > 0) setExpanded(rows[0].id);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchDecisions(); }, [fetchDecisions]);

  function handleCreated(d: Decision) {
    setDecisions((prev) => [d, ...prev]);
    setExpanded(d.id);
    setShowModal(false);
  }

  const filtered = decisions.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.tags.join(" ").includes(q)) return false;
    }
    return true;
  });

  const stats = {
    total:    decisions.length,
    accepted: decisions.filter((d) => d.status === "accepted").length,
    open:     decisions.filter((d) => d.status === "open").length,
    byCategory: Object.fromEntries(
      (Object.keys(categoryConfig) as DecisionCategory[]).map((k) => [k, decisions.filter((d) => d.category === k).length])
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mural de Decisões</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log estruturado de decisões de produto — o que foi decidido, por quem e por quê
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Nova Decisão
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total de Decisões", value: stats.total,    color: "text-gray-900",    bg: "bg-white border-gray-100"       },
          { label: "Aceitas",           value: stats.accepted, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Em Discussão",      value: stats.open,     color: "text-amber-600",   bg: "bg-amber-50 border-amber-100"   },
          { label: "Arquitetura",       value: stats.byCategory.arquitetura ?? 0, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Decision List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                categoryFilter === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Todos
            </button>
            {(Object.entries(categoryConfig) as [DecisionCategory, typeof categoryConfig[DecisionCategory]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  categoryFilter === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cfg.label}
                <span className={`ml-1.5 text-[10px] font-bold ${categoryFilter === key ? cfg.color : "text-gray-400"}`}>
                  {stats.byCategory[key] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou tag..."
              className="text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent w-full"
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{filtered.length} decisões</span>
        </div>

        {/* Empty state */}
        {decisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <BookOpen size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Nenhuma decisão registrada</p>
              <p className="text-sm text-gray-400 mt-1">Documente as decisões de produto para manter o time alinhado</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700"
            >
              <Plus size={14} />
              Criar primeira decisão
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((d) => {
              const statusCfg  = statusConfig[d.status];
              const catCfg     = categoryConfig[d.category];
              const StatusIcon = statusCfg.icon;
              const isExpanded = expanded === d.id;
              const adrId      = `ADR-${String(d.adr_number).padStart(3, "0")}`;

              return (
                <div key={d.id}>
                  {/* Header row */}
                  <div
                    className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : d.id)}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${catCfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400 font-mono">{adrId}</span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.border}`}>
                          <StatusIcon size={10} className={statusCfg.color} />
                          <span className={`text-[10px] font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catCfg.bg} ${catCfg.color}`}>
                          {catCfg.label}
                        </span>
                        {d.epic_link && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {d.epic_link}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{d.title}</p>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        {d.decided_by && (
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${avatarColor(d.decided_by)}`}>
                              {initials(d.decided_by)}
                            </div>
                            <span className="text-xs text-gray-500">{d.decided_by}</span>
                          </div>
                        )}
                        {d.participants.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Users size={11} />
                            <span>{d.participants.join(", ")}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">{formatDate(d.decided_at)}</span>
                      </div>
                      {d.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {d.tags.map((tag) => (
                            <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded
                        ? <ChevronDown size={16} className="text-gray-400" />
                        : <ChevronRight size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded ADR Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 bg-gray-50/40 border-t border-gray-100 space-y-4">
                      {d.context && (
                        <div className="mt-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Contexto</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{d.context}</p>
                        </div>
                      )}

                      {d.decision && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">Decisão</p>
                          <p className="text-sm font-semibold text-blue-900 leading-relaxed">{d.decision}</p>
                        </div>
                      )}

                      {d.rationale && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Justificativa</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{d.rationale}</p>
                        </div>
                      )}

                      {d.alternatives.length > 0 && d.alternatives.some((a) => a.option) && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Alternativas Consideradas e Descartadas
                          </p>
                          <div className="space-y-2">
                            {d.alternatives.filter((a) => a.option).map((alt, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-xs font-semibold text-gray-700">{alt.option}</span>
                                  {alt.reason && <span className="text-xs text-gray-400"> — {alt.reason}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {d.consequences && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Consequências</p>
                          <p className="text-xs text-amber-800 leading-relaxed">{d.consequences}</p>
                        </div>
                      )}

                      {!d.context && !d.decision && !d.rationale && !d.consequences && (
                        <p className="mt-4 text-xs text-gray-400 italic">Nenhum detalhe adicionado ainda.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <NewDecisionModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
