"use client";

import { useState } from "react";
import { Plus, Search, Users, Calendar, Lightbulb, TrendingUp, MessageSquare, BarChart3 } from "lucide-react";

type ResearchType = "all" | "interview" | "usability" | "survey" | "data";
type ResearchStatus = "planned" | "ongoing" | "completed";
type InsightType = "pain" | "opportunity" | "behavior" | "request";

interface Research {
  id: string;
  title: string;
  type: Exclude<ResearchType, "all">;
  status: ResearchStatus;
  date: string;
  participants: number;
  insights: number;
  epic?: string;
  epicColor?: string;
  owner: string;
  initials: string;
  avatarColor: string;
  tags: string[];
  objective: string;
}

interface Insight {
  id: string;
  quote: string;
  type: InsightType;
  tags: string[];
  sourceId: string;
  epic?: string;
  epicColor?: string;
  date: string;
  severity: "high" | "medium" | "low";
}

const typeConfig: Record<Exclude<ResearchType, "all">, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  interview: { label: "Entrevista", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  usability: { label: "Teste de Usabilidade", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  survey: { label: "Pesquisa Quant.", icon: BarChart3, color: "text-emerald-600", bg: "bg-emerald-50" },
  data: { label: "Análise de Dados", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
};

const insightConfig: Record<InsightType, { label: string; color: string; bg: string; border: string }> = {
  pain: { label: "Dor", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  opportunity: { label: "Oportunidade", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  behavior: { label: "Comportamento", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  request: { label: "Pedido", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
};

const statusStyle: Record<ResearchStatus, { label: string; color: string; dot: string }> = {
  completed: { label: "Concluída", color: "text-emerald-600", dot: "bg-emerald-400" },
  ongoing: { label: "Em Andamento", color: "text-blue-600", dot: "bg-blue-400" },
  planned: { label: "Planejada", color: "text-gray-400", dot: "bg-gray-300" },
};

const researches: Research[] = [
  {
    id: "R-001",
    title: "Mapeamento da jornada de onboarding KYC",
    type: "interview",
    status: "completed",
    date: "18 Out 2023",
    participants: 12,
    insights: 34,
    epic: "Onboarding",
    epicColor: "bg-blue-100 text-blue-700",
    owner: "Sofia L.",
    initials: "SL",
    avatarColor: "bg-pink-200 text-pink-800",
    tags: ["KYC", "Onboarding", "Fricção"],
    objective: "Identificar pontos de abandono e oportunidades de simplificação no fluxo de KYC.",
  },
  {
    id: "R-002",
    title: "Teste de usabilidade — nova tela de Portfólio",
    type: "usability",
    status: "completed",
    date: "05 Out 2023",
    participants: 8,
    insights: 22,
    epic: "Portfólio",
    epicColor: "bg-emerald-100 text-emerald-700",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    tags: ["Portfólio", "Usabilidade", "Mobile"],
    objective: "Validar o redesign da tela de portfólio com foco em clareza de rentabilidade.",
  },
  {
    id: "R-003",
    title: "NPS Trimestral Q3/2023",
    type: "survey",
    status: "completed",
    date: "30 Set 2023",
    participants: 2840,
    insights: 67,
    owner: "Carla R.",
    initials: "CR",
    avatarColor: "bg-purple-200 text-purple-800",
    tags: ["NPS", "Satisfação", "Q3"],
    objective: "Medir satisfação geral e identificar promotores, neutros e detratores na base.",
  },
  {
    id: "R-004",
    title: "Análise de funil — dados Mixpanel Q3",
    type: "data",
    status: "completed",
    date: "20 Set 2023",
    participants: 0,
    insights: 18,
    epic: "Conversão",
    epicColor: "bg-amber-100 text-amber-700",
    owner: "Lucas M.",
    initials: "LM",
    avatarColor: "bg-emerald-200 text-emerald-800",
    tags: ["Funil", "Dados", "Conversão"],
    objective: "Mapear drop-offs no funil de onboarding usando dados quantitativos do Mixpanel.",
  },
  {
    id: "R-005",
    title: "Entrevistas sobre Relatório de IR",
    type: "interview",
    status: "ongoing",
    date: "24 Out 2023",
    participants: 5,
    insights: 12,
    epic: "Compliance",
    epicColor: "bg-purple-100 text-purple-700",
    owner: "Sofia L.",
    initials: "SL",
    avatarColor: "bg-pink-200 text-pink-800",
    tags: ["IR", "Compliance", "Declaração"],
    objective: "Entender as dificuldades na declaração de IR, com foco em renda fixa isenta.",
  },
  {
    id: "R-006",
    title: "Teste A/B — CTA da tela de Produto",
    type: "usability",
    status: "ongoing",
    date: "22 Out 2023",
    participants: 3200,
    insights: 4,
    epic: "Conversão",
    epicColor: "bg-amber-100 text-amber-700",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    tags: ["A/B Test", "CTA", "Conversão"],
    objective: "Testar variações do botão de aporte para aumentar a conversão em 5%.",
  },
  {
    id: "R-007",
    title: "Jobs-to-be-Done — Investidor Conservador",
    type: "interview",
    status: "planned",
    date: "Nov 2023",
    participants: 0,
    insights: 0,
    epic: "Produto",
    epicColor: "bg-gray-100 text-gray-600",
    owner: "Carla R.",
    initials: "CR",
    avatarColor: "bg-purple-200 text-purple-800",
    tags: ["JTBD", "Segmentação", "Conservador"],
    objective: "Entender as motivações e trabalhos do investidor conservador para refinar o produto.",
  },
  {
    id: "R-008",
    title: "Pesquisa de satisfação — Módulo de Aportes",
    type: "survey",
    status: "planned",
    date: "Nov 2023",
    participants: 0,
    insights: 0,
    epic: "Pagamentos",
    epicColor: "bg-blue-100 text-blue-700",
    owner: "Lucas M.",
    initials: "LM",
    avatarColor: "bg-emerald-200 text-emerald-800",
    tags: ["Aportes", "Satisfação", "Pix"],
    objective: "Medir satisfação com o novo módulo de Pix e identificar melhorias rápidas.",
  },
];

const insights: Insight[] = [
  {
    id: "I-001",
    quote: "\"Não entendo por que preciso enviar meu documento 3 vezes. Parece que o sistema não guarda nada.\"",
    type: "pain",
    tags: ["KYC", "Fricção"],
    sourceId: "R-001",
    epic: "Onboarding",
    epicColor: "bg-blue-100 text-blue-700",
    date: "18 Out 2023",
    severity: "high",
  },
  {
    id: "I-002",
    quote: "\"Queria simular quanto vou receber de retorno antes de decidir o valor do aporte.\"",
    type: "opportunity",
    tags: ["Simulador", "Conversão"],
    sourceId: "R-001",
    epic: "Portfólio",
    epicColor: "bg-emerald-100 text-emerald-700",
    date: "18 Out 2023",
    severity: "high",
  },
  {
    id: "I-003",
    quote: "\"Seria incrível ver meus investimentos de outros bancos consolidados aqui em um só lugar.\"",
    type: "request",
    tags: ["Open Finance", "Consolidação"],
    sourceId: "R-003",
    date: "30 Set 2023",
    severity: "medium",
  },
  {
    id: "I-004",
    quote: "\"O gráfico de rentabilidade histórica ficou muito mais fácil de entender. Aprovado!\"",
    type: "behavior",
    tags: ["Portfólio", "Rentabilidade"],
    sourceId: "R-002",
    epic: "Portfólio",
    epicColor: "bg-emerald-100 text-emerald-700",
    date: "05 Out 2023",
    severity: "low",
  },
  {
    id: "I-005",
    quote: "\"Precisei de 4 tentativas para entender onde clicar para fazer um novo aporte no mobile.\"",
    type: "pain",
    tags: ["Mobile", "Navegação", "UX"],
    sourceId: "R-002",
    epic: "Portfólio",
    epicColor: "bg-emerald-100 text-emerald-700",
    date: "05 Out 2023",
    severity: "high",
  },
  {
    id: "I-006",
    quote: "\"Na declaração de IR, não sei quais números pegar do extrato. Uma planilha pré-preenchida ajudaria muito.\"",
    type: "opportunity",
    tags: ["IR", "Compliance", "Extrato"],
    sourceId: "R-005",
    epic: "Compliance",
    epicColor: "bg-purple-100 text-purple-700",
    date: "24 Out 2023",
    severity: "high",
  },
];

export default function DiscoveryPage() {
  const [typeFilter, setTypeFilter] = useState<ResearchType>("all");
  const [search, setSearch] = useState("");

  const filtered = researches.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: researches.length,
    insights: researches.reduce((acc, r) => acc + r.insights, 0),
    ongoing: researches.filter((r) => r.status === "ongoing").length,
    planned: researches.filter((r) => r.status === "planned").length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Discovery Hub</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pesquisas com usuários, insights e ciclo de aprendizado de produto
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
          <Plus size={14} />
          Nova Pesquisa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pesquisas realizadas", value: stats.total, color: "text-gray-900", bg: "bg-white border-gray-100" },
          { label: "Insights coletados", value: stats.insights, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Em andamento", value: stats.ongoing, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Planejadas", value: stats.planned, color: "text-gray-500", bg: "bg-gray-50 border-gray-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main area */}
      <div className="grid grid-cols-3 gap-4">
        {/* Research list — 2 cols */}
        <div className="col-span-2 space-y-3">
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setTypeFilter("all")}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  typeFilter === "all" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Todos
              </button>
              {(Object.entries(typeConfig) as [Exclude<ResearchType, "all">, (typeof typeConfig)[Exclude<ResearchType, "all">]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    typeFilter === key ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {cfg.label}
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
          <div className="space-y-2.5">
            {filtered.map((r) => {
              const cfg = typeConfig[r.type];
              const sts = statusStyle[r.status];
              const TypeIcon = cfg.icon;
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <TypeIcon size={15} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-gray-400">{r.id}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${sts.dot}`} />
                          <span className={`text-[10px] font-semibold ${sts.color}`}>{sts.label}</span>
                        </div>
                        {r.epic && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.epicColor}`}>
                            {r.epic}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                      <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-1">{r.objective}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${r.avatarColor}`}>
                            {r.initials}
                          </div>
                          <span className="text-xs text-gray-500">{r.owner}</span>
                        </div>
                        {r.participants > 0 && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Users size={11} />
                            <span>{r.participants.toLocaleString("pt-BR")} participantes</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Lightbulb size={11} />
                          <span>{r.insights} insights</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
                          <Calendar size={11} />
                          <span>{r.date}</span>
                        </div>
                      </div>
                      {r.tags.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                          {r.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
                            >
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
        </div>

        {/* Insights feed — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden self-start sticky top-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-bold text-gray-900">Insights Recentes</p>
            <Lightbulb size={15} className="text-amber-500" />
          </div>
          <div className="divide-y divide-gray-50">
            {insights.map((insight) => {
              const cfg = insightConfig[insight.type];
              return (
                <div
                  key={insight.id}
                  className="p-5 hover:bg-gray-50/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                    {insight.epic && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${insight.epicColor}`}>
                        {insight.epic}
                      </span>
                    )}
                    {insight.severity === "high" && (
                      <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-100">
                        Alta relevância
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2.5 italic">{insight.quote}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {insight.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-semibold text-blue-500">{insight.sourceId}</span>
                    <span className="text-[10px] text-gray-400">{insight.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
