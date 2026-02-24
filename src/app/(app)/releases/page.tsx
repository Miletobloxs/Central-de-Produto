"use client";

import { useState } from "react";
import { Plus, Eye, Lock, Zap, Wrench, Star, AlertTriangle, ChevronRight, Copy, Check } from "lucide-react";

type ChangeType = "feature" | "improvement" | "fix" | "breaking";
type Visibility = "internal" | "public";

interface ChangelogItem {
  type: ChangeType;
  title: string;
  description: string;
  taskId?: string;
}

interface Release {
  id: string;
  version: string;
  date: string;
  sprint: string;
  summary: string;
  visibility: Visibility;
  items: ChangelogItem[];
  stats: { features: number; improvements: number; fixes: number; breaking: number };
}

const releases: Release[] = [
  {
    id: "r1",
    version: "v2.4.1",
    date: "22 Out 2023",
    sprint: "Sprint #42",
    summary: "Hotfix de performance e correções críticas no módulo financeiro",
    visibility: "public",
    stats: { features: 0, improvements: 1, fixes: 3, breaking: 0 },
    items: [
      {
        type: "improvement",
        title: "Performance do Dashboard reduzida em 40%",
        description: "Refatoração das queries do portfólio e implementação de cache Redis para dados de cotação.",
        taskId: "T-038",
      },
      {
        type: "fix",
        title: "Correção no cálculo de juros compostos para CRI",
        description: "Arredondamento incorreto em operações com prazo superior a 24 meses.",
        taskId: "T-039",
      },
      {
        type: "fix",
        title: "Timeout na sincronização de extratos corrigido",
        description: "Ajuste no timeout do worker de sincronização de extratos bancários para 30s.",
        taskId: "T-040",
      },
      {
        type: "fix",
        title: "Erro 500 no fluxo de onboarding iOS resolvido",
        description: "Tratamento de caracteres especiais no campo de CPF no app nativo iOS.",
        taskId: "T-041",
      },
    ],
  },
  {
    id: "r2",
    version: "v2.4.0",
    date: "08 Out 2023",
    sprint: "Sprint #41",
    summary: "Módulo de Relatórios Consolidados e redesign do portfólio",
    visibility: "public",
    stats: { features: 2, improvements: 3, fixes: 5, breaking: 0 },
    items: [
      {
        type: "feature",
        title: "Módulo de Relatórios Consolidados",
        description: "Novo módulo para geração de relatórios personalizados com filtros por ativo, período e tipo de produto. Suporte a exportação PDF e XLSX.",
        taskId: "T-028",
      },
      {
        type: "feature",
        title: "Filtros avançados no extrato de transações",
        description: "Filtro por tipo de operação, período customizado, ativo específico e status de liquidação.",
        taskId: "T-029",
      },
      {
        type: "improvement",
        title: "Redesign completo da tela de Portfólio",
        description: "Nova visualização com gráfico de alocação por classe, rentabilidade histórica e projeção de vencimentos.",
        taskId: "T-030",
      },
      {
        type: "improvement",
        title: "Otimização de carregamento da homepage",
        description: "Redução de 2.8s para 1.1s no LCP da página inicial via lazy loading e SSR.",
        taskId: "T-031",
      },
      {
        type: "improvement",
        title: "Acessibilidade: contraste e navegação por teclado",
        description: "Todos os componentes interativos agora seguem WCAG 2.1 nível AA.",
        taskId: "T-032",
      },
    ],
  },
  {
    id: "r3",
    version: "v2.3.2",
    date: "25 Set 2023",
    sprint: "Sprint #40",
    summary: "Autenticação 2FA e melhorias de segurança",
    visibility: "public",
    stats: { features: 1, improvements: 2, fixes: 3, breaking: 0 },
    items: [
      {
        type: "feature",
        title: "Autenticação de dois fatores (2FA)",
        description: "Suporte a TOTP via Google Authenticator e Authy. Obrigatório para perfis ADMIN e SUPER_ADMIN.",
        taskId: "T-018",
      },
      {
        type: "improvement",
        title: "Tokens JWT com rotação automática",
        description: "Refresh token com expiração de 7 dias e blacklist em Redis para revogação imediata.",
        taskId: "T-019",
      },
      {
        type: "improvement",
        title: "Rate limiting na API pública",
        description: "Limite de 100 req/min por IP e 1000 req/min por API key autenticada.",
        taskId: "T-020",
      },
    ],
  },
  {
    id: "r4",
    version: "v2.3.0",
    date: "11 Set 2023",
    sprint: "Sprint #39",
    summary: "API v2 com breaking changes — migração necessária",
    visibility: "internal",
    stats: { features: 3, improvements: 1, fixes: 2, breaking: 2 },
    items: [
      {
        type: "breaking",
        title: "Endpoint /api/offers renomeado para /api/v2/products",
        description: "Rota legada mantida com deprecation warning até v2.5.0. Migrar integrações até Dez/2023.",
        taskId: "T-011",
      },
      {
        type: "breaking",
        title: "Formato de resposta do /api/transactions atualizado",
        description: "Campo amount agora retorna objeto { value, currency } ao invés de número. Atualizar parsers dos clientes.",
        taskId: "T-012",
      },
      {
        type: "feature",
        title: "Webhooks de eventos de transação",
        description: "Notificações em tempo real via webhook para aporte, resgate e pagamento de juros.",
        taskId: "T-013",
      },
    ],
  },
];

