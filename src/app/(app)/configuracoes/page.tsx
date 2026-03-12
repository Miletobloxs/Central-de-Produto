"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Users, Plug, Globe, Save, Check, Plus, MoreVertical, Settings2, Loader2, CheckCircle2, Trash2, UserPlus, UserCog, Clock, Copy, Mail } from "lucide-react";
import { InviteModal } from "./InviteModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { toast } from "sonner";
import type { Permission } from "@/lib/services/access.service";
import { UserRole } from "@/lib/types/enums";
import { TeamSettings } from "./TeamSettings";
import type { TeamUser, TeamGroup, TeamInvite } from "@/lib/services/team.service";

const AVAILABLE_PERMISSIONS = [
  { id: 'ORCHESTRATE_PRODUCT' as Permission, label: 'Orquestrar Produto', desc: 'Gerenciar Roadmaps, Épicos e Configurações' },
  { id: 'CREATE_TASK' as Permission, label: 'Criar Tarefas', desc: 'Adicionar novos itens ao backlog ou sprints' },
  { id: 'MOVE_CARDS' as Permission, label: 'Mover Cards', desc: 'Gestar o fluxo de trabalho no board' },
  { id: 'VIEW_REPORTS' as Permission, label: 'Ver Relatórios', desc: 'Acesso a dashboards de analytics e saúde' },
  { id: 'PARTICIPATE_REVIEWS' as Permission, label: 'Participar de Reviews', desc: 'Comentar e votar em revisões de sprint' },
];

type Tab = "geral" | "notificacoes" | "equipe" | "integracoes";
type SubTab = "colaboradores" | "grupos";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Geral", icon: Globe },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "equipe", label: "Equipe & Acesso", icon: Users },
  { id: "integracoes", label: "Integrações", icon: Plug },
];

const integrations = [
  { name: "GitHub", desc: "Repositórios e commits vinculados às tasks", connected: true, icon: "GH", color: "bg-gray-900 text-white" },
  { name: "Supabase", desc: "Banco de dados e autenticação", connected: true, icon: "SB", color: "bg-emerald-600 text-white" },
  { name: "Slack", desc: "Notificações automáticas de sprint e deploy", connected: true, icon: "SL", color: "bg-purple-600 text-white" },
  { name: "Vercel", desc: "Deploy contínuo e ambientes de preview", connected: false, icon: "VC", color: "bg-black text-white" },
  { name: "Jira", desc: "Sincronização bidirecional de issues", connected: false, icon: "JR", color: "bg-blue-600 text-white" },
  { name: "Figma", desc: "Designs vinculados aos épicos", connected: false, icon: "FG", color: "bg-pink-500 text-white" },
];

const INTERNAL_ROLES = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.BOARD]: "Conselho (Board)",
  [UserRole.DEVELOPER]: "Desenvolvedor",
  [UserRole.BLOXXS_TEAM]: "Time Bloxs",
  [UserRole.ORIGINADOR]: "Originador",
  [UserRole.DISTRIBUIDOR]: "Distribuidor",
  [UserRole.ASSESSOR]: "Assessor",
  [UserRole.INVESTIDOR]: "Investidor",
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("equipe");
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/team/config');
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setGroups(data.groups || []);
      setUsers(data.users || []);
      setInvites(data.invites || []); 
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Erro ao carregar dados de equipe.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = () => {
    setSaved(true);
    toast.success("Configurações gerais salvas!");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Configurações
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Gerencie as preferências da Central de Produto</p>
      </div>

      {/* Tabs + Content */}
      <div className="flex gap-5">
        {/* Tab Nav */}
        <div className="w-52 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0 ${activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <Icon size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">

          {/* ── Geral ── */}
          {activeTab === "geral" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900 mb-4">Informações do Produto</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome do Produto</label>
                      <input
                        type="text"
                        defaultValue="Central de Produto Bloxs"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Versão Atual</label>
                      <input
                        type="text"
                        defaultValue="v2.4.1"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descrição</label>
                    <textarea
                      defaultValue="Plataforma central de gestão operacional para o time de produto da Bloxs Investimentos."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Fuso Horário</label>
                      <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>América/São_Paulo (UTC-3)</option>
                        <option>América/New_York (UTC-5)</option>
                        <option>UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Idioma</label>
                      <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>Português (BR)</option>
                        <option>English (US)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Configurações de Sprint</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Duração da Sprint</label>
                      <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>2 semanas</option>
                        <option>1 semana</option>
                        <option>3 semanas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Dia de Início</label>
                      <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                        <option>Segunda-feira</option>
                        <option>Terça-feira</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Velocidade alvo</label>
                      <input
                        type="number"
                        defaultValue={45}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${saved
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {saved ? <Check size={14} /> : <Save size={14} />}
                  {saved ? "Salvo!" : "Salvar alterações"}
                </button>
              </div>
            </div>
          )}

          {/* ── Notificações ── */}
          {activeTab === "notificacoes" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-900">Preferências de Notificação</h2>
              <div className="space-y-1">
                {[
                  { label: "Sprint iniciada", desc: "Receber ao início de cada sprint", enabled: true },
                  { label: "Sprint finalizada", desc: "Receber ao término da sprint", enabled: true },
                  { label: "Nova tarefa atribuída", desc: "Receber quando uma task for atribuída a você", enabled: true },
                  { label: "Comentário em task", desc: "Receber ao ser mencionado em comentários", enabled: false },
                  { label: "Épico aprovado", desc: "Receber quando um épico for aprovado no roadmap", enabled: true },
                  { label: "Novo feedback recebido", desc: "Receber resumo diário de feedbacks", enabled: false },
                  { label: "Deploy em produção", desc: "Receber confirmação de deploys", enabled: true },
                  { label: "Alerta de NPS", desc: "Receber quando o NPS cair abaixo de 7.5", enabled: true },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-b-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{notif.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${notif.enabled ? "bg-blue-600" : "bg-gray-200"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notif.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Equipe & Acesso ── */}
          {activeTab === "equipe" && (
            <TeamSettings 
              groups={groups}
              users={users}
              invites={invites}
              isLoading={isLoading}
              onRefresh={fetchData}
              internalRoles={INTERNAL_ROLES}
              availablePermissions={AVAILABLE_PERMISSIONS}
            />
          )}

          {/* ── Integrações ── */}
          {activeTab === "integracoes" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {integrations.map((integ) => (
                  <div key={integ.name} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${integ.color}`}>
                      {integ.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-gray-800">{integ.name}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${integ.connected
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                          }`}>
                          {integ.connected ? "Conectado" : "Desconectado"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{integ.desc}</p>
                      <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${integ.connected
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-blue-600 bg-blue-50 hover:bg-blue-100"
                        }`}>
                        {integ.connected ? "Desconectar" : "Conectar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-center pt-8 border-t border-gray-50">
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
          Central de Produto v2.5.0-API-BYPASS
        </p>
      </div>
    </div>
  );
}
