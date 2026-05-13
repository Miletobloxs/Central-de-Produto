"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  Zap,
  Target,
  CheckCircle2,
  LayoutList,
  Download,
  AlertTriangle,
} from "lucide-react";
import type { Sprint, Task, BacklogItem, Objective, KeyResult } from "@/types/product";

// ─── Types ────────────────────────────────────────────────────
interface Epic {
  id: string;
  name: string;
  status: string;
  priority: string;
  color?: string;
  stream?: string;
}

interface SprintMetric {
  id: string;
  name: string;
  status: string;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
  sp_done: number;
  sp_total: number;
}

interface EpicProgress {
  id: string;
  name: string;
  color?: string;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

interface OKRObjective extends Objective {
  key_results: KeyResult[];
  progress: number;
}

// ─── Helpers ─────────────────────────────────────────────────
const MOSCOW_META = {
  must:   { label: "Must Have",   color: "bg-red-500",    light: "bg-red-50 text-red-700" },
  should: { label: "Should Have", color: "bg-orange-400", light: "bg-orange-50 text-orange-700" },
  could:  { label: "Could Have",  color: "bg-yellow-400", light: "bg-yellow-50 text-yellow-700" },
  wont:   { label: "Won't Have",  color: "bg-gray-300",   light: "bg-gray-100 text-gray-500" },
};

const STATUS_COLORS = {
  todo:        { bar: "bg-gray-200",    label: "To Do",       text: "text-gray-500" },
  in_progress: { bar: "bg-blue-400",    label: "Em Progresso", text: "text-blue-600" },
  review:      { bar: "bg-amber-400",   label: "Review",       text: "text-amber-600" },
  done:        { bar: "bg-emerald-500", label: "Concluído",    text: "text-emerald-600" },
};

const PRIORITY_META = {
  critical: { label: "Crítico", color: "bg-red-500",    text: "text-red-600" },
  high:     { label: "Alto",    color: "bg-orange-400", text: "text-orange-600" },
  medium:   { label: "Médio",   color: "bg-yellow-400", text: "text-yellow-600" },
  low:      { label: "Baixo",   color: "bg-gray-300",   text: "text-gray-500" },
};

const OKR_STATUS_META = {
  on_track:  { label: "No Prazo",   color: "bg-emerald-500" },
  at_risk:   { label: "Em Risco",   color: "bg-amber-400" },
  off_track:  { label: "Atrasado",  color: "bg-red-500" },
  completed: { label: "Concluído",  color: "bg-blue-500" },
};

function emptyState(message: string) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
      <AlertTriangle size={20} className="opacity-40" />
      <span className="text-xs">{message}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [sprints, setSprints]         = useState<Sprint[]>([]);
  const [tasks, setTasks]             = useState<Task[]>([]);
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [objectives, setObjectives]   = useState<OKRObjective[]>([]);
  const [epics, setEpics]             = useState<Epic[]>([]);

