import { Plus, Search, SlidersHorizontal, Link2 } from "lucide-react";

type MoscowCategory = "must" | "should" | "could" | "wont";
type ItemStatus = "Novo" | "Em Avaliação" | "Aprovado" | "Em Sprint" | "Descartado";

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  epic: string;
  epicColor: string;
  points: number | null;
  status: ItemStatus;
  owner: string;
  initials: string;
  avatarColor: string;
  category: MoscowCategory;
  value: number;
}

const items: BacklogItem[] = [
  // Must Have
  {
    id: "BK-001",
    title: "Módulo de Pix para aportes instantâneos",
    description: "Permitir aportes via Pix com confirmação em tempo real e reconciliação automática.",
    epic: "Pagamentos",
    epicColor: "bg-blue-100 text-blue-700",
    points: 13,
    status: "Em Sprint",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    category: "must",
    value: 9,
  },
  {
    id: "BK-002",
    title: "Autenticação biométrica no app mobile",
    description: "Face ID e Touch ID para acesso ao app sem senha, com fallback seguro.",
    epic: "Segurança",
    epicColor: "bg-red-100 text-red-700",
    points: 8,
    status: "Aprovado",
    owner: "Sofia L.",
    initials: "SL",
    avatarColor: "bg-pink-200 text-pink-800",
    category: "must",
    value: 8,
  },
  {
    id: "BK-003",
    title: "Extrato consolidado multi-produto",
    description: "Visão unificada de CRI, CRA, LCA, LCI e debentures em um único extrato.",
    epic: "Analytics",
    epicColor: "bg-emerald-100 text-emerald-700",
    points: 8,
    status: "Aprovado",
    owner: "Lucas M.",
    initials: "LM",
    avatarColor: "bg-emerald-200 text-emerald-800",
    category: "must",
    value: 9,
  },
  {
    id: "BK-004",
    title: "Relatório de IR anual automatizado",
    description: "Geração automática do informe de rendimentos para declaração de Imposto de Renda.",
    epic: "Compliance",
    epicColor: "bg-purple-100 text-purple-700",
    points: 13,
    status: "Em Avaliação",
    owner: "Carla R.",
    initials: "CR",
    avatarColor: "bg-purple-200 text-purple-800",
    category: "must",
    value: 10,
  },
  // Should Have
  {
    id: "BK-005",
    title: "Dashboard personalizado por perfil de investidor",
    description: "Widgets configuráveis: portfólio, rentabilidade, vencimentos e alertas customizados.",
    epic: "Experiência",
    epicColor: "bg-pink-100 text-pink-700",
    points: 5,
    status: "Em Avaliação",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    category: "should",
    value: 7,
  },
  {
    id: "BK-006",
    title: "Notificações de vencimento com antecedência D-5 e D-1",
    description: "Push e e-mail automáticos informando vencimentos próximos de papéis na carteira.",
    epic: "Engajamento",
    epicColor: "bg-amber-100 text-amber-700",
    points: 3,
    status: "Aprovado",
    owner: "Lucas M.",
    initials: "LM",
    avatarColor: "bg-emerald-200 text-emerald-800",
    category: "should",
    value: 7,
  },
  {
    id: "BK-007",
    title: "Comparador de produtos financeiros",
    description: "Side-by-side de CRI vs CRA vs Debentures com filtros de prazo, risco e rentabilidade.",
    epic: "Plataforma Core",
    epicColor: "bg-blue-100 text-blue-700",
    points: 8,
    status: "Novo",
    owner: "Carla R.",
    initials: "CR",
    avatarColor: "bg-purple-200 text-purple-800",
    category: "should",
    value: 8,
  },
  // Could Have
  {
    id: "BK-008",
    title: "Gamificação de metas de investimento",
    description: "Badges, streak de aportes mensais e ranking entre investidores para aumentar engajamento.",
    epic: "Engajamento",
    epicColor: "bg-amber-100 text-amber-700",
    points: 13,
    status: "Novo",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    category: "could",
    value: 5,
  },
  {
    id: "BK-009",
    title: "Integração com Open Finance (BACEN)",
    description: "Importar dados de outras instituições para oferecer análise cross-banco ao investidor.",
    epic: "APIs e Integrações",
    epicColor: "bg-purple-100 text-purple-700",
    points: 21,
    status: "Em Avaliação",
    owner: "Sofia L.",
    initials: "SL",
    avatarColor: "bg-pink-200 text-pink-800",
    category: "could",
    value: 6,
  },
  {
    id: "BK-010",
    title: "Assistente IA de suporte ao investidor",
    description: "Chatbot com LLM para responder dúvidas sobre produtos, tributação e rentabilidade.",
    epic: "Suporte",
    epicColor: "bg-slate-100 text-slate-700",
    points: 8,
    status: "Novo",
    owner: "Carla R.",
    initials: "CR",
    avatarColor: "bg-purple-200 text-purple-800",
    category: "could",
    value: 5,
  },
  // Won't Have
  {
    id: "BK-011",
    title: "Criptomoedas e ativos digitais",
    description: "Fora do escopo regulatório da Bloxs e do perfil de risco da base atual.",
    epic: "Produto",
    epicColor: "bg-gray-100 text-gray-600",
    points: null,
    status: "Descartado",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    category: "wont",
    value: 0,
  },
  {
    id: "BK-012",
    title: "Marketplace de gestores independentes",
    description: "Risco regulatório alto. Requer licença CVM adicional. Reavaliar em 2025.",
    epic: "Plataforma Core",
    epicColor: "bg-gray-100 text-gray-600",
    points: null,
    status: "Descartado",
    owner: "André M.",
    initials: "AM",
    avatarColor: "bg-amber-200 text-amber-800",
    category: "wont",
    value: 0,
  },
];

