"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus, Search, Users, Calendar, Lightbulb,
  TrendingUp, MessageSquare, BarChart3, Loader2, X, AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type ResearchType   = "interview" | "usability" | "survey" | "data";
type ResearchStatus = "planned" | "ongoing" | "completed";
type InsightType    = "pain" | "opportunity" | "behavior" | "request";
type InsightSeverity = "high" | "medium" | "low";

interface Research {
  id: string;
  title: string;
  type: ResearchType;
  status: ResearchStatus;
  objective: string | null;
  participants: number;
  owner: string | null;
  epic_id: string | null;
  tags: string[];
  research_date: string;
  created_at: string;
  insight_count?: number;
}

interface Insight {
  id: string;
  quote: string;
  type: InsightType;
  severity: InsightSeverity;
  research_id: string | null;
  epic_id: string | null;
  tags: string[];
  created_at: string;
}

interface Epic { id: string; name: string; color?: string }

// ─── Config ───────────────────────────────────────────────────
const TYPE_CFG: Record<ResearchType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  interview: { label: "Entrevista",         icon: MessageSquare, color: "text-blue-600",   bg: "bg-blue-50" },
  usability: { label: "Teste Usabilidade",  icon: Users,         color: "text-purple-600", bg: "bg-purple-50" },
  survey:    { label: "Pesquisa Quant.",    icon: BarChart3,     color: "text-emerald-600",bg: "bg-emerald-50" },
  data:      { label: "Análise de Dados",   icon: TrendingUp,    color: "text-amber-600",  bg: "bg-amber-50" },
};

const STATUS_CFG: Record<ResearchStatus, { label: string; color: string; dot: string }> = {
  completed: { label: "Concluída",     color: "text-emerald-600", dot: "bg-emerald-400" },
  ongoing:   { label: "Em Andamento",  color: "text-blue-600",    dot: "bg-blue-400" },
  planned:   { label: "Planejada",     color: "text-gray-400",    dot: "bg-gray-300" },
};

