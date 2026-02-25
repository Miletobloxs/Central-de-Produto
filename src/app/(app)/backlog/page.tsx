"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BacklogItem, MoscowPriority } from "@/types/product";
import { Plus, X, Star, Loader2, ListTodo, Pencil, Check } from "lucide-react";

// ─── Constantes ───────────────────────────────────────────────
const COLUMNS: {
  id: MoscowPriority;
  label: string;
  desc: string;
  color: string;
  badge: string;
}[] = [
  { id: "must",   label: "Must Have",   desc: "Essencial para o lançamento",    color: "border-t-red-500",     badge: "bg-red-100 text-red-700" },
  { id: "should", label: "Should Have", desc: "Alta prioridade mas não crítico", color: "border-t-amber-500",   badge: "bg-amber-100 text-amber-700" },
  { id: "could",  label: "Could Have",  desc: "Desejável se houver tempo",       color: "border-t-blue-500",    badge: "bg-blue-100 text-blue-700" },
  { id: "wont",   label: "Won't Have",  desc: "Fora do escopo atual",           color: "border-t-gray-400",    badge: "bg-gray-100 text-gray-500" },
];

const EPICS = ["Onboarding", "Investimentos", "Plataforma", "Analytics", "Infra", "Auth", "Notificações"];

// ─── Item Card ────────────────────────────────────────────────
function ItemCard({
  item,
  onDelete,
  onUpdate,
}: {
  item: BacklogItem;
  onDelete: (id: string) => void;
  onUpdate: (id: string, patch: Partial<BacklogItem>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  function saveEdit() {
    if (editTitle.trim() && editTitle !== item.title) {
      onUpdate(item.id, { title: editTitle.trim() });
    }
    setEditing(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm group hover:shadow-md transition-shadow">
      {editing ? (
        <div className="flex gap-1">
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
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium text-gray-800 leading-snug flex-1 ${item.moscow_priority === "wont" ? "line-through opacity-50" : ""}`}>
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

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.epic && (
            <span className="text-[10px] font-semibold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-md">
              {item.epic}
            </span>
          )}
          <span className="text-[10px] font-bold text-gray-400">{item.story_points}pt</span>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={10}
              className={i < item.business_value ? "text-amber-400 fill-amber-400" : "text-gray-200"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Item Form ────────────────────────────────────────────
function AddItemForm({
  onAdd,
  onCancel,
}: {
  onAdd: (title: string, epic: string, points: number) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [epic, setEpic] = useState("");
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
  const supabase = createClient();
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingIn, setAddingIn] = useState<MoscowPriority | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("backlog_items")
      .select("*")
      .order("position", { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function addItem(priority: MoscowPriority, title: string, epic: string, points: number) {
    const position = items.filter((i) => i.moscow_priority === priority).length;
    const { data } = await supabase
      .from("backlog_items")
      .insert({ title, moscow_priority: priority, story_points: points, epic: epic || null, business_value: 3, position })
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  const totalPoints = items.reduce((s, i) => s + (i.story_points ?? 0), 0);

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
        <span className="text-xs text-gray-400">{items.length} itens · {totalPoints}pt total</span>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-5 min-w-max">
          {COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.moscow_priority === col.id);
            return (
              <div key={col.id} className="w-72 shrink-0 flex flex-col">
                {/* Column header */}
                <div className={`bg-white rounded-t-2xl border-t-4 ${col.color} px-4 pt-3 pb-2 border border-gray-100 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                          {colItems.length}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{col.label}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{col.desc}</p>
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
                <div className="flex-1 bg-gray-50/60 rounded-b-2xl border border-t-0 border-gray-100 p-2 space-y-2 min-h-[200px]">
                  {addingIn === col.id && (
                    <AddItemForm
                      onAdd={(t, e, p) => addItem(col.id, t, e, p)}
                      onCancel={() => setAddingIn(null)}
                    />
                  )}
                  {colItems.map((item) => (
                    <ItemCard key={item.id} item={item} onDelete={deleteItem} onUpdate={updateItem} />
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
