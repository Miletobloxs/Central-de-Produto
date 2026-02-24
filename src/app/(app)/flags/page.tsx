"use client";

import { useState } from "react";
import { Flag, Plus, Users, Clock, AlertTriangle, CheckCircle2, XCircle, Search } from "lucide-react";

type FlagType = "release" | "experiment" | "kill-switch";
type Environment = "production" | "staging" | "dev";

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string;
  type: FlagType;
  defaultActive: boolean;
  rollout: number;
  segments: string[];
  lastModified: string;
  modifiedBy: string;
  modifiedInitials: string;
  modifiedColor: string;
  linkedEpic?: string;
  epicColor?: string;
}

const flagTypeConfig: Record<FlagType, { label: string; color: string; bg: string; border: string }> = {
  release: { label: "Release", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  experiment: { label: "Experimento", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  "kill-switch": { label: "Kill Switch", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

const flags: FeatureFlag[] = [
  {
    id: "flag-001",
    key: "pix_instant_deposit",
    label: "Pix — Aportes Instantâneos",
    description: "Habilita o fluxo completo de aporte via Pix com confirmação em tempo real e reconciliação automática.",
    type: "release",
    defaultActive: true,
    rollout: 100,
    segments: ["Global"],
    lastModified: "22 Out 2023",
    modifiedBy: "André M.",
    modifiedInitials: "AM",
    modifiedColor: "bg-amber-200 text-amber-800",
    linkedEpic: "Pagamentos",
    epicColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "flag-002",
    key: "portfolio_v2_redesign",
    label: "Portfólio v2 — Redesign",
    description: "Nova tela de portfólio com gráfico de alocação por classe, rentabilidade histórica e projeção de vencimentos.",
    type: "release",
    defaultActive: true,
    rollout: 100,
    segments: ["Global"],
    lastModified: "08 Out 2023",
    modifiedBy: "Sofia L.",
    modifiedInitials: "SL",
    modifiedColor: "bg-pink-200 text-pink-800",
    linkedEpic: "Portfólio",
    epicColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "flag-003",
    key: "advanced_reports_export",
    label: "Relatórios — Exportação Avançada",
    description: "Exportação de relatórios em PDF e XLSX com filtros personalizados. Limitado a planos Enterprise.",
    type: "release",
    defaultActive: true,
    rollout: 100,
    segments: ["Enterprise", "RCVM 175"],
    lastModified: "08 Out 2023",
    modifiedBy: "Lucas M.",
    modifiedInitials: "LM",
    modifiedColor: "bg-emerald-200 text-emerald-800",
    linkedEpic: "Relatórios",
    epicColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "flag-004",
    key: "2fa_mandatory_admins",
    label: "2FA Obrigatório — ADMIN/SUPER_ADMIN",
    description: "Torna a autenticação de dois fatores obrigatória para todos os perfis com permissão administrativa.",
    type: "kill-switch",
    defaultActive: true,
    rollout: 100,
    segments: ["ADMIN", "SUPER_ADMIN"],
    lastModified: "25 Set 2023",
    modifiedBy: "Carla R.",
    modifiedInitials: "CR",
    modifiedColor: "bg-purple-200 text-purple-800",
    linkedEpic: "Segurança",
    epicColor: "bg-red-100 text-red-700",
  },
  {
    id: "flag-005",
    key: "ai_assistant_beta",
    label: "Assistente IA — Beta Fechado",
    description: "Chatbot com LLM (GPT-4o) para responder dúvidas sobre produtos, tributação e rentabilidade estimada.",
    type: "experiment",
    defaultActive: true,
    rollout: 5,
    segments: ["SP - Early Adopters", "RCVM 175"],
    lastModified: "20 Out 2023",
    modifiedBy: "André M.",
    modifiedInitials: "AM",
    modifiedColor: "bg-amber-200 text-amber-800",
    linkedEpic: "Suporte",
    epicColor: "bg-slate-100 text-slate-700",
  },
  {
    id: "flag-006",
    key: "open_finance_pilot",
    label: "Open Finance (BACEN) — Piloto",
    description: "Importação de dados de outras instituições via Open Finance do Banco Central. Fase alpha.",
    type: "experiment",
    defaultActive: true,
    rollout: 2,
    segments: ["Early Adopters"],
    lastModified: "15 Out 2023",
    modifiedBy: "Sofia L.",
    modifiedInitials: "SL",
    modifiedColor: "bg-pink-200 text-pink-800",
    linkedEpic: "APIs & Integrações",
    epicColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "flag-007",
    key: "investment_gamification",
    label: "Gamificação de Investimentos",
    description: "Badges e streak de aportes mensais para aumentar engajamento. Em hold aguardando A/B test.",
    type: "experiment",
    defaultActive: false,
    rollout: 0,
    segments: [],
    lastModified: "10 Out 2023",
    modifiedBy: "Carla R.",
    modifiedInitials: "CR",
    modifiedColor: "bg-purple-200 text-purple-800",
    linkedEpic: "Engajamento",
    epicColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "flag-008",
    key: "legacy_dashboard_v1",
    label: "Dashboard Legado v1",
    description: "Fallback para o dashboard antigo. Desabilitar após confirmação de estabilidade do v2.",
    type: "kill-switch",
    defaultActive: false,
    rollout: 0,
    segments: [],
    lastModified: "01 Out 2023",
    modifiedBy: "Lucas M.",
    modifiedInitials: "LM",
    modifiedColor: "bg-emerald-200 text-emerald-800",
    linkedEpic: "Dashboard",
    epicColor: "bg-gray-100 text-gray-600",
  },
];

const environments: { id: Environment; label: string; color: string }[] = [
  { id: "production", label: "Produção", color: "text-red-600" },
  { id: "staging", label: "Staging", color: "text-amber-600" },
  { id: "dev", label: "Dev", color: "text-blue-600" },
];

export default function FeatureFlagsPage() {
  const [env, setEnv] = useState<Environment>("production");
  const [search, setSearch] = useState("");
  const [flagStates, setFlagStates] = useState<Record<string, boolean>>(
    Object.fromEntries(flags.map((f) => [f.id, f.defaultActive]))
  );

  const toggleFlag = (id: string) => {
    setFlagStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = flags.filter((f) =>
    !search ||
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.key.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = Object.values(flagStates).filter(Boolean).length;
  const experimentCount = flags.filter((f) => f.type === "experiment").length;
  const inactiveCount = flags.length - activeCount;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Controle de rollout, experimentos e kill switches por segmento
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Environment Selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {environments.map((e) => (
              <button
                key={e.id}
                onClick={() => setEnv(e.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  env === e.id ? `bg-gray-900 text-white` : `text-gray-500 hover:text-gray-700`
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
            <Plus size={14} />
            Nova Flag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total de Flags", value: flags.length, icon: Flag, color: "text-gray-900", bg: "bg-white border-gray-100" },
          { label: "Ativas", value: activeCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Experimentos", value: experimentCount, icon: AlertTriangle, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
          { label: "Inativas", value: inactiveCount, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50 border-gray-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm flex items-center justify-between`}>
              <div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <Icon size={20} className={`${s.color} opacity-30`} />
            </div>
          );
        })}
      </div>

      {/* Search + Flags list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar flag por nome ou key..."
              className="text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent w-full"
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{filtered.length} flags</span>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.map((flag) => {
            const isActive = flagStates[flag.id];
            const typeCfg = flagTypeConfig[flag.type];
            const rolloutColor =
              flag.rollout === 0
                ? "bg-gray-200"
                : flag.rollout === 100
                ? "bg-emerald-500"
                : "bg-blue-500";

            return (
              <div key={flag.id} className={`px-6 py-4 transition-colors ${isActive ? "" : "opacity-60"} hover:bg-gray-50/50`}>
                <div className="flex items-start gap-4">
                  {/* Toggle */}
                  <div className="shrink-0 mt-0.5">
                    <button
                      onClick={() => toggleFlag(flag.id)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                        isActive ? "bg-emerald-500" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                          isActive ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                        {typeCfg.label}
                      </span>
                      {flag.linkedEpic && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${flag.epicColor}`}>
                          {flag.linkedEpic}
                        </span>
                      )}
                      {!isActive && (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Desabilitada
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-0.5">{flag.label}</p>
                    <code className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {flag.key}
                    </code>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">{flag.description}</p>
                  </div>

                  {/* Rollout */}
                  <div className="w-36 shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Rollout</span>
                      <span className={`text-xs font-bold ${flag.rollout === 100 ? "text-emerald-600" : flag.rollout === 0 ? "text-gray-400" : "text-blue-600"}`}>
                        {flag.rollout}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rolloutColor} transition-all`}
                        style={{ width: `${flag.rollout}%` }}
                      />
                    </div>
                    {flag.segments.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {flag.segments.map((seg) => (
                          <span key={seg} className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {seg}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="w-32 shrink-0 text-right">
                    <div className="flex items-center justify-end gap-1.5 mb-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${flag.modifiedColor}`}>
                        {flag.modifiedInitials}
                      </div>
                      <span className="text-[11px] text-gray-500">{flag.modifiedBy}</span>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400">
                      <Clock size={10} />
                      <span>{flag.lastModified}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 shadow-sm flex items-center gap-6 flex-wrap">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipos de Flag</p>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        {(Object.entries(flagTypeConfig) as [FlagType, (typeof flagTypeConfig)[FlagType]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg.replace("bg-", "bg-")} border ${cfg.border}`} />
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-gray-400">
              {key === "release" ? "— funcionalidade em produção" : key === "experiment" ? "— teste com % dos usuários" : "— desliga feature de emergência"}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={12} />
          <span>Segmentos definem quais usuários recebem a feature</span>
        </div>
      </div>
    </div>
  );
}
