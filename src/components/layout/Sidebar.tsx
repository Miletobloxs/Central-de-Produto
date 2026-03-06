"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Map,
  ListTodo,
  Zap,
  Tag,
  MessageSquare,
  Settings,
  HelpCircle,
  BarChart3,
  Activity,
  AlertOctagon,
  BookOpen,
  Building2,
  Flag,
  FileText,
  GitBranch,
  Users,
} from "lucide-react";
import { accessService, Permission } from "@/lib/services/access.service";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredPermission?: Permission;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { href: "/okrs", label: "OKRs & Metas", icon: Target },
      { href: "/roadmap", label: "Roadmap", icon: Map },
      { href: "/backlog", label: "Backlog", icon: ListTodo },
    ],
  },
  {
    label: "Execução",
    items: [
      { href: "/sprints", label: "Sprints", icon: Zap },
      { href: "/releases", label: "Releases", icon: Tag },
      { href: "/flags", label: "Feature Flags", icon: Flag },
    ],
  },
  {
    label: "Análise",
    items: [
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/feedback", label: "Feedback / NPS", icon: MessageSquare },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { href: "/sprint-review", label: "Sprint Review", icon: FileText },
      { href: "/decisions", label: "Mural de Decisões", icon: GitBranch },
    ],
  },
  {
    label: "Descoberta",
    items: [
      { href: "/discovery", label: "Discovery Hub", icon: BookOpen },
      { href: "/competitive", label: "Competitive Intel.", icon: Building2 },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/configuracoes", label: "Configurações", icon: Settings, requiredPermission: "ORCHESTRATE_PRODUCT" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="w-64 min-w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.7" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 leading-none mb-0.5">Powered by</p>
            <p className="text-sm font-bold text-gray-900 leading-none tracking-wide">Bloxs</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pt-4 pb-2 overflow-y-auto space-y-4">
        {navGroups.map((group, gi) => {
          // Filtrar itens do grupo com base nas permissões
          const visibleItems = group.items.filter(item => {
            if (!item.requiredPermission) return true;
            // Mock do usuário atual (será Admin para este exemplo)
            const mockUser = { role: 'ADMIN' as any };
            return accessService.can(mockUser, item.requiredPermission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={gi}>
              {group.label && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-1.5">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                      >
                        <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Help Box */}
      <div className="p-4">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <HelpCircle size={13} className="text-blue-600" />
            </div>
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
              Ajuda / Suporte
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            Dúvidas sobre o roadmap ou processos de sprint?
          </p>
          <button className="w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Abrir Chamado
          </button>
        </div>
      </div>
    </aside>
  );
}
