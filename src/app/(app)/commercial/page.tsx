"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { TrendingUp, Plus, Lock, AlertTriangle } from "lucide-react";
import { getClientsAction, updateStageAction } from "@/lib/actions/commercial.actions";
import type { CommercialClient, CommercialStage, ClosedReason } from "@/lib/services/commercial.service";
import CommercialCard from "./CommercialCard";
import NewClientModal from "./NewClientModal";
import ClientDrawer from "./ClientDrawer";

// ── Stage config ───────────────────────────────────────────────────────────────

type StageConfig = {
  id: CommercialStage;
  label: string;
  color: string;   // header accent
  dotColor: string;
  description: string;
};

const STAGES: StageConfig[] = [
  { id: "contact",      label: "Contato Inicial",     color: "bg-gray-100 text-gray-600",     dotColor: "bg-gray-400",    description: "Primeiro contato, qualificação" },
  { id: "nda",          label: "NDA",                 color: "bg-yellow-50 text-yellow-700",  dotColor: "bg-yellow-400",  description: "NDA enviado / em assinatura" },
  { id: "proposal",     label: "Proposta / Contrato", color: "bg-blue-50 text-blue-700",      dotColor: "bg-blue-500",    description: "Proposta comercial entregue" },
  { id: "homologation", label: "Homologação",         color: "bg-purple-50 text-purple-700",  dotColor: "bg-purple-500",  description: "Integração técnica e testes" },
  { id: "active",       label: "Cliente Ativo",       color: "bg-emerald-50 text-emerald-700",dotColor: "bg-emerald-500", description: "Go-live concluído" },
  { id: "closed",       label: "Encerrado",           color: "bg-red-50 text-red-600",        dotColor: "bg-red-400",     description: "Churn, perda ou desqualificado" },
];

// ── Gate validation ────────────────────────────────────────────────────────────

type GateError = {
  blocked: true;
  message: string;
};

function validateGate(client: CommercialClient, toStage: CommercialStage): GateError | null {
  const stageOrder: CommercialStage[] = ["contact", "nda", "proposal", "homologation", "active", "closed"];
  const fromIdx = stageOrder.indexOf(client.stage);
  const toIdx   = stageOrder.indexOf(toStage);

  // Allow moving back freely
  if (toIdx <= fromIdx && toStage !== "closed") return null;

  if (toStage === "nda" && fromIdx < 1) {
    // NDA gate: no hard gate, just a forward move — allow
    return null;
  }

  if (toStage === "proposal") {
    if (!client.nda_signed_at) {
      return { blocked: true, message: "O NDA precisa estar assinado antes de avançar para Proposta." };
    }
  }

  if (toStage === "homologation") {
    if (!client.contract_signed_at) {
      return { blocked: true, message: "O contrato precisa estar assinado antes de iniciar a Homologação." };
    }
  }

  if (toStage === "closed" && toIdx > fromIdx) {
    // handled via modal prompt for closed_reason — always allow the action but require reason
    return null;
  }

  return null;
}

