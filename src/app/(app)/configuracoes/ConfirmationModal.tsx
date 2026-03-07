"use client";

import { Info, AlertTriangle, AlertCircle, X, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type ModalType = "info" | "warning" | "danger" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ModalType;
  isLoading?: boolean;
}

const TYPE_CONFIG = {
  info: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600",
    confirmClass: "bg-blue-600 hover:bg-blue-700 shadow-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-600",
    confirmClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-100",
  },
  danger: {
    icon: AlertCircle,
    iconClass: "bg-red-100 text-red-600",
    confirmClass: "bg-red-600 hover:bg-red-700 shadow-red-100",
  },
  success: {
    icon: Info,
    iconClass: "bg-emerald-100 text-emerald-600",
    confirmClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
  isLoading = false,
}: ConfirmationModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? "bg-gray-900/40 backdrop-blur-sm opacity-100" : "bg-transparent backdrop-blur-none opacity-0"}`}>
      <div 
        className={`bg-white rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 transform ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-4 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${config.iconClass} animate-bounce[animation-duration:2s]`}>
            <Icon size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>

        <div className="p-8 pt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${config.confirmClass} disabled:opacity-50`}
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}
            {confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
