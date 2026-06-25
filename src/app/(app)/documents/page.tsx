"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  FolderOpen, Upload, Download, Trash2, FileText, File,
  FileSpreadsheet, Presentation, Image, Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDocumentsAction, deleteDocumentAction,
  type DocumentRecord, type DocumentCategory,
} from "@/lib/actions/documents.actions";
import UploadModal from "./UploadModal";

// ── Category config ───────────────────────────────────────────────────────────

type CategoryConfig = { id: DocumentCategory | "all"; label: string; color: string };

const CATEGORIES: CategoryConfig[] = [
  { id: "all",         label: "Todos",                color: "text-gray-600 bg-gray-100"          },
  { id: "touchpoints", label: "Touchpoints Semanais", color: "text-violet-700 bg-violet-50"       },
  { id: "templates",   label: "Templates",            color: "text-blue-700 bg-blue-50"           },
  { id: "comercial",   label: "Política Comercial",   color: "text-emerald-700 bg-emerald-50"     },
  { id: "gtm",         label: "GTM & Checklists",     color: "text-orange-700 bg-orange-50"       },
  { id: "outros",      label: "Outros",               color: "text-gray-600 bg-gray-100"          },
];

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  touchpoints: "text-violet-700 bg-violet-50 border-violet-100",
  templates:   "text-blue-700 bg-blue-50 border-blue-100",
  comercial:   "text-emerald-700 bg-emerald-50 border-emerald-100",
  gtm:         "text-orange-700 bg-orange-50 border-orange-100",
  outros:      "text-gray-600 bg-gray-100 border-gray-200",
};

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  touchpoints: "Touchpoints",
  templates:   "Template",
  comercial:   "Pol. Comercial",
  gtm:         "GTM",
  outros:      "Outros",
};

// ── File type helpers ─────────────────────────────────────────────────────────

function getFileIcon(mime: string | null) {
  if (!mime) return File;
  if (mime.includes("pdf")) return FileText;
  if (mime.includes("word") || mime.includes("document")) return FileText;
  if (mime.includes("sheet") || mime.includes("excel")) return FileSpreadsheet;
  if (mime.includes("presentation") || mime.includes("powerpoint")) return Presentation;
  if (mime.startsWith("image/")) return Image;
  return File;
}

function getFileIconColor(mime: string | null) {
  if (!mime) return "text-gray-400 bg-gray-50";
  if (mime.includes("pdf")) return "text-red-500 bg-red-50";
  if (mime.includes("word") || mime.includes("document")) return "text-blue-500 bg-blue-50";
  if (mime.includes("sheet") || mime.includes("excel")) return "text-emerald-500 bg-emerald-50";
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "text-orange-500 bg-orange-50";
  if (mime.startsWith("image/")) return "text-purple-500 bg-purple-50";
  return "text-gray-400 bg-gray-50";
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── DocumentCard ──────────────────────────────────────────────────────────────

function DocumentCard({
  doc,
  onDelete,
}: {
  doc: DocumentRecord;
  onDelete: (id: string, filePath: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const Icon = getFileIcon(doc.mime_type);
  const iconColor = getFileIconColor(doc.mime_type);
  const catColor = CATEGORY_COLORS[doc.category];

  async function handleDownload() {
    setDownloading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600);
    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = doc.file_name;
      a.click();
    } else {
      toast.error(error?.message ?? "Erro ao gerar link de download.");
    }
    setDownloading(false);
  }

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 ${iconColor}`}>
          <Icon size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug truncate">{doc.name}</p>
          {doc.description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{doc.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${catColor}`}>
              {CATEGORY_LABELS[doc.category]}
            </span>
            <span className="text-[10px] text-gray-400">{formatDate(doc.created_at)}</span>
            {doc.file_size && (
              <span className="text-[10px] text-gray-400">{formatBytes(doc.file_size)}</span>
            )}
            {doc.uploaded_by && (
              <span className="text-[10px] text-gray-300 truncate max-w-[120px]">{doc.uploaded_by}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download"
            className="p-2 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          >
            <Download size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(doc.id, doc.file_path)}
                className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-[10px] font-bold border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Excluir"
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getDocumentsAction();
    setDocs(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleDelete(id: string, filePath: string) {
    startTransition(async () => {
      const res = await deleteDocumentAction(id, filePath);
      if (res.success) {
        setDocs((prev) => prev.filter((d) => d.id !== id));
        toast.success("Documento removido.");
      } else {
        toast.error(res.error ?? "Erro ao remover documento.");
      }
    });
  }

  const filtered = docs.filter((d) => {
    const matchesCategory = activeCategory === "all" || d.category === activeCategory;
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.description ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const countByCategory = (cat: DocumentCategory | "all") =>
    cat === "all" ? docs.length : docs.filter((d) => d.category === cat).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center gap-4 shrink-0">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <FolderOpen size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">Documentos</h1>
          <p className="text-xs text-gray-400 mt-0.5">Centralizador de docs do time de produto</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Upload size={14} />
          Upload
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 pt-4 pb-2 bg-white border-b border-gray-100 shrink-0">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar documentos…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm placeholder-gray-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const count = countByCategory(cat.id);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FolderOpen size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-400">
              {search ? "Nenhum documento encontrado" : "Nenhum documento nesta categoria"}
            </p>
            {!search && (
              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
              >
                Fazer upload do primeiro
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-5xl">
            {filtered.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={(doc) => setDocs((prev) => [doc, ...prev])}
        />
      )}
    </div>
  );
}
