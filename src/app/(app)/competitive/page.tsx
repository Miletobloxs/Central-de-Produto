import { CheckCircle2, Wrench, Clock, Minus, Plus, TrendingUp, TrendingDown, Minus as Dash } from "lucide-react";

type FeatureAvailability = "available" | "in-dev" | "planned" | "unavailable";
type ThreatLevel = "alto" | "médio" | "baixo";
type MoveType = "feature" | "product" | "pricing" | "growth" | "partnership";

interface Competitor {
  id: string;
  name: string;
  short: string;
  color: string;
  threat: ThreatLevel;
  differentiation: string;
  users: string;
  lastUpdate: string;
}

interface FeatureRow {
  feature: string;
  category: string;
  bloxs: FeatureAvailability;
  btg: FeatureAvailability;
  xp: FeatureAvailability;
  warren: FeatureAvailability;
  nuinvest: FeatureAvailability;
  kinea: FeatureAvailability;
}

interface RecentMove {
  date: string;
  competitor: string;
  competitorColor: string;
  type: MoveType;
  description: string;
  impact: "alto" | "médio" | "baixo";
}

const competitors: Competitor[] = [
  {
    id: "btg",
    name: "BTG Pactual Digital",
    short: "BTG",
    color: "bg-yellow-100 text-yellow-800",
    threat: "alto",
    differentiation: "Maior plataforma de renda fixa do Brasil, força em CRI/CRA e produto estruturado",
    users: "3.2M",
    lastUpdate: "Nov 2023",
  },
  {
    id: "xp",
    name: "XP Investimentos",
    short: "XP",
    color: "bg-orange-100 text-orange-800",
    threat: "alto",
    differentiation: "Ecossistema completo com assessoria, ecosistema de parceiros e forte marca",
    users: "4.1M",
    lastUpdate: "Out 2023",
  },
  {
    id: "warren",
    name: "Warren",
    short: "WR",
    color: "bg-green-100 text-green-800",
    threat: "médio",
    differentiation: "Gestão automatizada, UX superior, forte em engajamento de investidores jovens",
    users: "420K",
    lastUpdate: "Out 2023",
  },
  {
    id: "nuinvest",
    name: "Nuinvest (Nubank)",
    short: "NU",
    color: "bg-purple-100 text-purple-800",
    threat: "médio",
    differentiation: "Integração com o ecossistema Nubank, grande base de clientes digitais já capturados",
    users: "2.0M",
    lastUpdate: "Set 2023",
  },
  {
    id: "kinea",
    name: "Kinea Investimentos",
    short: "KI",
    color: "bg-blue-100 text-blue-800",
    threat: "baixo",
    differentiation: "Foco em produto estruturado e investidores qualificados (RCVM 175+)",
    users: "180K",
    lastUpdate: "Set 2023",
  },
];

const features: FeatureRow[] = [
  { feature: "Pix para Aportes", category: "Pagamentos", bloxs: "available", btg: "available", xp: "available", warren: "available", nuinvest: "available", kinea: "unavailable" },
  { feature: "App Mobile Nativo", category: "Plataforma", bloxs: "available", btg: "available", xp: "available", warren: "available", nuinvest: "available", kinea: "unavailable" },
  { feature: "Autenticação 2FA", category: "Segurança", bloxs: "available", btg: "available", xp: "available", warren: "unavailable", nuinvest: "available", kinea: "unavailable" },
  { feature: "Relatórios PDF/XLSX", category: "Analytics", bloxs: "available", btg: "available", xp: "available", warren: "unavailable", nuinvest: "unavailable", kinea: "available" },
  { feature: "Comparador de Produtos", category: "Decisão", bloxs: "in-dev", btg: "available", xp: "available", warren: "unavailable", nuinvest: "unavailable", kinea: "unavailable" },
  { feature: "Open Finance (BACEN)", category: "Integração", bloxs: "planned", btg: "available", xp: "available", warren: "unavailable", nuinvest: "available", kinea: "unavailable" },
  { feature: "Webhooks API", category: "API", bloxs: "available", btg: "available", xp: "unavailable", warren: "unavailable", nuinvest: "unavailable", kinea: "available" },
  { feature: "CRI / CRA / LCA / LCI", category: "Produtos", bloxs: "available", btg: "available", xp: "available", warren: "available", nuinvest: "unavailable", kinea: "available" },
  { feature: "Assistente IA / Chatbot", category: "IA", bloxs: "in-dev", btg: "available", xp: "in-dev", warren: "unavailable", nuinvest: "unavailable", kinea: "unavailable" },
  { feature: "Dashboard Personalizado", category: "UX", bloxs: "in-dev", btg: "available", xp: "available", warren: "available", nuinvest: "available", kinea: "unavailable" },
  { feature: "Gamificação", category: "Engajamento", bloxs: "planned", btg: "unavailable", xp: "unavailable", warren: "available", nuinvest: "available", kinea: "unavailable" },
  { feature: "Debentures / FIDCs", category: "Produtos", bloxs: "available", btg: "available", xp: "available", warren: "unavailable", nuinvest: "unavailable", kinea: "available" },
];