  useEffect(() => {
    async function fetchAll() {
      const supabase = createClient();
      const [sprintsRes, tasksRes, backlogRes, objectivesRes, krsRes, epicsRes] = await Promise.all([
        supabase.from("sprints").select("*").order("created_at"),
        supabase.from("tasks").select("*").is("parent_task_id", null),
        supabase.from("backlog_items").select("*"),
        supabase.from("objectives").select("*").order("created_at"),
        supabase.from("key_results").select("*"),
        supabase.from("epics").select("id, name, status, priority, color, stream").order("created_at"),
      ]);

      const krs: KeyResult[] = krsRes.data ?? [];
      const objs: OKRObjective[] = (objectivesRes.data ?? []).map((obj: Objective) => {
        const objKRs = krs.filter((kr) => kr.objective_id === obj.id);
        const progress =
          objKRs.length > 0
            ? Math.round(
                objKRs.reduce((sum, kr) => sum + Math.min(100, (kr.current_value / Math.max(kr.target_value, 1)) * 100), 0) /
                  objKRs.length
              )
            : 0;
        return { ...obj, key_results: objKRs, progress };
      });

      setSprints(sprintsRes.data ?? []);
      setTasks(tasksRes.data ?? []);
      setBacklogItems(backlogRes.data ?? []);
      setObjectives(objs);
      setEpics(epicsRes.data ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // ─── Derived Metrics ─────────────────────────────────────
  const activeSprint = sprints.find((s) => s.status === "active");

  const sprintMetrics: SprintMetric[] = useMemo(
    () =>
      sprints.map((s) => {
        const st = tasks.filter((t) => t.sprint_id === s.id);
        return {
          id: s.id,
          name: s.name,
          status: s.status,
          todo:        st.filter((t) => t.status === "todo").length,
          in_progress: st.filter((t) => t.status === "in_progress").length,
          review:      st.filter((t) => t.status === "review").length,
          done:        st.filter((t) => t.status === "done").length,
          total:       st.length,
          sp_done:  st.filter((t) => t.status === "done").reduce((a, t) => a + (t.story_points ?? 0), 0),
          sp_total: st.reduce((a, t) => a + (t.story_points ?? 0), 0),
        };
      }),
    [sprints, tasks]
  );

  const activeSprintMetric = activeSprint ? sprintMetrics.find((s) => s.id === activeSprint.id) : null;

  const avgVelocity = useMemo(() => {
    const completed = sprintMetrics.filter((s) => s.status === "completed" && s.sp_done > 0);
    return completed.length > 0
      ? Math.round(completed.reduce((a, s) => a + s.sp_done, 0) / completed.length)
      : null;
  }, [sprintMetrics]);

  const allKRs = objectives.flatMap((o) => o.key_results);
  const avgOKR = allKRs.length > 0
    ? Math.round(allKRs.reduce((a, kr) => a + Math.min(100, (kr.current_value / Math.max(kr.target_value, 1)) * 100), 0) / allKRs.length)
    : null;

  const backlogInSprint = backlogItems.filter((b) => b.sprint_id != null).length;

  const epicProgress: EpicProgress[] = useMemo(
    () =>
      epics.map((e) => {
        const et = tasks.filter(
          (t) =>
            t.epic === e.id ||
            t.epic?.toLowerCase() === e.name?.toLowerCase()
        );
        return {
          id: e.id,
          name: e.name,
          color: e.color,
          todo:        et.filter((t) => t.status === "todo").length,
          in_progress: et.filter((t) => t.status === "in_progress").length,
          review:      et.filter((t) => t.status === "review").length,
          done:        et.filter((t) => t.status === "done").length,
          total:       et.length,
        };
      }),
    [epics, tasks]
  );

  const priorityCounts = useMemo(
    () => ({
      critical: tasks.filter((t) => t.priority === "critical").length,
      high:     tasks.filter((t) => t.priority === "high").length,
      medium:   tasks.filter((t) => t.priority === "medium").length,
      low:      tasks.filter((t) => t.priority === "low").length,
    }),
    [tasks]
  );
  const maxPriority = Math.max(...Object.values(priorityCounts), 1);

  const moscowCounts = useMemo(
    () => ({
      must:   backlogItems.filter((b) => b.moscow_priority === "must").length,
      should: backlogItems.filter((b) => b.moscow_priority === "should").length,
      could:  backlogItems.filter((b) => b.moscow_priority === "could").length,
      wont:   backlogItems.filter((b) => b.moscow_priority === "wont").length,
    }),
    [backlogItems]
  );
  const totalBacklog = backlogItems.length;

  // ─── Export ───────────────────────────────────────────────
  function exportReport() {
    const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    const statusLabel = (s: string) =>
      s === "active" ? "Ativo" : s === "completed" ? "Concluído" : "Planejando";
    const statusBadgeClass = (s: string) =>
      s === "active" ? "#dbeafe;color:#1d4ed8" : s === "completed" ? "#d1fae5;color:#065f46" : "#fef3c7;color:#92400e";
    const progressColor = (pct: number) =>
      pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Analytics de Produto — ${date}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',system-ui,sans-serif;color:#111;background:#fff;padding:40px;font-size:13px;line-height:1.5}
  h1{font-size:22px;font-weight:800;color:#0f172a}
  h2{font-size:13px;font-weight:700;color:#1e293b;margin:24px 0 10px;padding-bottom:6px;border-bottom:2px solid #e2e8f0;text-transform:uppercase;letter-spacing:.04em}
  .header{border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:4px}
  .subtitle{color:#64748b;font-size:12px;margin-top:4px}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}
  .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px}
  .kpi-label{font-size:10px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:.05em}
  .kpi-value{font-size:26px;font-weight:800;color:#0f172a;margin:4px 0}
  .kpi-sub{font-size:11px;color:#94a3b8}
  table{width:100%;border-collapse:collapse;margin-top:4px}
  th{background:#f8fafc;font-size:10px;font-weight:700;color:#475569;text-align:left;padding:7px 10px;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:.03em}
  td{font-size:12px;padding:7px 10px;border-bottom:1px solid #f1f5f9;color:#334155;vertical-align:middle}
  tr:last-child td{border-bottom:none}
  .badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 7px;border-radius:9999px}
  .bar{background:#e2e8f0;border-radius:4px;height:5px;overflow:hidden}
  .bar-fill{height:100%;border-radius:4px}
  .obj-card{margin-bottom:14px;padding:12px 14px;background:#f8fafc;border-radius:8px;border-left:3px solid #3b82f6}
  .kr-table th{background:#f1f5f9}
  .footer{margin-top:36px;padding-top:12px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;text-align:center}
  @media print{body{padding:20px}@page{margin:1.5cm}}
</style>
</head>
<body>
<div class="header">
  <h1>Analytics de Produto</h1>
  <p class="subtitle">Relatório gerado em ${date} às ${time}</p>
</div>

<div class="kpi-grid">
  <div class="kpi">
    <p class="kpi-label">Sprint Ativo</p>
    <p class="kpi-value">${activeSprintMetric ? `${activeSprintMetric.done}<span style="font-size:16px;color:#94a3b8">/${activeSprintMetric.total}</span>` : "—"}</p>
    <p class="kpi-sub">${activeSprintMetric ? "tasks concluídas" : activeSprint ? activeSprint.name : "sem sprint ativo"}</p>
  </div>
  <div class="kpi">
    <p class="kpi-label">Velocidade Média</p>
    <p class="kpi-value">${avgVelocity !== null ? avgVelocity : "—"}<span style="font-size:14px;color:#94a3b8;font-weight:500"> SP</span></p>
    <p class="kpi-sub">${sprintMetrics.filter((s) => s.status === "completed").length} sprint(s) concluído(s)</p>
  </div>
  <div class="kpi">
    <p class="kpi-label">Progresso OKR</p>
    <p class="kpi-value" style="color:${avgOKR !== null ? progressColor(avgOKR) : "#94a3b8"}">${avgOKR !== null ? `${avgOKR}%` : "—"}</p>
    <p class="kpi-sub">${objectives.length} objetivo${objectives.length !== 1 ? "s" : ""} cadastrado${objectives.length !== 1 ? "s" : ""}</p>
  </div>
  <div class="kpi">
    <p class="kpi-label">Backlog em Sprint</p>
    <p class="kpi-value">${totalBacklog > 0 ? `${Math.round((backlogInSprint / totalBacklog) * 100)}%` : "—"}</p>
    <p class="kpi-sub">${backlogInSprint} de ${totalBacklog} itens alocados</p>
  </div>
</div>

<h2>Throughput por Sprint</h2>
${sprintMetrics.length === 0
  ? `<p style="color:#94a3b8;font-size:12px;padding:8px 0">Nenhum sprint encontrado.</p>`
  : `<table>
  <thead><tr><th>Sprint</th><th>Status</th><th>To Do</th><th>Em Progresso</th><th>Review</th><th>Concluído</th><th>Total Tasks</th><th>SP Entregues</th><th>SP Total</th><th>Conclusão</th></tr></thead>
  <tbody>${sprintMetrics.map((s) => {
    const pct = s.sp_total > 0 ? Math.round((s.sp_done / s.sp_total) * 100) : s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
    return `<tr>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge" style="background:${statusBadgeClass(s.status)}">${statusLabel(s.status)}</span></td>
      <td>${s.todo}</td><td>${s.in_progress}</td><td>${s.review}</td><td>${s.done}</td>
      <td>${s.total}</td><td>${s.sp_done}</td><td>${s.sp_total}</td>
      <td><strong style="color:${progressColor(pct)}">${pct}%</strong></td>
    </tr>`;
  }).join("")}</tbody>
</table>`}

<h2>Objetivos & Key Results</h2>
${objectives.length === 0
  ? `<p style="color:#94a3b8;font-size:12px;padding:8px 0">Nenhum objetivo cadastrado.</p>`
  : objectives.map((obj) => `
<div class="obj-card">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
    <div>
      <strong style="font-size:13px">${obj.title}</strong>
      <p style="font-size:11px;color:#64748b;margin-top:2px">${obj.quarter} · ${OKR_STATUS_META[obj.status]?.label ?? obj.status}</p>
    </div>
    <span style="font-size:15px;font-weight:800;color:${progressColor(obj.progress)}">${obj.progress}%</span>
  </div>
  <div class="bar" style="margin-bottom:${obj.key_results.length > 0 ? "10px" : "0"}">
    <div class="bar-fill" style="width:${obj.progress}%;background:${progressColor(obj.progress)}"></div>
  </div>
  ${obj.key_results.length > 0 ? `
  <table class="kr-table" style="margin-top:4px">
    <thead><tr><th>Key Result</th><th>Atual</th><th>Meta</th><th>Unidade</th><th>Progresso</th></tr></thead>
    <tbody>${obj.key_results.map((kr) => {
      const krPct = Math.min(100, Math.round((kr.current_value / Math.max(kr.target_value, 1)) * 100));
      return `<tr>
        <td>${kr.title}</td>
        <td>${kr.current_value}</td>
        <td>${kr.target_value}</td>
        <td>${kr.unit}</td>
        <td><strong style="color:${progressColor(krPct)}">${krPct}%</strong></td>
      </tr>`;
    }).join("")}</tbody>
  </table>` : ""}
</div>`).join("")}

<h2>Progresso por Épico</h2>
${epicProgress.length === 0
  ? `<p style="color:#94a3b8;font-size:12px;padding:8px 0">Nenhum épico cadastrado.</p>`
  : `<table>
  <thead><tr><th>Épico</th><th>To Do</th><th>Em Progresso</th><th>Review</th><th>Concluído</th><th>Total Tasks</th><th>% Conclusão</th></tr></thead>
  <tbody>${epicProgress.map((e) => {
    const pct = e.total > 0 ? Math.round((e.done / e.total) * 100) : 0;
    return `<tr>
      <td><strong>${e.name}</strong></td>
      <td>${e.todo}</td><td>${e.in_progress}</td><td>${e.review}</td><td>${e.done}</td><td>${e.total}</td>
      <td><strong style="color:${progressColor(pct)}">${pct}%</strong></td>
    </tr>`;
  }).join("")}</tbody>
</table>`}

<h2>Backlog — Priorização MoSCoW</h2>
${totalBacklog === 0
  ? `<p style="color:#94a3b8;font-size:12px;padding:8px 0">Nenhum item no backlog.</p>`
  : `<table>
  <thead><tr><th>Categoria</th><th>Itens</th><th>Em Sprint</th><th>Story Points</th><th>% do Backlog</th></tr></thead>
  <tbody>${(Object.entries(moscowCounts) as [keyof typeof MOSCOW_META, number][]).map(([key, count]) => {
    const pct = totalBacklog > 0 ? Math.round((count / totalBacklog) * 100) : 0;
    const inSprint = backlogItems.filter((b) => b.moscow_priority === key && b.sprint_id != null).length;
    const sp = backlogItems.filter((b) => b.moscow_priority === key).reduce((a, b) => a + (b.story_points ?? 0), 0);
    return `<tr>
      <td><strong>${MOSCOW_META[key].label}</strong></td>
      <td>${count}</td><td>${inSprint}</td><td>${sp} SP</td>
      <td>${pct}%</td>
    </tr>`;
  }).join("")}</tbody>
</table>`}

<div class="footer">Central de Produto · Analytics Report · ${date} às ${time}</div>
<script>window.print();</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  // ─── Render ───────────────────────────────────────────────
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
          <h1 className="text-xl font-bold text-gray-900">Analytics de Produto</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Velocidade, OKRs, épicos e backlog — dados em tempo real
          </p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 bg-white rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
        >
          <Download size={14} />
          Exportar PDF
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-4 gap-3">
        {/* Sprint ativo */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Sprint Ativo</p>
            <Zap size={14} className="text-blue-400" />
          </div>
          {activeSprintMetric ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {activeSprintMetric.done}
                <span className="text-base font-medium text-gray-400">/{activeSprintMetric.total}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">tasks concluídas</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Sem sprint ativo</p>
          )}
        </div>

        {/* Velocidade média */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Velocidade Média</p>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          {avgVelocity !== null ? (
            <>
              <p className="text-2xl font-bold text-gray-900">
                {avgVelocity}
                <span className="text-sm font-medium text-gray-400 ml-1">SP/sprint</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">sprints concluídos</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Aguardando dados</p>
          )}
        </div>

        {/* OKR Progress */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Progresso OKR</p>
            <Target size={14} className="text-purple-400" />
          </div>
          {avgOKR !== null ? (
            <>
              <p className="text-2xl font-bold text-gray-900">{avgOKR}%</p>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    avgOKR >= 70 ? "bg-emerald-500" : avgOKR >= 40 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${avgOKR}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-2">Sem OKRs cadastrados</p>
          )}
        </div>

        {/* Backlog coverage */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500">Backlog em Sprint</p>
            <LayoutList size={14} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {backlogInSprint}
            <span className="text-base font-medium text-gray-400">/{totalBacklog}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {totalBacklog > 0
              ? `${Math.round((backlogInSprint / totalBacklog) * 100)}% alocado`
              : "itens no backlog"}
          </p>
        </div>
      </div>

      {/* ── Sprint Throughput + Priority ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Sprint Throughput — 2 cols */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Throughput por Sprint</p>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição de tasks por status em cada sprint</p>
            </div>
            <div className="flex items-center gap-3">
              {(Object.entries(STATUS_COLORS) as [string, typeof STATUS_COLORS[keyof typeof STATUS_COLORS]][]).map(([, v]) => (
                <div key={v.label} className="flex items-center gap-1">
                  <div className={`w-2.5 h-2.5 rounded-sm ${v.bar}`} />
                  <span className="text-[10px] text-gray-400">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            {sprintMetrics.length === 0 ? (
              emptyState("Nenhum sprint encontrado")
            ) : (
              <div className="space-y-4">
                {sprintMetrics.map((s) => {
                  const max = Math.max(s.total, 1);
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-700 truncate max-w-[180px]">{s.name}</span>
                          {s.status === "active" && (
                            <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full">
                              ATIVO
                            </span>
                          )}
                          {s.status === "completed" && (
                            <CheckCircle2 size={11} className="text-emerald-500" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{s.total} task{s.total !== 1 ? "s" : ""}</span>
                      </div>
                      {s.total === 0 ? (
                        <div className="h-7 bg-gray-50 rounded-lg flex items-center px-3">
                          <span className="text-[10px] text-gray-300">Sem tasks</span>
                        </div>
                      ) : (
                        <div className="flex h-7 rounded-lg overflow-hidden gap-px">
                          {(["todo", "in_progress", "review", "done"] as const).map((st) => {
                            const count = s[st];
                            const pct = (count / max) * 100;
                            if (pct === 0) return null;
                            return (
                              <div
                                key={st}
                                className={`${STATUS_COLORS[st].bar} flex items-center justify-center transition-all`}
                                style={{ width: `${pct}%` }}
                                title={`${STATUS_COLORS[st].label}: ${count}`}
                              >
                                {pct > 12 && (
                                  <span className="text-[10px] font-bold text-white drop-shadow-sm">{count}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Story Points Summary */}
            {sprintMetrics.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">Story Points Entregues</p>
                <div className="flex items-end gap-2 h-16">
                  {sprintMetrics.map((s) => {
                    const maxSP = Math.max(...sprintMetrics.map((x) => x.sp_total), 1);
                    const donePct = s.sp_total > 0 ? (s.sp_done / s.sp_total) * 100 : 0;
                    const barH = Math.max((s.sp_total / maxSP) * 100, 8);
                    return (
                      <div key={s.id} className="flex-1 flex flex-col items-center gap-1 group" title={`${s.name}: ${s.sp_done}/${s.sp_total} SP`}>
                        <span className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {s.sp_done}/{s.sp_total}
                        </span>
                        <div
                          className="w-full rounded-t-md relative overflow-hidden bg-gray-100"
                          style={{ height: `${barH}%` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-emerald-400 transition-all"
                            style={{ height: `${donePct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 mt-1.5">
                  {sprintMetrics.map((s) => (
                    <div key={s.id} className="flex-1 text-center">
                      <span className="text-[9px] text-gray-300 truncate block">{s.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Priority Distribution — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">Prioridade das Tasks</p>
            <p className="text-xs text-gray-400 mt-0.5">{tasks.length} task{tasks.length !== 1 ? "s" : ""} no total</p>
          </div>
          <div className="p-5">
            {tasks.length === 0 ? (
              emptyState("Nenhuma task encontrada")
            ) : (
              <div className="space-y-4">
                {(Object.entries(priorityCounts) as [keyof typeof PRIORITY_META, number][]).map(([key, count]) => {
                  const meta = PRIORITY_META[key];
                  const pct = Math.round((count / tasks.length) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
                        <span className={`text-xs font-bold ${meta.text}`}>{count}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${meta.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Breakdown visual */}
            {tasks.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Distribuição</p>
                <div className="flex h-3 rounded-full overflow-hidden gap-px">
                  {(Object.entries(priorityCounts) as [keyof typeof PRIORITY_META, number][]).map(([key, count]) => {
                    const pct = (count / tasks.length) * 100;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={key}
                        className={`${PRIORITY_META[key].color} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${PRIORITY_META[key].label}: ${count}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Epic Progress ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Progresso por Épico</p>
            <p className="text-xs text-gray-400 mt-0.5">Tasks distribuídas por épico e status</p>
          </div>
          <span className="text-xs text-gray-400">{epics.length} épico{epics.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="p-6">
          {epicProgress.length === 0 ? (
            emptyState("Nenhum épico cadastrado")
          ) : (
            <div className="space-y-5">
              {epicProgress.map((e) => {
                const max = Math.max(e.total, 1);
                const donePct = Math.round((e.done / max) * 100);
                return (
                  <div key={e.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {e.color && (
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                        )}
                        <span className="text-xs font-semibold text-gray-800">{e.name}</span>
                        <span className="text-[10px] text-gray-400">{e.total} task{e.total !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        {e.done > 0    && <span className="text-emerald-600 font-semibold">{e.done} ✓</span>}
                        {e.review > 0  && <span className="text-amber-500 font-semibold">{e.review} review</span>}
                        {e.in_progress > 0 && <span className="text-blue-500 font-semibold">{e.in_progress} prog.</span>}
                        {e.todo > 0    && <span className="text-gray-400">{e.todo} pendente</span>}
                        <span className="font-bold text-gray-700">{donePct}%</span>
                      </div>
                    </div>
                    {e.total === 0 ? (
                      <div className="h-3 bg-gray-50 rounded-full flex items-center px-3">
                        <span className="text-[9px] text-gray-200">Sem tasks vinculadas</span>
                      </div>
                    ) : (
                      <div className="flex h-3 rounded-full overflow-hidden gap-px bg-gray-100">
                        {(["done", "review", "in_progress", "todo"] as const).map((st) => {
                          const count = e[st];
                          const pct = (count / max) * 100;
                          if (pct === 0) return null;
                          return (
                            <div
                              key={st}
                              className={`${STATUS_COLORS[st].bar} transition-all`}
                              style={{ width: `${pct}%` }}
                              title={`${STATUS_COLORS[st].label}: ${count}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── OKR Progress + Backlog MoSCoW ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* OKR Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Progresso OKR</p>
              <p className="text-xs text-gray-400 mt-0.5">Avanço médio dos Key Results por objetivo</p>
            </div>
            {avgOKR !== null && (
              <span className={`text-sm font-bold ${avgOKR >= 70 ? "text-emerald-600" : avgOKR >= 40 ? "text-amber-500" : "text-red-500"}`}>
                {avgOKR}% geral
              </span>
            )}
          </div>
          <div className="p-6">
            {objectives.length === 0 ? (
              emptyState("Nenhum objetivo cadastrado")
            ) : (
              <div className="space-y-5">
                {objectives.map((obj) => {
                  const statusMeta = OKR_STATUS_META[obj.status] ?? OKR_STATUS_META.on_track;
                  return (
                    <div key={obj.id}>
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{obj.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400">{obj.quarter}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${statusMeta.color}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-700 shrink-0">{obj.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${statusMeta.color}`}
                          style={{ width: `${obj.progress}%` }}
                        />
                      </div>
                      {obj.key_results.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {obj.key_results.map((kr) => {
                            const krPct = Math.min(100, Math.round((kr.current_value / Math.max(kr.target_value, 1)) * 100));
                            return (
                              <div key={kr.id} className="flex items-center gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] text-gray-500 truncate">{kr.title}</p>
                                </div>
                                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                  <div
                                    className="h-full bg-blue-400 rounded-full"
                                    style={{ width: `${krPct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">
                                  {kr.current_value}/{kr.target_value} {kr.unit}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Backlog MoSCoW */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-900">Backlog — Priorização MoSCoW</p>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição dos {totalBacklog} itens do backlog</p>
            </div>
          </div>
          <div className="p-6">
            {totalBacklog === 0 ? (
              emptyState("Nenhum item no backlog")
            ) : (
              <>
                {/* Stacked bar */}
                <div className="flex h-4 rounded-xl overflow-hidden gap-px mb-5">
                  {(Object.entries(moscowCounts) as [keyof typeof MOSCOW_META, number][]).map(([key, count]) => {
                    const pct = (count / totalBacklog) * 100;
                    if (pct === 0) return null;
                    return (
                      <div
                        key={key}
                        className={`${MOSCOW_META[key].color} transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${MOSCOW_META[key].label}: ${count}`}
                      />
                    );
                  })}
                </div>

                {/* Legend + details */}
                <div className="space-y-3.5">
                  {(Object.entries(moscowCounts) as [keyof typeof MOSCOW_META, number][]).map(([key, count]) => {
                    const meta = MOSCOW_META[key];
                    const pct = totalBacklog > 0 ? Math.round((count / totalBacklog) * 100) : 0;
                    const inSprint = backlogItems.filter(
                      (b) => b.moscow_priority === key && b.sprint_id != null
                    ).length;
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-sm ${meta.color}`} />
                            <span className="text-xs font-semibold text-gray-700">{meta.label}</span>
                            {inSprint > 0 && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${meta.light}`}>
                                {inSprint} em sprint
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700">{count}</span>
                            <span className="text-[10px] text-gray-400">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${meta.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Story Points summary */}
                {backlogItems.some((b) => b.story_points > 0) && (
                  <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                    {(Object.keys(moscowCounts) as (keyof typeof MOSCOW_META)[]).map((key) => {
                      const meta = MOSCOW_META[key];
                      const sp = backlogItems
                        .filter((b) => b.moscow_priority === key)
                        .reduce((a, b) => a + (b.story_points ?? 0), 0);
                      return (
                        <div key={key} className={`rounded-xl px-3 py-2 ${meta.light}`}>
                          <p className="text-[10px] font-semibold">{meta.label}</p>
                          <p className="text-sm font-bold mt-0.5">{sp} <span className="text-xs font-normal opacity-70">SP</span></p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
