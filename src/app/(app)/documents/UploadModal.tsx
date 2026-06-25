"use client";

import { useState, useRef, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, Upload, File, AlertCircle, CheckCircle } from "lucide-react";
import Modal, { ModalHeader } from "@/components/ui/Modal";
import { saveDocumentAction, type DocumentCategory, type DocumentRecord } from "@/lib/actions/documents.actions";

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "touchpoints", label: "Touchpoints Semanais" },
  { value: "templates",   label: "Templates"            },
  { value: "comercial",   label: "Política Comercial"   },
  { value: "gtm",         label: "GTM & Checklists"     },
  { value: "outros",      label: "Outros"               },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Props = {
  onClose: () => void;
  onUploaded: (doc: DocumentRecord) => void;
};

type UploadState = "idle" | "uploading" | "saving" | "done" | "error";

export default function UploadModal({ onClose, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "outros" as DocumentCategory,
  });

  function handleFileSelect(f: File) {
    setFile(f);
    if (!form.name) setForm((prev) => ({ ...prev, name: f.name.replace(/\.[^.]+$/, "") }));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setErrorMsg("Selecione um arquivo."); return; }
    if (!form.name.trim()) { setErrorMsg("Nome é obrigatório."); return; }

    setErrorMsg(null);
    setUploadState("uploading");
    setProgress(10);

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const ext = file.name.split(".").pop() ?? "bin";
      const randomId = crypto.randomUUID();
      const filePath = `${form.category}/${randomId}.${ext}`;

      setProgress(30);

      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { contentType: file.type, upsert: false });

      if (storageError) throw storageError;

      setProgress(70);
      setUploadState("saving");

      const res = await saveDocumentAction({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      });

      setProgress(100);

      if (!res.success) throw new Error(res.error);

      setUploadState("done");
      setTimeout(() => {
        onUploaded(res.data);
        onClose();
      }, 600);
    } catch (err: any) {
      setUploadState("error");
      setErrorMsg(err.message ?? "Erro no upload.");
    }
  }

  const uploadingOrDone = uploadState === "uploading" || uploadState === "saving" || uploadState === "done";

  return (
    <Modal onClose={onClose} size="md" blocking={uploadingOrDone}>
      <ModalHeader
        icon={<div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><Upload size={15} className="text-white" /></div>}
        title="Novo Documento"
        subtitle="Máx. 50 MB · PDF, DOCX, XLSX, PPT, imagens"
        onClose={!uploadingOrDone ? onClose : undefined}
      />
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !file && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              file
                ? "border-blue-300 bg-blue-50/50"
                : dragging
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
            />
            {file ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                  <File size={18} className="text-blue-500" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                  <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
                </div>
                {!uploadingOrDone && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="p-1 rounded-lg hover:bg-white transition-colors"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                )}
              </div>
            ) : (
              <div>
                <Upload size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">Arraste ou clique para selecionar</p>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nome *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={uploadingOrDone}
              placeholder="ex: Touchpoint Semana 24"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Descrição</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={uploadingOrDone}
              placeholder="Resumo do conteúdo (opcional)"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as DocumentCategory }))}
              disabled={uploadingOrDone}
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white disabled:opacity-50 appearance-none"
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Progress bar */}
          {uploadingOrDone && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">
                  {uploadState === "uploading" ? "Enviando arquivo…" : uploadState === "saving" ? "Salvando metadados…" : "Concluído!"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${uploadState === "done" ? "bg-emerald-500" : "bg-blue-500"}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              {errorMsg}
            </div>
          )}

          {/* Done */}
          {uploadState === "done" && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
              <CheckCircle size={13} className="shrink-0" />
              Documento enviado com sucesso!
            </div>
          )}

          {/* Actions */}
          {uploadState === "idle" || uploadState === "error" ? (
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!file}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar
              </button>
            </div>
          ) : null}
        </form>
    </Modal>
  );
}
