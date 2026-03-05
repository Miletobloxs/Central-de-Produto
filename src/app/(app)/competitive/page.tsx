"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CheckCircle2, Wrench, Clock, Minus, Plus, TrendingUp, TrendingDown,
  X, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FeatureAvailability = "available" | "in-dev" | "planned" | "unavailable";
type ThreatLevel = "alto" | "médio" | "baixo";
type MoveType = "feature" | "product" | "pricing" | "growth" | "partnership";
type MoveImpact = "alto" | "médio" | "baixo";

interface Competitor {
  id: string;
  name: string;
  short_name: string;
  color: string;
  threat: ThreatLevel;
  differentiation: string | null;
  users: string | null;
  created_at: string;
}

interface CompetitiveFeature {
  id: string;
  feature: string;
  category: string;
  bloxs: FeatureAvailability;
  availability: Record<string, FeatureAvailability>;
}

interface CompetitiveMove {
  id: string;
  competitor_id: string;
  type: MoveType;
  description: string;
  impact: MoveImpact;
  move_date: string;
}

const availabilityConfig: Record<FeatureAvailability, { icon: React.ElementType; color: string; bg: string }> = {
  available: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  "in-dev": { icon: Wrench, color: "text-amber-500", bg: "bg-amber-50" },
  planned: { icon: Clock, color: "text-gray-400", bg: "bg-gray-50" },
  unavailable: { icon: Minus, color: "text-gray-300", bg: "" },
};

const threatConfig: Record<ThreatLevel, { color: string; bg: string; border: string }> = {
  alto: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  médio: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  baixo: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
};

const moveTypeConfig: Record<MoveType, { label: string; color: string; bg: string }> = {
  feature: { label: "Feature", color: "text-blue-600", bg: "bg-blue-50" },
  product: { label: "Produto", color: "text-purple-600", bg: "bg-purple-50" },
  pricing: { label: "Pricing", color: "text-red-600", bg: "bg-red-50" },
  growth: { label: "Crescimento", color: "text-emerald-600", bg: "bg-emerald-50" },
  partnership: { label: "Parceria", color: "text-amber-600", bg: "bg-amber-50" },
};

const impactConfig: Record<MoveImpact, { icon: React.ElementType; color: string }> = {
  alto: { icon: TrendingUp, color: "text-red-500" },
  médio: { icon: Minus, color: "text-amber-500" },
  baixo: { icon: TrendingDown, color: "text-gray-400" },
};

