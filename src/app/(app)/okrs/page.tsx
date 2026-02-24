"use client";

import { useState } from "react";
import { Link2, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Plus } from "lucide-react";

type Quarter = "Q4 2023" | "Q1 2024" | "Q2 2024";
type KRStatus = "no-prazo" | "em-risco" | "atrasado" | "concluido";

interface KeyResult {
  id: string;
  title: string;
  current: string;
  target: string;
  progress: number;
  status: KRStatus;
  linkedMetric: string | null;
  linkedValue: string | null;
  unit: string;
  trendUp: boolean;
}

interface Objective {
  id: string;
  title: string;
  owner: string;
  initials: string;
  avatarColor: string;
  progress: number;
  keyResults: KeyResult[];
}

const okrData: Record<Quarter, Objective[]> = {
  "Q4 2023": [
    {
      id: "O1",
      title: "Expandir capacidade técnica e estabilidade da plataforma",
      owner: "Sofia Lima",
      initials: "SL",
      avatarColor: "bg-pink-200 text-pink-800",
      progress: 68,
      keyResults: [
        {
          id: "KR1.1",
          title: "Reduzir tempo de resposta da API para < 200ms (P99)",
          current: "280ms",
          target: "200ms",
          progress: 58,
          status: "em-risco",
          linkedMetric: null,
          linkedValue: null,
          unit: "ms",
          trendUp: false,
        },
        {
          id: "KR1.2",
          title: "Atingir 99.9% de uptime mensal",
          current: "99.7%",
          target: "99.9%",
          progress: 80,
          status: "em-risco",
          linkedMetric: null,
          linkedValue: null,
          unit: "%",
          trendUp: true,
        },
        {
          id: "KR1.3",
          title: "Completar migração de infraestrutura para Supabase",
          current: "80%",
          target: "100%",
          progress: 80,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "%",
          trendUp: true,
        },
      ],
    },
    {
      id: "O2",
      title: "Crescer e reter a base de usuários ativos da plataforma",
      owner: "André Mileto",
      initials: "AM",
      avatarColor: "bg-amber-200 text-amber-800",
      progress: 74,
      keyResults: [
        {
          id: "KR2.1",
          title: "Atingir 50 mil usuários ativos mensais",
          current: "45.2k",
          target: "50k",
          progress: 90,
          status: "no-prazo",
          linkedMetric: "Usuários Ativos",
          linkedValue: "45.2k",
          unit: "k",
          trendUp: true,
        },
        {
          id: "KR2.2",
          title: "Reduzir Churn Rate para 1.5%",
          current: "2.1%",
          target: "1.5%",
          progress: 54,
          status: "em-risco",
          linkedMetric: "Churn Rate",
          linkedValue: "2.1%",
          unit: "%",
          trendUp: false,
        },
        {
          id: "KR2.3",
          title: "Elevar NPS geral acima de 8.5",
          current: "8.4",
          target: "8.5",
          progress: 95,
          status: "no-prazo",
          linkedMetric: "NPS Geral",
          linkedValue: "8.4",
          unit: "pts",
          trendUp: true,
        },
        {
          id: "KR2.4",
          title: "Taxa de conversão de leads acima de 15%",
          current: "12.5%",
          target: "15%",
          progress: 63,
          status: "em-risco",
          linkedMetric: "Conversão",
          linkedValue: "12.5%",
          unit: "%",
          trendUp: true,
        },
      ],
    },
    {
      id: "O3",
      title: "Aumentar resultado financeiro e retenção de receita",
      owner: "André Mileto",
      initials: "AM",
      avatarColor: "bg-amber-200 text-amber-800",
      progress: 52,
      keyResults: [
        {
          id: "KR3.1",
          title: "Crescer receita mensal para R$ 2M",
          current: "R$ 1.2M",
          target: "R$ 2M",
          progress: 60,
          status: "em-risco",
          linkedMetric: "Resultado Mês",
          linkedValue: "R$ 1.2M",
          unit: "R$",
          trendUp: true,
        },
        {
          id: "KR3.2",
          title: "Elevar LTV médio por investidor para R$ 600",
          current: "R$ 450",
          target: "R$ 600",
          progress: 75,
          status: "no-prazo",
          linkedMetric: "LTV",
          linkedValue: "R$ 450",
          unit: "R$",
          trendUp: true,
        },
      ],
    },
  ],
  "Q1 2024": [
    {
      id: "O4",
      title: "Lançar módulo de antecipação de recebíveis",
      owner: "Lucas Mendes",
      initials: "LM",
      avatarColor: "bg-emerald-200 text-emerald-800",
      progress: 20,
      keyResults: [
        {
          id: "KR4.1",
          title: "Homologar integração com 2 parceiros de crédito",
          current: "0",
          target: "2",
          progress: 0,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "parceiros",
          trendUp: true,
        },
        {
          id: "KR4.2",
          title: "Processar R$ 5M em operações de antecipação no Q1",
          current: "R$ 0",
          target: "R$ 5M",
          progress: 0,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "R$",
          trendUp: true,
        },
      ],
    },
    {
      id: "O5",
      title: "Evoluir plataforma mobile e aumentar adoção",
      owner: "Carla Rodrigues",
      initials: "CR",
      avatarColor: "bg-purple-200 text-purple-800",
      progress: 15,
      keyResults: [
        {
          id: "KR5.1",
          title: "Lançar redesign do Checkout Mobile",
          current: "0%",
          target: "100%",
          progress: 15,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "%",
          trendUp: true,
        },
        {
          id: "KR5.2",
          title: "Aumentar sessões mobile/web para 60%",
          current: "48%",
          target: "60%",
          progress: 40,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "%",
          trendUp: true,
        },
      ],
    },
  ],
  "Q2 2024": [
    {
      id: "O6",
      title: "Estruturar plataforma de Analytics avançado",
      owner: "Sofia Lima",
      initials: "SL",
      avatarColor: "bg-pink-200 text-pink-800",
      progress: 5,
      keyResults: [
        {
          id: "KR6.1",
          title: "Lançar Analytics Platform v2 em produção",
          current: "0%",
          target: "100%",
          progress: 5,
          status: "no-prazo",
          linkedMetric: null,
          linkedValue: null,
          unit: "%",
          trendUp: true,
        },
      ],
    },
  ],
};