const recentMoves: RecentMove[] = [
  { date: "Nov 2023", competitor: "BTG", competitorColor: "bg-yellow-100 text-yellow-800", type: "feature", description: "Lançou integração com Open Finance via BACEN para todos os clientes pessoas físicas.", impact: "alto" },
  { date: "Out 2023", competitor: "XP", competitorColor: "bg-orange-100 text-orange-800", type: "product", description: "Anunciou plano de assistente IA para análise personalizada de carteira e recomendações.", impact: "alto" },
  { date: "Out 2023", competitor: "Warren", competitorColor: "bg-green-100 text-green-800", type: "feature", description: "Lançou gamificação de metas de investimento com streak mensal e ranking entre usuários.", impact: "médio" },
  { date: "Set 2023", competitor: "Nuinvest", competitorColor: "bg-purple-100 text-purple-800", type: "growth", description: "Atingiu 2 milhões de investidores ativos, crescimento de 40% vs Q3/2022.", impact: "médio" },
  { date: "Set 2023", competitor: "XP", competitorColor: "bg-orange-100 text-orange-800", type: "pricing", description: "Zerou taxa de custódia para fundos de renda fixa com prazo acima de 360 dias.", impact: "alto" },
  { date: "Ago 2023", competitor: "BTG", competitorColor: "bg-yellow-100 text-yellow-800", type: "feature", description: "Lançou simulador de rentabilidade com projeção de cenários (base/otimista/pessimista).", impact: "médio" },
];

const availabilityConfig: Record<FeatureAvailability, { icon: React.ElementType; color: string; bg: string }> = {
  available: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  "in-dev": { icon: Wrench, color: "text-amber-500", bg: "bg-amber-50" },
  planned: { icon: Clock, color: "text-gray-400", bg: "bg-gray-50" },
  unavailable: { icon: Minus, color: "text-gray-300", bg: "" },
};

const threatConfig: Record<ThreatLevel, { color: string; bg: string; border: string }> = {
  alto: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  médio: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  baixo: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

const moveTypeConfig: Record<MoveType, { label: string; color: string; bg: string }> = {
  feature: { label: "Feature", color: "text-blue-600", bg: "bg-blue-50" },
  product: { label: "Produto", color: "text-purple-600", bg: "bg-purple-50" },
  pricing: { label: "Pricing", color: "text-red-600", bg: "bg-red-50" },
  growth: { label: "Crescimento", color: "text-emerald-600", bg: "bg-emerald-50" },
  partnership: { label: "Parceria", color: "text-amber-600", bg: "bg-amber-50" },
};

const impactConfig: Record<"alto" | "médio" | "baixo", { icon: React.ElementType; color: string }> = {
  alto: { icon: TrendingUp, color: "text-red-500" },
  médio: { icon: Dash, color: "text-amber-500" },
  baixo: { icon: TrendingDown, color: "text-gray-400" },
};

const competitorKeys: (keyof Omit<FeatureRow, "feature" | "category">)[] = [
  "bloxs", "btg", "xp", "warren", "nuinvest", "kinea",
];

export default function CompetitivePage() {
  const categories = [...new Set(features.map((f) => f.category))];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Competitive Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitoramento de concorrentes, features lançadas e posicionamento de mercado
          </p>
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
          <Plus size={14} />
          Registrar Movimento
        </button>
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-5 gap-3">
        {competitors.map((c) => {
          const threat = threatConfig[c.threat];
          return (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${c.color}`}>
                  {c.short}
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${threat.bg} ${threat.color} ${threat.border}`}>
                  {c.threat}
                </div>
              </div>
              <p className="text-xs font-bold text-gray-900 mb-1 leading-tight">{c.name}</p>
              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{c.differentiation}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">{c.users}</span>
                <span className="text-[10px] text-gray-400">usuários</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">Matriz de Features</p>
          <div className="flex items-center gap-4">
            {[
              { icon: CheckCircle2, color: "text-emerald-600", label: "Disponível" },
              { icon: Wrench, color: "text-amber-500", label: "Em Dev" },
              { icon: Clock, color: "text-gray-400", label: "Planejado" },
              { icon: Minus, color: "text-gray-300", label: "Indisponível" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <item.icon size={12} className={item.color} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-semibold text-gray-500 px-6 py-3 w-48">Feature</th>
                <th className="font-semibold text-gray-500 px-3 py-3 text-center w-20">Categoria</th>
                {["Bloxs", "BTG", "XP", "Warren", "Nuinvest", "Kinea"].map((name) => (
                  <th key={name} className={`font-bold px-3 py-3 text-center w-20 ${name === "Bloxs" ? "text-blue-600" : "text-gray-500"}`}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <>
                  <tr key={`cat-${cat}`} className="bg-gray-50/80">
                    <td colSpan={8} className="px-6 py-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat}</span>
                    </td>
                  </tr>
                  {features.filter((f) => f.category === cat).map((row) => (
                    <tr key={row.feature} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-semibold text-gray-700">{row.feature}</td>
                      <td className="px-3 py-3 text-center text-gray-400">{row.category}</td>
                      {competitorKeys.map((key) => {
                        const avail = row[key];
                        const cfg = availabilityConfig[avail];
                        const Icon = cfg.icon;
                        const isBloxs = key === "bloxs";
                        return (
                          <td key={key} className={`px-3 py-3 text-center ${isBloxs ? "bg-blue-50/30" : ""}`}>
                            <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cfg.bg}`}>
                              <Icon size={13} className={cfg.color} />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Moves */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Movimentos Recentes</p>
          <p className="text-xs text-gray-400 mt-0.5">Features lançadas, mudanças de pricing e parcerias estratégicas</p>
        </div>
        <div className="divide-y divide-gray-50">
          {recentMoves.map((move, i) => {
            const typeCfg = moveTypeConfig[move.type];
            const impactCfg = impactConfig[move.impact];
            const ImpactIcon = impactCfg.icon;
            return (
              <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <span className="text-xs font-bold text-gray-400 w-20 shrink-0 pt-0.5">{move.date}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${move.competitorColor}`}>
                  {move.competitor}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>
                      {typeCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{move.description}</p>
                </div>
                <div className={`flex items-center gap-1 shrink-0 ${impactCfg.color}`}>
                  <ImpactIcon size={12} />
                  <span className="text-[10px] font-bold capitalize">{move.impact}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
