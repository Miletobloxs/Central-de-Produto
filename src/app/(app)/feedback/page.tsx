"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Plus,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface NPSMonthly {
  id: string;
  month: string;
  score: number;
  total_responses: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  created_at: string;
}

interface FeedbackEntry {
  id: string;
  quote: string;
  sentiment: "positive" | "neutral" | "negative";
  category: string;
  source: string;
  score: number | null;
  epic_id: string | null;
  sprint_id: string | null;
  feedback_date: string;
  created_at: string;
}

interface Epic {
  id: string;
  name: string;
  color?: string;
}

// ─── Constants ────────────────────────────────────────────────
const CATEGORIES = [
  "Interface", "Performance", "Checkout", "Notificações",
  "Suporte", "Onboarding", "Segurança", "Geral",
] as const;

const SOURCES = ["App Mobile", "Web", "Email", "Entrevista", "Survey"] as const;

const SOURCE_COLOR: Record<string, string> = {
  "App Mobile": "bg-blue-100 text-blue-700",
  "Web":        "bg-slate-100 text-slate-700",
  "Email":      "bg-purple-100 text-purple-700",
  "Entrevista": "bg-emerald-100 text-emerald-700",
  "Survey":     "bg-orange-100 text-orange-700",
};

const SENTIMENT_STYLE: Record<string, string> = {
  positive: "border-emerald-200 bg-emerald-50",
  neutral:  "border-amber-200 bg-amber-50",
  negative: "border-red-200 bg-red-50",
};