// ── KanbanColumn ──────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  clients,
  onCardClick,
}: {
  stage: StageConfig;
  clients: CommercialClient[];
  onCardClick: (client: CommercialClient) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div className="flex flex-col min-w-[256px] max-w-[256px]">
      {/* Column header */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${stage.color}`}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${stage.dotColor}`} />
        <span className="text-xs font-bold flex-1">{stage.label}</span>
        <span className="text-[10px] font-bold opacity-60 px-1.5 py-0.5 bg-white/50 rounded-full">{clients.length}</span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] rounded-xl transition-colors space-y-2 p-2 ${
          isOver ? "bg-blue-50 border-2 border-dashed border-blue-300" : "bg-gray-50/50"
        }`}
      >
        {clients.map((client) => (
          <CommercialCard key={client.id} client={client} onClick={() => onCardClick(client)} />
        ))}
        {clients.length === 0 && (
          <p className="text-[10px] text-gray-300 text-center pt-6 italic">Sem clientes</p>
        )}
      </div>
    </div>
  );
}

// ── ClosedReasonModal ─────────────────────────────────────────────────────────

function ClosedReasonModal({ onConfirm, onCancel }: { onConfirm: (reason: ClosedReason) => void; onCancel: () => void }) {
  const [reason, setReason] = useState<ClosedReason>("lost");
  const options: { value: ClosedReason; label: string }[] = [
    { value: "lost",          label: "Perdido para concorrência" },
    { value: "churn",         label: "Churn (cliente encerrou)" },
    { value: "disqualified",  label: "Desqualificado" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-[20px] border border-gray-100 shadow-xl w-full max-w-sm mx-4 p-6">
        <p className="text-sm font-bold text-gray-900 mb-1">Motivo do encerramento</p>
        <p className="text-xs text-gray-500 mb-4">Por que este prospect está sendo encerrado?</p>
        <div className="space-y-2 mb-5">
          {options.map((o) => (
            <label key={o.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                value={o.value}
                checked={reason === o.value}
                onChange={() => setReason(o.value)}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{o.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={() => onConfirm(reason)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
            Encerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gate Error Toast ──────────────────────────────────────────────────────────

function GateToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white border border-amber-200 shadow-xl rounded-2xl p-4 max-w-sm">
      <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
        <Lock size={14} className="text-amber-600" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 mb-0.5">Gate bloqueado</p>
        <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommercialPage() {
  const [clients, setClients] = useState<CommercialClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClient, setActiveClient] = useState<CommercialClient | null>(null); // dragging
  const [drawerClient, setDrawerClient] = useState<CommercialClient | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // pending stage move requiring closed_reason
  const [pendingMove, setPendingMove] = useState<{ client: CommercialClient; toStage: CommercialStage } | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  const loadClients = useCallback(async () => {
    setLoading(true);
    const data = await getClientsAction();
    setClients(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  function clientsByStage(stage: CommercialStage) {
    return clients.filter((c) => c.stage === stage);
  }

  function handleDragStart({ active }: DragStartEvent) {
    const client = clients.find((c) => c.id === active.id);
    setActiveClient(client ?? null);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveClient(null);
    if (!over || active.id === over.id) return;

    const client = clients.find((c) => c.id === active.id);
    const toStage = over.id as CommercialStage;
    if (!client || client.stage === toStage) return;

    const gateErr = validateGate(client, toStage);
    if (gateErr) { setGateError(gateErr.message); return; }

    if (toStage === "closed") {
      setPendingMove({ client, toStage });
      return;
    }

    await commitMove(client, toStage);
  }

  async function commitMove(client: CommercialClient, toStage: CommercialStage, closedReason?: ClosedReason) {
    // Optimistic update
    setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, stage: toStage } : c));
    const res = await updateStageAction(client.id, toStage, closedReason, client.stage);
    if (res.success) {
      setClients((prev) => prev.map((c) => c.id === client.id ? res.data : c));
    } else {
      // Rollback
      setClients((prev) => prev.map((c) => c.id === client.id ? client : c));
      setGateError(res.error);
    }
  }

  function handleClientCreated(client: CommercialClient) {
    setClients((prev) => [...prev, client]);
  }

  function handleClientUpdated(updated: CommercialClient) {
    setClients((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setDrawerClient(updated);
  }

  const totalMRR = clients.filter((c) => c.stage === "active" && c.contract_mrr != null)
    .reduce((acc, c) => acc + Number(c.contract_mrr ?? 0), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center gap-4 shrink-0">
        <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <TrendingUp size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Gate Comercial</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pipeline IBaaS — {clients.length} prospects</p>
        </div>

        {totalMRR > 0 && (
          <div className="ml-4 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">MRR Ativo</p>
            <p className="text-sm font-bold text-emerald-700">R$ {totalMRR.toLocaleString("pt-BR")}</p>
          </div>
        )}

        <button
          onClick={() => setShowNewModal(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={15} />
          Novo Prospect
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm text-gray-400">Carregando…</div>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  clients={clientsByStage(stage.id)}
                  onCardClick={setDrawerClient}
                />
              ))}
            </div>

            <DragOverlay>
              {activeClient && (
                <div className="opacity-90 rotate-1 scale-105 pointer-events-none">
                  <CommercialCard client={activeClient} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals / Drawer */}
      {showNewModal && (
        <NewClientModal onClose={() => setShowNewModal(false)} onCreated={handleClientCreated} />
      )}

      {drawerClient && (
        <ClientDrawer
          client={drawerClient}
          onClose={() => setDrawerClient(null)}
          onUpdated={handleClientUpdated}
        />
      )}

      {pendingMove && (
        <ClosedReasonModal
          onConfirm={async (reason) => {
            const { client, toStage } = pendingMove;
            setPendingMove(null);
            await commitMove(client, toStage, reason);
          }}
          onCancel={() => setPendingMove(null)}
        />
      )}

      {gateError && <GateToast message={gateError} onDismiss={() => setGateError(null)} />}
    </div>
  );
}
