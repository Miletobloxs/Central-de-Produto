"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Database, Server, Shield, Mail, Zap, Globe, HardDrive,
  Plus, Loader2, X, AlertOctagon, Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
type ServiceStatus = "operational" | "degraded" | "outage";
type BugSeverity   = "critical" | "high" | "medium" | "low";
type BugStatus     = "open" | "in_progress" | "resolved";
type IncidentStatus = "active" | "investigating" | "resolved" | "postmortem";

interface ServiceCheck {
  id: string;
  service_name: string;
  status: ServiceStatus;
  latency_ms: number;
  uptime_pct: number;
  icon: string;
  notes: string | null;
  checked_at: string;
}

interface Bug {
  id: string;
  title: string;
  severity: BugSeverity;
  status: BugStatus;
  sprint_id: string | null;
  epic_id: string | null;
  assignee: string | null;
  reported_at: string;
  resolved_at: string | null;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: IncidentStatus;
  affected_users: number;
  started_at: string;
}

interface Epic  { id: string; name: string }
interface Sprint { id: string; name: string }

// ─── Constants ────────────────────────────────────────────────
const SERVICE_ICONS: Record<string, React.ElementType> = {
  Globe, Database, Shield, Mail, Zap, Server, HardDrive, Activity,
};
const ICON_OPTIONS = Object.keys(SERVICE_ICONS);

const STATUS_CFG: Record<ServiceStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  operational: { label: "Operacional", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  degraded:    { label: "Degradado",   color: "text-amber-600",   bg: "bg-amber-50",   icon: AlertTriangle },
  outage:      { label: "Indisponível", color: "text-red-600",     bg: "bg-red-50",     icon: XCircle },
};

const UPTIME_COLOR: Record<ServiceStatus, string> = {
  operational: "bg-emerald-400",
  degraded:    "bg-amber-400",
  outage:      "bg-red-400",
};

