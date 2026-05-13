"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Sprint, Task, SprintStatus } from "@/types/product";
import {
  Loader2, ListTodo, ChevronRight, Zap,
  CheckCircle2, Circle, ChevronDown,
} from "lucide-react";

// ─── Mapeamento: status do sprint → coluna do board ───────────
const COLUMNS: {
  id: string;
  label: string;
  badge: string;
  color: string;
  sprintStatus: SprintStatus;
}[] = [
  { id: "todo",        label: "To Do",       badge: "bg-gray-100 text-gray-600",       color: "border-t-gray-300",    sprintStatus: "planning"  },
  { id: "in_progress", label: "In Progress", badge: "bg-blue-100 text-blue-700",       color: "border-t-blue-500",    sprintStatus: "active"    },
  { id: "review",      label: "Review",      badge: "bg-amber-100 text-amber-700",     color: "border-t-amber-400",   sprintStatus: "review"    },
  { id: "entregue",    label: "Entregue",    badge: "bg-emerald-100 text-emerald-700", color: "border-t-emerald-500", sprintStatus: "completed" },
];

const NEXT_STATUS: Record<SprintStatus, SprintStatus | null> = {
  planning:  "active",
  active:    "review",
  review:    "completed",
  completed: null,
};

const NEXT_LABEL: Record<SprintStatus, string> = {
  planning:  "Iniciar",
  active:    "Em Review",
  review:    "Concluir",
  completed: "",
};

// ─── Sprint Card ──────────────────────────────────────────────
function SprintCard({
  sprint,
  tasks,
  onAdvance,
}: {
  sprint: Sprint;
  tasks: Task[];
  onAdvance: (id: string, next: SprintStatus) => Promise<void>;
}) {
  const [expanded,  setExpanded]  = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const totalPoints = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const donePoints  = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);
  const doneTasks   = tasks.filter((t) => t.status === "done").length;
  const completion  = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  const next = NEXT_STATUS[sprint.status];

  async function handleAdvance() {
    if (!next) return;
    setAdvancing(true);
    await onAdvance(sprint.id, next);
    setAdvancing(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Zap size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{sprint.name}</p>
            {sprint.goal && (
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{sprint.goal}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <ChevronDown
              size={13}
              className={`transition-transform duration-150 ${expanded ? "" : "-rotate-90"}`}
            />
          </button>
        </div>

        {/* Progress */}
        {tasks.length > 0 ? (
          <div className="mt-2.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${completion}%`,
                  background: completion >= 75 ? "#22c55e" : completion >= 40 ? "#3b82f6" : "#f59e0b",
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">{doneTasks}/{tasks.length} tasks</span>
              <span className="text-[10px] font-semibold text-gray-500">{donePoints}/{totalPoints}pt</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-300 mt-2">Sem tasks neste sprint</p>
        )}
      </div>

      {/* Task list */}
      {expanded && tasks.length > 0 && (
        <div className="border-t border-gray-50 px-3 pb-2.5 pt-2 space-y-1">
          {tasks.slice(0, 6).map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              {task.status === "done"
                ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                : task.status === "review"
                ? <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 shrink-0" />
                : task.status === "in_progress"
                ? <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 shrink-0" />
                : <Circle size={11} className="text-gray-300 shrink-0" />
              }
              <span className={`text-[11px] flex-1 truncate leading-snug ${
                task.status === "done" ? "line-through text-gray-400" : "text-gray-700"
              }`}>
                {task.title}
              </span>
              <span className="text-[10px] text-gray-400 shrink-0">{task.story_points}pt</span>
            </div>
          ))}
          {tasks.length > 6 && (
            <p className="text-[10px] text-gray-400 text-center pt-1">
              +{tasks.length - 6} tasks
            </p>
          )}
        </div>
      )}

      {/* Advance status */}
      {next && (
        <div className="border-t border-gray-50 px-3 py-2">
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            {advancing
              ? <Loader2 size={10} className="animate-spin" />
              : <ChevronRight size={11} />
            }
            {NEXT_LABEL[sprint.status]}
          </button>
        </div>
      )}

      {sprint.status === "completed" && (
        <div className="border-t border-gray-50 px-3 py-2">
          <span className="text-[10px] font-semibold text-emerald-500">✓ Sprint entregue</span>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function BacklogPage() {
  const supabase = useMemo(() => createClient(), []);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: sprintData }, { data: taskData }] = await Promise.all([
      supabase.from("sprints").select("*").order("created_at", { ascending: false }),
      supabase.from("tasks").select("*").is("parent_task_id", null),
    ]);
    setSprints((sprintData ?? []) as Sprint[]);
    setTasks((taskData ?? []) as Task[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function advanceSprint(id: string, next: SprintStatus) {
    await supabase.from("sprints").update({ status: next }).eq("id", id);
    setSprints((prev) => prev.map((s) => s.id === id ? { ...s, status: next } : s));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  const totalPoints = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const donePoints  = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <ListTodo size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Backlog</span>
        </div>
        <span className="text-xs text-gray-400">
          {sprints.length} sprint{sprints.length !== 1 ? "s" : ""} · {donePoints}/{totalPoints}pt entregues
        </span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 min-w-max">
          {COLUMNS.map((col) => {
            const colSprints = sprints.filter((s) => s.status === col.sprintStatus);
            return (
              <div key={col.id} className="w-72 shrink-0 flex flex-col">
                {/* Column header */}
                <div className={`bg-white rounded-t-2xl border-t-4 ${col.color} px-4 pt-3 pb-2.5 border border-gray-100 shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                      {colSprints.length}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{col.label}</span>
                  </div>
                </div>

                {/* Sprint cards */}
                <div className="flex-1 bg-gray-50/60 rounded-b-2xl border border-t-0 border-gray-100 p-2 space-y-2 min-h-[300px]">
                  {colSprints.map((sprint) => (
                    <SprintCard
                      key={sprint.id}
                      sprint={sprint}
                      tasks={tasks.filter((t) => t.sprint_id === sprint.id)}
                      onAdvance={advanceSprint}
                    />
                  ))}
                  {colSprints.length === 0 && (
                    <p className="text-xs text-gray-300 text-center py-8">Sem sprints</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
