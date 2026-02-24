"use client";

import { useState } from "react";
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
  Filter,
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
  startedAt: string;
  resolvedAt?: string;
  duration: string;
  affectedUsers: number;
  affectedPct: number;
  rootCause?: string;
  sprintTask?: string;
  components: string[];
  timeline: TimelineEvent[];
}

const incidents: Incident[] = [
  {
    id: "INC-042",
    title: "Lentidão no Auth Service — P99 > 500ms no login",
    severity: "high",
    status: "investigating",
    startedAt: "24 Fev 2024, 14:32",
    duration: "2h 14min",
    affectedUsers: 1240,
    affectedPct: 2.7,
    components: ["Auth Service", "API Gateway"],
    sprintTask: "T-089",
    timeline: [
      { time: "14:32", event: "Alerta automático: P99 > 500ms no Auth Service", author: "Sistema" },
      { time: "14:38", event: "Incidente criado e equipe notificada via Slack", author: "André M." },
      { time: "14:55", event: "Root cause identificado: pool de conexões esgotado no RDS", author: "Lucas M." },
      { time: "15:10", event: "Hotfix em revisão: aumento do connection pool para 200", author: "Sofia L." },
      { time: "15:45", event: "Métricas normalizando — P99 caiu para 180ms", author: "Sistema" },
    ],
  },
  {
    id: "INC-041",
    title: "Falha no worker de processamento de webhooks de pagamento",
    severity: "critical",
    status: "resolved",
    startedAt: "20 Fev 2024, 09:15",
    resolvedAt: "20 Fev 2024, 11:42",
    duration: "2h 27min",
    affectedUsers: 8920,
    affectedPct: 19.8,
    rootCause:
      "Timeout no worker de processamento devido a payload malformado recebido do gateway XP Investimentos.",
    components: ["Webhook Worker", "Database"],
    sprintTask: "T-088",
    timeline: [
      { time: "09:15", event: "Fila de webhooks acumulando > 500 mensagens pendentes", author: "Sistema" },
      { time: "09:22", event: "Incidente P1 declarado — comandante: Carla R.", author: "Carla R." },
      { time: "09:45", event: "Payload malformado do gateway XP Investimentos identificado", author: "André M." },
      { time: "10:30", event: "Fix deployado: validação e skip de payloads inválidos", author: "Lucas M." },
      { time: "11:42", event: "Fila drenada, processamento de webhooks normalizado", author: "Sofia L." },
    ],
  },
  {
    id: "INC-040",
    title: "Timeout na geração de relatórios PDF para usuários Enterprise",
    severity: "medium",
    status: "postmortem",
    startedAt: "15 Fev 2024, 16:45",
    resolvedAt: "15 Fev 2024, 18:10",
    duration: "1h 25min",
    affectedUsers: 340,
    affectedPct: 0.8,
    rootCause:
      "Query sem índice adequado ao filtrar relatórios com período > 12 meses e múltiplos produtos simultâneos.",
    components: ["Relatórios Service", "Database"],
    sprintTask: "T-082",
    timeline: [
      { time: "16:45", event: "Erros 504 em /api/reports/generate para relatórios com período longo", author: "Sistema" },
      { time: "17:00", event: "Root cause: query N+1 sem índice composto confirmado", author: "André M." },
      { time: "17:30", event: "Migration com índice composto criada e deployada em produção", author: "Lucas M." },
      { time: "18:10", event: "Geração normalizada, P99 caiu de >30s para 2.1s", author: "Sistema" },
    ],
  },
  {
    id: "INC-039",
    title: "Falha intermitente no envio de e-mails transacionais de boas-vindas",
    severity: "low",
    status: "resolved",
    startedAt: "10 Fev 2024, 11:20",
    resolvedAt: "10 Fev 2024, 12:05",
    duration: "45min",
    affectedUsers: 120,
    affectedPct: 0.3,
    rootCause: "Rate limit atingido no SendGrid durante execução simultânea de campanha de marketing.",
    components: ["Email Service"],
    sprintTask: "T-078",
    timeline: [
      { time: "11:20", event: "Taxa de bounce em e-mails transacionais subiu para 15%", author: "Sistema" },
      { time: "11:35", event: "Rate limit do SendGrid atingido por campanha simultânea", author: "Carla R." },
      { time: "11:50", event: "Campanha pausada, fila transacional priorizada", author: "André M." },
      { time: "12:05", event: "Envio normalizado, 120 e-mails pendentes reprocessados", author: "Sistema" },
    ],
  },
  {
    id: "INC-038",
    title: "Inconsistência no cálculo de rentabilidade acumulada de CRI pós-evento de juros",
    severity: "high",
    status: "postmortem",
    startedAt: "05 Fev 2024, 08:00",
    resolvedAt: "05 Fev 2024, 14:30",
    duration: "6h 30min",
    affectedUsers: 2850,
    affectedPct: 6.3,
    rootCause:
      "Bug no recálculo de YTM após pagamento de juros intermediários — data de liquidação não refletida corretamente.",
    components: ["Cálculo Financeiro", "Portfólio Service"],
    sprintTask: "T-075",
    timeline: [
      { time: "08:00", event: "Alertas de clientes sobre rentabilidade inconsistente no portfólio", author: "Suporte" },
      { time: "09:15", event: "Bug confirmado no módulo de cálculo de CRI pós-evento", author: "Lucas M." },
      { time: "11:00", event: "Hotfix em desenvolvimento — lógica de YTM corrigida", author: "André M." },
      { time: "13:00", event: "Fix deployado, recálculo em lote iniciado para 2.850 carteiras", author: "Sofia L." },
      { time: "14:30", event: "Recálculo concluído, dados validados com amostragem de 100 carteiras", author: "Lucas M." },
    ],
  },
];

