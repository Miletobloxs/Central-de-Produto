"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Map,
  ListTodo,
  Zap,
  Tag,
  MessageSquare,
  Settings,
  BarChart3,
  Activity,
  AlertOctagon,
  BookOpen,
  Building2,
  Flag,
  FileText,
  GitBranch,
  ShieldAlert,
  Library,
  TrendingUp,
  FolderOpen,
} from "lucide-react";
import { accessService, type Permission, type UserAccessInfo } from "@/lib/services/access.service";
import { getCurrentUserAction } from "@/lib/actions/auth.actions";

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
      { href: "/okrs",     label: "OKRs & Metas", icon: Target   },
      { href: "/roadmap",  label: "Roadmap",       icon: Map      },
      { href: "/backlog",  label: "Backlog",        icon: ListTodo },
    ],
  },
  {
    label: "Execução",
    items: [
      { href: "/sprints",  label: "Sprints",        icon: Zap   },
      { href: "/releases", label: "Releases",        icon: Tag   },
      { href: "/flags",    label: "Feature Flags",   icon: Flag  },
    ],
  },
  {
    label: "Análise",
    items: [
      { href: "/analytics", label: "Analytics",     icon: BarChart3     },
      { href: "/feedback",  label: "Feedback / NPS", icon: MessageSquare },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { href: "/sprint-review", label: "Sprint Review",     icon: FileText  },
      { href: "/decisions",     label: "Mural de Decisões", icon: GitBranch },
      { href: "/wiki",          label: "Wiki de Produtos",  icon: Library    },
      { href: "/documents",     label: "Documentos",        icon: FolderOpen },
    ],
  },
  {
    label: "Descoberta",
    items: [
      { href: "/discovery",   label: "Discovery Hub",       icon: BookOpen  },
      { href: "/competitive", label: "Competitive Intel.",   icon: Building2 },
    ],
  },
  {
    label: "Observabilidade",
    items: [
      { href: "/health",    label: "Health Monitor", icon: Activity     },
      { href: "/incidents", label: "Incidentes",     icon: ShieldAlert  },
    ],
  },
  {
    label: "Comercial",
    items: [
      { href: "/commercial", label: "Gate Comercial", icon: TrendingUp },
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
  const [user, setUser] = useState<UserAccessInfo | null>(null);

  useEffect(() => {
    getCurrentUserAction().then((u) => setUser(u ?? null));
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const canSee = (item: NavItem) => {
    if (!item.requiredPermission) return true;
    if (!user) return false;
    return accessService.can(user, item.requiredPermission);
  };

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
          const visibleItems = group.items.filter(canSee);
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
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                          active
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
    </aside>
  );
}
