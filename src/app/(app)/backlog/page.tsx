"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BacklogItem, BacklogStatus, Sprint } from "@/types/product";
import { Plus, X, Loader2, ListTodo, Pencil, Check, ChevronRight, Zap } from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────
const COLUMNS: { id: BacklogStatus; label: string; badge: string; color: string }[] = [
  { id: "todo",        label: "To Do",       badge: "bg-gray-100 text-gray-600",       color: "border-t-gray-300" },
  { id: "in_progress", label: "In Progress", badge: "bg-blue-100 text-blue-700",       color: "border-t-blue-500" },
  { id: "review",      label: "Review",      badge: "bg-amber-100 text-amber-700",     color: "border-t-amber-400" },
  { id: "entregue",    label: "Entregue",    badge: "bg-emerald-100 text-emerald-700", color: "border-t-emerald-500" },
];

const NEXT_STATUS: Record<BacklogStatus, BacklogStatus | null> = {
  todo:        "in_progress",
  in_progress: "review",
  review:      "entregue",
  entregue:    null,
};

const EPICS = ["Onboarding", "Investimentos", "Plataforma", "Analytics", "Infra", "Auth", "Notificações"];

// ─── Item Card ────────────────────────────────────────────────
function ItemCard({
  item,
  sprints,
  sprintMap,
  onDelete,
  onUpdate,
  onAdvance,
  onMoveToSprint,
}: {
  item: BacklogItem;
  sprints: Sprint[];
  sprintMap: Record<string, string>;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BacklogItem>) => void;
  onAdvance: (id: string, next: BacklogStatus) => void;
  onMoveToSprint: (item: BacklogItem, sprintId: string) => Promise<void>;
}) {
  const [editing,       setEditing]       = useState(false);
  const [editTitle,     setEditTitle]     = useState(item.title);
  const [showSprintDrop, setShowSprintDrop] = useState(false);
  const [moving,        setMoving]        = useState(false);

  function saveEdit() {
    if (editTitle.trim() && editTitle !== item.title) onUpdate(item.id, { title: editTitle.trim() });
    setEditing(false);
  }

  async function handleMove(sprintId: string) {
    setMoving(true);
    setShowSprintDrop(false);
    await onMoveToSprint(item, sprintId);
    setMoving(false);
  }

  const next      = NEXT_STATUS[item.status ?? "todo"];
  const sprintName = item.sprint_id ? sprintMap[item.sprint_id] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm group hover:shadow-md transition-shadow relative">
      {/* Title */}
      {editing ? (
        <div className="flex gap-1 mb-2">
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
            className="flex-1 text-sm border border-blue-300 rounded-lg px-2 py-1 outline-none"
          />
          <button onClick={saveEdit} className="text-emerald-500 hover:text-emerald-700">
            <Check size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className={`text-sm font-medium text-gray-800 leading-snug flex-1 ${
            item.status === "entregue" ? "line-through opacity-50" : ""
          }`}>
            {item.title}
          </p>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-blue-500">
              <Pencil size={11} />
            </button>
            <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-400">
              <X size={11} />
            </button>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        {item.epic && (
          <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md">
            {item.epic}
          </span>
        )}
        <span className="text-[10px] font-bold text-gray-400">{item.story_points}pt</span>
        {sprintName && (
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md flex items-center gap-1">
            <Zap size={9} /> {sprintName}
          </span>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        {next ? (
          <button
            onClick={() => onAdvance(item.id, next)}
            className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ChevronRight size={11} />
            {next === "in_progress" ? "In Progress" : next === "review" ? "Review" : "Entregue"}
          </button>
        ) : (
          <span className="text-[10px] text-emerald-400 font-semibold">✓ Entregue</span>
        )}

        {/* Sprint association */}
        {sprints.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSprintDrop((v) => !v)}
              disabled={moving}
              title="Associar sprint"
              className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              {moving ? <Loader2 size={10} className="animate-spin" /> : <Zap size={10} />}
              {sprintName ? "Trocar" : "Sprint"}
            </button>
            {showSprintDrop && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSprintDrop(false)} />
                <div className="absolute right-0 bottom-full mb-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[180px]">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">
                    Associar ao sprint
                  </p>
                  {sprints.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleMove(s.id)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 text-xs hover:bg-blue-50 hover:text-blue-700 ${
                        item.sprint_id === s.id ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700"
                      }`}
                    >
                      <Zap size={11} className="text-blue-500 shrink-0" />
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Add Item Form ────────────────────────────────────────────
function AddItemForm({ onAdd, onCancel }: {
  onAdd: (title: string, epic: string, points: number) => void;
  onCancel: () => void;
}) {
  const [title,  setTitle]  = useState("");
  const [epic,   setEpic]   = useState("");
  const [points, setPoints] = useState(1);

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-3 shadow-sm space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && title.trim()) onAdd(title.trim(), epic, points);
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Título do item…"
        className="w-full text-sm outline-none placeholder-gray-400 text-gray-800"
      />
      <div className="flex gap-2">
        <select
          value={epic}
          onChange={(e) => setEpic(e.target.value)}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600"
        >
          <option value="">Épico…</option>
          {EPICS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <select
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none text-gray-600 w-16"
        >
          {[1, 2, 3, 5, 8, 13].map((p) => <option key={p} value={p}>{p}pt</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button
          disabled={!title.trim()}
          onClick={() => onAdd(title.trim(), epic, points)}
          className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Adicionar
        </button>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 px-2">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function BacklogPage() {
  const supabase = useMemo(() => createClient(), []);

  const [items,          setItems]          = useState<BacklogItem[]>([]);
  const [sprints,        setSprints]        = useState<Sprint[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [addingIn,       setAddingIn]       = useState<BacklogStatus | null>(null);
  const [filterSprintId, setFilterSprintId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: itemData }, { data: sprintData }] = await Promise.all([
      supabase.from("backlog_items").select("*").order("position", { ascending: true }),
      supabase.from("sprints").select("id, name, status").order("created_at", { ascending: false }),
    ]);
    setItems((itemData ?? []) as BacklogItem[]);
    setSprints((sprintData ?? []) as Sprint[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sprintMap = useMemo(() => {
    const m: Record<string, string> = {};
    sprints.forEach((s) => { m[s.id] = s.name; });
    return m;
  }, [sprints]);

  const filteredItems = filterSprintId
    ? items.filter((i) => i.sprint_id === filterSprintId)
    : items;

  async function addItem(colStatus: BacklogStatus, title: string, epic: string, points: number) {
    const position = items.filter((i) => i.status === colStatus).length;
    const { data } = await supabase
      .from("backlog_items")
      .insert({
        title,
        status: colStatus,
        story_points: points,
        epic: epic || null,
        business_value: 3,
        moscow_priority: "could",
        position,
        sprint_id: filterSprintId ?? null,
      })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as BacklogItem]);
    setAddingIn(null);
  }

  async function deleteItem(id: string) {
    await supabase.from("backlog_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function updateItem(id: string, patch: Partial<BacklogItem>) {
    await supabase.from("backlog_items").update(patch).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function advanceStatus(id: string, next: BacklogStatus) {
    await supabase.from("backlog_items").update({ status: next }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: next } : i)));
  }

  async function moveToSprint(item: BacklogItem, sprintId: string) {
    const alreadyInSprint = item.sprint_id === sprintId;
    await supabase.from("backlog_items").update({ sprint_id: sprintId }).eq("id", item.id);
    if (!alreadyInSprint) {
      await supabase.from("tasks").insert({
        title:        item.title,
        status:       "todo",
        sprint_id:    sprintId,
        story_points: item.story_points,
        epic:         item.epic ?? null,
        priority:     "medium",
      });
    }
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, sprint_id: sprintId } : i));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  const totalPoints = filteredItems.reduce((s, i) => s + (i.story_points ?? 0), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <ListTodo size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Backlog</span>
        </div>

        {/* Sprint filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
          <button
            onClick={() => setFilterSprintId(null)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterSprintId === null
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Todos
          </button>
          {sprints.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilterSprintId(s.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterSprintId === s.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-400 ml-auto shrink-0">
          {filteredItems.length} itens · {totalPoints}pt
        </span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 min-w-max">
          {COLUMNS.map((col) => {
            const colItems = filteredItems.filter((i) => (i.status ?? "todo") === col.id);
            return (
              <div key={col.id} className="w-72 shrink-0 flex flex-col">
                {/* Column header */}
                <div className={`bg-white rounded-t-2xl border-t-4 ${col.color} px-4 pt-3 pb-2 border border-gray-100 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                        {colItems.length}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{col.label}</span>
                    </div>
                    <button
                      onClick={() => setAddingIn(col.id)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 bg-gray-50/60 rounded-b-2xl border border-t-0 border-gray-100 p-2 space-y-2 min-h-[300px]">
                  {addingIn === col.id && (
                    <AddItemForm
                      onAdd={(t, e, p) => addItem(col.id, t, e, p)}
                      onCancel={() => setAddingIn(null)}
                    />
                  )}
                  {colItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      sprints={sprints}
                      sprintMap={sprintMap}
                      onDelete={deleteItem}
                      onUpdate={updateItem}
                      onAdvance={advanceStatus}
                      onMoveToSprint={moveToSprint}
                    />
                  ))}
                  {colItems.length === 0 && addingIn !== col.id && (
                    <p className="text-xs text-gray-300 text-center py-6">Sem itens</p>
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
