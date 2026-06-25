"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

type Props = {
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  /** Set true when an async action is running — prevents click-outside close */
  blocking?: boolean;
};

export default function Modal({ onClose, children, size = "md", blocking = false }: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape" && !blocking) onClose(); },
    [onClose, blocking],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={blocking ? undefined : onClose}
      />
      <div className={`relative bg-white rounded-[20px] border border-gray-100 shadow-xl w-full mx-4 overflow-hidden ${SIZE_CLASSES[size]}`}>
        {children}
      </div>
    </div>
  );
}

type ModalHeaderProps = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  onClose?: () => void;
};

export function ModalHeader({ icon, title, subtitle, onClose }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {icon && <div className="shrink-0">{icon}</div>}
        <div>
          <p className="text-sm font-bold text-gray-900">{title}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X size={16} className="text-gray-500" />
        </button>
      )}
    </div>
  );
}