const severityConfig: Record<Severity, { label: string; color: string; bg: string; border: string; dot: string }> = {
  critical: { label: "Crítico", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  high: { label: "Alto", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-400" },
  medium: { label: "Médio", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
  low: { label: "Baixo", color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-300" },
};

const statusConfig: Record<IncidentStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active: { label: "Ativo", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  investigating: { label: "Investigando", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
  resolved: { label: "Resolvido", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  postmortem: { label: "Postmortem", color: "text-blue-600", bg: "bg-blue-50", icon: AlertOctagon },
};

export default function IncidentsPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState<string | null>("INC-042");

  const activeIncidents = incidents.filter(
    (i) => i.status === "active" || i.status === "investigating"
  );

  const filteredIncidents = incidents.filter((i) => {
    if (filter === "active") return i.status === "active" || i.status === "investigating";
    if (filter === "resolved") return i.status === "resolved" || i.status === "postmortem";
    return true;
  });

  const stats = {
    active: incidents.filter((i) => i.status === "active" || i.status === "investigating").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    postmortem: incidents.filter((i) => i.status === "postmortem").length,
    mttr: "2h 08min",
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Incidents & Alertas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro e timeline de incidentes de produção</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 rounded-xl px-4 py-2.5 hover:bg-red-600 transition-colors">
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
          { label: "Em Andamento", value: stats.active, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
          { label: "Resolvidos (30d)", value: stats.resolved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Postmortem", value: stats.postmortem, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "MTTR médio", value: stats.mttr, color: "text-gray-800", bg: "bg-gray-50", border: "border-gray-200" },
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
          <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={12} />
            Filtros
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {filteredIncidents.map((incident) => {
            const sevCfg = severityConfig[incident.severity];
            const stsCfg = statusConfig[incident.status];
            const StatusIcon = stsCfg.icon;
            const isExpanded = expanded === incident.id;

            return (
              <div key={incident.id}>
                {/* Row */}
                <div
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : incident.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${sevCfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold text-gray-400">{incident.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevCfg.bg} ${sevCfg.color} ${sevCfg.border}`}
                      >
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
                        <span>{incident.startedAt}</span>
                      </div>
                      <span className="text-xs text-gray-400">Duração: {incident.duration}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Users size={11} />
                        <span>
                          {incident.affectedUsers.toLocaleString("pt-BR")} usuários ({incident.affectedPct}%)
                        </span>
                      </div>
                      {incident.sprintTask && (
                        <div className="flex items-center gap-1 text-xs text-blue-500 font-semibold">
                          <Link2 size={11} />
                          <span>{incident.sprintTask}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Timeline */}
                {isExpanded && (
                  <div className="px-6 pb-6 bg-gray-50/50 border-t border-gray-100">
                    {incident.rootCause && (
                      <div className="mt-4 px-4 py-3 bg-white rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Root Cause
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">{incident.rootCause}</p>
                      </div>
                    )}
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
