import { Plus, ChevronDown, Clock, User, Tag } from "lucide-react";

interface Task {
  id: string;
  title: string;
  epic: string;
  epicColor: string;
  assignee: string;
  initials: string;
  avatarColor: string;
  priority: "Alta" | "Média" | "Baixa";
  points: number;
}

type Column = {
  id: string;
  label: string;
  count: number;
  badgeColor: string;
  tasks: Task[];
};

const columns: Column[] = [
  {
    id: "backlog",
    label: "Backlog",
    count: 5,
    badgeColor: "bg-gray-100 text-gray-600",
    tasks: [
      {
        id: "T-043",
        title: "Criar endpoint de pré-aprovação de limite",
        epic: "Multi-Bank API",
        epicColor: "bg-amber-100 text-amber-700",
        assignee: "Lucas M.",
        initials: "LM",
        avatarColor: "bg-emerald-200 text-emerald-800",
        priority: "Alta",
        points: 5,
      },
      {
        id: "T-044",
        title: "Mapear fluxo de dados do novo fornecedor",
        epic: "Multi-Bank API",
        epicColor: "bg-amber-100 text-amber-700",
        assignee: "Carla R.",
        initials: "CR",
        avatarColor: "bg-purple-200 text-purple-800",
        priority: "Média",
        points: 3,
      },
      {
        id: "T-045",
        title: "Documentar contrato de API v2",
        epic: "Plataforma Core",
        epicColor: "bg-blue-100 text-blue-700",
        assignee: "Rafael T.",
        initials: "RT",
        avatarColor: "bg-amber-200 text-amber-800",
        priority: "Baixa",
        points: 2,
      },
    ],
  },
  {
    id: "em-progresso",
    label: "Em Progresso",
    count: 5,
    badgeColor: "bg-blue-50 text-blue-600",
    tasks: [
      {
        id: "T-038",
        title: "Implementar webhook de transações",
        epic: "APIs e Integrações",
        epicColor: "bg-purple-100 text-purple-700",
        assignee: "André M.",
        initials: "AM",
        avatarColor: "bg-amber-200 text-amber-800",
        priority: "Alta",
        points: 8,
      },
      {
        id: "T-039",
        title: "Refatorar camada de autenticação JWT",
        epic: "Plataforma Core",
        epicColor: "bg-blue-100 text-blue-700",
        assignee: "Sofia L.",
        initials: "SL",
        avatarColor: "bg-pink-200 text-pink-800",
        priority: "Alta",
        points: 5,
      },
      {
        id: "T-040",
        title: "Testes de integração para pagamentos PIX",
        epic: "APIs e Integrações",
        epicColor: "bg-purple-100 text-purple-700",
        assignee: "Lucas M.",
        initials: "LM",
        avatarColor: "bg-emerald-200 text-emerald-800",
        priority: "Média",
        points: 3,
      },
    ],
  },
  {
    id: "em-revisao",
    label: "Em Revisão",
    count: 7,
    badgeColor: "bg-amber-50 text-amber-600",
    tasks: [
      {
        id: "T-034",
        title: "Ajustar layout da tela de extrato",
        epic: "Mobile",
        epicColor: "bg-pink-100 text-pink-700",
        assignee: "Carla R.",
        initials: "CR",
        avatarColor: "bg-purple-200 text-purple-800",
        priority: "Alta",
        points: 3,
      },
      {
        id: "T-035",
        title: "Code review — módulo de relatórios",
        epic: "Analytics",
        epicColor: "bg-emerald-100 text-emerald-700",
        assignee: "Rafael T.",
        initials: "RT",
        avatarColor: "bg-amber-200 text-amber-800",
        priority: "Média",
        points: 2,
      },
      {
        id: "T-036",
        title: "QA — fluxo de onboarding",
        epic: "Plataforma Core",
        epicColor: "bg-blue-100 text-blue-700",
        assignee: "André M.",
        initials: "AM",
        avatarColor: "bg-amber-200 text-amber-800",
        priority: "Alta",
        points: 5,
      },
    ],
  },
  {
    id: "finalizado",
    label: "Finalizado",
    count: 31,
    badgeColor: "bg-emerald-50 text-emerald-600",
    tasks: [
      {
        id: "T-010",
        title: "Setup de CI/CD no repositório principal",
        epic: "Infra",
        epicColor: "bg-slate-100 text-slate-700",
        assignee: "Sofia L.",
        initials: "SL",
        avatarColor: "bg-pink-200 text-pink-800",
        priority: "Alta",
        points: 8,
      },
      {
        id: "T-011",
        title: "Migração banco de dados para Supabase",
        epic: "Plataforma Core",
        epicColor: "bg-blue-100 text-blue-700",
        assignee: "André M.",
        initials: "AM",
        avatarColor: "bg-amber-200 text-amber-800",
        priority: "Alta",
        points: 13,
      },
      {
        id: "T-012",
        title: "Implementar rate limiting na API",
        epic: "APIs e Integrações",
        epicColor: "bg-purple-100 text-purple-700",
        assignee: "Lucas M.",
        initials: "LM",
        avatarColor: "bg-emerald-200 text-emerald-800",
        priority: "Média",
        points: 5,
      },
    ],
  },
];

const priorityDot: Record<string, string> = {
  Alta: "bg-red-500",
  Média: "bg-amber-400",
  Baixa: "bg-gray-300",
};

export default function SprintsPage() {
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sprints</h1>
          <p className="text-sm text-gray-500 mt-0.5">Acompanhamento das tasks da sprint atual</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors">
          <Plus size={14} />
          Nova Task
        </button>
      </div>

      {/* Sprint info card */}
      <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm flex items-center gap-8">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Sprint Atual</p>
          <p className="text-base font-bold text-gray-900">Sprint #42</p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Tema</p>
          <p className="text-sm font-semibold text-gray-800">Fase de Expansão de APIs Financeiras</p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Período</p>
          <p className="text-sm font-semibold text-gray-800">01 Out – 22 Out 2023</p>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-gray-500">Progresso</p>
            <p className="text-xs font-bold text-blue-600">65%</p>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-amber-500" />
          <span className="text-sm font-semibold text-amber-600">12 dias restantes</span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700">{col.label}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {col.count}
                </span>
              </div>
              <button className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Plus size={13} />
              </button>
            </div>

            {/* Tasks */}
            <div className="space-y-2.5">
              {col.tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* Epic tag */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <Tag size={11} className="text-gray-400" />
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${task.epicColor}`}>
                      {task.epic}
                    </span>
                  </div>

                  {/* Title */}
                  <p className="text-xs font-semibold text-gray-800 leading-relaxed mb-3">
                    {task.title}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${task.avatarColor}`}
                      >
                        {task.initials}
                      </div>
                      <span className="text-[10px] text-gray-500">{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
                      <span className="text-[10px] text-gray-400 font-medium">{task.points}pt</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more indicator */}
              {col.count > col.tasks.length && (
                <button className="w-full py-2 text-[11px] text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center gap-1 transition-colors">
                  <ChevronDown size={12} />
                  Ver mais {col.count - col.tasks.length} tasks
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
