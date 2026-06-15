"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, Clock, User, Tag } from "lucide-react";
import type { CommercialClient } from "@/lib/services/commercial.service";

const PRODUCT_LABELS: Record<string, string> = {
  white_label: "Whitelabel",
  ibaas: "IBaaS",
  ca:    "C/A",
  dcc:   "DCC",
};

const CHANNEL_LABELS: Record<string, string> = {
  inbound: "Inbound",
  partner: "Parceiro",
  outbound: "Outbound",
  existing: "Base",
};

function getSLAWarning(client: CommercialClient): string | null {
  const now = Date.now();
  const DAY = 86_400_000;

  if (client.stage === "nda" && client.nda_sent_at) {
    const sent = new Date(client.nda_sent_at).getTime();
    const diff = Math.floor((now - sent) / DAY);
    if (diff >= 7) return `NDA enviado há ${diff} dias`;
  }

  if (client.stage === "proposal" && client.contract_sent_at) {
    const sent = new Date(client.contract_sent_at).getTime();
    const diff = Math.floor((now - sent) / DAY);
    if (diff >= 14) return `Contrato enviado há ${diff} dias`;
  }

  if (client.stage === "homologation") {
    const ref = client.contract_signed_at ?? client.portal_access_at;
    if (ref) {
      const diff = Math.floor((now - new Date(ref).getTime()) / DAY);
      if (diff >= 30) return `Em homologação há ${diff} dias`;
    }
  }

  return null;
}

type Props = {
  client: CommercialClient;
  onClick: () => void;
};

export default function CommercialCard({ client, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: client.id,
    data: { client },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  const sla = getSLAWarning(client);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer select-none touch-none"
    >
      {/* Company name */}
      <p className="text-sm font-bold text-gray-900 leading-snug mb-2">{client.company_name}</p>

      {/* Product tags */}
      {client.product_type.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {client.product_type.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
              <Tag size={8} />
              {PRODUCT_LABELS[p] ?? p}
            </span>
          ))}
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center gap-3 text-[10px] text-gray-400">
        {client.owner && (
          <span className="flex items-center gap-1">
            <User size={9} />
            {client.owner}
          </span>
        )}
        {client.origin_channel && (
          <span className="flex items-center gap-1">
            <Clock size={9} />
            {CHANNEL_LABELS[client.origin_channel] ?? client.origin_channel}
          </span>
        )}
        {client.contract_mrr != null && (
          <span className="ml-auto font-bold text-emerald-600">
            R$ {Number(client.contract_mrr).toLocaleString("pt-BR")}
          </span>
        )}
      </div>

      {/* SLA warning */}
      {sla && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
          <AlertTriangle size={10} className="shrink-0" />
          {sla}
        </div>
      )}

      {/* Blocker indicator */}
      {client.blockers && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">
          <AlertTriangle size={10} className="shrink-0" />
          {client.blockers.length > 60 ? client.blockers.slice(0, 60) + "…" : client.blockers}
        </div>
      )}
    </div>
  );
}
