"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Eye,
  Lock,
  Zap,
  Wrench,
  Star,
  AlertTriangle,
  ChevronRight,
  Copy,
  Check,
  Loader2,
  X,
  Package,
} from "lucide-react";

type ChangeType  = "feature" | "improvement" | "fix" | "breaking";
type Visibility  = "internal" | "public";

interface ChangelogItem {
  id: string;
  release_id: string;
  type: ChangeType;
  title: string;
  description: string | null;
  task_id: string | null;
  position: number;
  created_at: string;
}

interface Release {
  id: string;
  version: string;
  summary: string | null;
  visibility: Visibility;
  sprint_name: string | null;
  released_at: string;
  created_at: string;
  changelog_items: ChangelogItem[];
}

const typeConfig: Record<ChangeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  feature:     { label: "Nova Feature",    icon: Star,          color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    },
  improvement: { label: "Melhoria",        icon: Zap,           color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   },
  fix:         { label: "Correção",        icon: Wrench,        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  breaking:    { label: "Breaking Change", icon: AlertTriangle, color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"     },
};

function computeStats(items: ChangelogItem[]) {
  return {
    features:     items.filter((i) => i.type === "feature").length,
    improvements: items.filter((i) => i.type === "improvement").length,
    fixes:        items.filter((i) => i.type === "fix").length,
    breaking:     items.filter((i) => i.type === "breaking").length,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Add Item Modal ────────────────────────────────────────────
function AddItemModal({
  releaseId,
  onClose,
  onCreated,
}: {
  releaseId: string;
  onClose: () => void;
  onCreated: (item: ChangelogItem) => void;
}) {
  const supabase = createClient();
  const [type,        setType]        = useState<ChangeType>("feature");
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [taskId,      setTaskId]      = useState("");
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    setError("");
    const { data, error: err } = await supabase
      .from("changelog_items")
      .insert({
        release_id:  releaseId,
        type,
        title:       title.trim(),
        description: description.trim() || null,
        task_id:     taskId.trim() || null,
        position:    0,
      })
      .select()
      .single();
    if (err || !data) { setError(err?.message ?? "Erro ao salvar"); setSaving(false); return; }
    onCreated(data as ChangelogItem);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Adicionar Item ao Changelog</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(typeConfig) as [ChangeType, typeof typeConfig[ChangeType]][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    type === key
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <Icon size={13} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Título *</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Novo módulo de relatórios consolidados"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detalhes técnicos ou contexto da mudança..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Task vinculada</label>
          <input
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Ex: T-038"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── New Release Modal ─────────────────────────────────────────
function NewReleaseModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (r: Release) => void;
}) {
  const supabase = createClient();
  const [version,    setVersion]    = useState("");
  const [summary,    setSummary]    = useState("");
  const [visibility, setVisibility] = useState<Visibility>("internal");
  const [sprintName, setSprintName] = useState("");
  const [releasedAt, setReleasedAt] = useState(new Date().toISOString().slice(0, 10));
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!version.trim()) { setError("Versão é obrigatória"); return; }
    setSaving(true);
    setError("");
    const { data, error: err } = await supabase
      .from("releases")
      .insert({
        version:     version.trim(),
        summary:     summary.trim()    || null,
        visibility,
        sprint_name: sprintName.trim() || null,
        released_at: releasedAt,
      })
      .select()
      .single();
    if (err || !data) { setError(err?.message ?? "Erro ao salvar"); setSaving(false); return; }
    onCreated({ ...(data as Omit<Release, "changelog_items">), changelog_items: [] });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Nova Release</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Versão *</label>
            <input
              autoFocus
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ex: v2.5.0"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sprint</label>
            <input
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="Ex: Sprint #43"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Resumo</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="Descrição geral desta versão..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Visibilidade</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
            >
              <option value="internal">Interno</option>
              <option value="public">Público</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Data de release</label>
            <input
              type="date"
              value={releasedAt}
              onChange={(e) => setReleasedAt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Criar Release"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function ReleasesPage() {
  const supabase = createClient();

  const [releases,        setReleases]        = useState<Release[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [selectedId,      setSelectedId]      = useState<string | null>(null);
  const [visibility,      setVisibility]      = useState<Visibility>("public");
  const [copied,          setCopied]          = useState(false);
  const [showNewRelease,  setShowNewRelease]  = useState(false);
  const [showAddItem,     setShowAddItem]     = useState(false);

  const fetchReleases = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("releases")
      .select("*, changelog_items(*)")
      .order("released_at", { ascending: false });
    const rows = (data ?? []) as Release[];
    setReleases(rows);
    if (rows.length > 0) setSelectedId(rows[0].id);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchReleases(); }, [fetchReleases]);

  function handleReleaseCreated(r: Release) {
    setReleases((prev) => [r, ...prev]);
    setSelectedId(r.id);
    setShowNewRelease(false);
  }

  function handleItemCreated(item: ChangelogItem) {
    setReleases((prev) =>
      prev.map((r) =>
        r.id === item.release_id
          ? { ...r, changelog_items: [...r.changelog_items, item] }
          : r
      )
    );
    setShowAddItem(false);
  }

  function handleCopy() {
    if (!release) return;
    const lines = [
      `## ${release.version} — ${formatDate(release.released_at)}`,
      release.summary ? `\n${release.summary}` : "",
      "",
      ...release.changelog_items.map(
        (i) => `- [${i.type.toUpperCase()}] ${i.title}${i.task_id ? ` (${i.task_id})` : ""}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const release = releases.find((r) => r.id === selectedId) ?? null;

  const visibleItems = release
    ? visibility === "public"
      ? release.changelog_items.filter((i) => i.type !== "breaking")
      : release.changelog_items
    : [];

  const stats = release ? computeStats(release.changelog_items) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-500" size={28} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Releases & Changelog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Histórico de versões e comunicado de mudanças</p>
        </div>
        <button
          onClick={() => setShowNewRelease(true)}
          className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Nova Release
        </button>
      </div>

      {/* Empty state */}
      {releases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Package size={24} className="text-blue-400" />
          </div>
          <div>
            <p className="text-gray-700 font-semibold">Nenhuma release criada</p>
            <p className="text-sm text-gray-400 mt-1">Crie a primeira release e adicione itens ao changelog</p>
          </div>
          <button
            onClick={() => setShowNewRelease(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700"
          >
            <Plus size={14} />
            Criar primeira release
          </button>
        </div>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Release Sidebar */}
          <div className="w-72 shrink-0 space-y-2">
            {releases.map((r) => {
              const s = computeStats(r.changelog_items);
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`w-full text-left rounded-2xl px-4 py-4 border transition-all ${
                    selectedId === r.id
                      ? "bg-white border-blue-200 shadow-md"
                      : "bg-white border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{r.version}</span>
                      {r.visibility === "internal" && <Lock size={11} className="text-gray-400" />}
                    </div>
                    {selectedId === r.id && <ChevronRight size={14} className="text-blue-600" />}
                  </div>
                  {r.summary && (
                    <p className="text-xs text-gray-500 mb-2.5 line-clamp-2 leading-relaxed">{r.summary}</p>
                  )}
                  <div className="flex items-center justify-between">
                    {r.sprint_name ? (
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {r.sprint_name}
                      </span>
                    ) : <span />}
                    <span className="text-[10px] text-gray-400">{formatDate(r.released_at)}</span>
                  </div>
                  {r.changelog_items.length > 0 && (
                    <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                      {s.features > 0 && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          +{s.features} feat
                        </span>
                      )}
                      {s.improvements > 0 && (
                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          +{s.improvements} imp
                        </span>
                      )}
                      {s.fixes > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {s.fixes} fix
                        </span>
                      )}
                      {s.breaking > 0 && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                          ⚠ {s.breaking}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Release Detail */}
          {release && (
            <div className="flex-1 min-w-0 space-y-4">
              {/* Version Header */}
              <div className="bg-white rounded-2xl px-6 py-5 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900">{release.version}</h2>
                      {release.sprint_name && (
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {release.sprint_name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(release.released_at)}</span>
                    </div>
                    {release.summary && (
                      <p className="text-sm text-gray-600">{release.summary}</p>
                    )}
                  </div>

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => setVisibility("public")}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        visibility === "public" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Eye size={12} />
                      Público
                    </button>
                    <button
                      onClick={() => setVisibility("internal")}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        visibility === "internal" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Lock size={12} />
                      Interno
                    </button>
                  </div>
                </div>

                {/* Stats + actions */}
                {stats && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                    {(Object.entries(typeConfig) as [ChangeType, typeof typeConfig[ChangeType]][]).map(([key, cfg]) => {
                      const count = stats[key === "feature" ? "features" : key === "improvement" ? "improvements" : key === "fix" ? "fixes" : "breaking"];
                      if (count === 0) return null;
                      const Icon = cfg.icon;
                      return (
                        <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
                          <Icon size={13} className={cfg.color} />
                          <span className={`text-xs font-bold ${cfg.color}`}>{count}</span>
                          <span className={`text-xs ${cfg.color} opacity-80`}>{cfg.label}</span>
                        </div>
                      );
                    })}
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Plus size={12} />
                        Adicionar item
                      </button>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        {copied ? "Copiado!" : "Copiar changelog"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Breaking changes warning */}
              {visibility === "public" && stats && stats.breaking > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    <span className="font-bold">Breaking changes ocultados na visão pública.</span>{" "}
                    Alterne para{" "}
                    <button onClick={() => setVisibility("internal")} className="underline font-semibold">
                      modo Interno
                    </button>{" "}
                    para visualizá-los.
                  </p>
                </div>
              )}

              {/* Changelog Items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-900">
                    Changelog — {visibleItems.length}{" "}
                    {visibleItems.length === 1 ? "item" : "itens"}
                  </p>
                  {release.changelog_items.length === 0 && (
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      + Adicionar primeiro item
                    </button>
                  )}
                </div>

                {visibleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                    <p className="text-sm text-gray-400">
                      {release.changelog_items.length === 0
                        ? "Nenhum item adicionado ainda."
                        : "Nenhum item visível na visão pública."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {visibleItems.map((item) => {
                      const cfg  = typeConfig[item.type];
                      const Icon = cfg.icon;
                      return (
                        <div key={item.id} className="flex items-start gap-4 px-6 py-5 hover:bg-gray-50/50 transition-colors">
                          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.border}`}>
                            <Icon size={14} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                              {item.task_id && (
                                <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {item.task_id}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-gray-800 mb-1">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {showNewRelease && (
        <NewReleaseModal onClose={() => setShowNewRelease(false)} onCreated={handleReleaseCreated} />
      )}

      {showAddItem && release && (
        <AddItemModal
          releaseId={release.id}
          onClose={() => setShowAddItem(false)}
          onCreated={handleItemCreated}
        />
      )}
    </div>
  );
}
