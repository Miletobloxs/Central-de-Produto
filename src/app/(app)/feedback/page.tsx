import { TrendingUp, TrendingDown, MessageSquare, Star, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

type Sentiment = "positive" | "neutral" | "negative";

const recentFeedback: {
  id: number;
  quote: string;
  sentiment: Sentiment;
  category: string;
  date: string;
  source: string;
  score: number;
}[] = [
  {
    id: 1,
    quote: "A nova interface de investimentos facilitou muito a visualização do portfólio.",
    sentiment: "positive",
    category: "Interface",
    date: "22 Out 2023",
    source: "App Mobile",
    score: 9,
  },
  {
    id: 2,
    quote: "Lentidão no carregamento do extrato anual consolidado.",
    sentiment: "negative",
    category: "Performance",
    date: "21 Out 2023",
    source: "Web",
    score: 4,
  },
  {
    id: 3,
    quote: "O processo de aporte ficou muito mais simples com a atualização do checkout.",
    sentiment: "positive",
    category: "Checkout",
    date: "20 Out 2023",
    source: "App Mobile",
    score: 10,
  },
  {
    id: 4,
    quote: "Seria ótimo ter notificações de vencimento de investimentos com mais antecedência.",
    sentiment: "neutral",
    category: "Notificações",
    date: "19 Out 2023",
    source: "Web",
    score: 7,
  },
  {
    id: 5,
    quote: "O suporte respondeu muito rápido ao meu chamado. Excelente experiência.",
    sentiment: "positive",
    category: "Suporte",
    date: "18 Out 2023",
    source: "Email",
    score: 10,
  },
  {
    id: 6,
    quote: "Dificuldade para encontrar o histórico de transações antigas (mais de 1 ano).",
    sentiment: "negative",
    category: "Interface",
    date: "17 Out 2023",
    source: "Web",
    score: 3,
  },
];

const npsMonthly = [
  { month: "Mai", score: 7.8, responses: 142 },
  { month: "Jun", score: 7.9, responses: 156 },
  { month: "Jul", score: 8.0, responses: 168 },
  { month: "Ago", score: 8.1, responses: 175 },
  { month: "Set", score: 8.2, responses: 189 },
  { month: "Out", score: 8.4, responses: 201 },
];

const categories = [
  { name: "Interface", positive: 68, neutral: 22, negative: 10 },
  { name: "Performance", positive: 45, neutral: 30, negative: 25 },
  { name: "Checkout", positive: 78, neutral: 14, negative: 8 },
  { name: "Notificações", positive: 52, neutral: 34, negative: 14 },
  { name: "Suporte", positive: 82, neutral: 12, negative: 6 },
];

const sentimentIcon = {
  positive: <ThumbsUp size={13} className="text-emerald-500" />,
  neutral: <Minus size={13} className="text-amber-500" />,
  negative: <ThumbsDown size={13} className="text-red-500" />,
};

const sentimentStyle: Record<string, string> = {
  positive: "border-emerald-200 bg-emerald-50",
  neutral: "border-amber-200 bg-amber-50",
  negative: "border-red-200 bg-red-50",
};

const sourceColor: Record<string, string> = {
  "App Mobile": "bg-blue-100 text-blue-700",
  "Web": "bg-slate-100 text-slate-700",
  "Email": "bg-purple-100 text-purple-700",
};

export default function FeedbackPage() {
  const maxBarScore = 8.4;
  const minBarScore = 7.0;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feedback / NPS</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitoramento de satisfação e feedbacks dos usuários</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <span>Últimos 6 meses</span>
        </div>
      </div>

      {/* NPS + Distribution row */}
      <div className="grid grid-cols-3 gap-4">
        {/* NPS Score */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">NPS Geral</p>
          <div className="relative w-24 h-24 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F3F5" strokeWidth="12" />
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="12"
                strokeDasharray={`${(8.4 / 10) * 239} 239`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">8.4</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={13} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-500">+0.2 vs mês anterior</span>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Distribuição</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-gray-700">Promotores (9–10)</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">72%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs font-medium text-gray-700">Neutros (7–8)</span>
                </div>
                <span className="text-xs font-bold text-amber-600">19%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "19%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-medium text-gray-700">Detratores (0–6)</span>
                </div>
                <span className="text-xs font-bold text-red-500">9%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-red-500 rounded-full" style={{ width: "9%" }} />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">201 respostas</span> neste mês
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Métricas Rápidas</p>
          <div className="space-y-4">
            {[
              { label: "Feedbacks recebidos", value: "201", trend: "+8%", up: true },
              { label: "Taxa de resposta", value: "34%", trend: "+2%", up: true },
              { label: "Tempo médio de resolução", value: "2.3d", trend: "-0.5d", up: true },
              { label: "CSAT", value: "4.6/5", trend: "+0.1", up: true },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{m.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{m.value}</span>
                  <div className={`flex items-center gap-0.5 text-[10px] font-semibold ${m.up ? "text-emerald-500" : "text-red-500"}`}>
                    {m.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {m.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NPS Trend + Category Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* NPS Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Evolução do NPS</h2>
          <div className="flex items-end gap-3 h-28">
            {npsMonthly.map((m) => {
              const height = ((m.score - minBarScore) / (maxBarScore - minBarScore)) * 100;
              const isLast = m.month === "Out";
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">{m.score}</span>
                  <div className="w-full flex items-end" style={{ height: "72px" }}>
                    <div
                      className={`w-full rounded-t-lg transition-all ${isLast ? "bg-blue-600" : "bg-blue-200"}`}
                      style={{ height: `${Math.max(height, 10)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Sentimento por Categoria</h2>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                  <span className="text-[10px] text-gray-400">{cat.positive}% positivo</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden gap-px">
                  <div className="bg-emerald-400 rounded-l-full" style={{ width: `${cat.positive}%` }} />
                  <div className="bg-amber-300" style={{ width: `${cat.neutral}%` }} />
                  <div className="bg-red-400 rounded-r-full" style={{ width: `${cat.negative}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[10px] text-gray-500">Positivo</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-300" /><span className="text-[10px] text-gray-500">Neutro</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] text-gray-500">Negativo</span></div>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Feedbacks Recentes</h2>
          </div>
          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Ver todos
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {recentFeedback.map((fb) => (
            <div key={fb.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
              <div className={`mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${sentimentStyle[fb.sentiment]}`}>
                {sentimentIcon[fb.sentiment]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 italic leading-relaxed mb-2">
                  &ldquo;{fb.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sourceColor[fb.source]}`}>
                    {fb.source}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {fb.category}
                  </span>
                  <span className="text-[10px] text-gray-400">{fb.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Star size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-gray-700">{fb.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
