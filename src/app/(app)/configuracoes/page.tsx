"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Users, Plug, Globe, Save, Check, Plus, MoreVertical, Settings2, Loader2, CheckCircle2, Trash2, UserPlus, UserCog, Clock, Copy, Mail } from "lucide-react";
import { getGroupsAction, createGroupAction, updateGroupAction, deleteGroupAction, getUsersAction, updateUserAction, deleteUserAction, getPendingInvitesAction } from "@/lib/actions/team.actions";
import { InviteModal } from "./InviteModal";
import type { Permission } from "@/lib/services/access.service";
import { UserRole } from "@prisma/client";

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

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.BOARD]: "Board (Conselho)",
  [UserRole.DEVELOPER]: "Desenvolvedor",
  [UserRole.BLOXXS_TEAM]: "Time Bloxs",
  [UserRole.ORIGINADOR]: "Originador",
  [UserRole.DISTRIBUIDOR]: "Distribuidor",
  [UserRole.ASSESSOR]: "Assessor",
  [UserRole.INVESTIDOR]: "Investidor",
};

// Cargos que podem ser selecionados/atribuídos nesta plataforma (Foco Interno)
const MANAGEABLE_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.BOARD,
  UserRole.DEVELOPER,
  UserRole.BLOXXS_TEAM
];

