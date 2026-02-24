import {
  TrendingUp,
  TrendingDown,
  FileText,
  Database,
  Users,
  ChevronRight,
  RefreshCw,
  MapPin,
} from "lucide-react";

// ── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  dark?: boolean;
  badge?: string;
}

function KPICard({ label, value, trend, trendUp, dark, badge }: KPICardProps) {
  if (dark) {
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#1C2536" }}>
        <p className="text-xs text-slate-400 font-medium tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white leading-tight">{value}</p>
        <div className="flex items-center gap-1.5">
          <TrendingUp size={13} className="text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">{trend}</span>
        </div>
        {badge && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full w-fit">
            {badge}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-medium tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <div className="flex items-center gap-1.5">
        {trendUp ? (
          <TrendingUp size={13} className="text-emerald-500" />
        ) : (
          <TrendingDown size={13} className="text-red-500" />
        )}
        <span className={`text-xs font-semibold ${trendUp ? "text-emerald-500" : "text-red-500"}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="p-6 space-y-5">

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard label="Conversão" value="12.5%" trend="+2.3%" trendUp />
        <KPICard label="Usuários Ativos" value="45.2k" trend="+5.1%" trendUp />
        <KPICard
          label="Resultado Mês"
          value="R$ 1.2M"
          trend="Batendo Meta"
          trendUp
          dark
          badge="↑ Batendo Meta"
        />
        <KPICard label="Churn Rate" value="2.1%" trend="-0.5%" trendUp={false} />
        <KPICard label="LTV" value="R$ 450" trend="+1.2%" trendUp />
      </div>

      {/* ── Sprint Atual ── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Sprint Atual Detalhada</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fase de Expansão de APIs Financeiras</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            Sprint #42
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600">Progresso da Sprint</span>
            <span className="text-xs font-bold text-blue-600">65%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: "65%" }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-gray-400">Início: 01 Out</span>
            <span className="text-[11px] text-gray-400">12 dias restantes</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Total de Tasks</p>
            <p className="text-2xl font-bold text-gray-900">48</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs text-amber-600 mb-1">Em Revisão</p>
            <p className="text-2xl font-bold text-amber-600">7</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-xs text-emerald-600 mb-1">Finalizadas</p>
            <p className="text-2xl font-bold text-emerald-600">31</p>
          </div>
        </div>
      </div>

      {/* ── Forms & Epics Row ── */}
      <div className="grid grid-cols-5 gap-4">

        {/* Forms & Automação */}
        <div className="col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Forms & Automação</h2>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>

          <div className="space-y-3">
            {/* CR Mensal */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <FileText size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">CR Mensal</p>
                <p className="text-xs text-gray-500">Relatórios de conversão</p>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0">
                Ver Base
              </button>
            </div>

            {/* Base de Dados Mensal */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Database size={16} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Base de Dados Mensal</p>
                <p className="text-xs text-gray-500">Sincronização automática</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                ATIVO
              </span>
            </div>

            {/* Automação de Leads */}
            <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3.5">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Users size={16} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Automação de Leads</p>
                <p className="text-xs text-gray-500">Fluxo de output para CRM</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 shrink-0">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Próximos Épicos */}
        <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Próximos Épicos</h2>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Ver Tudo
            </button>
          </div>

          <div className="space-y-4">
            {/* Épico 15 */}
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-[11px] font-semibold text-gray-400 mb-1">ÉPICO #15</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5">
                Módulo de Antecipação de Recebíveis
              </p>
              <p className="text-[11px] text-gray-500">
                Início previsto: Nov/2023 •{" "}
                <span className="text-red-500 font-semibold">Prioridade Alta</span>
              </p>
            </div>

            {/* Épico 16 */}
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-[11px] font-semibold text-gray-400 mb-1">ÉPICO #16</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5">
                Redesign do Checkout Mobile
              </p>
              <p className="text-[11px] text-gray-500">
                Início previsto: Dez/2023 •{" "}
                <span className="text-amber-500 font-semibold">Prioridade Média</span>
              </p>
            </div>

            {/* Épico 17 */}
            <div className="border-l-4 border-gray-200 pl-4">
              <p className="text-[11px] font-semibold text-gray-400 mb-1">ÉPICO #17</p>
              <p className="text-sm font-semibold text-gray-800 leading-snug mb-1.5">
                Integração Multi-Bank API
              </p>
              <p className="text-[11px] text-gray-500">
                Jan/2024 •{" "}
                <span className="text-gray-400 font-semibold">Planejamento</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feedback & Map Row ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Feedback Loop */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-5">Feedback Loop (Input/Output)</h2>

          <div className="rounded-2xl p-5 space-y-4" style={{ background: "#1C2536" }}>
            {/* NPS Score */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8C14.5 4.41 11.59 1.5 8 1.5ZM8 12C5.79 12 4 10.21 4 8C4 5.79 5.79 4 8 4C10.21 4 12 5.79 12 8C12 10.21 10.21 12 8 12Z" fill="white" fillOpacity="0.8"/>
                  <circle cx="8" cy="8" r="2" fill="white" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">NPS Geral</p>
                <p className="text-xl font-bold text-white">8.4</p>
              </div>
            </div>

            {/* Feedback recente */}
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Feedback Recente
                </p>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;A nova interface de investimentos facilitou muito a visualização do portfólio.&rdquo;
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3.5">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Principal Dor
                </p>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;Lentidão no carregamento do extrato anual consolidado.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Geográfico */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-5">Mapa Geográfico de Operações</h2>

          <div className="relative rounded-xl overflow-hidden" style={{ height: "220px" }}>
            {/* Map background */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 40% 45%, #c8e6c9 0%, transparent 55%),
                  radial-gradient(ellipse at 65% 60%, #b2dfdb 0%, transparent 45%),
                  radial-gradient(ellipse at 30% 70%, #a5d6a7 0%, transparent 50%),
                  radial-gradient(ellipse at 55% 30%, #dcedc8 0%, transparent 40%),
                  #d4edda
                `,
              }}
            />

            {/* Grid overlay for map feel */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Water edges */}
            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(144,202,249,0.3)]" />

            {/* Location marker */}
            <div className="absolute bottom-4 right-4 bg-white rounded-xl shadow-md px-3.5 py-2.5 flex items-center gap-2">
              <MapPin size={14} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Região Destaque
                </p>
                <p className="text-xs font-bold text-gray-800">São Paulo / SP</p>
              </div>
            </div>

            {/* Dot markers */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-200" />
            </div>
            <div className="absolute top-1/3 left-1/3">
              <div className="w-2 h-2 bg-blue-400 rounded-full ring-2 ring-blue-100" />
            </div>
            <div className="absolute top-2/3 right-1/3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-emerald-100" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="flex items-center justify-between py-4 px-1 border-t border-gray-200 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="3" height="3" rx="0.5" fill="white" />
              <rect x="6" y="1" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.7" />
              <rect x="1" y="6" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.7" />
              <rect x="6" y="6" width="3" height="3" rx="0.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-xs text-gray-500">
            Bloxs Investimentos © 2024 • Product Engineering
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xs text-gray-400 hover:text-gray-600">Termos</button>
          <button className="text-xs text-gray-400 hover:text-gray-600">Privacidade</button>
          <button className="text-xs text-gray-400 hover:text-gray-600">Documentação Técnica</button>
        </div>
      </footer>
    </div>
  );
}
