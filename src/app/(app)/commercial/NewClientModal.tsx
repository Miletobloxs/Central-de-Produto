"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import Modal, { ModalHeader } from "@/components/ui/Modal";
import { createClientAction } from "@/lib/actions/commercial.actions";
import type { CommercialClient } from "@/lib/services/commercial.service";

const PRODUCT_OPTIONS = [
  { value: "white_label", label: "Whitelabel" },
  { value: "ibaas",       label: "IBaaS"      },
  { value: "ca",          label: "C/A"         },
  { value: "dcc",         label: "DCC"         },
];

const CHANNEL_OPTIONS = [
  { value: "inbound",  label: "Inbound"  },
  { value: "partner",  label: "Parceiro" },
  { value: "outbound", label: "Outbound" },
  { value: "existing", label: "Base"     },
];

type Props = {
  onClose: () => void;
  onCreated: (client: CommercialClient) => void;
};

export default function NewClientModal({ onClose, onCreated }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    owner: "",
    origin_channel: "",
    product_type: [] as string[],
  });

  function toggleProduct(val: string) {
    setForm((f) => ({
      ...f,
      product_type: f.product_type.includes(val)
        ? f.product_type.filter((p) => p !== val)
        : [...f.product_type, val],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) { setError("Nome da empresa é obrigatório."); return; }
    setError(null);
    startTransition(async () => {
      const res = await createClientAction({
        company_name: form.company_name.trim(),
        contact_name: form.contact_name.trim() || undefined,
        contact_email: form.contact_email.trim() || undefined,
        owner: form.owner.trim() || undefined,
        origin_channel: form.origin_channel || undefined,
        product_type: form.product_type.length > 0 ? form.product_type : undefined,
      });
      if (!res.success) { setError(res.error); return; }
      onCreated(res.data);
      onClose();
    });
  }

  return (
    <Modal onClose={onClose} size="md" blocking={isPending}>
      <ModalHeader
        icon={<div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><Plus size={16} className="text-white" /></div>}
        title="Novo Prospect"
        subtitle="Entrará no estágio Contato Inicial"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Empresa *</label>
            <input
              autoFocus
              type="text"
              value={form.company_name}
              onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
              placeholder="ex: Gaia Impacto"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Contact name + email */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Contato</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                placeholder="Nome"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">E-mail</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                placeholder="email@empresa.com"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Owner + channel */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Owner</label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
                placeholder="Responsável"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Canal</label>
              <select
                value={form.origin_channel}
                onChange={(e) => setForm((f) => ({ ...f, origin_channel: e.target.value }))}
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white appearance-none"
              >
                <option value="">—</option>
                {CHANNEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products */}
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">Produtos</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRODUCT_OPTIONS.map((p) => {
                const selected = form.product_type.includes(p.value);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => toggleProduct(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Criando…" : "Criar Prospect"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
