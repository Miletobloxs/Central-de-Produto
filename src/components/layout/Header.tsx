"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 gap-4 shrink-0">
      {/* Bloxs Logo */}
      <div className="flex items-center gap-2 mr-auto">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="1" fill="white" />
            <rect x="7" y="1" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" />
            <rect x="1" y="7" width="4" height="4" rx="1" fill="white" fillOpacity="0.7" />
            <rect x="7" y="7" width="4" height="4" rx="1" fill="white" fillOpacity="0.4" />
          </svg>
        </div>
        <span className="text-sm font-bold text-gray-800 tracking-wide">Bloxs</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3.5 py-2 w-72">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar no produto..."
          className="bg-transparent text-sm text-gray-600 outline-none placeholder-gray-400 w-full"
        />
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1.5">
        <button className="relative w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <HelpCircle size={16} />
        </button>
        <div className="w-8 h-8 rounded-full bg-amber-300 flex items-center justify-center text-xs font-bold text-amber-800 ml-1">
          AM
        </div>
      </div>
    </header>
  );
}
