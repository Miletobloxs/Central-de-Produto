"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";
import type { Sprint, Task, TaskStatus, TaskPriority } from "@/types/product";
import {
  Plus,
  Loader2,
  GripVertical,
  Zap,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle2,
  Circle,
  ListTree,
  FlagTriangleRight,
  Pencil,
} from "lucide-react";

// ─── Constantes ──────────────────────────────────────────────
const COLUMNS: { id: TaskStatus; label: string; badge: string }[] = [
  { id: "todo",        label: "To Do",        badge: "bg-gray-100 text-gray-600" },
  { id: "in_progress", label: "Em Progresso",  badge: "bg-blue-100 text-blue-700" },
  { id: "review",      label: "Review",        badge: "bg-amber-100 text-amber-700" },
  { id: "done",        label: "Concluído",     badge: "bg-emerald-100 text-emerald-700" },
];

const PRIORITY_COLOR: Record<string, string> = {
  critical: "bg-red-500",
  high:     "bg-orange-400",
  medium:   "bg-yellow-400",
  low:      "bg-gray-300",
};

const EPIC_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
];

// ─── Subtask Row ─────────────────────────────────────────────
function SubtaskRow({
  subtask,
  onToggle,
  onDelete,
}: {
  subtask: Task;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const done = subtask.status === "done";
  return (
    <div className="flex items-center gap-2 py-1 group/sub">
      <button
        onClick={() => onToggle(subtask.id, !done)}
        className="shrink-0 text-gray-400 hover:text-emerald-500 transition-colors"
      >
        {done ? (
          <CheckCircle2 size={13} className="text-emerald-500" />
        ) : (
          <Circle size={13} />
        )}
      </button>
      <span
        className={`flex-1 text-xs leading-snug ${
          done ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {subtask.title}
      </span>
      <button
        onClick={() => onDelete(subtask.id)}
        className="opacity-0 group-hover/sub:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
      >
        <X size={10} />
      </button>
    </div>
  );
}

// ─── Inline Add Subtask ───────────────────────────────────────
function AddSubtaskForm({
  onAdd,
  onCancel,
}: {
  onAdd: (title: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) { onAdd(title.trim()); }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Nome da subtarefa…"
        className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-300"
      />
      <button
        onClick={() => title.trim() && onAdd(title.trim())}
        disabled={!title.trim()}
        className="text-[10px] font-semibold bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-40"
      >
        OK
      </button>
      <button onClick={onCancel} className="text-gray-300 hover:text-gray-500">
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────
function TaskCard({
  task,
  subtasks,
  overlay = false,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  task: Task;
  subtasks: Task[];
  overlay?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleSubtask: (id: string, done: boolean) => void;
  onDeleteSubtask: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const [subtasksOpen, setSubtasksOpen] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);

  const style = { transform: CSS.Transform.toString(transform), transition };
  const epicColor =
    EPIC_COLORS[task.epic ? task.epic.charCodeAt(0) % EPIC_COLORS.length : 0];

  const doneSubtasks = subtasks.filter((s) => s.status === "done").length;
  const hasSubtasks = subtasks.length > 0 || addingSubtask;

  function handleAddSubtask(title: string) {
    onAddSubtask(task.id, title);
    setSubtasksOpen(true);
    setAddingSubtask(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`bg-white rounded-xl border border-gray-100 shadow-sm group
        ${isDragging ? "opacity-40" : ""}
        ${overlay ? "shadow-xl rotate-1 scale-105" : "hover:shadow-md"}
        transition-all`}
    >
      {/* Main task */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...listeners}
            className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical size={13} />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 leading-snug line-clamp-2">
              {task.title}
            </p>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {task.epic && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${epicColor}`}>
                  {task.epic}
                </span>
              )}
              <span className="text-[10px] font-bold text-gray-400">{task.story_points}pt</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${PRIORITY_COLOR[task.priority]}`}
                  title={task.priority}
                />
                {task.assignee && (
                  <span className="text-[10px] text-gray-400 truncate max-w-[70px]">
                    {task.assignee}
                  </span>
                )}

                {/* Subtask count badge */}
                {subtasks.length > 0 && (
                  <button
                    onClick={() => setSubtasksOpen((v) => !v)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded-md transition-colors"
                  >
                    <ListTree size={9} />
                    {doneSubtasks}/{subtasks.length}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Add subtask button */}
                <button
                  onClick={() => { setAddingSubtask(true); setSubtasksOpen(true); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-500 transition-opacity"
                  title="Adicionar subtarefa"
                >
                  <ListTree size={11} />
                </button>
                <button
                  onClick={() => onEdit(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-500 transition-opacity"
                  title="Editar task"
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks panel */}
      {hasSubtasks && (
        <div className="border-t border-gray-50 px-3 pb-2.5 pt-2">
          {/* Subtask header */}
          <button
            onClick={() => setSubtasksOpen((v) => !v)}
            className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-gray-600 mb-2 transition-colors"
          >
            {subtasksOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
            Subtarefas
            {subtasks.length > 0 && (
              <span className="text-gray-300">({doneSubtasks}/{subtasks.length})</span>
            )}
          </button>

          {subtasksOpen && (
            <div className="space-y-0.5">
              {subtasks.map((sub) => (
                <SubtaskRow
                  key={sub.id}
                  subtask={sub}
                  onToggle={onToggleSubtask}
                  onDelete={onDeleteSubtask}
                />
              ))}

              {addingSubtask ? (
                <AddSubtaskForm
                  onAdd={handleAddSubtask}
                  onCancel={() => setAddingSubtask(false)}
                />
              ) : (
                <button
                  onClick={() => setAddingSubtask(true)}
                  className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-blue-500 transition-colors mt-1"
                >
                  <Plus size={10} /> Adicionar subtarefa
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show "add subtask" form even when no subtasks yet */}
      {!hasSubtasks && addingSubtask && (
        <div className="border-t border-gray-50 px-3 pb-2.5 pt-2">
          <AddSubtaskForm
            onAdd={handleAddSubtask}
            onCancel={() => setAddingSubtask(false)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────
function KanbanColumn({
  col,
  tasks,
  subtasksMap,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: {
  col: (typeof COLUMNS)[0];
  tasks: Task[];
  subtasksMap: Record<string, Task[]>;
  onAddTask: (status: TaskStatus, title: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string) => void;
  onAddSubtask: (parentId: string, title: string) => void;
  onToggleSubtask: (id: string, done: boolean) => void;
  onDeleteSubtask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function submit() {
    if (!newTitle.trim()) return;
    onAddTask(col.id, newTitle.trim());
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between px-3 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
            {tasks.length}
          </span>
          <span className="text-sm font-semibold text-gray-700">{col.label}</span>
        </div>
        <button onClick={() => setAdding(true)} className="text-gray-400 hover:text-blue-600">
          <Plus size={14} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl p-2 space-y-2 min-h-[200px] transition-colors
          ${isOver ? "bg-blue-50 ring-2 ring-blue-200" : "bg-gray-50/60"}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              subtasks={subtasksMap[task.id] ?? []}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
            />
          ))}
        </SortableContext>

        {adding && (
          <div className="bg-white rounded-xl border border-blue-200 p-2.5 shadow-sm">
            <textarea
              autoFocus
              rows={2}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Título da task…"
              className="w-full text-sm text-gray-800 resize-none outline-none placeholder-gray-400"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={submit} className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700">
                Adicionar
              </button>
              <button onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600 text-xs px-2">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !adding && (
          <p className="text-xs text-gray-300 text-center py-6">Sem tasks</p>
        )}
      </div>
    </div>
  );
}

// ─── Finish Sprint Modal ──────────────────────────────────────
function FinishSprintModal({
  sprint,
  tasks,
  onClose,
  onConfirm,
}: {
  sprint: Sprint;
  tasks: Task[];
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);

  const totalTasks  = tasks.length;
  const doneTasks   = tasks.filter((t) => t.status === "done").length;
  const openTasks   = totalTasks - doneTasks;
  const totalPoints = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const donePoints  = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);
  const completion  = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  async function handleConfirm() {
    setSaving(true);
    await onConfirm();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
            <FlagTriangleRight size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Finalizar Sprint</h2>
            <p className="text-xs text-gray-500">{sprint.name}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-emerald-600">{doneTasks}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Concluídas</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-amber-600">{openTasks}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Em aberto</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-3 text-center">
            <p className="text-xl font-bold text-blue-600">{donePoints}pt</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Velocity</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Conclusão do sprint</span>
            <span className="text-xs font-bold text-gray-700">{completion}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${completion}%`,
                background: completion >= 75 ? "#22c55e" : completion >= 40 ? "#3b82f6" : "#f59e0b",
              }}
            />
          </div>
        </div>

        {openTasks > 0 && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
            <p className="text-xs text-amber-700">
              <span className="font-semibold">{openTasks} task{openTasks > 1 ? "s" : ""} não concluída{openTasks > 1 ? "s" : ""}.</span>{" "}
              Elas permanecerão no board e poderão ser movidas para o próximo sprint.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Finalizando..." : "Finalizar Sprint"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Task Modal ─────────────────────────────────────────
const EPICS = ["Onboarding", "Investimentos", "Plataforma", "Analytics", "Infra", "Auth", "Notificações"];

const PRIORITIES: { id: TaskPriority; label: string; activeClass: string; idleClass: string }[] = [
  { id: "low",      label: "Low",      activeClass: "bg-gray-600 text-white",    idleClass: "bg-gray-100 text-gray-600 hover:bg-gray-200" },
  { id: "medium",   label: "Medium",   activeClass: "bg-yellow-500 text-white",  idleClass: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { id: "high",     label: "High",     activeClass: "bg-orange-500 text-white",  idleClass: "bg-orange-100 text-orange-700 hover:bg-orange-200" },
  { id: "critical", label: "Critical", activeClass: "bg-red-600 text-white",     idleClass: "bg-red-100 text-red-700 hover:bg-red-200" },
];

function EditTaskModal({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (id: string, patch: Partial<Task>) => Promise<void>;
}) {
  const [title,    setTitle]    = useState(task.title);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [points,   setPoints]   = useState(task.story_points);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [epic,     setEpic]     = useState(task.epic ?? "");
  const [saving,   setSaving]   = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(task.id, {
      title:        title.trim(),
      priority,
      story_points: points,
      assignee:     assignee.trim() || undefined,
      epic:         epic || undefined,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Editar Task</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Título *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onClose(); }}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Prioridade</label>
            <div className="flex gap-2 mt-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${priority === p.id ? p.activeClass : p.idleClass}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Story Points</label>
              <select
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                {[1, 2, 3, 5, 8, 13].map((p) => <option key={p} value={p}>{p} pt</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Épico</label>
              <select
                value={epic}
                onChange={(e) => setEpic(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">Nenhum</option>
                {EPICS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responsável</label>
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Nome do responsável…"
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            disabled={!title.trim() || saving}
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── New Sprint Modal ─────────────────────────────────────────
function NewSprintModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, goal: string, startDate: string, endDate: string) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const err = await onCreate(name.trim(), goal.trim(), startDate, endDate);
    if (err) { setError(err); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Novo Sprint</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome *</label>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Sprint 43" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
              placeholder="Ex: Lançar módulo de onboarding" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Início</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fim</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button disabled={!name.trim() || saving} onClick={handleCreate}
            className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Criando..." : "Criar Sprint"}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function SprintsPage() {
  const supabase = createClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);           // root tasks only
  const [subtasks, setSubtasks] = useState<Task[]>([]);     // tasks with parent_task_id
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [showNewSprint,    setShowNewSprint]    = useState(false);
  const [showFinishSprint, setShowFinishSprint] = useState(false);
  const [sprintDropdown,   setSprintDropdown]   = useState(false);
  const [editTaskId,       setEditTaskId]       = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: sprintData } = await supabase
      .from("sprints").select("*").order("created_at", { ascending: false });

    if (sprintData && sprintData.length > 0) {
      setSprints(sprintData);
      const current = sprintData.find((s: Sprint) => s.status === "active") ?? sprintData[0];
      setActiveSprint(current);
      await loadTasksForSprint(current.id);
    } else {
      setSprints([]); setActiveSprint(null); setTasks([]); setSubtasks([]);
    }
    setLoading(false);
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTasksForSprint(sprintId: string) {
    const { data } = await supabase
      .from("tasks").select("*").eq("sprint_id", sprintId)
      .order("position", { ascending: true });
    const all: Task[] = data ?? [];
    setTasks(all.filter((t) => !t.parent_task_id));
    setSubtasks(all.filter((t) => !!t.parent_task_id));
  }

  useEffect(() => { fetchData(); }, [fetchData]);

  async function selectSprint(sprint: Sprint) {
    setActiveSprint(sprint);
    setSprintDropdown(false);
    await loadTasksForSprint(sprint.id);
  }

  async function createSprint(name: string, goal: string, startDate: string, endDate: string): Promise<string | null> {
    const payload: Record<string, string> = { name, goal, status: "active" };
    if (startDate) payload.start_date = startDate;
    if (endDate)   payload.end_date   = endDate;

    const { data, error } = await supabase.from("sprints")
      .insert(payload).select().single();
    if (error) return error.message;
    if (data) { setSprints((p) => [data, ...p]); setActiveSprint(data); setTasks([]); setSubtasks([]); }
    setShowNewSprint(false);
    return null;
  }

  async function addTask(status: TaskStatus, title: string) {
    if (!activeSprint) return;
    const { data } = await supabase.from("tasks")
      .insert({ title, status, sprint_id: activeSprint.id, story_points: 1, priority: "medium" })
      .select().single();
    if (data) setTasks((p) => [...p, data]);
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((p) => p.filter((t) => t.id !== id));
    setSubtasks((p) => p.filter((s) => s.parent_task_id !== id));
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    await supabase.from("tasks").update(patch).eq("id", id);
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function addSubtask(parentId: string, title: string) {
    if (!activeSprint) return;
    const { data } = await supabase.from("tasks")
      .insert({
        title,
        status: "todo",
        sprint_id: activeSprint.id,
        parent_task_id: parentId,
        story_points: 1,
        priority: "medium",
      })
      .select().single();
    if (data) setSubtasks((p) => [...p, data]);
  }

  async function toggleSubtask(id: string, done: boolean) {
    const newStatus: TaskStatus = done ? "done" : "todo";
    setSubtasks((p) => p.map((s) => s.id === id ? { ...s, status: newStatus } : s));
    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
  }

  async function deleteSubtask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setSubtasks((p) => p.filter((s) => s.id !== id));
  }

  async function finishSprint() {
    if (!activeSprint) return;
    const donePoints = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);
    await supabase.from("sprints")
      .update({ status: "completed", velocity: donePoints })
      .eq("id", activeSprint.id);
    const finished = { ...activeSprint, status: "completed" as const, velocity: donePoints };
    setSprints((p) => p.map((s) => s.id === activeSprint.id ? finished : s));
    setActiveSprint(finished);
    setShowFinishSprint(false);
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    setTasks((p) => p.map((t) => t.id === taskId ? { ...t, status: newStatus as TaskStatus } : t));
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggingTask(tasks.find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggingTask(null);
    if (!over || active.id === over.id) return;
    const overId = over.id as string;
    const colIds = COLUMNS.map((c) => c.id) as string[];
    if (colIds.includes(overId)) {
      updateTaskStatus(active.id as string, overId);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) updateTaskStatus(active.id as string, overTask.status);
    }
  }

  // Build subtasksMap: parentId → subtasks[]
  const subtasksMap: Record<string, Task[]> = {};
  subtasks.forEach((s) => {
    if (!s.parent_task_id) return;
    if (!subtasksMap[s.parent_task_id]) subtasksMap[s.parent_task_id] = [];
    subtasksMap[s.parent_task_id].push(s);
  });

  // KPIs
  const totalPoints = tasks.reduce((s, t) => s + (t.story_points ?? 0), 0);
  const donePoints  = tasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points ?? 0), 0);
  const completion  = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Sprints</span>
        </div>

        {/* Sprint selector */}
        <div className="relative">
          <button
            onClick={() => setSprintDropdown(!sprintDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {activeSprint?.name ?? "Nenhum sprint"}
            {activeSprint && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                activeSprint.status === "active" ? "bg-emerald-100 text-emerald-700" :
                activeSprint.status === "planning" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-500"}`}>
                {activeSprint.status}
              </span>
            )}
            <ChevronDown size={13} className="text-gray-400" />
          </button>

          {sprintDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSprintDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                {sprints.map((s) => (
                  <button key={s.id} onClick={() => selectSprint(s)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2
                      ${activeSprint?.id === s.id ? "text-blue-600 font-medium" : "text-gray-700"}`}>
                    {activeSprint?.id === s.id && <CheckCircle2 size={13} />}
                    {s.name}
                  </button>
                ))}
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { setSprintDropdown(false); setShowNewSprint(true); }}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 flex items-center gap-2">
                  <Plus size={13} /> Novo Sprint
                </button>
              </div>
            </>
          )}
        </div>

        {activeSprint?.goal && (
          <span className="text-xs text-gray-500 hidden md:block truncate max-w-xs">
            {activeSprint.goal}
          </span>
        )}

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500">{completion}%</span>
          </div>
          {activeSprint?.status === "active" && (
            <button
              onClick={() => setShowFinishSprint(true)}
              className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-emerald-700"
            >
              <FlagTriangleRight size={13} /> Finalizar Sprint
            </button>
          )}
          {sprints.length === 0 && (
            <button onClick={() => setShowNewSprint(true)}
              className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-700">
              <Plus size={13} /> Novo Sprint
            </button>
          )}
        </div>
      </div>

      {/* Board */}
      {activeSprint ? (
        <div className="flex-1 overflow-x-auto p-6">
          <DndContext sensors={sensors} collisionDetection={closestCorners}
            onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full">
              {COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.id}
                  col={col}
                  tasks={tasks.filter((t) => t.status === col.id)}
                  subtasksMap={subtasksMap}
                  onAddTask={addTask}
                  onDeleteTask={deleteTask}
                  onEditTask={setEditTaskId}
                  onAddSubtask={addSubtask}
                  onToggleSubtask={toggleSubtask}
                  onDeleteSubtask={deleteSubtask}
                />
              ))}
            </div>
            <DragOverlay>
              {draggingTask && (
                <TaskCard
                  task={draggingTask}
                  subtasks={subtasksMap[draggingTask.id] ?? []}
                  overlay
                  onDelete={() => {}}
                  onEdit={() => {}}
                  onAddSubtask={() => {}}
                  onToggleSubtask={() => {}}
                  onDeleteSubtask={() => {}}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Zap size={24} className="text-blue-500" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Nenhum sprint ativo</p>
            <p className="text-sm text-gray-400 mt-1">Crie um sprint para começar</p>
          </div>
          <button onClick={() => setShowNewSprint(true)}
            className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700">
            Criar Sprint
          </button>
        </div>
      )}

      {showNewSprint && (
        <NewSprintModal onClose={() => setShowNewSprint(false)} onCreate={createSprint} />
      )}

      {showFinishSprint && activeSprint && (
        <FinishSprintModal
          sprint={activeSprint}
          tasks={tasks}
          onClose={() => setShowFinishSprint(false)}
          onConfirm={finishSprint}
        />
      )}

      {editTaskId && (() => {
        const task = tasks.find((t) => t.id === editTaskId);
        return task ? (
          <EditTaskModal
            task={task}
            onClose={() => setEditTaskId(null)}
            onSave={updateTask}
          />
        ) : null;
      })()}
    </div>
  );
}
