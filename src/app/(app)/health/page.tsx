import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Server,
  Shield,
  Mail,
  Zap,
  Globe,
  HardDrive,
} from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "outage";

interface Service {
  name: string;
  status: ServiceStatus;
  uptime: number;
  latency: number;
  icon: React.ElementType;
}

const services: Service[] = [
  { name: "API Gateway", status: "operational", uptime: 99.98, latency: 42, icon: Globe },
  { name: "Database (PostgreSQL)", status: "operational", uptime: 99.95, latency: 8, icon: Database },
  { name: "Auth Service", status: "degraded", uptime: 98.2, latency: 320, icon: Shield },
  { name: "Redis Cache", status: "operational", uptime: 100.0, latency: 2, icon: Zap },
  { name: "Email Service", status: "operational", uptime: 99.9, latency: 180, icon: Mail },
  { name: "Webhook Worker", status: "operational", uptime: 99.85, latency: 95, icon: Server },
  { name: "Storage (S3)", status: "operational", uptime: 100.0, latency: 65, icon: HardDrive },
  { name: "CDN", status: "operational", uptime: 100.0, latency: 12, icon: Globe },
];

const bugs = [
  { severity: "Crítico", count: 0, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  { severity: "Alto", count: 2, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  { severity: "Médio", count: 8, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { severity: "Baixo", count: 15, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" },
];

const p99Trend = [
  { day: "Seg", ms: 234 },
  { day: "Ter", ms: 245 },
  { day: "Qua", ms: 289 },
  { day: "Qui", ms: 312 },
  { day: "Sex", ms: 245 },
  { day: "Sáb", ms: 198 },
  { day: "Dom", ms: 245 },
];

const uptimeBlocks = Array.from({ length: 90 }, (_, i): ServiceStatus => {
  const day = 90 - i;
  if (day === 4 || day === 22) return "degraded";
  if (day === 45) return "outage";
  return "operational";
});

const statusConfig: Record<ServiceStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  operational: { label: "Operacional", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  degraded: { label: "Degradado", color: "text-amber-600", bg: "bg-amber-50", icon: AlertTriangle },
  outage: { label: "Indisponível", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

const uptimeBlockColor: Record<ServiceStatus, string> = {
  operational: "bg-emerald-400",
  degraded: "bg-amber-400",
  outage: "bg-red-400",
};

const healthScore = 87;
const operationalCount = services.filter((s) => s.status === "operational").length;
const degradedCount = services.filter((s) => s.status === "degraded").length;
const maxP99 = Math.max(...p99Trend.map((d) => d.ms));

export default function HealthPage() {
  const scoreColor =
    healthScore >= 90 ? "text-emerald-600" : healthScore >= 70 ? "text-amber-600" : "text-red-600";
  const scoreRingColor =
    healthScore >= 90 ? "#10b981" : healthScore >= 70 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Health Score</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitoramento unificado de saúde da plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Atualizado há 2 min</span>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Score + Quick Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {/* Score Ring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="relative w-24 h-24 shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#f3f4f6" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="42"
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
            <p className={`text-sm font-semibold mt-0.5 ${scoreColor}`}>
              {healthScore >= 90 ? "Excelente" : healthScore >= 70 ? "Atenção" : "Crítico"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {operationalCount}/{services.length} serviços ok
            </p>
            {degradedCount > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle size={11} className="text-amber-500" />
                <span className="text-xs text-amber-600 font-semibold">{degradedCount} degradado(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick metrics */}
        {[
          { label: "Uptime (30d)", value: "99.72%", sub: "Meta: 99.9%", ok: false },
          { label: "P99 Resposta", value: "245ms", sub: "Meta: < 300ms", ok: true },
          { label: "Error Rate", value: "0.12%", sub: "Meta: < 0.5%", ok: true },
        ].map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col justify-between"
          >
            <p className="text-xs text-gray-500">{m.label}</p>
            <div>
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <div className={`flex items-center gap-1 mt-1 ${m.ok ? "text-emerald-600" : "text-amber-600"}`}>
                {m.ok ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                <span className="text-xs font-semibold">{m.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Services + Bugs/P99 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Services — 2 cols */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Status dos Serviços</p>
          </div>
          <div className="divide-y divide-gray-50">
            {services.map((svc) => {
              const cfg = statusConfig[svc.status];
              const StatusIcon = cfg.icon;
              const SvcIcon = svc.icon;
              return (
                <div
                  key={svc.name}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <SvcIcon size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{svc.name}</p>
                    <p className="text-xs text-gray-400">Uptime: {svc.uptime}%</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-xs font-bold text-gray-700">{svc.latency}ms</p>
                    <p className="text-[10px] text-gray-400">avg latência</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} shrink-0`}>
                    <StatusIcon size={11} className={cfg.color} />
                    <span className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bugs + P99 — 1 col */}
        <div className="space-y-4">
          {/* Bug severity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">Bugs em Aberto</p>
              <p className="text-xs text-gray-400 mt-0.5">por severidade</p>
            </div>
            <div className="p-4 space-y-2.5">
              {bugs.map((b) => (
                <div
                  key={b.severity}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${b.bg} ${b.border}`}
                >
                  <span className={`text-xs font-bold ${b.color}`}>{b.severity}</span>
                  <span className={`text-xl font-black ${b.color}`}>{b.count}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Total em aberto</span>
                <span className="text-sm font-bold text-gray-800">25</span>
              </div>
            </div>
          </div>

          {/* P99 Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">P99 Latência</p>
              <p className="text-xs text-gray-400 mt-0.5">últimos 7 dias (ms)</p>
            </div>
            <div className="px-5 pb-4 pt-3">
              <div className="flex items-end gap-1.5 h-16">
                {p99Trend.map((d) => {
                  const heightPct = (d.ms / maxP99) * 100;
                  const isHigh = d.ms > 300;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-sm ${isHigh ? "bg-amber-400" : "bg-blue-500"}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] text-gray-400">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">Atual: 245ms</span>
                <span className="text-xs text-gray-400">Meta: &lt;300ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Histórico de Uptime</p>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 90 dias</p>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: "Operacional", color: "bg-emerald-400" },
              { label: "Degradado", color: "bg-amber-400" },
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
          <div className="flex items-center gap-0.5 flex-wrap">
            {uptimeBlocks.map((status, i) => (
              <div
                key={i}
                title={`Dia ${90 - i}`}
                className={`w-2 h-6 rounded-sm ${uptimeBlockColor[status]}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">90 dias atrás</span>
            <span className="text-xs text-gray-400">Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}
