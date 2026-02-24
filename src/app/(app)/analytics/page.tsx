"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowDown, Download, ChevronRight } from "lucide-react";

type Period = "7d" | "30d" | "90d" | "12m";
type FunnelId = "onboarding" | "investment" | "reactivation";

const periods: { id: Period; label: string }[] = [
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "90d", label: "90 dias" },
  { id: "12m", label: "12 meses" },
];

const funnels: { id: FunnelId; name: string; steps: { name: string; users: number }[] }[] = [
  {
    id: "onboarding",
    name: "Onboarding",
    steps: [
      { name: "Cadastro Iniciado", users: 12450 },
      { name: "Email Verificado", users: 10820 },
      { name: "KYC Enviado", users: 7340 },
      { name: "KYC Aprovado", users: 6210 },
      { name: "Primeiro Aporte", users: 3890 },
    ],
  },
  {
    id: "investment",
    name: "Fluxo de Investimento",
    steps: [
      { name: "Visitou Produto", users: 8920 },
      { name: "Simulou Aporte", users: 5640 },
      { name: "Iniciou Aporte", users: 2890 },
      { name: "Aporte Concluído", users: 2450 },
    ],
  },
  {
    id: "reactivation",
    name: "Reativação",
    steps: [
      { name: "E-mail Enviado", users: 5200 },
      { name: "E-mail Aberto", users: 2860 },
      { name: "Clicou no CTA", users: 890 },
      { name: "Login Realizado", users: 640 },
      { name: "Novo Aporte", users: 420 },
    ],
  },
];

const cohorts: { month: string; users: number; retention: number[] }[] = [
  { month: "Ago/23", users: 1240, retention: [100, 68, 52, 47, 43, 41, 39, 37, 36, 35, 34, 34, 33] },
  { month: "Set/23", users: 1580, retention: [100, 71, 55, 49, 45, 42, 40, 38, 37, 36, 35, 34] },
  { month: "Out/23", users: 1920, retention: [100, 74, 58, 52, 47, 44, 42, 40, 38] },
  { month: "Nov/23", users: 2140, retention: [100, 76, 60, 54, 49, 46, 43] },
  { month: "Dez/23", users: 1860, retention: [100, 73, 57, 50, 46] },
  { month: "Jan/24", users: 2380, retention: [100, 78, 62, 55] },
  { month: "Fev/24", users: 2610, retention: [100, 79, 63] },
  { month: "Mar/24", users: 2890, retention: [100, 81] },
  { month: "Abr/24", users: 3120, retention: [100] },
];

const features = [
  { name: "Portfólio", adoption: 89, trend: +2.1, isNew: false },
  { name: "Extrato Consolidado", adoption: 76, trend: +8.4, isNew: true },
  { name: "Relatórios PDF", adoption: 54, trend: +12.3, isNew: true },
  { name: "Filtros Avançados", adoption: 48, trend: +5.2, isNew: true },
  { name: "Notificações Push", adoption: 41, trend: -1.8, isNew: false },
  { name: "Autenticação 2FA", adoption: 38, trend: +15.6, isNew: false },
  { name: "Comparador", adoption: 22, trend: +3.1, isNew: false },
  { name: "Simulador IR", adoption: 18, trend: +0.5, isNew: false },
];

const journeys = [
  { path: "Dashboard → Portfólio → Produto → Aporte", sessions: 4820, cvr: 34.2 },
  { path: "Dashboard → Extrato → Filtros → Relatório", sessions: 3210, cvr: 28.7 },
  { path: "Notificação → Produto → Simulação → Aporte", sessions: 2890, cvr: 41.5 },
  { path: "Dashboard → Comparador → Produto → Aporte", sessions: 1640, cvr: 38.9 },
  { path: "Login → KYC → Produto → Primeiro Aporte", sessions: 1240, cvr: 52.1 },
];

