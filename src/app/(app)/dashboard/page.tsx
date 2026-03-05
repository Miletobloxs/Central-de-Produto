"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sprint, Task, BacklogItem, Objective } from "@/types/product";
import {
  TrendingUp,
  Zap,
  ListTodo,
  Target,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

// ─── KPI Card ────────────────────────────────────────────────
function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  dark,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  dark?: boolean;
}) {
  if (dark) {
    return (
      <div className="rounded-2xl p-5 flex flex-col gap-2" style={{ background: "#1C2536" }}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <p className="text-xs text-slate-400 font-medium mt-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-2">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={15} className={iconColor} />
      </div>
      <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── Task Row ────────────────────────────────────────────────
function TaskRow({ task }: { task: Task }) {
  const statusIcon =
    task.status === "done" ? <CheckCircle2 size={13} className="text-emerald-500" /> :
    task.status === "in_progress" ? <Clock size={13} className="text-blue-500" /> :
    task.status === "review" ? <AlertCircle size={13} className="text-amber-500" /> :
    <div className="w-3 h-3 rounded-full border-2 border-gray-300" />;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      {statusIcon}
      <span className="text-sm text-gray-700 flex-1 truncate">{task.title}</span>
      {task.epic && (
        <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md shrink-0">
          {task.epic}
        </span>
      )}
      <span className="text-[10px] font-bold text-gray-400 shrink-0">{task.story_points}pt</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [backlogCount, setBacklogCount] = useState(0);
  const [mustHaveCount, setMustHaveCount] = useState(0);
  const [objectives, setObjectives] = useState<Objective[]>([]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);

    // Active sprint
    const { data: sprintData } = await supabase
      .from("sprints")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveSprint(sprintData ?? null);

    // Sprint tasks
    if (sprintData) {
      const { data: taskData } = await supabase
        .from("tasks")
        .select("*")
        .eq("sprint_id", sprintData.id);
      setTasks(taskData ?? []);
    } else {
      setTasks([]);
    }

    // Backlog counts
    const { count: total } = await supabase
      .from("backlog_items")
      .select("*", { count: "exact", head: true });
    setBacklogCount(total ?? 0);

    const { count: mustCount } = await supabase
      .from("backlog_items")
      .select("*", { count: "exact", head: true })
      .eq("moscow_priority", "must")
      .eq("status", "open");
    setMustHaveCount(mustCount ?? 0);

    // OKRs this quarter
    const { data: objData } = await supabase
      .from("objectives")
      .select("*, key_results(*)")
      .eq("quarter", "Q1 2026");
    setObjectives(objData ?? []);

    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // KPI calculations
  const totalPoints   = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const donePoints    = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);
  const completion    = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const velocity      = donePoints;
  const inProgress    = tasks.filter((t) => t.status === "in_progress" || t.status === "review").length;

  const okrProgress = objectives.length
    ? Math.round(
        objectives.reduce((s, o) => {
          const krs = o.key_results ?? [];
          if (!krs.length) return s;
          const avg = krs.reduce((a: number, kr: { current_value: number; target_value: number }) =>
            a + Math.min(100, (kr.current_value / (kr.target_value || 1)) * 100), 0) / krs.length;
          return s + avg;
        }, 0) / objectives.length
      )
    : 0;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <LayoutDashboard size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-900">Dashboard</span>
        {activeSprint && (
          <span className="text-xs text-gray-400 ml-1">· {activeSprint.name}</span>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Sprint Completion"
            value={`${completion}%`}
            sub={activeSprint?.name ?? "Sem sprint ativo"}
            icon={Zap}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            dark
          />
          <KPICard
            label="Velocity"
            value={`${velocity}pt`}
            sub={`${tasks.filter((t) => t.status === "done").length} tasks concluídas`}
            icon={TrendingUp}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <KPICard
            label="Backlog Aberto"
            value={String(backlogCount)}
            sub={`${mustHaveCount} Must Have pendentes`}
            icon={ListTodo}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
          />
          <KPICard
            label="OKRs Q1 2026"
            value={`${okrProgress}%`}
            sub={`${objectives.length} objetivos ativos`}
            icon={Target}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sprint Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {activeSprint?.name ?? "Nenhum Sprint Ativo"}
                </h3>
                {activeSprint?.goal && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]">
                    {activeSprint.goal}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">{completion}%</p>
                <p className="text-[10px] text-gray-400">{donePoints}/{totalPoints}pt</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${completion}%`,
                  background: completion >= 75 ? "#22c55e" : completion >= 40 ? "#3b82f6" : "#f59e0b",
                }}
              />
            </div>

            {/* Status breakdown */}
            {tasks.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "To Do",      status: "todo",        color: "text-gray-600", bg: "bg-gray-50" },
                  { label: "Fazendo",    status: "in_progress", color: "text-blue-600",    bg: "bg-blue-50" },
                  { label: "Review",     status: "review",      color: "text-amber-600",   bg: "bg-amber-50" },
                  { label: "Concluído",  status: "done",        color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map((col) => (
                  <div key={col.status} className={`${col.bg} rounded-xl p-2.5 text-center`}>
                    <p className={`text-lg font-bold ${col.color}`}>
                      {tasks.filter((t) => t.status === col.status).length}
                    </p>
                    <p className="text-[10px] text-gray-500">{col.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                {activeSprint ? "Sem tasks neste sprint" : "Crie um sprint para ver o progresso"}
              </p>
            )}
          </div>

          {/* OKR Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">OKRs — Q1 2026</h3>
            {objectives.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Sem objetivos cadastrados</p>
            ) : (
              <div className="space-y-3">
                {objectives.slice(0, 4).map((obj) => {
                  const krs = obj.key_results ?? [];
                  const pct = krs.length
                    ? Math.round(krs.reduce((s: number, kr: { current_value: number; target_value: number }) =>
                        s + Math.min(100, (kr.current_value / (kr.target_value || 1)) * 100), 0) / krs.length)
                    : 0;
                  return (
                    <div key={obj.id}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{obj.title}</p>
                        <span className="text-xs font-bold text-gray-500">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        {recentTasks.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tasks do Sprint</h3>
              <span className="text-xs text-gray-400">{inProgress} em andamento</span>
            </div>
            <div>
              {recentTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!activeSprint && tasks.length === 0 && objectives.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
              <LayoutDashboard size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold">Dashboard vazio</p>
              <p className="text-sm text-gray-400 mt-1">Crie um sprint e adicione tasks para ver os KPIs</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