function formatMonth(m: string) {
  const [year, month] = m.split("-");
  const names = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${names[parseInt(month) - 1]}/${year.slice(2)}`;
}

function EmptyState({ icon, message }: { icon?: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
      {icon ?? <AlertTriangle size={18} className="opacity-40" />}
      <span className="text-xs">{message}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function FeedbackPage() {
  const [loading, setLoading]             = useState(true);
  const [npsMonthly, setNpsMonthly]       = useState<NPSMonthly[]>([]);
  const [feedbackEntries, setFeedback]    = useState<FeedbackEntry[]>([]);
  const [epics, setEpics]                 = useState<Epic[]>([]);
  const [showAddFeedback, setShowFeedback] = useState(false);
  const [showAddNPS, setShowNPS]           = useState(false);
  const [filterCategory, setFilterCat]    = useState("all");
  const [filterSentiment, setFilterSent]  = useState("all");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const supabase = createClient();
    const [npsRes, fbRes, epicsRes] = await Promise.all([
      supabase.from("nps_monthly").select("*").order("month"),
      supabase.from("feedback_entries").select("*").order("feedback_date", { ascending: false }),
      supabase.from("epics").select("id, name, color"),
    ]);
    setNpsMonthly(npsRes.data ?? []);
    setFeedback(fbRes.data ?? []);
    setEpics(epicsRes.data ?? []);
    setLoading(false);
  }

  // ─── Derived Metrics ─────────────────────────────────────
  const latestNPS   = npsMonthly[npsMonthly.length - 1] ?? null;
  const previousNPS = npsMonthly.length >= 2 ? npsMonthly[npsMonthly.length - 2] : null;
  const scoreDelta  = latestNPS && previousNPS ? latestNPS.score - previousNPS.score : null;

  const netNPS = latestNPS
    ? Math.round(((latestNPS.promoters - latestNPS.detractors) / Math.max(latestNPS.total_responses, 1)) * 100)
    : null;

  const promoterPct  = latestNPS ? Math.round((latestNPS.promoters  / Math.max(latestNPS.total_responses, 1)) * 100) : 0;
  const neutralPct   = latestNPS ? Math.round((latestNPS.neutrals   / Math.max(latestNPS.total_responses, 1)) * 100) : 0;
  const detractorPct = latestNPS ? Math.round((latestNPS.detractors / Math.max(latestNPS.total_responses, 1)) * 100) : 0;

  const scoredEntries = feedbackEntries.filter((f) => f.score != null);
  const avgScore = scoredEntries.length > 0
    ? (scoredEntries.reduce((a, f) => a + (f.score ?? 0), 0) / scoredEntries.length).toFixed(1)
    : null;

  const positivePct = feedbackEntries.length > 0
    ? Math.round((feedbackEntries.filter((f) => f.sentiment === "positive").length / feedbackEntries.length) * 100)
    : null;

  // Category breakdown from real entries
  const categoryStats = useMemo(() => {
    const map: Record<string, { positive: number; neutral: number; negative: number }> = {};
    feedbackEntries.forEach((fb) => {
      if (!map[fb.category]) map[fb.category] = { positive: 0, neutral: 0, negative: 0 };
      map[fb.category][fb.sentiment]++;
    });
    return Object.entries(map)
      .map(([name, c]) => ({ name, ...c, total: c.positive + c.neutral + c.negative }))
      .sort((a, b) => b.total - a.total);
  }, [feedbackEntries]);

  // Feedback correlated to epics
  const epicFeedback = useMemo(() =>
    epics
      .map((e) => {
        const entries = feedbackEntries.filter((f) => f.epic_id === e.id);
        return {
          ...e,
          total:    entries.length,
          positive: entries.filter((f) => f.sentiment === "positive").length,
          neutral:  entries.filter((f) => f.sentiment === "neutral").length,
          negative: entries.filter((f) => f.sentiment === "negative").length,
        };
      })
      .filter((e) => e.total > 0)
      .sort((a, b) => b.total - a.total),
    [epics, feedbackEntries]
  );

  // Filtered feed
  const filteredFeedback = useMemo(() =>
    feedbackEntries.filter((fb) => {
      if (filterCategory !== "all" && fb.category !== filterCategory) return false;
      if (filterSentiment !== "all" && fb.sentiment !== filterSentiment) return false;
      return true;
    }),
    [feedbackEntries, filterCategory, filterSentiment]
  );

  // NPS chart scale
  const npsScores = npsMonthly.map((n) => n.score);
  const minScore  = npsScores.length > 0 ? Math.min(...npsScores) - 0.5 : 0;
  const maxScore  = npsScores.length > 0 ? Math.max(...npsScores) + 0.5 : 10;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Feedback / NPS</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Satisfação dos usuários, NPS mensal e feedbacks por feature
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNPS(true)}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <TrendingUp size={14} />
            Registrar NPS
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 transition-colors"
          >
            <Plus size={14} />
            Adicionar Feedback
          </button>
        </div>
      </div>

      {/* ── Top row: NPS Score + Distribuição + Métricas Rápidas ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* NPS Score gauge */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">NPS Score</p>
          <div className="relative w-24 h-24 mb-3">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F3F5" strokeWidth="12" />
              <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke={
                  latestNPS
                    ? latestNPS.score >= 8 ? "#10b981" : latestNPS.score >= 6 ? "#f59e0b" : "#ef4444"
                    : "#e5e7eb"
                }
                strokeWidth="12"
                strokeDasharray={`${((latestNPS?.score ?? 0) / 10) * 239} 239`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {latestNPS ? latestNPS.score.toFixed(1) : "—"}
              </span>
            </div>
          </div>

          {scoreDelta !== null ? (
            <div className={`flex items-center gap-1 ${scoreDelta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {scoreDelta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span className="text-xs font-semibold">
                {scoreDelta >= 0 ? "+" : ""}{scoreDelta.toFixed(1)} vs mês anterior
              </span>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              {latestNPS ? formatMonth(latestNPS.month) : "Nenhum dado ainda"}
            </p>
          )}

          {netNPS !== null && (
            <span className={`mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${
              netNPS >= 50 ? "bg-emerald-50 text-emerald-600"
              : netNPS >= 0 ? "bg-amber-50 text-amber-600"
              : "bg-red-50 text-red-500"
            }`}>
              NPS líquido: {netNPS > 0 ? "+" : ""}{netNPS}
            </span>
          )}
        </div>

        {/* Distribuição Promotores / Neutros / Detratores */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Distribuição</p>
          {latestNPS ? (
            <>
              <div className="space-y-3">
                {[
                  { label: "Promotores (9–10)", pct: promoterPct,  count: latestNPS.promoters,  color: "bg-emerald-500", text: "text-emerald-600" },
                  { label: "Neutros (7–8)",     pct: neutralPct,   count: latestNPS.neutrals,   color: "bg-amber-400",  text: "text-amber-600" },
                  { label: "Detratores (0–6)",  pct: detractorPct, count: latestNPS.detractors, color: "bg-red-500",    text: "text-red-500" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                        <span className="text-xs font-medium text-gray-700">{row.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">{row.count}</span>
                        <span className={`text-xs font-bold ${row.text}`}>{row.pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">
                    {latestNPS.total_responses.toLocaleString("pt-BR")}
                  </span>{" "}
                  respostas em {formatMonth(latestNPS.month)}
                </p>
              </div>
            </>
          ) : (
            <EmptyState message="Registre o NPS mensal para ver a distribuição" />
          )}
        </div>

        {/* Métricas Rápidas */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Métricas Rápidas</p>
          <div className="space-y-4">
            {[
              {
                label: "Total de feedbacks",
                value: feedbackEntries.length.toString(),
                sub: null,
              },
              {
                label: "Score médio (CSAT)",
                value: avgScore ? `${avgScore}/10` : "—",
                sub: null,
              },
              {
                label: "Sentimento positivo",
                value: positivePct !== null ? `${positivePct}%` : "—",
                sub: null,
              },
              {
                label: "Categorias registradas",
                value: categoryStats.length.toString(),
                sub: null,
              },
              {
                label: "Meses de histórico NPS",
                value: npsMonthly.length.toString(),
                sub: null,
              },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{m.label}</p>
                <span className="text-sm font-bold text-gray-900">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NPS Trend + Sentimento por Categoria ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* NPS Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Evolução do NPS</h2>
          {npsMonthly.length === 0 ? (
            <EmptyState message="Registre o NPS mensal para ver a evolução" />
          ) : (
            <div className="flex items-end gap-2 h-28">
              {npsMonthly.map((m, i) => {
                const isLast = i === npsMonthly.length - 1;
                const height = ((m.score - minScore) / Math.max(maxScore - minScore, 0.1)) * 100;
                return (
                  <div
                    key={m.id}
                    className="flex-1 flex flex-col items-center gap-1.5 group"
                    title={`${formatMonth(m.month)}: ${m.score.toFixed(1)} (${m.total_responses} resp.)`}
                  >
                    <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.score.toFixed(1)}
                    </span>
                    <div className="w-full flex items-end" style={{ height: "72px" }}>
                      <div
                        className={`w-full rounded-t-lg transition-all ${isLast ? "bg-blue-600" : "bg-blue-200"}`}
                        style={{ height: `${Math.max(height, 8)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400">{formatMonth(m.month)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sentimento por Categoria */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-5">Sentimento por Categoria</h2>
          {categoryStats.length === 0 ? (
            <EmptyState message="Adicione feedbacks com categorias para ver o breakdown" />
          ) : (
            <>
              <div className="space-y-3">
                {categoryStats.slice(0, 5).map((cat) => {
                  const posP = Math.round((cat.positive / cat.total) * 100);
                  const neuP = Math.round((cat.neutral  / cat.total) * 100);
                  const negP = 100 - posP - neuP;
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {posP}% positivo · {cat.total}
                        </span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden gap-px">
                        {posP > 0 && <div className="bg-emerald-400" style={{ width: `${posP}%` }} />}
                        {neuP > 0 && <div className="bg-amber-300"  style={{ width: `${neuP}%` }} />}
                        {negP > 0 && <div className="bg-red-400"    style={{ width: `${negP}%` }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                {[
                  { color: "bg-emerald-400", label: "Positivo" },
                  { color: "bg-amber-300",   label: "Neutro" },
                  { color: "bg-red-400",     label: "Negativo" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-gray-500">{l.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Feedback por Épico ── */}
      {epicFeedback.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Feedback correlacionado por Épico</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Sentimento dos usuários associado às features do roadmap
            </p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {epicFeedback.map((e) => {
              const posP = Math.round((e.positive / e.total) * 100);
              const neuP = Math.round((e.neutral  / e.total) * 100);
              const negP = 100 - posP - neuP;
              return (
                <div key={e.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {e.color && (
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                      )}
                      <span className="text-xs font-semibold text-gray-800">{e.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {e.total} feedback{e.total !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
                    {posP > 0 && <div className="bg-emerald-400" style={{ width: `${posP}%` }} title={`${e.positive} positivos`} />}
                    {neuP > 0 && <div className="bg-amber-300"  style={{ width: `${neuP}%` }} title={`${e.neutral} neutros`} />}
                    {negP > 0 && <div className="bg-red-400"    style={{ width: `${negP}%` }} title={`${e.negative} negativos`} />}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {e.positive > 0 && (
                      <span className="text-[10px] text-emerald-600 font-semibold">{e.positive} positivo{e.positive !== 1 ? "s" : ""}</span>
                    )}
                    {e.neutral > 0 && (
                      <span className="text-[10px] text-amber-500 font-semibold">{e.neutral} neutro{e.neutral !== 1 ? "s" : ""}</span>
                    )}
                    {e.negative > 0 && (
                      <span className="text-[10px] text-red-500 font-semibold">{e.negative} negativo{e.negative !== 1 ? "s" : ""}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Feedbacks Recentes ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={15} className="text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Feedbacks Recentes</h2>
            <span className="text-xs text-gray-400">({filteredFeedback.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCat(e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
            >
              <option value="all">Todas as categorias</option>
              {categoryStats.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSent(e.target.value)}
              className="text-xs text-gray-600 border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
            >
              <option value="all">Todos</option>
              <option value="positive">Positivo</option>
              <option value="neutral">Neutro</option>
              <option value="negative">Negativo</option>
            </select>
          </div>
        </div>

        {filteredFeedback.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={20} className="opacity-30" />}
            message={
              feedbackEntries.length === 0
                ? 'Nenhum feedback cadastrado ainda — clique em "Adicionar Feedback"'
                : "Nenhum feedback com esses filtros"
            }
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredFeedback.slice(0, 12).map((fb) => {
              const epicName = epics.find((e) => e.id === fb.epic_id)?.name;
              return (
                <div
                  key={fb.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className={`mt-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${SENTIMENT_STYLE[fb.sentiment]}`}>
                    {fb.sentiment === "positive" ? (
                      <ThumbsUp size={13} className="text-emerald-500" />
                    ) : fb.sentiment === "negative" ? (
                      <ThumbsDown size={13} className="text-red-500" />
                    ) : (
                      <Minus size={13} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 italic leading-relaxed mb-2">
                      &ldquo;{fb.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {fb.source && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SOURCE_COLOR[fb.source] ?? "bg-gray-100 text-gray-600"}`}>
                          {fb.source}
                        </span>
                      )}
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {fb.category}
                      </span>
                      {epicName && (
                        <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {epicName}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {new Date(fb.feedback_date + "T12:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  {fb.score !== null && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-gray-700">{fb.score}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddFeedback && (
        <AddFeedbackModal
          epics={epics}
          onClose={() => setShowFeedback(false)}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = await supabase.from("feedback_entries").insert(data);
            if (!error) { await fetchAll(); setShowFeedback(false); }
            return error?.message ?? null;
          }}
        />
      )}

      {showAddNPS && (
        <AddNPSModal
          onClose={() => setShowNPS(false)}
          onSave={async (data) => {
            const supabase = createClient();
            const { error } = await supabase
              .from("nps_monthly")
              .upsert(data, { onConflict: "month" });
            if (!error) { await fetchAll(); setShowNPS(false); }
            return error?.message ?? null;
          }}
        />
      )}
    </div>
  );
}

// ─── Modal: Adicionar Feedback ────────────────────────────────
function AddFeedbackModal({
  epics,
  onClose,
  onSave,
}: {
  epics: Epic[];
  onClose: () => void;
  onSave: (data: Partial<FeedbackEntry>) => Promise<string | null>;
}) {
  const [quote,     setQuote]     = useState("");
  const [sentiment, setSentiment] = useState<"positive" | "neutral" | "negative">("positive");
  const [category,  setCategory]  = useState<string>("Interface");
  const [source,    setSource]    = useState<string>("Web");
  const [score,     setScore]     = useState("");
  const [epicId,    setEpicId]    = useState("");
  const [date,      setDate]      = useState(new Date().toISOString().split("T")[0]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  async function handleSave() {
    if (!quote.trim()) { setError("O texto do feedback não pode estar vazio."); return; }
    setLoading(true);
    const err = await onSave({
      quote:         quote.trim(),
      sentiment,
      category,
      source,
      score:         score ? parseInt(score) : null,
      epic_id:       epicId || null,
      feedback_date: date,
    } as Partial<FeedbackEntry>);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Adicionar Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Feedback do usuário *
            </label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Transcreva ou resuma o feedback recebido..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          {/* Sentiment buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sentimento</label>
            <div className="flex gap-2">
              {(["positive", "neutral", "negative"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSentiment(s)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    sentiment === s
                      ? s === "positive"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : s === "neutral"
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : "bg-red-50 border-red-300 text-red-700"
                      : "border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {s === "positive" ? "👍 Positivo" : s === "neutral" ? "😐 Neutro" : "👎 Negativo"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Canal</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Score (1–10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="ex: 8"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          {epics.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Épico relacionado <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <select
                value={epicId}
                onChange={(e) => setEpicId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="">Nenhum</option>
                {epics.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Registrar NPS Mensal ──────────────────────────────
function AddNPSModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (data: Partial<NPSMonthly>) => Promise<string | null>;
}) {
  const [month,      setMonth]      = useState(new Date().toISOString().slice(0, 7));
  const [score,      setScore]      = useState("");
  const [total,      setTotal]      = useState("");
  const [promoters,  setPromoters]  = useState("");
  const [neutrals,   setNeutrals]   = useState("");
  const [detractors, setDetractors] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  async function handleSave() {
    if (!score || !total) {
      setError("Score médio e total de respostas são obrigatórios.");
      return;
    }
    setLoading(true);
    const err = await onSave({
      month,
      score:           parseFloat(score),
      total_responses: parseInt(total),
      promoters:       parseInt(promoters  || "0"),
      neutrals:        parseInt(neutrals   || "0"),
      detractors:      parseInt(detractors || "0"),
    });
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Registrar NPS Mensal</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mês *</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Score médio (0–10) *
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="ex: 8.4"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Total de respostas *
            </label>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="ex: 201"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              Distribuição por categoria
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Promotores (9–10)", value: promoters,  setter: setPromoters,  border: "border-emerald-200", ring: "focus:ring-emerald-100", text: "text-emerald-600" },
                { label: "Neutros (7–8)",     value: neutrals,   setter: setNeutrals,   border: "border-amber-200",   ring: "focus:ring-amber-100",   text: "text-amber-600" },
                { label: "Detratores (0–6)",  value: detractors, setter: setDetractors, border: "border-red-200",     ring: "focus:ring-red-100",     text: "text-red-600" },
              ].map((f) => (
                <div key={f.label}>
                  <label className={`block text-[10px] font-semibold mb-1.5 ${f.text}`}>
                    {f.label}
                  </label>
                  <input
                    type="number"
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    placeholder="0"
                    className={`w-full border ${f.border} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${f.ring}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-white bg-gray-900 rounded-xl px-4 py-2.5 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