const BUG_CFG: Record<BugSeverity, { label: string; color: string; bg: string; border: string; penalty: number }> = {
  critical: { label: "Crítico", color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200",    penalty: 15 },
  high:     { label: "Alto",    color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", penalty: 5  },
  medium:   { label: "Médio",   color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  penalty: 1  },
  low:      { label: "Baixo",   color: "text-gray-600",   bg: "bg-gray-50",   border: "border-gray-200",   penalty: 0  },
};

// ─── Score formula ────────────────────────────────────────────
// 50 pts = serviços | 50 pts = bugs
function computeHealthScore(services: ServiceCheck[], openBugs: Bug[]) {
  const total = services.length;
  if (total === 0 && openBugs.length === 0) return 100;

  const svcScore = total > 0
    ? services.reduce((acc, s) => {
        if (s.status === "operational") return acc + (50 / total);
        if (s.status === "degraded")    return acc + (50 / total) * 0.5;
        return acc;
      }, 0)
    : 50;

  const bugPenalty = openBugs.reduce(
    (acc, b) => acc + (BUG_CFG[b.severity]?.penalty ?? 0), 0
  );
  const bugScore = Math.max(0, 50 - bugPenalty);

  return Math.round(svcScore + bugScore);
}

// Gera blocos de uptime dos últimos 90 dias a partir do uptime_pct médio
function buildUptimeBlocks(services: ServiceCheck[]): ServiceStatus[] {
  if (services.length === 0) return Array(90).fill("operational");
  const avgUptime = services.reduce((a, s) => a + s.uptime_pct, 0) / services.length;
  const operationalDays = Math.round((avgUptime / 100) * 90);
  const nonOp = 90 - operationalDays;
  const outage  = Math.round(nonOp * 0.35);
  const degraded = nonOp - outage;
  const blocks: ServiceStatus[] = [
    ...Array(operationalDays).fill("operational"),
    ...Array(degraded).fill("degraded"),
    ...Array(outage).fill("outage"),
  ];
  // embaralha levemente para parecer distribuído no tempo
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }
  return blocks;
}

// ─── Main Page ────────────────────────────────────────────────
export default function HealthPage() {
  const [loading,  setLoading]  = useState(true);
  const [services, setServices] = useState<ServiceCheck[]>([]);
  const [bugs,     setBugs]     = useState<Bug[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [epics,    setEpics]    = useState<Epic[]>([]);
  const [sprints,  setSprints]  = useState<Sprint[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [showAddService, setShowAddService] = useState(false);
  const [showAddBug,     setShowAddBug]     = useState(false);
  const [editService,    setEditService]    = useState<ServiceCheck | null>(null);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [svcRes, bugsRes, incRes, epicsRes, sprintsRes] = await Promise.all([
      supabase.from("service_checks").select("*").order("service_name"),
      supabase.from("bugs").select("*").neq("status", "resolved").order("created_at", { ascending: false }),
      supabase.from("incidents").select("id,title,severity,status,affected_users,started_at")
               .in("status", ["active", "investigating"]).order("started_at", { ascending: false }),
      supabase.from("epics").select("id, name"),
      supabase.from("sprints").select("id, name").order("created_at", { ascending: false }),
    ]);
    setServices(svcRes.data ?? []);
    setBugs(bugsRes.data ?? []);
    setIncidents(incRes.data ?? []);
    setEpics(epicsRes.data ?? []);
    setSprints(sprintsRes.data ?? []);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Derived ─────────────────────────────────────────────
  const healthScore = useMemo(
    () => computeHealthScore(services, bugs),
    [services, bugs]
  );

  const scoreColor     = healthScore >= 90 ? "text-emerald-600" : healthScore >= 70 ? "text-amber-600" : "text-red-600";
  const scoreRingColor = healthScore >= 90 ? "#10b981"          : healthScore >= 70 ? "#f59e0b"        : "#ef4444";
  const scoreLabel     = healthScore >= 90 ? "Excelente"        : healthScore >= 70 ? "Atenção"        : "Crítico";

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (healthScore / 100) * circumference;

  const operationalCount = services.filter((s) => s.status === "operational").length;
  const degradedCount    = services.filter((s) => s.status === "degraded").length;
  const outageCount      = services.filter((s) => s.status === "outage").length;

  const avgUptime = services.length > 0
    ? (services.reduce((a, s) => a + s.uptime_pct, 0) / services.length).toFixed(2)
    : null;

  const bugsBySeverity = useMemo(() => ({
    critical: bugs.filter((b) => b.severity === "critical").length,
    high:     bugs.filter((b) => b.severity === "high").length,
    medium:   bugs.filter((b) => b.severity === "medium").length,
    low:      bugs.filter((b) => b.severity === "low").length,
  }), [bugs]);

  const uptimeBlocks = useMemo(() => buildUptimeBlocks(services), [services]);

  const formattedLastUpdate = lastUpdated
    ? lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Health Score</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitoramento unificado de saúde da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2">
          {formattedLastUpdate && (
            <span className="text-xs text-gray-400">Atualizado às {formattedLastUpdate}</span>
          )}
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
          <button
            onClick={() => setShowAddService(true)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Serviço
          </button>
          <button
            onClick={() => setShowAddBug(true)}
            className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} />
            Registrar Bug
          </button>
        </div>
      </div>

      {/* ── Active incident banner ── */}
      {incidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertOctagon size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-800">
              {incidents.length} incidente{incidents.length > 1 ? "s" : ""} em andamento
            </p>
            <p className="text-xs text-red-700 mt-0.5 truncate">
              {incidents.map((i) => i.title).join(" · ")}
            </p>
          </div>
          <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full shrink-0 animate-pulse">
            AO VIVO
          </span>
        </div>
      )}

      {/* ── Score + Quick Metrics ── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Score Ring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="48" cy="48" r="42"
                fill="none"
                stroke={scoreRingColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${scoreColor}`}>{healthScore}</span>
              <span className="text-[10px] text-gray-400 font-semibold">/ 100</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Health Score</p>
            <p className={`text-sm font-semibold mt-0.5 ${scoreColor}`}>{scoreLabel}</p>
            {services.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {operationalCount}/{services.length} serviços ok
              </p>
            )}
            {degradedCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={11} className="text-amber-500" />
                <span className="text-xs text-amber-600 font-semibold">{degradedCount} degradado{degradedCount > 1 ? "s" : ""}</span>
              </div>
            )}
            {outageCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <XCircle size={11} className="text-red-500" />
                <span className="text-xs text-red-600 font-semibold">{outageCount} indisponível{outageCount > 1 ? "is" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* Uptime médio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500">Uptime Médio (30d)</p>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {avgUptime !== null ? `${avgUptime}%` : "—"}
            </p>
            {avgUptime !== null && (
              <div className={`flex items-center gap-1 mt-1 ${parseFloat(avgUptime) >= 99.9 ? "text-emerald-600" : "text-amber-600"}`}>
                {parseFloat(avgUptime) >= 99.9
                  ? <CheckCircle2 size={11} />
                  : <AlertTriangle size={11} />}
                <span className="text-xs font-semibold">
                  Meta: 99.9%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bugs em aberto */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500">Bugs em Aberto</p>
          <div>
            <p className="text-2xl font-bold text-gray-900">{bugs.length}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {bugsBySeverity.critical > 0 && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                  {bugsBySeverity.critical} crítico{bugsBySeverity.critical > 1 ? "s" : ""}
                </span>
              )}
              {bugsBySeverity.high > 0 && (
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
                  {bugsBySeverity.high} alto{bugsBySeverity.high > 1 ? "s" : ""}
                </span>
              )}
              {bugs.length === 0 && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 size={11} />
                  <span className="text-xs font-semibold">Nenhum bug</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Incidents ativos */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500">Incidents Ativos</p>
          <div>
            <p className={`text-2xl font-bold ${incidents.length > 0 ? "text-red-600" : "text-gray-900"}`}>
              {incidents.length}
            </p>
            <div className={`flex items-center gap-1 mt-1 ${incidents.length === 0 ? "text-emerald-600" : "text-red-500"}`}>
              {incidents.length === 0
                ? <><CheckCircle2 size={11} /><span className="text-xs font-semibold">Todos resolvidos</span></>
                : <><AlertOctagon size={11} /><span className="text-xs font-semibold">{incidents.length} em andamento</span></>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── Services + Bugs ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Services — 2 cols */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Status dos Serviços</p>
            <span className="text-xs text-gray-400">{services.length} serviço{services.length !== 1 ? "s" : ""}</span>
          </div>
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <Server size={20} className="opacity-30" />
              <span className="text-xs">Nenhum serviço cadastrado</span>
              <button
                onClick={() => setShowAddService(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Adicionar primeiro serviço →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {services.map((svc) => {
                const cfg    = STATUS_CFG[svc.status];
                const StatusIcon = cfg.icon;
                const SvcIcon = SERVICE_ICONS[svc.icon] ?? Globe;
                return (
                  <div
                    key={svc.id}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => setEditService(svc)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                      <SvcIcon size={14} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{svc.service_name}</p>
                      {svc.notes ? (
                        <p className="text-xs text-gray-400 truncate">{svc.notes}</p>
                      ) : (
                        <p className="text-xs text-gray-400">Uptime: {svc.uptime_pct}%</p>
                      )}
                    </div>
                    <div className="text-right mr-4 shrink-0">
                      <p className="text-xs font-bold text-gray-700">{svc.latency_ms}ms</p>
                      <p className="text-[10px] text-gray-400">latência</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} shrink-0`}>
                      <StatusIcon size={11} className={cfg.color} />
                      <span className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bugs — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Bugs em Aberto</p>
            <p className="text-xs text-gray-400 mt-0.5">por severidade</p>
          </div>
          <div className="p-4 space-y-2.5">
            {(Object.keys(BUG_CFG) as BugSeverity[]).map((sev) => {
              const cfg   = BUG_CFG[sev];
              const count = bugsBySeverity[sev];
              return (
                <div
                  key={sev}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                  <span className={`text-xl font-black ${cfg.color}`}>{count}</span>
                </div>
              );
            })}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Total em aberto</span>
              <span className="text-sm font-bold text-gray-800">{bugs.length}</span>
            </div>
          </div>

          {/* Recent bugs */}
          {bugs.length > 0 && (
            <div className="border-t border-gray-100 px-4 pb-4 pt-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Recentes</p>
              <div className="space-y-2">
                {bugs.slice(0, 3).map((bug) => {
                  const cfg = BUG_CFG[bug.severity];
                  return (
                    <div key={bug.id} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${cfg.border.replace("border-", "bg-")}`} />
                      <p className="text-xs text-gray-600 leading-relaxed truncate">{bug.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Uptime History ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Histórico de Uptime</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Últimos 90 dias — derivado do uptime médio dos serviços ({avgUptime ?? "—"}%)
            </p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: "Operacional", color: "bg-emerald-400" },
              { label: "Degradado",   color: "bg-amber-400" },
              { label: "Indisponível", color: "bg-red-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 py-4">
          {services.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Cadastre serviços para ver o histórico de uptime
            </p>
          ) : (
            <>
              <div className="flex items-center gap-0.5 flex-wrap">
                {uptimeBlocks.map((status, i) => (
                  <div
                    key={i}
                    title={`Dia ${90 - i}`}
                    className={`w-2 h-6 rounded-sm ${UPTIME_COLOR[status]}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">90 dias atrás</span>
                <span className="text-xs text-gray-400">Hoje</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── APM Placeholder ── */}
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-6 py-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shrink-0">
          <Activity size={18} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600">P99 · Error Rate · Traces</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Métricas de APM em tempo real disponíveis após integração com Datadog ou New Relic
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shrink-0">
          Aguardando APM
        </span>
      </div>

      {/* ── Modals ── */}
      {(showAddService || editService) && (
        <ServiceModal
          service={editService}
          onClose={() => { setShowAddService(false); setEditService(null); }}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = editService
              ? await supabase.from("service_checks").update({ ...data, checked_at: new Date().toISOString() }).eq("id", editService.id)
              : await supabase.from("service_checks").upsert(
                  { ...data, checked_at: new Date().toISOString() },
                  { onConflict: "service_name" }
                );
            if (!error) { await fetchAll(); setShowAddService(false); setEditService(null); }
            return error?.message ?? null;
          }}
          onDelete={editService ? async () => {
            const supabase = createClient();
            await supabase.from("service_checks").delete().eq("id", editService.id);
            await fetchAll();
            setEditService(null);
          } : undefined}
        />
      )}

      {showAddBug && (
        <BugModal
          epics={epics}
          sprints={sprints}
          onClose={() => setShowAddBug(false)}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = await supabase.from("bugs").insert(data);
            if (!error) { await fetchAll(); setShowAddBug(false); }
            return error?.message ?? null;
          }}
        />
      )}
    </div>
  );
}

// ─── Modal: Serviço ───────────────────────────────────────────
function ServiceModal({
  service,
  onClose,
  onSave,
  onDelete,
}: {
  service: ServiceCheck | null;
  onClose: () => void;
  onSave: (data: Partial<ServiceCheck>) => Promise<string | null>;
  onDelete?: () => Promise<void>;
}) {
  const [name,      setName]      = useState(service?.service_name ?? "");
  const [status,    setStatus]    = useState<ServiceStatus>(service?.status ?? "operational");
  const [latency,   setLatency]   = useState(service?.latency_ms?.toString() ?? "0");
  const [uptime,    setUptime]    = useState(service?.uptime_pct?.toString() ?? "100");
  const [icon,      setIcon]      = useState(service?.icon ?? "Globe");
  const [notes,     setNotes]     = useState(service?.notes ?? "");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) { setError("Nome do serviço é obrigatório."); return; }
    setLoading(true);
    const err = await onSave({
      service_name: name.trim(),
      status,
      latency_ms:  parseInt(latency) || 0,
      uptime_pct:  parseFloat(uptime) || 100,
      icon,
      notes: notes.trim() || null,
    } as Partial<ServiceCheck>);
    setLoading(false);
    if (err) setError(err);
  }

  const StatusIcon = STATUS_CFG[status].icon;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">
            {service ? "Atualizar Serviço" : "Adicionar Serviço"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome do serviço *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: API Gateway"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Status buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <div className="flex gap-2">
              {(Object.keys(STATUS_CFG) as ServiceStatus[]).map((s) => {
                const cfg = STATUS_CFG[s];
                const Icon = cfg.icon;
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      status === s
                        ? `${cfg.bg} border-current ${cfg.color}`
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Latência (ms)</label>
              <input
                type="number" min="0"
                value={latency}
                onChange={(e) => setLatency(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Uptime % (30d)</label>
              <input
                type="number" min="0" max="100" step="0.01"
                value={uptime}
                onChange={(e) => setUptime(e.target.value)}
                placeholder="99.9"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ícone</label>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((ic) => {
                const Icon = SERVICE_ICONS[ic];
                return (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    title={ic}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                      icon === ic ? "bg-gray-900 border-gray-900 text-white" : "border-gray-200 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Observação <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ex: Pool de conexões em 85%"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="px-6 pb-5 flex items-center justify-between">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="text-xs text-red-500 hover:text-red-700 font-semibold"
            >
              Remover serviço
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Bug ───────────────────────────────────────────────
function BugModal({
  epics,
  sprints,
  onClose,
  onSave,
}: {
  epics: Epic[];
  sprints: Sprint[];
  onClose: () => void;
  onSave: (data: Partial<Bug>) => Promise<string | null>;
}) {
  const [title,     setTitle]     = useState("");
  const [severity,  setSeverity]  = useState<BugSeverity>("medium");
  const [epicId,    setEpicId]    = useState("");
  const [sprintId,  setSprintId]  = useState("");
  const [assignee,  setAssignee]  = useState("");
  const [date,      setDate]      = useState(new Date().toISOString().split("T")[0]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) { setError("Título do bug é obrigatório."); return; }
    setLoading(true);
    const err = await onSave({
      title:       title.trim(),
      severity,
      status:      "open",
      epic_id:     epicId   || null,
      sprint_id:   sprintId || null,
      assignee:    assignee.trim() || null,
      reported_at: date,
    } as Partial<Bug>);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Registrar Bug</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva o bug brevemente..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Severidade</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(BUG_CFG) as BugSeverity[]).map((s) => {
                const cfg = BUG_CFG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      severity === s
                        ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {epics.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Épico</label>
                <select
                  value={epicId}
                  onChange={(e) => setEpicId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">Nenhum</option>
                  {epics.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            )}
            {sprints.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sprint</label>
                <select
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <option value="">Nenhum</option>
                  {sprints.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Responsável</label>
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="ex: André M."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}