const columns: {
  id: MoscowCategory;
  label: string;
  short: string;
  description: string;
  headerBg: string;
  badge: string;
  border: string;
  dot: string;
}[] = [
  {
    id: "must",
    label: "Must Have",
    short: "M",
    description: "Crítico — não entrega sem isso",
    headerBg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
  },
  {
    id: "should",
    label: "Should Have",
    short: "S",
    description: "Importante, não crítico",
    headerBg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  {
    id: "could",
    label: "Could Have",
    short: "C",
    description: "Desejável se houver capacidade",
    headerBg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  {
    id: "wont",
    label: "Won't Have",
    short: "W",
    description: "Fora de escopo neste ciclo",
    headerBg: "bg-gray-50",
    badge: "bg-gray-100 text-gray-600",
    border: "border-gray-200",
    dot: "bg-gray-300",
  },
];

const statusStyle: Record<ItemStatus, string> = {
  "Novo": "bg-gray-100 text-gray-600",
  "Em Avaliação": "bg-amber-50 text-amber-600",
  "Aprovado": "bg-blue-50 text-blue-600",
  "Em Sprint": "bg-emerald-50 text-emerald-600",
  "Descartado": "bg-gray-100 text-gray-400",
};

export default function BacklogPage() {
  const counts = {
    must: items.filter((i) => i.category === "must").length,
    should: items.filter((i) => i.category === "should").length,
    could: items.filter((i) => i.category === "could").length,
    wont: items.filter((i) => i.category === "wont").length,
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Backlog de Produto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Priorização por framework MoSCoW — {items.length} itens no backlog
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar item..."
              className="text-sm text-gray-600 outline-none placeholder-gray-400 w-40 bg-transparent"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal size={14} />
            Filtros
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
            <Plus size={14} />
            Novo Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {columns.map((col) => (
          <div
            key={col.id}
            className={`rounded-2xl px-5 py-3.5 border ${col.border} ${col.headerBg} flex items-center justify-between`}
          >
            <div>
              <p className="text-xs font-bold text-gray-700">{col.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{col.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
              <span className="text-xl font-bold text-gray-800">{counts[col.id]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* MoSCoW Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => {
          const colItems = items.filter((i) => i.category === col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              {/* Column Header */}
              <div className={`rounded-xl px-4 py-3 border ${col.border} ${col.headerBg} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${col.badge}`}>
                    {col.short}
                  </span>
                  <span className="text-sm font-bold text-gray-800">{col.label}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                  {colItems.length}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2.5">
                {colItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 border ${col.id === "wont" ? "border-gray-100 opacity-70" : "border-gray-100"} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    {/* ID + Epic */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-bold text-gray-400">{item.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.epicColor}`}>
                        {item.epic}
                      </span>
                    </div>

                    {/* Title */}
                    <p className={`text-xs font-semibold leading-relaxed mb-1.5 ${col.id === "wont" ? "text-gray-500 line-through" : "text-gray-800"}`}>
                      {item.title}
                    </p>

                    {/* Description */}
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${item.avatarColor}`}>
                          {item.initials}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[item.status]}`}>
                          {item.status}
                        </span>
                      </div>
                      {item.points !== null ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-gray-400">{item.points}pt</span>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] font-bold text-gray-400">★ {item.value}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-300 italic">n/a</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add item button */}
                <button className={`w-full py-2.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed ${col.border} rounded-xl flex items-center justify-center gap-1.5 transition-colors hover:bg-white`}>
                  <Plus size={12} />
                  Adicionar item
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 shadow-sm flex items-center gap-6">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Legenda MoSCoW</p>
        <div className="h-4 w-px bg-gray-200" />
        {columns.map((col) => (
          <div key={col.id} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
            <span className="text-xs font-semibold text-gray-600">{col.label}</span>
            <span className="text-xs text-gray-400">— {col.description}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Link2 size={12} />
          <span>★ = Valor de Negócio (1–10)</span>
        </div>
      </div>
    </div>
  );
}