/* ─── AddCompetitorModal ──────────────────────────────────────────── */
function AddCompetitorModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: "", short_name: "", color: "bg-gray-100 text-gray-800",
    threat: "médio" as ThreatLevel, differentiation: "", users: "",
  });
  const [saving, setSaving] = useState(false);

  const colorOptions = [
    "bg-yellow-100 text-yellow-800",
    "bg-orange-100 text-orange-800",
    "bg-red-100 text-red-800",
    "bg-green-100 text-green-800",
    "bg-blue-100 text-blue-800",
    "bg-purple-100 text-purple-800",
    "bg-pink-100 text-pink-800",
    "bg-gray-100 text-gray-800",
  ];

  async function handleSave() {
    if (!form.name.trim() || !form.short_name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("competitors").insert({
      name: form.name.trim(),
      short_name: form.short_name.trim().slice(0, 4).toUpperCase(),
      color: form.color,
      threat: form.threat,
      differentiation: form.differentiation.trim() || null,
      users: form.users.trim() || null,
    });
    setSaving(false);
    onSave();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Novo Concorrente</p>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nome completo *</label>
            <input
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              placeholder="ex: BTG Pactual Digital"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Sigla (max 4) *</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 uppercase"
                placeholder="ex: BTG"
                maxLength={4}
                value={form.short_name}
                onChange={(e) => setForm({ ...form, short_name: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Usuários</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="ex: 3.2M"
                value={form.users}
                onChange={(e) => setForm({ ...form, users: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nível de Ameaça</label>
            <div className="flex gap-2">
              {(["alto", "médio", "baixo"] as ThreatLevel[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, threat: t })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
                    form.threat === t
                      ? threatConfig[t].bg + " " + threatConfig[t].color + " " + threatConfig[t].border
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Cor do badge</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => {
                const [bg] = c.split(" ");
                return (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full border-2 ${bg} ${form.color === c ? "border-gray-900" : "border-transparent"}`}
                    title={c}
                  />
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Diferenciação</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              rows={2}
              placeholder="Principal diferencial competitivo..."
              value={form.differentiation}
              onChange={(e) => setForm({ ...form, differentiation: e.target.value })}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.short_name.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AddMoveModal ────────────────────────────────────────────────── */
function AddMoveModal({
  open,
  onClose,
  onSave,
  competitors,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  competitors: Competitor[];
}) {
  const [form, setForm] = useState({
    competitor_id: "",
    type: "feature" as MoveType,
    description: "",
    impact: "médio" as MoveImpact,
    move_date: new Date().toISOString().slice(0, 7),
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.competitor_id || !form.description.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("competitive_moves").insert({
      competitor_id: form.competitor_id,
      type: form.type,
      description: form.description.trim(),
      impact: form.impact,
      move_date: form.move_date,
    });
    setSaving(false);
    onSave();
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Registrar Movimento</p>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Concorrente *</label>
            <select
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
              value={form.competitor_id}
              onChange={(e) => setForm({ ...form, competitor_id: e.target.value })}
            >
              <option value="">Selecionar...</option>
              {competitors.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Tipo</label>
              <select
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MoveType })}
              >
                <option value="feature">Feature</option>
                <option value="product">Produto</option>
                <option value="pricing">Pricing</option>
                <option value="growth">Crescimento</option>
                <option value="partnership">Parceria</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Período</label>
              <input
                type="month"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                value={form.move_date}
                onChange={(e) => setForm({ ...form, move_date: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Impacto</label>
            <div className="flex gap-2">
              {(["alto", "médio", "baixo"] as MoveImpact[]).map((imp) => {
                const cfg = impactConfig[imp];
                const Icon = cfg.icon;
                return (
                  <button
                    key={imp}
                    onClick={() => setForm({ ...form, impact: imp })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      form.impact === imp ? "bg-gray-900 text-white border-gray-900" : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    <Icon size={11} />
                    {imp}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Descrição *</label>
            <textarea
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 resize-none"
              rows={3}
              placeholder="Descreva o movimento do concorrente..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.competitor_id || !form.description.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── AddFeatureModal ─────────────────────────────────────────────── */
function AddFeatureModal({
  open,
  onClose,
  onSave,
  competitors,
}: {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  competitors: Competitor[];
}) {
  const [form, setForm] = useState({
    feature: "",
    category: "",
    bloxs: "unavailable" as FeatureAvailability,
  });
  const [competitorAvail, setCompetitorAvail] = useState<Record<string, FeatureAvailability>>({});
  const [saving, setSaving] = useState(false);

  function setCompetitorStatus(id: string, avail: FeatureAvailability) {
    setCompetitorAvail((prev) => ({ ...prev, [id]: avail }));
  }

  async function handleSave() {
    if (!form.feature.trim() || !form.category.trim()) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("competitive_features").insert({
      feature: form.feature.trim(),
      category: form.category.trim(),
      bloxs: form.bloxs,
      availability: competitorAvail,
    });
    setSaving(false);
    onSave();
    onClose();
  }

  const availOptions: { value: FeatureAvailability; icon: React.ElementType; color: string }[] = [
    { value: "available", icon: CheckCircle2, color: "text-emerald-600" },
    { value: "in-dev", icon: Wrench, color: "text-amber-500" },
    { value: "planned", icon: Clock, color: "text-gray-400" },
    { value: "unavailable", icon: Minus, color: "text-gray-300" },
  ];

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Nova Feature na Matriz</p>
          <button onClick={onClose}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Feature *</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="ex: Open Finance"
                value={form.feature}
                onChange={(e) => setForm({ ...form, feature: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Categoria *</label>
              <input
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                placeholder="ex: Integração"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block">Status Bloxs</label>
            <div className="flex gap-2">
              {availOptions.map(({ value, icon: Icon, color }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, bloxs: value })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                    form.bloxs === value ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                >
                  <Icon size={11} className={form.bloxs === value ? "text-white" : color} />
                  {value}
                </button>
              ))}
            </div>
          </div>
          {competitors.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block">Status por Concorrente</label>
              <div className="space-y-2">
                {competitors.map((c) => {
                  const currentAvail = competitorAvail[c.id] ?? "unavailable";
                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg w-14 text-center shrink-0 ${c.color}`}>
                        {c.short_name}
                      </div>
                      <div className="flex gap-1.5 flex-1">
                        {availOptions.map(({ value, icon: Icon, color }) => (
                          <button
                            key={value}
                            onClick={() => setCompetitorStatus(c.id, value)}
                            className={`flex-1 py-1.5 rounded-lg border flex items-center justify-center transition-all ${
                              currentAvail === value
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                            }`}
                            title={value}
                          >
                            <Icon size={11} className={currentAvail === value ? "text-white" : color} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.feature.trim() || !form.category.trim()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────── */
export default function CompetitivePage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [features, setFeatures] = useState<CompetitiveFeature[]>([]);
  const [moves, setMoves] = useState<CompetitiveMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [showAddMove, setShowAddMove] = useState(false);
  const [showAddFeature, setShowAddFeature] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [cRes, fRes, mRes] = await Promise.all([
      supabase.from("competitors").select("*").order("created_at", { ascending: true }),
      supabase.from("competitive_features").select("*").order("category", { ascending: true }),
      supabase.from("competitive_moves").select("*").order("move_date", { ascending: false }),
    ]);
    setCompetitors(cRes.data ?? []);
    setFeatures(fRes.data ?? []);
    setMoves(mRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const competitorMap = useMemo(
    () => Object.fromEntries(competitors.map((c) => [c.id, c])),
    [competitors]
  );

  const categories = useMemo(() => [...new Set(features.map((f) => f.category))], [features]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Competitive Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitoramento de concorrentes, features lançadas e posicionamento de mercado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFeature(true)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Feature
          </button>
          <button
            onClick={() => setShowAddMove(true)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <Plus size={14} />
            Movimento
          </button>
          <button
            onClick={() => setShowAddCompetitor(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 rounded-xl px-4 py-2.5 hover:bg-blue-700 transition-colors"
          >
            <Plus size={14} />
            Concorrente
          </button>
        </div>
      </div>

      {/* Competitor Cards */}
      {competitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <p className="text-sm font-semibold text-gray-400">Nenhum concorrente cadastrado</p>
          <p className="text-xs text-gray-400 mt-1">Clique em &quot;Concorrente&quot; para adicionar o primeiro.</p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(competitors.length, 5)}, 1fr)` }}>
          {competitors.map((c) => {
            const threat = threatConfig[c.threat];
            return (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black ${c.color}`}>
                    {c.short_name}
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${threat.bg} ${threat.color} ${threat.border}`}>
                    {c.threat}
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-900 mb-1 leading-tight">{c.name}</p>
                {c.differentiation && (
                  <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2 mb-3">{c.differentiation}</p>
                )}
                {c.users && (
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs font-bold text-gray-700">{c.users}</span>
                    <span className="text-[10px] text-gray-400">usuários</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Matrix */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">Matriz de Features</p>
          <div className="flex items-center gap-4">
            {[
              { icon: CheckCircle2, color: "text-emerald-600", label: "Disponível" },
              { icon: Wrench, color: "text-amber-500", label: "Em Dev" },
              { icon: Clock, color: "text-gray-400", label: "Planejado" },
              { icon: Minus, color: "text-gray-300", label: "Indisponível" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <item.icon size={12} className={item.color} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {features.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Nenhuma feature na matriz ainda. Clique em &quot;Feature&quot; para adicionar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-semibold text-gray-500 px-6 py-3 w-48">Feature</th>
                  <th className="font-semibold text-gray-500 px-3 py-3 text-center w-24">Categoria</th>
                  <th className="font-bold px-3 py-3 text-center w-20 text-blue-600">Bloxs</th>
                  {competitors.map((c) => (
                    <th key={c.id} className={`font-bold px-3 py-3 text-center w-20 ${threatConfig[c.threat].color}`}>
                      {c.short_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <>
                    <tr key={`cat-${cat}`} className="bg-gray-50/80">
                      <td colSpan={3 + competitors.length} className="px-6 py-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat}</span>
                      </td>
                    </tr>
                    {features.filter((f) => f.category === cat).map((row) => {
                      const bloxsCfg = availabilityConfig[row.bloxs];
                      const BloxsIcon = bloxsCfg.icon;
                      return (
                        <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="px-6 py-3 font-semibold text-gray-700">{row.feature}</td>
                          <td className="px-3 py-3 text-center text-gray-400">{row.category}</td>
                          <td className="px-3 py-3 text-center bg-blue-50/30">
                            <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${bloxsCfg.bg}`}>
                              <BloxsIcon size={13} className={bloxsCfg.color} />
                            </div>
                          </td>
                          {competitors.map((c) => {
                            const avail: FeatureAvailability = row.availability?.[c.id] ?? "unavailable";
                            const cfg = availabilityConfig[avail];
                            const Icon = cfg.icon;
                            return (
                              <td key={c.id} className="px-3 py-3 text-center">
                                <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cfg.bg}`}>
                                  <Icon size={13} className={cfg.color} />
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Moves */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Movimentos Recentes</p>
          <p className="text-xs text-gray-400 mt-0.5">Features lançadas, mudanças de pricing e parcerias estratégicas</p>
        </div>
        {moves.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-400">Nenhum movimento registrado ainda. Clique em &quot;Movimento&quot; para adicionar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {moves.map((move) => {
              const competitor = competitorMap[move.competitor_id];
              const typeCfg = moveTypeConfig[move.type];
              const impactCfg = impactConfig[move.impact];
              const ImpactIcon = impactCfg.icon;
              return (
                <div key={move.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <span className="text-xs font-bold text-gray-400 w-20 shrink-0 pt-0.5">{move.move_date}</span>
                  {competitor && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${competitor.color}`}>
                      {competitor.short_name}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>
                        {typeCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">{move.description}</p>
                  </div>
                  <div className={`flex items-center gap-1 shrink-0 ${impactCfg.color}`}>
                    <ImpactIcon size={12} />
                    <span className="text-[10px] font-bold capitalize">{move.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCompetitorModal
        open={showAddCompetitor}
        onClose={() => setShowAddCompetitor(false)}
        onSave={fetchAll}
      />
      <AddMoveModal
        open={showAddMove}
        onClose={() => setShowAddMove(false)}
        onSave={fetchAll}
        competitors={competitors}
      />
      <AddFeatureModal
        open={showAddFeature}
        onClose={() => setShowAddFeature(false)}
        onSave={fetchAll}
        competitors={competitors}
      />
    </div>
  );
}
