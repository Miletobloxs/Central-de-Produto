"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Flag, Plus, Users, Clock, AlertTriangle, CheckCircle2, XCircle,
  Search, X, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FlagType = "release" | "experiment" | "kill-switch";
type Environment = "production" | "staging" | "dev";

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: FlagType;
  active: boolean;
  rollout: number;
  segments: string[];
  modified_by: string | null;
  epic_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Epic {
  id: string;
  name: string;
  color: string;
}

const flagTypeConfig: Record<FlagType, { label: string; color: string; bg: string; border: string }> = {
  release: { label: "Release", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  experiment: { label: "Experimento", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  "kill-switch": { label: "Kill Switch", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
};

const environments: { id: Environment; label: string }[] = [
  { id: "production", label: "Produção" },
  { id: "staging", label: "Staging" },
  { id: "dev", label: "Dev" },
];

/* ─── NewFlagModal ────────────────────────────────────────────────── */
function NewFlagModal({
  open,
  onClose,
  onSave,
  epics,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  epics: Epic[];
}) {
  const [form, setForm] = useState({
    key: "",
    label: "",
    description: "",
    type: "release" as FlagType,
    active: true,
    rollout: 100,
    segments: "",
    modified_by: "",
    epic_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    if (!form.key.trim() || !form.label.trim()) {
      setError("Key e label são obrigatórios.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const segmentList = form.segments.split(",").map((s) => s.trim()).filter(Boolean);
    const { error: err } = await supabase.from("feature_flags").insert({
      key: form.key.trim(),
      label: form.label.trim(),
      description: form.description.trim() || null,
      type: form.type,
      active: form.active,
      rollout: form.rollout,
      segments: segmentList,
      modified_by: form.modified_by.trim() || null,
      epic_id: form.epic_id || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSave();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Nova Feature Flag</p>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Key (snake_case) *</label>
              <input
                className="w-full text-sm font-mono border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="pix_instant_deposit"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value.replace(/\s/g, "_").toLowerCase() })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Label *</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Nome da feature"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Descrição</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              rows={2}
              placeholder="O que essa flag controla?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Tipo</label>
            <div className="flex gap-2">
              {(Object.entries(flagTypeConfig) as [FlagType, typeof flagTypeConfig[FlagType]][]).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setForm({ ...form, type: k })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    form.type === k
                      ? `${v.bg} ${v.color} ${v.border}`
                      : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500">Rollout: {form.rollout}%</label>
              <button
                onClick={() => setForm({ ...form, active: !form.active })}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                  form.active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {form.active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                {form.active ? "Ativa" : "Inativa"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.rollout}
              onChange={(e) => setForm({ ...form, rollout: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Segmentos (vírgula)</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="Global, Enterprise"
                value={form.segments}
                onChange={(e) => setForm({ ...form, segments: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Modificado por</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="André M."
                value={form.modified_by}
                onChange={(e) => setForm({ ...form, modified_by: e.target.value })}
              />
            </div>
          </div>
          {epics.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Épico vinculado</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                value={form.epic_id}
                onChange={(e) => setForm({ ...form, epic_id: e.target.value })}
              >
                <option value="">— Nenhum —</option>
                {epics.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Criar Flag
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [env, setEnv] = useState<Environment>("production");
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [fRes, eRes] = await Promise.all([
      supabase.from("feature_flags").select("*").order("type", { ascending: true }).order("label", { ascending: true }),
      supabase.from("epics").select("id, name, color"),
    ]);
    setFlags(fRes.data ?? []);
    setEpics(eRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const epicMap = useMemo(
    () => Object.fromEntries(epics.map((e) => [e.id, e])),
    [epics]
  );

  const filtered = useMemo(
    () =>
      flags.filter(
        (f) =>
          !search ||
          f.label.toLowerCase().includes(search.toLowerCase()) ||
          f.key.toLowerCase().includes(search.toLowerCase())
      ),
    [flags, search]
  );

  const activeCount = flags.filter((f) => f.active).length;
  const experimentCount = flags.filter((f) => f.type === "experiment").length;
  const inactiveCount = flags.length - activeCount;

  async function toggleFlag(flag: FeatureFlag) {
    if (toggling) return;
    setToggling(flag.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("feature_flags")
      .update({ active: !flag.active })
      .eq("id", flag.id);
    if (!error) {
      setFlags((prev) =>
        prev.map((f) => (f.id === flag.id ? { ...f, active: !f.active } : f))
      );
    }
    setToggling(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {showModal && (
        <NewFlagModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={fetchAll}
          epics={epics}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Controle de rollout, experimentos e kill switches por segmento
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Environment Selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {environments.map((e) => (
              <button
                key={e.id}
                onClick={() => setEnv(e.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  env === e.id ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Nova Flag
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total de Flags", value: flags.length, icon: Flag, color: "text-gray-900", bg: "bg-white border-gray-100" },
          { label: "Ativas", value: activeCount, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
          { label: "Experimentos", value: experimentCount, icon: AlertTriangle, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
          { label: "Inativas", value: inactiveCount, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50 border-gray-100" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl px-5 py-4 border shadow-sm flex items-center justify-between`}
            >
              <div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <Icon size={20} className={`${s.color} opacity-30`} />
            </div>
          );
        })}
      </div>

      {/* Search + Flags List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 flex-1">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar flag por nome ou key..."
              className="text-sm text-gray-600 outline-none placeholder-gray-400 bg-transparent w-full"
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{filtered.length} flags</span>
        </div>

        {flags.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Flag size={28} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Nenhuma flag cadastrada</p>
            <p className="text-xs text-gray-400 mt-1">Clique em &quot;Nova Flag&quot; para criar a primeira.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400">Nenhuma flag encontrada para &quot;{search}&quot;.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((flag) => {
              const typeCfg = flagTypeConfig[flag.type];
              const rolloutColor =
                flag.rollout === 0 ? "bg-gray-200" : flag.rollout === 100 ? "bg-emerald-500" : "bg-blue-500";
              const epic = flag.epic_id ? epicMap[flag.epic_id] : null;
              const isToggling = toggling === flag.id;
              const initials = flag.modified_by
                ? flag.modified_by.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                : "";
              return (
                <div
                  key={flag.id}
                  className={`px-6 py-4 transition-colors ${!flag.active ? "opacity-60" : ""} hover:bg-gray-50/50`}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle */}
                    <div className="shrink-0 mt-0.5">
                      <button
                        onClick={() => toggleFlag(flag)}
                        disabled={isToggling}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                          flag.active ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      >
                        {isToggling ? (
                          <Loader2
                            size={10}
                            className="absolute inset-0 m-auto animate-spin text-white"
                          />
                        ) : (
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                              flag.active ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}
                        >
                          {typeCfg.label}
                        </span>
                        {epic && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${epic.color}`}>
                            {epic.name}
                          </span>
                        )}
                        {!flag.active && (
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            Desabilitada
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-800 mb-0.5">{flag.label}</p>
                      <code className="text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {flag.key}
                      </code>
                      {flag.description && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">{flag.description}</p>
                      )}
                    </div>

                    {/* Rollout */}
                    <div className="w-36 shrink-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-500">Rollout</span>
                        <span
                          className={`text-xs font-bold ${
                            flag.rollout === 100
                              ? "text-emerald-600"
                              : flag.rollout === 0
                              ? "text-gray-400"
                              : "text-blue-600"
                          }`}
                        >
                          {flag.rollout}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${rolloutColor} transition-all`}
                          style={{ width: `${flag.rollout}%` }}
                        />
                      </div>
                      {flag.segments.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {flag.segments.map((seg) => (
                            <span
                              key={seg}
                              className="text-[9px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full"
                            >
                              {seg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="w-28 shrink-0 text-right">
                      {flag.modified_by && (
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold bg-gray-200 text-gray-600">
                            {initials}
                          </div>
                          <span className="text-[11px] text-gray-500">{flag.modified_by}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400">
                        <Clock size={10} />
                        <span>
                          {new Date(flag.updated_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl px-6 py-4 border border-gray-100 shadow-sm flex items-center gap-6 flex-wrap">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipos de Flag</p>
        <div className="h-4 w-px bg-gray-200 shrink-0" />
        {(Object.entries(flagTypeConfig) as [FlagType, typeof flagTypeConfig[FlagType]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bg} border ${cfg.border}`} />
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-gray-400">
              {key === "release"
                ? "— funcionalidade em produção"
                : key === "experiment"
                ? "— teste com % dos usuários"
                : "— desliga feature de emergência"}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={12} />
          <span>Segmentos definem quais usuários recebem a feature</span>
        </div>
      </div>
    </div>
  );
}
