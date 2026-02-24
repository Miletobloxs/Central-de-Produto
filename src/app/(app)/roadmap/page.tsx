import { ChevronDown, Plus, Filter } from "lucide-react";

const epics = [
  {
    id: 15,
    title: "Módulo de Antecipação de Recebíveis",
    stream: "Plataforma Core",
    quarter: "Q4 2023",
    start: 0,
    span: 2,
    color: "bg-blue-500",
    status: "Em Progresso",
    statusColor: "text-blue-600 bg-blue-50",
    priority: "Alta",
  },
  {
    id: 16,
    title: "Redesign do Checkout Mobile",
    stream: "Mobile",
    quarter: "Q4 2023",
    start: 1,
    span: 2,
    color: "bg-purple-500",
    status: "Planejado",
    statusColor: "text-purple-600 bg-purple-50",
    priority: "Média",
  },
  {
    id: 17,
    title: "Integração Multi-Bank API",
    stream: "APIs e Integrações",
    quarter: "Q1 2024",
    start: 3,
    span: 2,
    color: "bg-amber-500",
    status: "Planejado",
    statusColor: "text-amber-600 bg-amber-50",
    priority: "Alta",
  },
  {
    id: 18,
    title: "Analytics Platform v2",
    stream: "Analytics & Dados",
    quarter: "Q1 2024",
    start: 3,
    span: 3,
    color: "bg-emerald-500",
    status: "Planejado",
    statusColor: "text-emerald-600 bg-emerald-50",
    priority: "Média",
  },
  {
    id: 19,
    title: "Mobile App Refresh",
    stream: "Mobile",
    quarter: "Q2 2024",
    start: 6,
    span: 2,
    color: "bg-pink-500",
    status: "Planejado",
    statusColor: "text-pink-600 bg-pink-50",
    priority: "Baixa",
  },
  {
    id: 20,
    title: "Infraestrutura de Segurança",
    stream: "Plataforma Core",
    quarter: "Q2 2024",
    start: 5,
    span: 3,
    color: "bg-slate-500",
    status: "Planejado",
    statusColor: "text-slate-600 bg-slate-50",
    priority: "Alta",
  },
];

const streams = ["Plataforma Core", "APIs e Integrações", "Mobile", "Analytics & Dados"];

const months = [
  "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
];

const quarters = [
  { label: "Q4 2023", cols: 3 },
  { label: "Q1 2024", cols: 3 },
  { label: "Q2 2024", cols: 3 },
];

const priorityColors: Record<string, string> = {
  Alta: "text-red-600 bg-red-50 border-red-200",
  Média: "text-amber-600 bg-amber-50 border-amber-200",
  Baixa: "text-gray-500 bg-gray-50 border-gray-200",
};

export default function RoadmapPage() {
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Roadmap do Produto</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão trimestral de iniciativas e épicos</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <Filter size={14} />
            Filtros
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
            <Plus size={14} />
            Novo Épico
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Épicos Planejados", value: "12", color: "text-gray-900" },
          { label: "Em Progresso", value: "3", color: "text-blue-600" },
          { label: "Concluídos", value: "8", color: "text-emerald-600" },
          { label: "Atrasados", value: "1", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Quarter headers */}
        <div className="border-b border-gray-100">
          <div className="flex">
            <div className="w-48 shrink-0 px-5 py-3 border-r border-gray-100 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stream</p>
            </div>
            <div className="flex flex-1">
              {quarters.map((q) => (
                <div
                  key={q.label}
                  className="flex-1 text-center py-3 border-r border-gray-100 last:border-r-0 bg-gray-50"
                >
                  <p className="text-xs font-bold text-gray-700">{q.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Month sub-headers */}
          <div className="flex border-t border-gray-100">
            <div className="w-48 shrink-0 border-r border-gray-100" />
            {months.map((m, i) => (
              <div
                key={i}
                className="flex-1 text-center py-2 border-r border-gray-100 last:border-r-0"
              >
                <p className="text-[10px] font-medium text-gray-400">{m}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stream rows */}
        {streams.map((stream) => {
          const streamEpics = epics.filter((e) => e.stream === stream);
          return (
            <div key={stream} className="flex border-b border-gray-100 last:border-b-0 min-h-16">
              {/* Stream label */}
              <div className="w-48 shrink-0 px-5 py-4 border-r border-gray-100 flex items-center">
                <p className="text-xs font-semibold text-gray-700">{stream}</p>
              </div>

              {/* Timeline cells */}
              <div className="flex flex-1 relative py-3">
                {/* Grid lines */}
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 border-r border-gray-50 last:border-r-0"
                  />
                ))}

                {/* Epics */}
                {streamEpics.map((epic) => (
                  <div
                    key={epic.id}
                    className="absolute top-3 bottom-3 flex items-center group"
                    style={{
                      left: `${(epic.start / months.length) * 100}%`,
                      width: `${(epic.span / months.length) * 100}%`,
                      paddingLeft: "4px",
                      paddingRight: "4px",
                    }}
                  >
                    <div
                      className={`${epic.color} rounded-lg px-3 py-1.5 w-full cursor-pointer opacity-90 hover:opacity-100 transition-opacity shadow-sm`}
                    >
                      <p className="text-[10px] font-bold text-white leading-snug truncate">
                        #{epic.id} {epic.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Epic List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Todos os Épicos</h2>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
            Ordenar por prioridade <ChevronDown size={12} />
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {epics.map((epic) => (
            <div key={epic.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
              <div className={`w-2 h-8 rounded-full ${epic.color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  <span className="text-gray-400 mr-2 text-xs">#{epic.id}</span>
                  {epic.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{epic.stream} • {epic.quarter}</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${priorityColors[epic.priority]}`}
              >
                {epic.priority}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${epic.statusColor}`}>
                {epic.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