const INSIGHT_CFG: Record<InsightType, { label: string; color: string; bg: string; border: string }> = {
  pain:        { label: "Dor",          color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200" },
  opportunity: { label: "Oportunidade", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  behavior:    { label: "Comportamento",color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  request:     { label: "Pedido",       color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-200" },
};

const SEVERITY_DOT: Record<InsightSeverity, string> = {
  high:   "bg-red-400",
  medium: "bg-amber-400",
  low:    "bg-gray-300",
};

// ─── Main ─────────────────────────────────────────────────────
export default function DiscoveryPage() {
  const [loading,   setLoading]   = useState(true);
  const [researches,setResearches]= useState<Research[]>([]);
  const [insights,  setInsights]  = useState<Insight[]>([]);
  const [epics,     setEpics]     = useState<Epic[]>([]);
  const [typeFilter,setTypeFilter]= useState<ResearchType | "all">("all");
  const [search,    setSearch]    = useState("");
  const [showNewR,  setShowNewR]  = useState(false);
  const [showNewI,  setShowNewI]  = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [rRes, iRes, eRes] = await Promise.all([
      supabase.from("researches").select("*").order("created_at", { ascending: false }),
      supabase.from("insights").select("*").order("created_at", { ascending: false }),
      supabase.from("epics").select("id, name, color"),
    ]);
    setResearches(rRes.data ?? []);
    setInsights(iRes.data ?? []);
    setEpics(eRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Derived ───────────────────────────────────────────────
  const insightsByResearch = useMemo(() => {
    const map: Record<string, number> = {};
    insights.forEach((i) => { if (i.research_id) map[i.research_id] = (map[i.research_id] ?? 0) + 1; });
    return map;
  }, [insights]);

  const filtered = useMemo(() =>
    researches.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [researches, typeFilter, search]
  );

  const epicMap = useMemo(() => Object.fromEntries(epics.map((e) => [e.id, e])), [epics]);

  const stats = useMemo(() => ({
    total:    researches.length,
    insights: insights.length,
    ongoing:  researches.filter((r) => r.status === "ongoing").length,
    planned:  researches.filter((r) => r.status === "planned").length,
  }), [researches, insights]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 size={20} className="animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Discovery Hub</h1>
          <p className="text-sm text-gray-500 mt-0.5">Pesquisas com usuários, insights e ciclo de aprendizado de produto</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewI(true)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Lightbulb size={14} />
            Novo Insight
          </button>
          <button
            onClick={() => setShowNewR(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Nova Pesquisa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pesquisas realizadas", value: stats.total,    color: "text-gray-900",    bg: "bg-white border-gray-100" },
          { label: "Insights coletados",   value: stats.insights, color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
          { label: "Em andamento",         value: stats.ongoing,  color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
          { label: "Planejadas",           value: stats.planned,  color: "text-gray-500",    bg: "bg-gray-50 border-gray-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main: Research list + Insights feed */}
      <div className="grid grid-cols-3 gap-4">

        {/* Research list — 2 cols */}
        <div className="col-span-2 space-y-3">
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
              {(["all", ...Object.keys(TYPE_CFG)] as (ResearchType | "all")[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {key === "all" ? "Todos" : TYPE_CFG[key as ResearchType].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar pesquisa..."
                className="text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent w-full"
              />
            </div>
          </div>

          {/* Cards */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <AlertTriangle size={20} className="opacity-30" />
              <span className="text-xs">
                {researches.length === 0
                  ? 'Nenhuma pesquisa ainda — clique em "Nova Pesquisa"'
                  : "Nenhuma pesquisa com esses filtros"}
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((r) => {
                const cfg    = TYPE_CFG[r.type];
                const sts    = STATUS_CFG[r.status];
                const TypeIcon = cfg.icon;
                const epic   = r.epic_id ? epicMap[r.epic_id] : null;
                const iCount = insightsByResearch[r.id] ?? r.participants === 0 ? 0 : 0;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <TypeIcon size={15} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${sts.dot}`} />
                            <span className={`text-[10px] font-semibold ${sts.color}`}>{sts.label}</span>
                          </div>
                          {epic && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                              {epic.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                        {r.objective && (
                          <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-1">{r.objective}</p>
                        )}
                        <div className="flex items-center gap-4 flex-wrap">
                          {r.owner && (
                            <span className="text-xs text-gray-500">{r.owner}</span>
                          )}
                          {r.participants > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Users size={11} />
                              <span>{r.participants.toLocaleString("pt-BR")} participantes</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Lightbulb size={11} />
                            <span>{insightsByResearch[r.id] ?? 0} insights</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                            <Calendar size={11} />
                            <span>{new Date(r.research_date + "T12:00:00").toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                        {r.tags.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                            {r.tags.map((tag) => (
                              <span key={tag} className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights feed — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start sticky top-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Insights Recentes</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{insights.length}</span>
              <Lightbulb size={15} className="text-amber-500" />
            </div>
          </div>
          {insights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
              <Lightbulb size={18} className="opacity-30" />
              <span className="text-xs">Nenhum insight ainda</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {insights.slice(0, 10).map((ins) => {
                const cfg  = INSIGHT_CFG[ins.type];
                const epic = ins.epic_id ? epicMap[ins.epic_id] : null;
                return (
                  <div key={ins.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                      {epic && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                          {epic.name}
                        </span>
                      )}
                      {ins.severity === "high" && (
                        <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                          Alta relevância
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed mb-2.5 italic">&ldquo;{ins.quote}&rdquo;</p>
                    {ins.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ins.tags.map((tag) => (
                          <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(ins.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNewR && (
        <NewResearchModal
          epics={epics}
          onClose={() => setShowNewR(false)}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = await supabase.from("researches").insert(data);
            if (!error) { await fetchAll(); setShowNewR(false); }
            return error?.message ?? null;
          }}
        />
      )}
      {showNewI && (
        <NewInsightModal
          epics={epics}
          researches={researches}
          onClose={() => setShowNewI(false)}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = await supabase.from("insights").insert(data);
            if (!error) { await fetchAll(); setShowNewI(false); }
            return error?.message ?? null;
          }}
        />
      )}
    </div>
  );
}

// ─── Modal: Nova Pesquisa ─────────────────────────────────────
function NewResearchModal({ epics, onClose, onSave }: {
  epics: Epic[];
  onClose: () => void;
  onSave: (data: Partial<Research>) => Promise<string | null>;
}) {
  const [title,    setTitle]    = useState("");
  const [type,     setType]     = useState<ResearchType>("interview");
  const [status,   setStatus]   = useState<ResearchStatus>("planned");
  const [objective,setObjective]= useState("");
  const [participants, setParticipants] = useState("");
  const [owner,    setOwner]    = useState("");
  const [epicId,   setEpicId]   = useState("");
  const [tags,     setTags]     = useState("");
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) { setError("Título é obrigatório."); return; }
    setLoading(true);
    const err = await onSave({
      title:         title.trim(),
      type,
      status,
      objective:     objective.trim() || null,
      participants:  parseInt(participants) || 0,
      owner:         owner.trim() || null,
      epic_id:       epicId || null,
      tags:          tags.split(",").map((t) => t.trim()).filter(Boolean),
      research_date: date,
    } as Partial<Research>);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Nova Pesquisa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Entrevistas sobre Onboarding KYC"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as ResearchType)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
                {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as ResearchStatus)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Objetivo</label>
            <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2}
              placeholder="O que queremos aprender com essa pesquisa?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Participantes</label>
              <input type="number" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Responsável</label>
              <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="ex: Sofia L."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
            </div>
            {epics.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Épico</label>
                <select value={epicId} onChange={(e) => setEpicId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
                  <option value="">Nenhum</option>
                  {epics.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags <span className="font-normal text-gray-400">(separadas por vírgula)</span></label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ex: KYC, Onboarding, Mobile"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50">
            {loading && <Loader2 size={13} className="animate-spin" />}Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Novo Insight ──────────────────────────────────────
function NewInsightModal({ epics, researches, onClose, onSave }: {
  epics: Epic[];
  researches: Research[];
  onClose: () => void;
  onSave: (data: Partial<Insight>) => Promise<string | null>;
}) {
  const [quote,      setQuote]      = useState("");
  const [type,       setType]       = useState<InsightType>("pain");
  const [severity,   setSeverity]   = useState<InsightSeverity>("medium");
  const [researchId, setResearchId] = useState("");
  const [epicId,     setEpicId]     = useState("");
  const [tags,       setTags]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSave() {
    if (!quote.trim()) { setError("O insight não pode estar vazio."); return; }
    setLoading(true);
    const err = await onSave({
      quote:       quote.trim(),
      type,
      severity,
      research_id: researchId || null,
      epic_id:     epicId || null,
      tags:        tags.split(",").map((t) => t.trim()).filter(Boolean),
    } as Partial<Insight>);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Novo Insight</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Insight (fala ou observação) *</label>
            <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={3}
              placeholder="Transcreva a fala do usuário ou descreva o comportamento observado..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tipo</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.entries(INSIGHT_CFG) as [InsightType, typeof INSIGHT_CFG[InsightType]][]).map(([k, v]) => (
                  <button key={k} onClick={() => setType(k)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      type === k ? `${v.bg} ${v.border} ${v.color}` : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Severidade</label>
              <div className="flex flex-col gap-1.5">
                {(["high","medium","low"] as InsightSeverity[]).map((s) => (
                  <button key={s} onClick={() => setSeverity(s)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 px-3 ${
                      severity === s ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[s]}`} />
                    {s === "high" ? "Alta" : s === "medium" ? "Média" : "Baixa"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {researches.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pesquisa de origem</label>
                <select value={researchId} onChange={(e) => setResearchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
                  <option value="">Nenhuma</option>
                  {researches.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
            )}
            {epics.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Épico relacionado</label>
                <select value={epicId} onChange={(e) => setEpicId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200">
                  <option value="">Nenhum</option>
                  {epics.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ex: KYC, Fricção, Mobile"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50">
            {loading && <Loader2 size={13} className="animate-spin" />}Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