const typeConfig: Record<ChangeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  feature: { label: "Nova Feature", icon: Star, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  improvement: { label: "Melhoria", icon: Zap, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  fix: { label: "Correção", icon: Wrench, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  breaking: { label: "Breaking Change", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

export default function ReleasesPage() {
  const [selectedRelease, setSelectedRelease] = useState<string>("r1");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [copied, setCopied] = useState(false);

  const release = releases.find((r) => r.id === selectedRelease)!;

  const visibleItems =
    visibility === "public"
      ? release.items.filter((i) => i.type !== "breaking")
      : release.items;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Releases & Changelog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Histórico de versões e comunicado de mudanças</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
          <Plus size={14} />
          Nova Release
        </button>
      </div>

      <div className="flex gap-5">
        {/* Release List */}
        <div className="w-72 shrink-0 space-y-2">
          {releases.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRelease(r.id)}
              className={`w-full text-left rounded-2xl px-4 py-4 border transition-all ${
                selectedRelease === r.id
                  ? "bg-white border-blue-200 shadow-md"
                  : "bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{r.version}</span>
                  {r.visibility === "internal" && (
                    <Lock size={11} className="text-gray-400" />
                  )}
                </div>
                {selectedRelease === r.id && (
                  <ChevronRight size={14} className="text-blue-600" />
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">{r.summary}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {r.sprint}
                </span>
                <span className="text-[10px] text-gray-400">{r.date}</span>
              </div>
              {/* Mini stats */}
              <div className="flex items-center gap-2 mt-2.5">
                {r.stats.features > 0 && (
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">+{r.stats.features} feat</span>
                )}
                {r.stats.improvements > 0 && (
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">+{r.stats.improvements} imp</span>
                )}
                {r.stats.fixes > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{r.stats.fixes} fix</span>
                )}
                {r.stats.breaking > 0 && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">⚠ {r.stats.breaking}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Release Detail */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Version Header */}
          <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-gray-900">{release.version}</h2>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {release.sprint}
                  </span>
                  <span className="text-xs text-gray-400">{release.date}</span>
                </div>
                <p className="text-sm text-gray-600">{release.summary}</p>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => setVisibility("public")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    visibility === "public"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Eye size={12} />
                  Público
                </button>
                <button
                  onClick={() => setVisibility("internal")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    visibility === "internal"
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Lock size={12} />
                  Interno
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              {(Object.entries(typeConfig) as [ChangeType, typeof typeConfig[ChangeType]][]).map(([key, cfg]) => {
                const statKey = key === "feature" ? "features" : key === "improvement" ? "improvements" : key === "fix" ? "fixes" : "breaking";
                const count = release.stats[statKey];
                if (count === 0) return null;
                const Icon = cfg.icon;
                return (
                  <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                    <Icon size={13} className={cfg.color} />
                    <span className={`text-xs font-bold ${cfg.color}`}>{count}</span>
                    <span className={`text-xs ${cfg.color} opacity-80`}>{cfg.label}</span>
                  </div>
                );
              })}
              <button
                onClick={handleCopy}
                className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? "Copiado!" : "Copiar changelog"}
              </button>
            </div>
          </div>

          {/* Visibility note */}
          {visibility === "public" && release.stats.breaking > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700">
                <span className="font-bold">Breaking changes ocultados na visão pública.</span> Alterne para{" "}
                <button onClick={() => setVisibility("internal")} className="underline font-semibold">
                  modo Interno
                </button>{" "}
                para visualizá-los.
              </p>
            </div>
          )}

          {/* Changelog Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-900">
                Changelog — {visibleItems.length} {visibleItems.length === 1 ? "item" : "itens"}
              </p>
            </div>

            <div className="divide-y divide-gray-50">
              {visibleItems.map((item, i) => {
                const cfg = typeConfig[item.type];
                const Icon = cfg.icon;
                return (
                  <div key={i} className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.border}`}>
                      <Icon size={14} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        {item.taskId && (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.taskId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">{item.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