const getRetentionStyle = (pct: number) => {
  if (pct >= 80) return "bg-blue-600 text-white";
  if (pct >= 60) return "bg-blue-400 text-white";
  if (pct >= 40) return "bg-blue-200 text-blue-800";
  if (pct >= 20) return "bg-blue-100 text-blue-700";
  return "bg-blue-50 text-blue-400";
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");
  const [selectedFunnel, setSelectedFunnel] = useState<FunnelId>("onboarding");

  const funnel = funnels.find((f) => f.id === selectedFunnel)!;
  const maxUsers = funnel.steps[0].users;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analytics de Produto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Funis de conversão, retenção por cohort e adoção de features</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  period === p.id ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <Download size={14} />
            Exportar
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Conversão Onboarding", value: "31.2%", delta: "+2.1%", up: true },
          { label: "Retenção W4", value: "47.0%", delta: "+3.4%", up: true },
          { label: "Adoção Média", value: "48.3%", delta: "+8.7%", up: true },
          { label: "Sessões/Usuário", value: "6.2", delta: "-0.3", up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <div className={`flex items-center gap-1 mt-1 ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>
              {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span className="text-xs font-semibold">{kpi.delta} vs. período anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel + Feature Adoption */}
      <div className="grid grid-cols-3 gap-4">
        {/* Funnel — 2 cols */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Funis de Conversão</p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {funnels.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFunnel(f.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
                    selectedFunnel === f.id ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6 space-y-1">
            {funnel.steps.map((step, i) => {
              const pct = (step.users / maxUsers) * 100;
              const dropPct =
                i > 0
                  ? ((funnel.steps[i - 1].users - step.users) / funnel.steps[i - 1].users) * 100
                  : null;
              return (
                <div key={i}>
                  {dropPct !== null && (
                    <div className="flex items-center gap-2 my-1.5 ml-36">
                      <ArrowDown size={11} className="text-red-400" />
                      <span className="text-[11px] text-red-400 font-semibold">
                        -{dropPct.toFixed(1)}% drop-off
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-32 shrink-0 text-right">
                      <span className="text-xs text-gray-500">{step.name}</span>
                    </div>
                    <div className="flex-1 h-10 bg-gray-50 rounded-xl overflow-hidden relative">
                      <div
                        className="h-full bg-blue-500 rounded-xl transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-bold text-white drop-shadow-sm">
                          {step.users.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className="w-12 shrink-0 text-right">
                      <span className="text-xs font-bold text-gray-600">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Taxa de conversão total</span>
              <span className="text-sm font-bold text-blue-600">
                {((funnel.steps[funnel.steps.length - 1].users / maxUsers) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Feature Adoption — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Adoção de Features</p>
            <p className="text-xs text-gray-400 mt-0.5">% de usuários ativos que usaram</p>
          </div>
          <div className="p-5 space-y-3.5">
            {features.map((f) => (
              <div key={f.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-700">{f.name}</span>
                    {f.isNew && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                        NOVO
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-0.5 ${f.trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {f.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    <span className="text-[10px] font-bold">
                      {f.trend > 0 ? "+" : ""}
                      {f.trend}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${f.isNew ? "bg-blue-500" : "bg-gray-400"}`}
                      style={{ width: `${f.adoption}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-600 w-8 text-right">{f.adoption}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cohort Analysis */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Cohort Analysis — Retenção</p>
            <p className="text-xs text-gray-400 mt-0.5">% de usuários ativos por semana após cadastro</p>
          </div>
          <div className="flex items-center gap-3">
            {[
              { label: "≥80%", color: "bg-blue-600" },
              { label: "≥60%", color: "bg-blue-400" },
              { label: "≥40%", color: "bg-blue-200" },
              { label: "<40%", color: "bg-blue-50 border border-blue-200" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${item.color}`} />
                <span className="text-[10px] text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-semibold text-gray-500 px-6 py-3 w-24">Cohort</th>
                <th className="font-semibold text-gray-500 px-2 py-3 w-16 text-center">Users</th>
                {Array.from({ length: 13 }, (_, i) => (
                  <th key={i} className="font-semibold text-gray-500 px-1 py-3 w-12 text-center">
                    {i === 0 ? "W0" : `W${i}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.month} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-2 font-semibold text-gray-700 whitespace-nowrap">{cohort.month}</td>
                  <td className="px-2 py-2 text-center text-gray-500">
                    {cohort.users.toLocaleString("pt-BR")}
                  </td>
                  {Array.from({ length: 13 }, (_, i) => {
                    const val = i < cohort.retention.length ? cohort.retention[i] : null;
                    return (
                      <td key={i} className="px-1 py-1 text-center">
                        {val !== null ? (
                          <div className={`rounded-md py-1.5 text-[11px] font-bold ${getRetentionStyle(val)}`}>
                            {val}%
                          </div>
                        ) : (
                          <div className="rounded-md py-1.5 bg-gray-50" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Journeys */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Top Jornadas de Usuário</p>
          <p className="text-xs text-gray-400 mt-0.5">Caminhos mais frequentes com maior taxa de conversão</p>
        </div>
        <div className="divide-y divide-gray-50">
          {journeys.map((j, i) => (
            <div key={i} className="flex items-center gap-6 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <span className="text-sm font-black text-gray-200 w-4 shrink-0">{i + 1}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {j.path.split(" → ").map((step, si, arr) => (
                    <span key={si} className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">
                        {step}
                      </span>
                      {si < arr.length - 1 && <ChevronRight size={10} className="text-gray-400" />}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Sessões</p>
                  <p className="text-sm font-bold text-gray-800">{j.sessions.toLocaleString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Conversão</p>
                  <p className="text-sm font-bold text-emerald-600">{j.cvr}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
