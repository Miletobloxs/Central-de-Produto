"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import { X, ChevronRight, Clock, Tag, User, Mail, Link as LinkIcon, AlertTriangle, Plus, CheckCircle, ArrowRight, MessageSquare, Phone, FileText } from "lucide-react";
import { updateClientAction, getActivitiesAction, addActivityAction } from "@/lib/actions/commercial.actions";
import type { CommercialClient, CommercialActivity, ActivityType } from "@/lib/services/commercial.service";

const STAGE_LABELS: Record<string, string> = {
  contact: "Contato Inicial", nda: "NDA", proposal: "Proposta / Contrato",
  homologation: "Homologação", active: "Cliente Ativo", closed: "Encerrado",
};

const PRODUCT_LABELS: Record<string, string> = {
  white_label: "Whitelabel", ibaas: "IBaaS", ca: "C/A", dcc: "DCC",
};

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  meeting:          CheckCircle,
  email:            Mail,
  call:             Phone,
  nda_sent:         FileText,
  nda_signed:       CheckCircle,
  contract_sent:    FileText,
  contract_signed:  CheckCircle,
  go_live:          CheckCircle,
  note:             MessageSquare,
  stage_change:     ArrowRight,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  meeting:          "bg-blue-100 text-blue-600",
  email:            "bg-gray-100 text-gray-600",
  call:             "bg-teal-100 text-teal-600",
  nda_sent:         "bg-yellow-100 text-yellow-600",
  nda_signed:       "bg-emerald-100 text-emerald-600",
  contract_sent:    "bg-orange-100 text-orange-600",
  contract_signed:  "bg-emerald-100 text-emerald-600",
  go_live:          "bg-purple-100 text-purple-600",
  note:             "bg-gray-100 text-gray-500",
  stage_change:     "bg-blue-100 text-blue-600",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

type Props = {
  client: CommercialClient;
  onClose: () => void;
  onUpdated: (client: CommercialClient) => void;
};

type Tab = "info" | "timeline";