const statusConfig: Record<KRStatus, { label: string; color: string; bg: string }> = {
  "no-prazo": { label: "No Prazo", color: "text-emerald-600", bg: "bg-emerald-50" },
  "em-risco": { label: "Em Risco", color: "text-amber-600", bg: "bg-amber-50" },
  "atrasado": { label: "Atrasado", color: "text-red-600", bg: "bg-red-50" },
  "concluido": { label: "Concluído", color: "text-blue-600", bg: "bg-blue-50" },
};

function ProgressRing({ value, size = 44 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const color = value >= 80 ? "#10b981" : value >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F3F5" strokeWidth="5" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="rotate-90"
        style={{
          transform: `rotate(90deg)`,
          transformOrigin: `${size / 2}px ${size / 2}px`,
          fontSize: "10px",
          fontWeight: "700",
          fill: color,
        }}
      >
        {value}%
      </text>
    </svg>
  );
}

export default function OKRsPage() {
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q4 2023");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ O1: true, O2: true, O3: true });

  const objectives = okrData[activeQuarter];
  const totalKRs = objectives.flatMap((o) => o.keyResults).length;
  const onTrackKRs = objectives.flatMap((o) => o.keyResults).filter((kr) => kr.status === "no-prazo").length;
  const atRiskKRs = objectives.flatMap((o) => o.keyResults).filter((kr) => kr.status === "em-risco").length;
  const avgProgress = Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">OKRs & Metas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Objetivos e Key Results por quarter</p>
        </div>
        <div className="flex items-center gap-2">
          {(["Q4 2023", "Q1 2024", "Q2 2024"] as Quarter[]).map((q) => (
            <button
              key={q}
              onClick={() => setActiveQuarter(q)}
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                activeQuarter === q
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {q}
            </button>
          ))}
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors ml-2">
            <Plus size={14} />
            Novo Objetivo
          </button>
        </div>
      </div>

      {/* Quarter Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Progresso Médio", value: `${avgProgress}%`, color: "text-blue-600" },
          { label: "Key Results", value: String(totalKRs), color: "text-gray-900" },
          { label: "No Prazo", value: String(onTrackKRs), color: "text-emerald-600" },
          { label: "Em Risco", value: String(atRiskKRs), color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Dashboard link info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
        <Link2 size={14} className="text-blue-600 shrink-0" />
        <p className="text-xs text-blue-700">
          <span className="font-bold">KRs vinculados ao Dashboard</span> puxam dados em tempo real das métricas da plataforma. Valores atualizados automaticamente a cada sessão.
        </p>
      </div>

      {/* Objectives */}
      <div className="space-y-4">
        {objectives.map((obj) => {
          const isOpen = expanded[obj.id] !== false;
          return (
            <div key={obj.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Objective Header */}
              <button
                onClick={() => toggle(obj.id)}
                className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors text-left"
              >
                <ProgressRing value={obj.progress} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">{obj.id}</span>
                    <span className="text-[10px] text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">{obj.keyResults.length} Key Results</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{obj.title}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${obj.avatarColor}`}>
                      {obj.initials}
                    </div>
                    <span className="text-xs text-gray-500">{obj.owner}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Key Results */}
              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {obj.keyResults.map((kr) => {
                    const sc = statusConfig[kr.status];
                    return (
                      <div key={kr.id} className="px-6 py-4 flex items-center gap-4">
                        {/* KR ID */}
                        <span className="text-[10px] font-bold text-gray-400 w-12 shrink-0">{kr.id}</span>

                        {/* KR Title + linked badge */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-medium text-gray-800">{kr.title}</p>
                            {kr.linkedMetric && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">
                                <Link2 size={9} />
                                Dashboard: {kr.linkedMetric}
                              </span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  kr.progress >= 80
                                    ? "bg-emerald-500"
                                    : kr.progress >= 50
                                    ? "bg-amber-400"
                                    : "bg-red-400"
                                }`}
                                style={{ width: `${kr.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-500 w-8 text-right shrink-0">
                              {kr.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Current vs Target */}
                        <div className="text-right shrink-0 w-40">
                          <div className="flex items-center justify-end gap-2">
                            <div>
                              <p className="text-[10px] text-gray-400">Atual</p>
                              <p className="text-sm font-bold text-gray-900">
                                {kr.linkedValue ?? kr.current}
                              </p>
                            </div>
                            <div className="text-gray-300">→</div>
                            <div>
                              <p className="text-[10px] text-gray-400">Meta</p>
                              <p className="text-sm font-bold text-gray-500">{kr.target}</p>
                            </div>
                            {kr.trendUp ? (
                              <TrendingUp size={14} className="text-emerald-500 ml-1" />
                            ) : (
                              <TrendingDown size={14} className="text-red-500 ml-1" />
                            )}
                          </div>
                        </div>

                        {/* Status badge */}
                        <span className={`text-[11px] font-semibold px-3 py-1 rounded-full shrink-0 ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </div>
                    );
                  })}

                  {/* Add KR */}
                  <div className="px-6 py-3">
                    <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                      <Plus size={12} />
                      Adicionar Key Result
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