const ROLE_HINTS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "Gestão de Infraestrutura e Governança Plena",
  [UserRole.ADMIN]: "Gestão de Produto, Equipe e Operações",
  [UserRole.BOARD]: "Acesso Estratégico e Relatórios de Inteligência",
  [UserRole.DEVELOPER]: "Execução Técnica, Roadmaps e Feature Flags",
  [UserRole.BLOXXS_TEAM]: "Operacional (Permissões via Grupos)",
  [UserRole.ORIGINADOR]: "Parceiro Externo (Originação)",
  [UserRole.DISTRIBUIDOR]: "Parceiro Externo (Distribuição)",
  [UserRole.ASSESSOR]: "Parceiro Externo (Assessoria)",
  [UserRole.INVESTIDOR]: "Cliente Final (Investimentos)",
};

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("equipe");
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("colaboradores");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  // State management
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INVESTIDOR);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupsData, usersData, invitesData] = await Promise.all([
        getGroupsAction(),
        getUsersAction(),
        getPendingInvitesAction()
      ]);
      setGroups(groupsData);
      setUsers(usersData);
      setPendingInvites(invitesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "equipe") {
      fetchData();
    }
  }, [activeTab]);

  const handleSaveGroup = async () => {
    if (!newName || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingGroup) {
        await updateGroupAction(editingGroup.id, {
          name: newName,
          description: newDescription,
          permissions: selectedPermissions
        });
      } else {
        await createGroupAction({
          name: newName,
          description: newDescription,
          permissions: selectedPermissions
        });
      }
      closeGroupModal();
      fetchData();
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este grupo? Usuários vinculados ficarão sem grupo.")) return;
    setIsSubmitting(true);
    try {
      await deleteGroupAction(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateUserAction(editingUser.id, {
        role: selectedRole,
        groupId: selectedGroupId
      });
      closeUserModal();
      fetchData();
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Atenção: A exclusão do usuário é permanente. Continuar?")) return;
    setIsSubmitting(true);
    try {
      await deleteUserAction(id);
      fetchData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGroupModal = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setNewName(group.name);
      setNewDescription(group.description || "");
      setSelectedPermissions(group.permissions || []);
    } else {
      setEditingGroup(null);
      setNewName("");
      setNewDescription("");
      setSelectedPermissions([]);
    }
    setIsGroupModalOpen(true);
  };

  const closeGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
    setNewName("");
    setNewDescription("");
    setSelectedPermissions([]);
  };

  const openUserModal = (user: any) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedGroupId(user.groupId);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const togglePermission = (permId: Permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permId)
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
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
            <div className="space-y-5">
              {/* Sub-Tabs Nav */}
              <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveSubTab("colaboradores")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "colaboradores"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Colaboradores
                </button>
                <button
                  onClick={() => setActiveSubTab("grupos")}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeSubTab === "grupos"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Configuração de Grupos
                </button>
              </div>

              {activeSubTab === "colaboradores" ? (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Membros da Equipe</h3>
                        <p className="text-sm text-gray-500">Colaboradores ativos na plataforma.</p>
                      </div>
                      <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
                      >
                        <UserPlus size={18} />
                        Convidar membro
                      </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {users.map((member) => {
                        const initials = member.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??';
                        return (
                          <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-blue-100 text-blue-700 shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                {ROLE_LABELS[member.role as UserRole] || member.role}
                              </span>
                              <span className="text-[9px] text-gray-400 italic">
                                {ROLE_HINTS[member.role as UserRole]}
                              </span>
                              <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">
                                {groups.find(g => g.id === member.groupId)?.name || "Sem Grupo"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openUserModal(member)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                title="Editar Colaborador"
                              >
                                <UserCog size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(member.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Excluir Colaborador"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Convites Pendentes */}
                  {pendingInvites.length > 0 && (
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                      <div className="p-8 border-b border-gray-100 bg-amber-50/30">
                        <div className="flex items-center gap-2">
                          <Clock className="text-amber-600" size={18} />
                          <h3 className="text-lg font-bold text-gray-900">Convites Pendentes</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Aguardando resgate pelos colaboradores (expira em 24h).</p>
                      </div>

                      <ul className="divide-y divide-gray-50">
                        {pendingInvites.map((invite) => (
                          <li key={invite.id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                  <Mail className="text-amber-600" size={18} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{invite.email}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-tight">
                                      {ROLE_LABELS[invite.role as UserRole]}
                                    </span>
                                    <span className="text-[10px] text-gray-400">•</span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                      Enviado em: {new Date(invite.createdAt).toLocaleString('pt-BR')}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    const link = `${window.location.origin}/invite?token=${invite.token}`;
                                    navigator.clipboard.writeText(link);
                                    alert("Link copiado!");
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                  <Copy size={16} />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-900">Níveis de Acesso</h2>
                    <button
                      onClick={() => openGroupModal()}
                      className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 rounded-xl px-3.5 py-2 hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={12} />
                      Novo Grupo
                    </button>
                  </div>

                  {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <p className="text-xs text-gray-500">Carregando grupos...</p>
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Grupo</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Usuários</th>
                          <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Permissões</th>
                          <th className="px-6 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {groups.map((group) => (
                          <tr key={group.id} className="hover:bg-gray-50/30 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-[10px]">
                                  {group.name[0]}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{group.name}</p>
                                  <p className="text-[10px] text-gray-500 truncate">{group.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
                                {group._count?.users ?? 0} Membros
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                                {group.permissions?.length ?? 0} Ativas
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openGroupModal(group)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Editar Grupo"
                                >
                                  <MoreVertical size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Excluir Grupo"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
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

      {/* Group Configuration Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Settings2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Configurar Grupo</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {editingGroup ? "Edite as configurações do grupo." : "Defina o nome e as regras de acesso."}
                  </p>
                </div>
              </div>
              <button onClick={closeGroupModal} className="text-gray-400 hover:text-gray-600 p-2">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome do Grupo</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ex: Time de QA, Editores de Conteúdo..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Descrição</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Para que serve este grupo?"
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-300 resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Permissões Selecionadas</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isSelected = selectedPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer group ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-1 w-4 h-4 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-700'}`}>
                            {perm.label}
                          </p>
                          <p className={`text-[11px] ${isSelected ? 'text-blue-600/70' : 'text-gray-500'}`}>
                            {perm.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={closeGroupModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={isSubmitting || !newName}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {editingGroup ? "Atualizar Grupo" : "Salvar Grupo"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Editing Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <UserCog size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Editar Colaborador</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{editingUser?.email}</p>
                </div>
              </div>
              <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-600 p-2">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nível de Cargo</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-sm font-semibold"
                >
                  {MANAGEABLE_ROLES.map((role) => (
                    <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-2 ml-1">
                  <strong>Poder:</strong> {ROLE_HINTS[selectedRole]}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Grupo de Acesso</label>
                <select
                  value={selectedGroupId || ""}
                  onChange={(e) => setSelectedGroupId(e.target.value || null)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all bg-white text-sm font-semibold"
                >
                  <option value="">Sem Grupo (Acesso Padrão)</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={closeUserModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          fetchData();
        }}
        groups={groups}
        internalRoles={Object.fromEntries(
          Object.entries(ROLE_LABELS).filter(([role]) => MANAGEABLE_ROLES.includes(role as any))
        )}
      />
    </div>
  );
}