export default function ClientDrawer({ client, onClose, onUpdated }: Props) {
  const [tab, setTab] = useState<Tab>("info");
  const [activities, setActivities] = useState<CommercialActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Add note
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const loadActivities = useCallback(async () => {
    setLoadingActivities(true);
    const data = await getActivitiesAction(client.id);
    setActivities(data);
    setLoadingActivities(false);
  }, [client.id]);

  useEffect(() => {
    if (tab === "timeline") loadActivities();
  }, [tab, loadActivities]);

  function startEdit(field: string, current: string | null) {
    setEditField(field);
    setEditValue(current ?? "");
  }

  function saveEdit() {
    if (!editField) return;
    startTransition(async () => {
      const res = await updateClientAction(client.id, { [editField]: editValue || null });
      if (res.success) { onUpdated(res.data); setEditField(null); }
    });
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    const res = await addActivityAction(client.id, { activity_type: "note", title: "Nota", description: noteText.trim() });
    if (res.success) {
      setNoteText("");
      loadActivities();
    }
    setAddingNote(false);
  }

  const EditableField = ({ label, field, value, type = "text" }: { label: string; field: string; value: string | null; type?: string }) => {
    if (editField === field) {
      return (
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <input
              autoFocus
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditField(null); }}
              className="w-full text-sm border border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button onClick={saveEdit} disabled={isPending} className="mt-6 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60">
            {isPending ? "…" : "OK"}
          </button>
          <button onClick={() => setEditField(null)} className="mt-6 px-3 py-1.5 border border-gray-200 text-gray-500 text-xs rounded-lg hover:bg-gray-50">
            ✕
          </button>
        </div>
      );
    }
    return (
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <button
          onClick={() => startEdit(field, value)}
          className="mt-0.5 text-sm text-gray-800 hover:text-blue-600 transition-colors text-left w-full group flex items-center gap-1"
        >
          <span className={value ? "" : "text-gray-300 italic"}>{value || "—"}</span>
          <ChevronRight size={11} className="text-gray-200 group-hover:text-blue-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white border-l border-gray-200 h-full w-full max-w-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-gray-900 truncate">{client.company_name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full shrink-0">
                {STAGE_LABELS[client.stage] ?? client.stage}
              </span>
            </div>
            <p className="text-xs text-gray-400">Criado em {formatDate(client.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 gap-4 border-b border-gray-100 shrink-0">
          {(["info", "timeline"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "info" ? "Informações" : "Histórico"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {tab === "info" && (
            <div className="p-6 space-y-5">
              {/* Products */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Produtos</p>
                <div className="flex flex-wrap gap-1.5">
                  {client.product_type.length > 0 ? client.product_type.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                      <Tag size={9} />{PRODUCT_LABELS[p] ?? p}
                    </span>
                  )) : <span className="text-sm text-gray-300 italic">—</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <EditableField label="Contato" field="contact_name" value={client.contact_name} />
                <EditableField label="E-mail" field="contact_email" value={client.contact_email} type="email" />
                <EditableField label="Owner" field="owner" value={client.owner} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Canal</p>
                  <p className="mt-0.5 text-sm text-gray-800">{client.origin_channel ?? "—"}</p>
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* NDA */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">NDA</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400">Enviado</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(client.nda_sent_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Assinado</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(client.nda_signed_at)}</p>
                  </div>
                </div>
                <EditableField label="URL do NDA" field="nda_url" value={client.nda_url} type="url" />
              </div>

              <div className="h-px bg-gray-100" />

              {/* Contract */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Contrato</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400">Enviado</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(client.contract_sent_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Assinado</p>
                    <p className={`text-sm font-medium ${client.contract_signed_at ? "text-emerald-600" : "text-gray-800"}`}>
                      {formatDate(client.contract_signed_at)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <EditableField label="URL do Contrato" field="contract_url" value={client.contract_url} type="url" />
                  <EditableField label="MRR (R$)" field="contract_mrr" value={client.contract_mrr?.toString() ?? null} type="number" />
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              {/* Timeline dates */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Marcos</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400">Acesso ao Portal</p>
                    <p className="text-sm font-medium text-gray-800">{formatDate(client.portal_access_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Go-Live</p>
                    <p className={`text-sm font-medium ${client.go_live_at ? "text-emerald-600" : "text-gray-800"}`}>
                      {formatDate(client.go_live_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockers */}
              <div>
                <EditableField label="Blockers" field="blockers" value={client.blockers} />
              </div>

              {/* Notes */}
              <div>
                <EditableField label="Notas gerais" field="notes" value={client.notes} />
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="p-6">
              {/* Add note form */}
              <form onSubmit={submitNote} className="mb-6 flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Adicionar nota…"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={16} />
                </button>
              </form>

              {loadingActivities && (
                <div className="text-xs text-gray-400 text-center py-8">Carregando…</div>
              )}

              {!loadingActivities && activities.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-8">Nenhuma atividade registrada.</div>
              )}

              <div className="relative">
                {activities.length > 0 && (
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />
                )}
                <div className="space-y-4">
                  {activities.map((act) => {
                    const Icon = ACTIVITY_ICONS[act.activity_type] ?? MessageSquare;
                    const color = ACTIVITY_COLORS[act.activity_type] ?? "bg-gray-100 text-gray-500";
                    return (
                      <div key={act.id} className="flex gap-4 items-start pl-0 relative">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 z-10 ${color}`}>
                          <Icon size={13} />
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{act.title}</p>
                            <span className="text-[10px] text-gray-400">{relativeTime(act.occurred_at)}</span>
                          </div>
                          {act.description && (
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{act.description}</p>
                          )}
                          {act.stage_from && act.stage_to && (
                            <p className="text-[10px] text-gray-400 mt-1">
                              {STAGE_LABELS[act.stage_from] ?? act.stage_from} → {STAGE_LABELS[act.stage_to] ?? act.stage_to}
                            </p>
                          )}
                          {act.recorded_by && (
                            <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1">
                              <User size={9} /> {act.recorded_by}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
