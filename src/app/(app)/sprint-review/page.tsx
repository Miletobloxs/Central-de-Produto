"use client";

import { useState } from "react";
import { ChevronRight, Share2, Download, TrendingUp, TrendingDown, Copy, Check, Star, AlertTriangle, ArrowRight, Plus } from "lucide-react";

interface SprintDelivery {
  epic: string;
  epicColor: string;
  items: { title: string; points: number; taskId: string }[];
}

interface SprintMetric {
  name: string;
  before: string;
  after: string;
  delta: string;
  positive: boolean;
  linkedToKR: boolean;
}

interface SprintHighlight {
  member: string;
  initials: string;
  color: string;
  highlight: string;
}

interface SprintReview {
  id: string;
  sprint: string;
  period: string;
  velocity: number;
  planned: number;
  theme: string;
  deliveries: SprintDelivery[];
  metrics: SprintMetric[];
  highlights: SprintHighlight[];
  blockers: string[];
  learnings: string[];
  nextTheme: string;
  nextTopItems: string[];
}

const reviews: SprintReview[] = [
  {
    id: "sr-42",
    sprint: "Sprint #42",
    period: "09 – 22 Out 2023",
    velocity: 41,
    planned: 45,
    theme: "Hotfix & Performance",
    deliveries: [
      {
        epic: "Performance",
        epicColor: "bg-blue-100 text-blue-700",
        items: [
          { title: "Cache Redis para cotações e dados do portfólio", points: 13, taskId: "T-038" },
          { title: "Otimização de queries N+1 no módulo de extratos", points: 10, taskId: "T-037" },
        ],
      },
      {
        epic: "Financeiro",
        epicColor: "bg-red-100 text-red-700",
        items: [
          { title: "Correção no cálculo de juros compostos para CRI > 24 meses", points: 8, taskId: "T-039" },
          { title: "Timeout na sincronização de extratos bancários corrigido", points: 5, taskId: "T-040" },
          { title: "Erro 500 no fluxo de onboarding iOS com CPF especial resolvido", points: 5, taskId: "T-041" },
        ],
      },
    ],
    metrics: [
      { name: "LCP Homepage", before: "2.8s", after: "1.1s", delta: "-60.7%", positive: true, linkedToKR: false },
      { name: "P99 Latência API", before: "312ms", after: "245ms", delta: "-21.5%", positive: true, linkedToKR: true },
      { name: "Error Rate", before: "0.28%", after: "0.12%", delta: "-57.1%", positive: true, linkedToKR: true },
      { name: "Bugs Críticos Abertos", before: "3", after: "0", delta: "-100%", positive: true, linkedToKR: false },
    ],
    highlights: [
      { member: "Lucas M.", initials: "LM", color: "bg-emerald-200 text-emerald-800", highlight: "Identificou root cause de N+1 queries em 2h, reduzindo LCP em 60%" },
      { member: "Sofia L.", initials: "SL", color: "bg-pink-200 text-pink-800", highlight: "Entregou fix de iOS com testes em 3 dispositivos antes do prazo" },
    ],
    blockers: ["Ambiente de staging instável por 1 dia atrasou validação do cache Redis"],
    learnings: [
      "Cache de cotações deve ter TTL de 5min, não 15min — dado mais fresco = menos erros",
      "Monitorar queries N+1 em PRs com plugin antes de subir para produção",
    ],
    nextTheme: "Módulo de Relatórios & Analytics",
    nextTopItems: ["Relatórios PDF/XLSX (21pts)", "Filtros avançados extrato (8pts)", "Redesign Portfólio v2 (13pts)"],
  },
  {
    id: "sr-41",
    sprint: "Sprint #41",
    period: "25 Set – 08 Out 2023",
    velocity: 49,
    planned: 52,
    theme: "Relatórios Consolidados & Redesign Portfólio",
    deliveries: [
      {
        epic: "Relatórios",
        epicColor: "bg-purple-100 text-purple-700",
        items: [
          { title: "Módulo de Relatórios Consolidados com exportação PDF e XLSX", points: 21, taskId: "T-028" },
          { title: "Filtros avançados no extrato de transações", points: 8, taskId: "T-029" },
        ],
      },
      {
        epic: "Portfólio",
        epicColor: "bg-emerald-100 text-emerald-700",
        items: [
          { title: "Redesign completo da tela de Portfólio com gráfico de alocação", points: 13, taskId: "T-030" },
          { title: "Otimização de LCP da homepage via lazy loading e SSR", points: 7, taskId: "T-031" },
        ],
      },
    ],
    metrics: [
      { name: "Adoção de Relatórios", before: "0%", after: "54%", delta: "+54pp", positive: true, linkedToKR: false },
      { name: "NPS", before: "7.9", after: "8.4", delta: "+0.5", positive: true, linkedToKR: true },
      { name: "LCP Homepage", before: "4.3s", after: "2.8s", delta: "-34.9%", positive: true, linkedToKR: false },
      { name: "Conversão Onboarding", before: "11.8%", after: "12.5%", delta: "+0.7pp", positive: true, linkedToKR: true },
    ],
    highlights: [
      { member: "André M.", initials: "AM", color: "bg-amber-200 text-amber-800", highlight: "Liderou redesign do Portfólio com 3 ciclos de feedback em 1 sprint" },
      { member: "Carla R.", initials: "CR", color: "bg-purple-200 text-purple-800", highlight: "Módulo de Relatórios com zero bugs em produção na primeira semana" },
    ],
    blockers: [
      "Exportação XLSX bloqueada 2 dias por incompatibilidade com Node 20",
      "Design review exigiu 1 rodada extra — aprovado no D+9 ao invés de D+7",
    ],
    learnings: [
      "Validar compatibilidade de libs de exportação no spike inicial, não ao final do sprint",
      "Design review deve ser agendado no D+3 da sprint, não na semana 2",
    ],
    nextTheme: "Hotfix & Performance",
    nextTopItems: ["Cache Redis cotações (13pts)", "Fix timeout extratos (5pts)", "Fix erro 500 iOS (5pts)"],
  },
  {
    id: "sr-40",
    sprint: "Sprint #40",
    period: "11 – 24 Set 2023",
    velocity: 34,
    planned: 34,
    theme: "Segurança — 2FA & JWT Rotation",
    deliveries: [
      {
        epic: "Segurança",
        epicColor: "bg-red-100 text-red-700",
        items: [
          { title: "2FA TOTP obrigatório para ADMIN e SUPER_ADMIN", points: 13, taskId: "T-018" },
          { title: "JWT Refresh Token com rotação automática e blacklist Redis", points: 8, taskId: "T-019" },
          { title: "Rate limiting na API pública (100 req/min por IP)", points: 5, taskId: "T-020" },
          { title: "3 correções de segurança: XSS, header injection e CORS", points: 8, taskId: "T-021" },
        ],
      },
    ],
    metrics: [
      { name: "2FA Admins Ativos", before: "0%", after: "100%", delta: "+100pp", positive: true, linkedToKR: false },
      { name: "Brute Force Bloqueados/sem", before: "~0", after: "400+", delta: "novo", positive: true, linkedToKR: false },
      { name: "Churn Rate", before: "2.4%", after: "2.1%", delta: "-0.3pp", positive: true, linkedToKR: true },
      { name: "Auth Error Rate", before: "0.8%", after: "0.1%", delta: "-87.5%", positive: true, linkedToKR: false },
    ],
    highlights: [
      { member: "Sofia L.", initials: "SL", color: "bg-pink-200 text-pink-800", highlight: "Sprint 100% completo — primeiro sem carryover em 6 meses" },
      { member: "Lucas M.", initials: "LM", color: "bg-emerald-200 text-emerald-800", highlight: "2FA com documentação inline e guia de onboarding para admins" },
    ],
    blockers: [],
    learnings: [
      "Sprint com foco em 1 épico = zero blockers e 100% de completude",
      "Rate limiting configurável por rota reduz falsos positivos em ~60%",
    ],
    nextTheme: "Relatórios Consolidados & Redesign Portfólio",
    nextTopItems: ["Módulo de Relatórios (21pts)", "Filtros de extrato (8pts)", "Redesign Portfólio (13pts)"],
  },
  {
    id: "sr-39",
    sprint: "Sprint #39",
    period: "28 Ago – 10 Set 2023",
    velocity: 42,
    planned: 48,
    theme: "API v2 — Breaking Changes & Webhooks",
    deliveries: [
      {
        epic: "API v2",
        epicColor: "bg-orange-100 text-orange-700",
        items: [
          { title: "Endpoint /api/v2/products com rota legada /api/offers mantida", points: 13, taskId: "T-011" },
          { title: "Novo formato /api/transactions: campo amount como { value, currency }", points: 13, taskId: "T-012" },
          { title: "Webhooks em tempo real: aporte, resgate e pagamento de juros", points: 8, taskId: "T-013" },
          { title: "Documentação OpenAPI v2 + migration guide para parceiros", points: 8, taskId: "T-014" },
        ],
      },
    ],
    metrics: [
      { name: "Time to First API Call", before: "4.2s", after: "2.5s", delta: "-40.5%", positive: true, linkedToKR: false },
      { name: "API Error Rate", before: "1.2%", after: "0.4%", delta: "-66.7%", positive: true, linkedToKR: true },
      { name: "Webhook Delivery Success", before: "n/a", after: "99.2%", delta: "novo", positive: true, linkedToKR: false },
      { name: "Parceiros Integrados v2", before: "0", after: "4", delta: "+4", positive: true, linkedToKR: false },
    ],
    highlights: [
      { member: "André M.", initials: "AM", color: "bg-amber-200 text-amber-800", highlight: "Migration guide aprovado pelos 4 parceiros em menos de 1 semana" },
    ],
    blockers: [
      "6pts de testes de integração movidos para Sprint #40 — falta de tempo na semana 2",
      "1 parceiro atrasou feedback do migration guide em 3 dias úteis",
    ],
    learnings: [
      "Breaking changes precisam de comunicação com 2 sprints de antecedência, não 1",
      "Webhook worker deve ter dead letter queue desde o primeiro deploy",
    ],
    nextTheme: "Segurança — 2FA & JWT Rotation",
    nextTopItems: ["2FA TOTP para ADMIN (13pts)", "JWT rotation (8pts)", "Rate limiting (5pts)"],
  },
];

