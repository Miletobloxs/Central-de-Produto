"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AlertOctagon,
  Clock,
  Users,
  Link2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Loader2,
  X,
  ShieldCheck,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "active" | "investigating" | "resolved" | "postmortem";
type FilterType = "all" | "active" | "resolved";

interface TimelineEvent {
  time: string;
  event: string;
  author: string;
}

interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: IncidentStatus;
  affected_users: number;
  affected_pct: number;
  components: string[];
  root_cause?: string | null;
  sprint_task_id?: string | null;
  timeline: TimelineEvent[];
  started_at: string;
  resolved_at?: string | null;
  created_at: string;
}

const severityConfig: Record<Severity, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: "Crítico",  color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    dot: "bg-red-500"    },
  high:     { label: "Alto",     color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-400" },
  medium:   { label: "Médio",    color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-400"  },
  low:      { label: "Baixo",    color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200",   dot: "bg-gray-300"   },
};

const statusConfig: Record<IncidentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active:       { label: "Ativo",        color: "text-red-600",     bg: "bg-red-50",     icon: XCircle       },
  investigating:{ label: "Investigando", color: "text-amber-600",   bg: "bg-amber-50",   icon: AlertTriangle },
  resolved:     { label: "Resolvido",    color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2  },
  postmortem:   { label: "Postmortem",   color: "text-blue-600",    bg: "bg-blue-50",    icon: AlertOctagon  },
};

function computeDuration(startedAt: string, resolvedAt?: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor((diff % 3_600_000) / 60_000);
  if (hours === 0) return `${mins}min`;
  return `${hours}h ${mins}min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Resolve Incident Modal ────────────────────────────────────
function ResolveIncidentModal({
  incident,
  onClose,
  onResolved,
}: {
  incident: Incident;
  onClose: () => void;
  onResolved: (updated: Incident) => void;
}) {
  const supabase = createClient();
  const [status,        setStatus]        = useState<IncidentStatus>(
    incident.status === "active" ? "investigating" : incident.status === "investigating" ? "resolved" : incident.status
  );
  const [rootCause,     setRootCause]     = useState(incident.root_cause ?? "");
  const [affectedUsers, setAffectedUsers] = useState(String(incident.affected_users ?? 0));
  const [affectedPct,   setAffectedPct]   = useState(String(incident.affected_pct ?? 0));
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState("");

  const isClosing = status === "resolved" || status === "postmortem";

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload: Record<string, unknown> = {
      status,
      root_cause:     rootCause.trim() || null,
      affected_users: parseInt(affectedUsers) || 0,
      affected_pct:   parseFloat(affectedPct) || 0,
    };
    if (isClosing && !incident.resolved_at) {
      payload.resolved_at = new Date().toISOString();
    }

    const { data, error: err } = await supabase
      .from("incidents")
      .update(payload)
      .eq("id", incident.id)
      .select()
      .single();

    if (err || !data) { setError(err?.message ?? "Erro ao atualizar"); setSaving(false); return; }
    onResolved(data as Incident);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Atualizar Incidente</h2>
              <p className="text-xs text-gray-400 truncate max-w-[220px]">{incident.title}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Novo status</label>
          <div className="grid grid-cols-2 gap-2">
            {(["investigating", "resolved", "postmortem"] as IncidentStatus[]).map((s) => {
              const cfg = statusConfig[s];
              const Icon = cfg.icon;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    status === s
                      ? `${cfg.bg} border-current ${cfg.color}`
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Icon size={13} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {isClosing && (
            <p className="text-[10px] text-emerald-600 font-semibold mt-1.5">
              ✓ resolved_at será registrado automaticamente
            </p>
          )}
        </div>

        {/* Root cause */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Root Cause</label>
          <textarea
            value={rootCause}
            onChange={(e) => setRootCause(e.target.value)}
            rows={3}
            placeholder="Descreva a causa raiz do incidente..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-none"
          />
        </div>

        {/* Affected users */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Usuários afetados</label>
            <input
              type="number"
              min="0"
              value={affectedUsers}
              onChange={(e) => setAffectedUsers(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">% afetados</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={affectedPct}
              onChange={(e) => setAffectedPct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
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
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── New Incident Modal ────────────────────────────────────────
function NewIncidentModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (incident: Incident) => void;
}) {
  const supabase = createClient();
  const [title,     setTitle]     = useState("");
  const [severity,  setSeverity]  = useState<Severity>("high");
  const [compInput, setCompInput] = useState("");
  const [components, setComponents] = useState<string[]>([]);
  const [taskId,    setTaskId]    = useState("");
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  function addComponent() {
    const v = compInput.trim();
    if (v && !components.includes(v)) setComponents((p) => [...p, v]);
    setCompInput("");
  }

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    setError("");
    const { data, error: err } = await supabase
      .from("incidents")
      .insert({
        title:          title.trim(),
        severity,
        status:         "active",
        components,
        sprint_task_id: taskId.trim() || null,
        timeline:       [],
        affected_users: 0,
        affected_pct:   0,
      })
      .select()
      .single();
    if (err || !data) { setError(err?.message ?? "Erro ao criar incidente"); setSaving(false); return; }
    onCreated(data as Incident);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Declarar Incidente</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Descreva o incidente brevemente..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Severidade</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 bg-white"
          >
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Componentes afetados</label>
          <div className="flex gap-2 mb-2">
            <input
              value={compInput}
              onChange={(e) => setCompInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addComponent(); } }}
              placeholder="Ex: Auth Service, Database..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
            />
            <button
              type="button"
              onClick={addComponent}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50"
            >
              + Add
            </button>
          </div>
          {components.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {components.map((c) => (
                <span key={c} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {c}
                  <button type="button" onClick={() => setComponents((p) => p.filter((x) => x !== c))}>
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task vinculada (opcional)</label>
          <input
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Ex: T-089"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
          />
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
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Declarando..." : "Declarar Incidente"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function IncidentsPage() {
  const supabase = createClient();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState<FilterType>("all");
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [showModal,  setShowModal]  = useState(false);
  const [resolveId,  setResolveId]  = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("incidents")
      .select("*")
      .order("started_at", { ascending: false });
    const rows = (data ?? []) as Incident[];
    setIncidents(rows);
    const firstActive = rows.find((i) => i.status === "active" || i.status === "investigating");
    if (firstActive) setExpanded(firstActive.id);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  const activeIncidents = incidents.filter(
    (i) => i.status === "active" || i.status === "investigating"
  );

  const filteredIncidents = incidents.filter((i) => {
    if (filter === "active")   return i.status === "active" || i.status === "investigating";
    if (filter === "resolved") return i.status === "resolved" || i.status === "postmortem";
    return true;
  });

  // MTTR: média de duração dos resolvidos
  const resolvedWithTime = incidents.filter((i) => i.resolved_at && i.started_at);
  const mttr = resolvedWithTime.length > 0
    ? (() => {
        const avgMs = resolvedWithTime.reduce((s, i) => {
          return s + (new Date(i.resolved_at!).getTime() - new Date(i.started_at).getTime());
        }, 0) / resolvedWithTime.length;
        const h = Math.floor(avgMs / 3_600_000);
        const m = Math.floor((avgMs % 3_600_000) / 60_000);
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
      })()
    : "—";

  const stats = {
    active:     activeIncidents.length,
    resolved:   incidents.filter((i) => i.status === "resolved").length,
    postmortem: incidents.filter((i) => i.status === "postmortem").length,
    mttr,
  };

  function handleCreated(incident: Incident) {
    setIncidents((prev) => [incident, ...prev]);
    setExpanded(incident.id);
    setShowModal(false);
  }

  function handleResolved(updated: Incident) {
    setIncidents((prev) => prev.map((i) => i.id === updated.id ? updated : i));
    setResolveId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-red-500" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Incidents & Alertas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro e timeline de incidentes de produção</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 rounded-xl px-4 py-2.5 hover:bg-red-600 transition-colors"
        >
          <Plus size={14} />
          Declarar Incidente
        </button>
      </div>

      {/* Active incident banner */}
      {activeIncidents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-800">
              {activeIncidents.length} incidente{activeIncidents.length > 1 ? "s" : ""} em andamento
            </p>
            <p className="text-xs text-amber-700 mt-0.5 truncate">
              {activeIncidents.map((i) => i.title).join(" · ")}
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full shrink-0 animate-pulse">
            AO VIVO
          </span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Em Andamento",  value: stats.active,     color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
          { label: "Resolvidos",    value: stats.resolved,   color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Postmortem",    value: stats.postmortem, color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    },
          { label: "MTTR médio",    value: stats.mttr,       color: "text-gray-800",    bg: "bg-gray-50",    border: "border-gray-200"    },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl px-5 py-3.5 border ${s.border} ${s.bg}`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Incident List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(["all", "active", "resolved"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${
                  filter === f ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {f === "all" ? `Todos (${incidents.length})` : f === "active" ? "Ativos" : "Resolvidos"}
              </button>
            ))}
          </div>
        </div>

        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
              <AlertOctagon size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Nenhum incidente registrado</p>
              <p className="text-sm text-gray-400 mt-1">Declare um incidente quando identificar um problema em produção</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 rounded-xl px-4 py-2.5 hover:bg-red-600"
            >
              <Plus size={14} />
              Declarar primeiro incidente
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredIncidents.map((incident) => {
              const sevCfg   = severityConfig[incident.severity];
              const stsCfg   = statusConfig[incident.status];
              const StatusIcon = stsCfg.icon;
              const isExpanded = expanded === incident.id;
              const displayId  = `INC-${String(incidents.length - incidents.indexOf(incident)).padStart(3, "0")}`;
              const duration   = computeDuration(incident.started_at, incident.resolved_at);

              return (
                <div key={incident.id}>
                  <div
                    className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : incident.id)}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${sevCfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">{displayId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevCfg.bg} ${sevCfg.color} ${sevCfg.border}`}>
                          {sevCfg.label}
                        </span>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${stsCfg.bg}`}>
                          <StatusIcon size={10} className={stsCfg.color} />
                          <span className={`text-[10px] font-semibold ${stsCfg.color}`}>{stsCfg.label}</span>
                        </div>
                        {incident.components.map((c) => (
                          <span key={c} className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {c}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{incident.title}</p>
                      <div className="flex items-center gap-5 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={11} />
                          <span>{formatDate(incident.started_at)}</span>
                        </div>
                        <span className="text-xs text-gray-400">Duração: {duration}</span>
                        {incident.affected_users > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Users size={11} />
                            <span>
                              {incident.affected_users.toLocaleString("pt-BR")} usuários ({incident.affected_pct}%)
                            </span>
                          </div>
                        )}
                        {incident.sprint_task_id && (
                          <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                            <Link2 size={11} />
                            <span>{incident.sprint_task_id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 bg-gray-50/50 border-t border-gray-100">
                      {incident.root_cause && (
                        <div className="mt-4 px-4 py-3 bg-white rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Root Cause</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{incident.root_cause}</p>
                        </div>
                      )}
                      {incident.timeline.length > 0 ? (
                        <div className="mt-4 space-y-0">
                          {incident.timeline.map((event, ei) => (
                            <div key={ei} className="flex items-start gap-3">
                              <span className="w-10 shrink-0 text-[11px] font-bold text-gray-400 pt-0.5 text-right">
                                {event.time}
                              </span>
                              <div className="shrink-0 flex flex-col items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-300 mt-0.5" />
                                {ei < incident.timeline.length - 1 && (
                                  <div className="w-px flex-1 bg-gray-200 min-h-[20px]" />
                                )}
                              </div>
                              <div className="flex-1 pb-3">
                                <p className="text-xs text-gray-700 leading-relaxed">{event.event}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">{event.author}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-gray-400 italic">Nenhum evento na timeline ainda.</p>
                      )}

                      {(incident.status === "active" || incident.status === "investigating") && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); setResolveId(incident.id); }}
                            className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
                          >
                            <ShieldCheck size={13} />
                            Resolver / Atualizar status
                          </button>
                        </div>
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
        <NewIncidentModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {resolveId && (() => {
        const incident = incidents.find((i) => i.id === resolveId);
        return incident ? (
          <ResolveIncidentModal
            incident={incident}
            onClose={() => setResolveId(null)}
            onResolved={handleResolved}
          />
        ) : null;
      })()}
    </div>
  );
}
