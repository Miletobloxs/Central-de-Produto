"use client";

import { useState } from "react";
import { Plus, Search, ChevronDown, ChevronRight, XCircle, CheckCircle2, Clock, Users } from "lucide-react";

type DecisionStatus = "accepted" | "open" | "deprecated" | "superseded";
type DecisionCategory = "produto" | "arquitetura" | "estratégia" | "processo";

interface DecisionAlternative {
  option: string;
  reason: string;
}

interface Decision {
  id: string;
  title: string;
  status: DecisionStatus;
  category: DecisionCategory;
  date: string;
  decidedBy: string;
  decidedInitials: string;
  decidedColor: string;
  participants: string[];
  context: string;
  decision: string;
  rationale: string;
  alternatives: DecisionAlternative[];
  consequences: string;
  epicLink?: string;
  epicColor?: string;
  tags: string[];
}

const statusConfig: Record<DecisionStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  accepted: { label: "Aceita", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  open: { label: "Em Discussão", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  deprecated: { label: "Depreciada", color: "text-red-500", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  superseded: { label: "Substituída", color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", icon: XCircle },
};

const categoryConfig: Record<DecisionCategory, { label: string; color: string; bg: string; dot: string }> = {
  produto: { label: "Produto", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500" },
  arquitetura: { label: "Arquitetura", color: "text-purple-600", bg: "bg-purple-50", dot: "bg-purple-500" },
  "estratégia": { label: "Estratégia", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" },
  processo: { label: "Processo", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
};

const decisions: Decision[] = [
  {
    id: "ADR-008",
    title: "Adotar Feature Flags como padrão de rollout de features novas",
    status: "accepted",
    category: "processo",
    date: "20 Out 2023",
    decidedBy: "André M.",
    decidedInitials: "AM",
    decidedColor: "bg-amber-200 text-amber-800",
    participants: ["Sofia L.", "Lucas M.", "Carla R."],
    context:
      "Deploys de novas features afetavam imediatamente 100% dos usuários, dificultando rollback rápido e impedindo testes controlados com subgrupos.",
    decision:
      "Todas as features novas serão entregues por trás de feature flags. Deploy contínuo com ativação controlada por segmento e percentual de rollout.",
    rationale:
      "Reduz risco de incidentes em produção, permite rollout gradual (5% → 25% → 100%) e habilita A/B testing sem infraestrutura adicional.",
    alternatives: [
      { option: "Branch deploys por feature", reason: "Complexidade de merge alta — rejeitado" },
      { option: "Beta users por tenant", reason: "Não escalável para testes com segmentos geográficos" },
      { option: "Blue-green sem flags", reason: "Não permite rollout gradual por segmento de usuário" },
    ],
    consequences:
      "Leve aumento de complexidade no código (condicionais por flag). Necessário processo de limpeza de flags antigas a cada quarter para evitar dead code.",
    epicLink: "Engenharia",
    epicColor: "bg-blue-100 text-blue-700",
    tags: ["rollout", "feature-flags", "processo"],
  },
  {
    id: "ADR-007",
    title: "Priorização de backlog com framework MoSCoW",
    status: "accepted",
    category: "processo",
    date: "01 Out 2023",
    decidedBy: "Carla R.",
    decidedInitials: "CR",
    decidedColor: "bg-purple-200 text-purple-800",
    participants: ["André M.", "Sofia L."],
    context:
      "Time sem critério unificado de priorização. Discussões de backlog duravam 2+ horas sem consenso claro sobre o que construir primeiro.",
    decision:
      "Adotar MoSCoW (Must Have / Should Have / Could Have / Won't Have) como framework oficial de priorização do backlog de produto.",
    rationale:
      "Simples, visual e fácil de comunicar com stakeholders não-técnicos. Já utilizado por times de produto de referência no Brasil e no exterior.",
    alternatives: [
      { option: "RICE (Reach × Impact × Confidence ÷ Effort)", reason: "Requer dados históricos que ainda não temos" },
      { option: "WSJF (Weighted Shortest Job First)", reason: "Complexidade alta para o estágio atual da equipe" },
      { option: "Sequência intuitiva pelo PM", reason: "Não transparente — gera desalinhamento com engenharia" },
    ],
    consequences:
      "Critério 'Must Have' sujeito a julgamento subjetivo. Revisão trimestral obrigatória para evitar que a categoria 'Must' infle com o tempo.",
    tags: ["priorização", "backlog", "moscow"],
  },
  {
    id: "ADR-006",
    title: "Foco exclusivo em Pix para aportes no Q4/2023",
    status: "accepted",
    category: "produto",
    date: "22 Set 2023",
    decidedBy: "André M.",
    decidedInitials: "AM",
    decidedColor: "bg-amber-200 text-amber-800",
    participants: ["Carla R.", "Lucas M.", "Sofia L."],
    context:
      "Plataforma suportava TED, Boleto e Pix com fluxos e bugs independentes. 89% dos aportes já eram via Pix, mas o custo de manter os 3 métodos era alto.",
    decision:
      "Deprecar TED e Boleto no fluxo de aportes. Focar 100% em Pix Instantâneo com confirmação em tempo real e reconciliação automática.",
    rationale:
      "ROI máximo no método mais usado. Simplifica a codebase, reduz bugs e entrega experiência de aporte < 5s end-to-end.",
    alternatives: [
      { option: "Manter os 3 métodos", reason: "Complexidade alta sem retorno proporcional (11% de uso)" },
      { option: "Priorizar TED por compliance mais simples", reason: "Experiência inferior ao Pix — contrário à direção do mercado" },
    ],
    consequences:
      "Usuários sem conta bancária digital ou Pix habilitado afetados temporariamente. Comunicação proativa obrigatória para esses casos.",
    epicLink: "Pagamentos",
    epicColor: "bg-blue-100 text-blue-700",
    tags: ["pagamentos", "pix", "simplificação"],
  },
  {
    id: "ADR-005",
    title: "Arquitetura assíncrona para processamento de webhooks",
    status: "accepted",
    category: "arquitetura",
    date: "05 Set 2023",
    decidedBy: "Lucas M.",
    decidedInitials: "LM",
    decidedColor: "bg-emerald-200 text-emerald-800",
    participants: ["André M.", "Sofia L."],
    context:
      "Webhooks processados de forma síncrona causavam timeouts em integrações com parceiros lentos, gerando falhas em cascata e perda silenciosa de eventos.",
    decision:
      "Adotar fila assíncrona Redis + worker dedicado com retry automático, dead letter queue e idempotência por evento ID.",
    rationale:
      "Desacopla recebimento do processamento. Resiliente a falhas de parceiros externos. Garante entrega at-least-once com idempotência no consumidor.",
    alternatives: [
      { option: "Webhooks síncronos com timeout aumentado", reason: "Não resolve a causa raiz — parceiro lento = timeout garantido" },
      { option: "Polling por clientes", reason: "Aumenta carga na API e piora experiência de tempo real" },
    ],
    consequences:
      "Latência de +100ms no processamento vs. síncrono, mas garantida. Aumenta complexidade operacional: fila + dead letter queue precisam de monitoramento.",
    epicLink: "APIs & Integrações",
    epicColor: "bg-purple-100 text-purple-700",
    tags: ["webhooks", "arquitetura", "redis", "async"],
  },
  {
    id: "ADR-004",
    title: "2FA obrigatório via TOTP para perfis ADMIN (vs. SMS OTP)",
    status: "accepted",
    category: "produto",
    date: "12 Set 2023",
    decidedBy: "Sofia L.",
    decidedInitials: "SL",
    decidedColor: "bg-pink-200 text-pink-800",
    participants: ["André M.", "Carla R."],
    context:
      "Boas práticas BACEN e regulação de plataformas financeiras recomendavam MFA obrigatório. Precisávamos escolher o mecanismo mais seguro e viável.",
    decision:
      "TOTP via Google Authenticator ou Authy, obrigatório para ADMIN e SUPER_ADMIN. Facultativo para investidores com incentivo de adoção.",
    rationale:
      "TOTP é mais seguro que SMS (imune a SIM swapping). Custo zero — sem dependência de Twilio. Suportado pelos authenticators populares.",
    alternatives: [
      { option: "SMS OTP via Twilio", reason: "Vulnerável a SIM swapping — inaceitável para admins com acesso financeiro" },
      { option: "Email OTP", reason: "Cadeia de segurança depende do e-mail — single point of failure" },
      { option: "Hardware keys (YubiKey)", reason: "Custo alto e fricção para equipe distribuída" },
    ],
    consequences:
      "Admins precisam de app authenticator instalado. Onboarding de novo admin +5 min. Taxa de suporte estimada: baixa.",
    epicLink: "Segurança",
    epicColor: "bg-red-100 text-red-700",
    tags: ["segurança", "2fa", "totp", "autenticação"],
  },
  {
    id: "ADR-003",
    title: "Migração para Next.js App Router (vs. manter Pages Router)",
    status: "accepted",
    category: "arquitetura",
    date: "20 Ago 2023",
    decidedBy: "Lucas M.",
    decidedInitials: "LM",
    decidedColor: "bg-emerald-200 text-emerald-800",
    participants: ["André M.", "Sofia L."],
    context:
      "Next.js 15 consolidou App Router como padrão. Manter Pages Router significaria acumular dívida técnica e perder React Server Components.",
    decision:
      "Migrar toda a aplicação para App Router com Server Components como padrão. Client Components apenas onde interatividade for necessária.",
    rationale:
      "RSC reduzem JS no cliente em ~40%. Melhor DX com layouts aninhados. Alinhamento com o ecossistema Next.js long-term.",
    alternatives: [
      { option: "Manter Pages Router", reason: "Dívida técnica crescente — suporte legado eventual" },
      { option: "Migrar para Remix", reason: "Reescrita completa — risco alto sem ganho proporcional dado stack Vercel" },
    ],
    consequences:
      "Curva de aprendizado de ~1 sprint. Algumas libs client-only precisaram de wrappers. Resultado final: bundle JS -38%.",
    epicLink: "Plataforma Core",
    epicColor: "bg-blue-100 text-blue-700",
    tags: ["next.js", "app-router", "arquitetura", "frontend"],
  },
  {
    id: "ADR-002",
    title: "Criptomoedas e ativos digitais fora de escopo até Q1/2025",
    status: "accepted",
    category: "estratégia",
    date: "10 Ago 2023",
    decidedBy: "Carla R.",
    decidedInitials: "CR",
    decidedColor: "bg-purple-200 text-purple-800",
    participants: ["André M.", "Board"],
    context:
      "Pressão de ~12% da base e de investidores da Bloxs para incluir criptomoedas. Risco regulatório e reputacional a considerar.",
    decision:
      "Criptomoedas e ativos digitais ficam fora do roadmap até reavaliação estratégica no Q1/2025.",
    rationale:
      "Risco regulatório alto (CVM sem framework consolidado). Fora do DNA da Bloxs: foco em renda fixa de qualidade. Diluiria esforço de produto.",
    alternatives: [
      { option: "Lançar apenas BTC e ETH com disclaimers", reason: "Risco regulatório presente — criaria expectativa de expansão" },
      { option: "Parceria com exchange de cripto", reason: "Dependência de terceiro fora de nosso controle operacional" },
    ],
    consequences:
      "Perda estimada de 8-12% de usuários potenciais a curto prazo. Mantém foco e reputação de plataforma de renda fixa de qualidade.",
    tags: ["estratégia", "produto", "cripto", "escopo"],
  },
  {
    id: "ADR-001",
    title: "Datadog como plataforma principal de observabilidade",
    status: "accepted",
    category: "arquitetura",
    date: "01 Ago 2023",
    decidedBy: "Lucas M.",
    decidedInitials: "LM",
    decidedColor: "bg-emerald-200 text-emerald-800",
    participants: ["André M.", "Sofia L."],
    context:
      "Time sem visibilidade unificada de logs, métricas e traces. Cada dev usando ferramentas diferentes: CloudWatch, console.log, Vercel logs.",
    decision:
      "Adotar Datadog com APM, Log Management e dashboards customizados. POC de 1 semana realizado antes da decisão final.",
    rationale:
      "All-in-one (logs + métricas + traces + alertas). Integração nativa com Next.js e Vercel. Trial gratuito viabilizou validação antes do custo.",
    alternatives: [
      { option: "New Relic", reason: "Pricing por usuário inviável para equipe pequena" },
      { option: "OpenTelemetry + Prometheus + Grafana", reason: "Setup e manutenção altos demais para time de 4 pessoas" },
      { option: "CloudWatch nativo", reason: "Fragmentado — logs sem traces sem alertas inteligentes" },
    ],
    consequences:
      "Custo ~$200/mês. Onboarding de 2 dias. MTTD reduziu de 45min para 8min na primeira semana de uso.",
    epicLink: "Plataforma Core",
    epicColor: "bg-blue-100 text-blue-700",
    tags: ["observabilidade", "datadog", "monitoramento"],
  },
];

export default function DecisionsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DecisionCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>("ADR-008");

  const filtered = decisions.filter((d) => {
    if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.tags.join(" ").includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: decisions.length,
    accepted: decisions.filter((d) => d.status === "accepted").length,
    open: decisions.filter((d) => d.status === "open").length,
    byCategory: Object.fromEntries(
      (Object.keys(categoryConfig) as DecisionCategory[]).map((k) => [k, decisions.filter((d) => d.category === k).length])
    ),
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mural de Decisões</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Log estruturado de decisões de produto — o que foi decidido, por quem e por quê
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
          <Plus size={14} />
          Nova Decisão
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total de Decisões", value: stats.total, color: "text-gray-900", bg: "bg-white border-gray-100" },
          { label: "Aceitas", value: stats.accepted, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Em Discussão", value: stats.open, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Este quarter", value: 5, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Decision List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                categoryFilter === "all" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Todos
            </button>
            {(Object.entries(categoryConfig) as [DecisionCategory, (typeof categoryConfig)[DecisionCategory]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setCategoryFilter(key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  categoryFilter === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cfg.label}
                <span className={`ml-1.5 text-[10px] font-bold ${categoryFilter === key ? cfg.color : "text-gray-400"}`}>
                  {stats.byCategory[key]}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou tag..."
              className="text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent w-full"
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{filtered.length} decisões</span>
        </div>

        {/* Decision Cards */}
        <div className="divide-y divide-gray-50">
          {filtered.map((d) => {
            const statusCfg = statusConfig[d.status];
            const catCfg = categoryConfig[d.category];
            const StatusIcon = statusCfg.icon;
            const isExpanded = expanded === d.id;

            return (
              <div key={d.id}>
                {/* Header row */}
                <div
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : d.id)}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${catCfg.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">{d.id}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.border}`}>
                        <StatusIcon size={10} className={statusCfg.color} />
                        <span className={`text-[10px] font-semibold ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catCfg.bg} ${catCfg.color}`}>
                        {catCfg.label}
                      </span>
                      {d.epicLink && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${d.epicColor}`}>
                          {d.epicLink}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{d.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${d.decidedColor}`}>
                          {d.decidedInitials}
                        </div>
                        <span className="text-xs text-gray-500">{d.decidedBy}</span>
                      </div>
                      {d.participants.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Users size={11} />
                          <span>{d.participants.join(", ")}</span>
                        </div>
                      )}
                      <span className="text-xs text-gray-400">{d.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {d.tags.map((tag) => (
                        <span key={tag} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
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

                {/* Expanded ADR Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 bg-gray-50/40 border-t border-gray-100 space-y-4">
                    {/* Contexto */}
                    <div className="mt-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Contexto</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{d.context}</p>
                    </div>

                    {/* Decisão */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">Decisão</p>
                      <p className="text-sm font-semibold text-blue-900 leading-relaxed">{d.decision}</p>
                    </div>

                    {/* Justificativa */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Justificativa</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{d.rationale}</p>
                    </div>

                    {/* Alternativas */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Alternativas Consideradas e Descartadas
                      </p>
                      <div className="space-y-2">
                        {d.alternatives.map((alt, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <XCircle size={13} className="text-red-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-xs font-semibold text-gray-700">{alt.option}</span>
                              <span className="text-xs text-gray-400"> — {alt.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consequências */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1.5">Consequências</p>
                      <p className="text-xs text-amber-800 leading-relaxed">{d.consequences}</p>
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