export default function SprintReviewPage() {
  const [selected, setSelected] = useState("sr-42");
  const [copied, setCopied] = useState(false);

  const review = reviews.find((r) => r.id === selected)!;
  const completionPct = Math.round((review.velocity / review.planned) * 100);
  const totalPoints = review.deliveries.reduce(
    (acc, d) => acc + d.items.reduce((a, i) => a + i.points, 0),
    0
  );
  const totalItems = review.deliveries.reduce((acc, d) => acc + d.items.length, 0);

  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (completionPct / 100) * circumference;
  const ringColor = completionPct >= 90 ? "#22c55e" : completionPct >= 70 ? "#f59e0b" : "#ef4444";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sprint Review & Stakeholder Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Relatório executivo automático por sprint — entregas, métricas e aprendizados
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
          <Plus size={14} />
          Gerar Nova Review
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sprint List */}
        <div className="w-64 shrink-0 space-y-2">
          {reviews.map((r) => {
            const pct = Math.round((r.velocity / r.planned) * 100);
            const isSelected = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full text-left rounded-2xl px-4 py-4 border transition-all ${
                  isSelected
                    ? "bg-white border-blue-200 shadow-md"
                    : "bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-900">{r.sprint}</span>
                  {isSelected && <ChevronRight size={14} className="text-blue-600" />}
                </div>
                <p className="text-xs font-semibold text-gray-600 mb-1 line-clamp-1">{r.theme}</p>
                <p className="text-[10px] text-gray-400 mb-2.5">{r.period}</p>
                <div className="flex items-center justify-between">
                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden mr-2">
                    <div
                      className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-400" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-bold ${pct >= 90 ? "text-emerald-600" : "text-amber-600"}`}>
                    {pct}%
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {r.velocity}/{r.planned} pts entregues
                </p>
              </button>
            );
          })}
        </div>

        {/* Review Detail */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Header Card */}
          <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm">
            <div className="flex items-start gap-6">
              {/* Ring */}
              <div className="relative w-24 h-24 shrink-0">
                <svg width="96" height="96" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="7" />
                  <circle
                    cx="48" cy="48" r={r} fill="none"
                    stroke={ringColor} strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 48 48)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-gray-900">{completionPct}%</span>
                  <span className="text-[9px] text-gray-400 font-semibold">completo</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{review.sprint}</h2>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {review.period}
                  </span>
                </div>
                <p className="text-sm font-semibold text-blue-600 mb-3">{review.theme}</p>
                <div className="flex items-center gap-5 flex-wrap">
                  {[
                    { label: "Velocity", value: `${review.velocity} pts` },
                    { label: "Planejado", value: `${review.planned} pts` },
                    { label: "Entregas", value: `${totalItems} tasks` },
                    { label: "Story Points", value: `${totalPoints} pts` },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                      <p className="text-sm font-bold text-gray-800">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  {copied ? "Copiado!" : "Copiar link"}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={12} />
                  Compartilhar
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download size={12} />
                  Exportar PDF
                </button>
              </div>
            </div>
          </div>

          {/* Deliveries */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">O que foi entregue</p>
              <p className="text-xs text-gray-400 mt-0.5">{totalItems} tasks concluídas · {totalPoints} story points</p>
            </div>
            <div className="p-6 space-y-5">
              {review.deliveries.map((delivery) => (
                <div key={delivery.epic}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${delivery.epicColor}`}>
                      {delivery.epic}
                    </span>
                    <span className="text-xs text-gray-400">
                      {delivery.items.length} {delivery.items.length === 1 ? "task" : "tasks"} ·{" "}
                      {delivery.items.reduce((a, i) => a + i.points, 0)} pts
                    </span>
                  </div>
                  <div className="space-y-1.5 ml-1">
                    {delivery.items.map((item) => (
                      <div key={item.taskId} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs text-gray-700 flex-1">{item.title}</p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                            {item.taskId}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">{item.points}pt</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics Moved */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900">Métricas Movidas</p>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                ● KR vinculado ao Dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-gray-100">
              {review.metrics.map((m) => (
                <div key={m.name} className="bg-white px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-semibold text-gray-600">{m.name}</p>
                    {m.linkedToKR && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" title="Vinculado a KR" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 line-through">{m.before}</span>
                    <ArrowRight size={12} className="text-gray-300" />
                    <span className="text-lg font-black text-gray-900">{m.after}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${
                      m.positive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                    }`}>
                      {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights + Blockers + Learnings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team Highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                <p className="text-sm font-bold text-gray-900">Destaques do Time</p>
              </div>
              <div className="divide-y divide-gray-50">
                {review.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${h.color}`}>
                      {h.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-700 mb-0.5">{h.member}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{h.highlight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockers + Learnings */}
            <div className="space-y-4">
              {review.blockers.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <AlertTriangle size={13} className="text-amber-500" />
                    <p className="text-sm font-bold text-gray-900">Blockers</p>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    {review.blockers.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <p className="text-xs text-gray-600 leading-relaxed">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <TrendingUp size={13} className="text-blue-500" />
                  <p className="text-sm font-bold text-gray-900">Aprendizados</p>
                </div>
                <div className="px-5 py-4 space-y-2">
                  {review.learnings.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <p className="text-xs text-gray-600 leading-relaxed">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next Sprint Preview */}
          <div className="bg-gray-900 rounded-2xl px-6 py-5 text-white">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
              Próximo Sprint
            </p>
            <p className="text-base font-bold mb-3">{review.nextTheme}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {review.nextTopItems.map((item, i) => (
                <span key={i} className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
