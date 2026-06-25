"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[480px] p-8 text-center">
      <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
        <AlertTriangle size={24} className="text-red-500" />
      </div>

      <h2 className="text-base font-bold text-gray-900 mb-1">Algo deu errado</h2>
      <p className="text-sm text-gray-500 mb-2 max-w-sm leading-relaxed">
        Ocorreu um erro ao carregar esta página. Isso pode ser temporário.
      </p>

      {error.digest && (
        <p className="text-[10px] font-mono text-gray-300 mb-6">ref: {error.digest}</p>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <RefreshCw size={14} />
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Home size={14} />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
