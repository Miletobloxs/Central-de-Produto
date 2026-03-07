"use client";

import { useState } from "react";
import { HelpCircle, X, MessageSquare, ExternalLink } from "lucide-react";

export default function SupportFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popover */}
      {isOpen && (
        <div className="mb-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-blue-600">
            <h3 className="text-white font-bold text-sm">Precisa de ajuda?</h3>
            <p className="text-blue-100 text-[11px] mt-1">
              Estamos aqui para apoiar sua jornada na Central de Produto.
            </p>
          </div>
          
          <div className="p-3 space-y-1">
            <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <MessageSquare size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Abrir Chamado</p>
                <p className="text-[10px] text-gray-400">Tempo de resposta: ~2h</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group text-left">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <ExternalLink size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Base de Conhecimento</p>
                <p className="text-[10px] text-gray-400">Tutoriais e processos</p>
              </div>
            </button>
          </div>
          
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-[10px] text-center text-gray-400 font-medium italic">
              "Transformando dados em decisões."
            </p>
          </div>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 active:scale-95 ${
          isOpen 
            ? "bg-white text-gray-900 rotate-90 ring-4 ring-blue-600/10" 
            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/20 hover:-translate-y-1"
        }`}
        aria-label="Abrir suporte"
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
}
