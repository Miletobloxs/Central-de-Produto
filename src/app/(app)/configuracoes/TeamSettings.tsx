"use client";

import { useState } from "react";
import { Users, Shield, Plus, MoreVertical, Settings2, Trash2, UserPlus, UserCog, Clock, Copy, Mail, CheckCircle2, UserCheck, Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types/enums";
import { TeamGroup, TeamUser, TeamInvite } from "@/lib/services/team.service";
import { InviteModal } from "./InviteModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { toast } from "sonner";
import { createGroupAction, updateGroupAction, deleteGroupAction, updateUserAction, deleteUserAction, deleteInviteAction, seedGroupsAction } from "@/lib/actions/team.actions";

interface TeamSettingsProps {
    groups: TeamGroup[];
    users: TeamUser[];
    invites: TeamInvite[];
    isLoading: boolean;
    onRefresh: () => void;
    internalRoles: Record<string, string>;
    availablePermissions: { id: string, label: string, desc: string }[];
}

export function TeamSettings({ groups, users, invites, isLoading, onRefresh, internalRoles, availablePermissions }: TeamSettingsProps) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<TeamGroup | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [groupForm, setGroupForm] = useState({ name: "", permissions: [] as string[] });
    const [isDeletingGroup, setIsDeletingGroup] = useState<string | null>(null);
    const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
    const [isUpdatingUser, setIsUpdatingUser] = useState<string | null>(null);
    const [isSeedingGroups, setIsSeedingGroups] = useState(false);

    const handleSeedGroups = async () => {
        setIsSeedingGroups(true);
        try {
            const result = await seedGroupsAction();
            if (result.success) {
                toast.success("Grupos iniciais criados com sucesso!");
                onRefresh();
            } else {
                toast.error(result.error || "Erro ao criar grupos iniciais.");
            }
        } catch (error) {
            toast.error("Erro inesperado ao criar grupos.");
        } finally {
            setIsSeedingGroups(false);
        }
    };

    const handleSaveGroup = async () => {
        if (!groupForm.name) return toast.error("Nome do grupo é obrigatório");
        try {
            if (selectedGroup) {
                await updateGroupAction(selectedGroup.id, { 
                    name: groupForm.name, 
                    permissions: groupForm.permissions as any 
                });
                toast.success("Grupo atualizado");
            } else {
                await createGroupAction({ 
                    name: groupForm.name, 
                    description: "", // Added empty description
                    permissions: groupForm.permissions as any 
                });
                toast.success("Grupo criado");
            }
            setIsGroupModalOpen(false);
            onRefresh();
        } catch (error) {
            toast.error("Erro ao salvar grupo.");
        }
    };

    const handleDeleteGroup = async (id: string) => {
        try {
            await deleteGroupAction(id);
            toast.success("Grupo excluído");
            onRefresh();
        } catch (error) {
            toast.error("Erro ao excluir grupo.");
        }
    };

    const handleUpdateUser = async (userId: string, role: string, groupId: string | null) => {
        setIsUpdatingUser(userId);
        try {
            await updateUserAction(userId, { 
                role: role as UserRole, 
                groupId 
            });
            toast.success("Usuário atualizado");
            onRefresh();
        } catch (error) {
            toast.error("Erro ao atualizar usuário.");
        } finally {
            setIsUpdatingUser(null);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        setIsDeletingUser(userId);
        try {
            await deleteUserAction(userId);
            toast.success("Usuário removido");
            onRefresh();
        } catch (error) {
            toast.error("Erro ao remover usuário.");
        } finally {
            setIsDeletingUser(null);
        }
    };

    const handleDeleteInvite = async (id: string) => {
        try {
            await deleteInviteAction(id);
            toast.success("Convite cancelado");
            onRefresh();
        } catch (error) {
            toast.error("Erro ao cancelar convite.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header com Ações Rápidas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Equipe</h2>
                    <p className="text-gray-500 mt-1">Controle acessos, grupos e convites de colaboradores.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            setSelectedGroup(null);
                            setGroupForm({ name: "", permissions: [] });
                            setIsGroupModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
                    >
                        <Shield size={18} />
                        Novo Grupo
                    </button>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                    >
                        <UserPlus size={18} />
                        Convidar
                    </button>
                </div>
            </div>

            {/* Grupos de Acesso */}
            <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Shield className="text-indigo-600" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Grupos de Acesso</h3>
                    </div>
                    {groups.length > 0 && (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{groups.length} ativos</span>
                    )}
                </div>

                <div className="p-4 sm:p-8">
                    {groups.length === 0 ? (
                        <div className="py-12 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Shield className="text-gray-300" size={40} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-800">Nenhum grupo encontrado</h4>
                            <p className="text-gray-500 mt-2 max-w-xs mx-auto">Comece criando grupos para definir o que cada time pode fazer na plataforma.</p>
                            {!isLoading && (
                                <button
                                    onClick={handleSeedGroups}
                                    disabled={isSeedingGroups}
                                    className="mt-6 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSeedingGroups ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Inicializando...
                                        </>
                                    ) : (
                                        <>
                                            <Shield size={18} />
                                            Inicializar Grupos Padrão
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groups.map((group) => (
                                <div key={group.id} className="group relative bg-gray-50/50 rounded-3xl border border-gray-100 p-6 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{group.name}</h4>
                                            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-1">
                                                {group.permissions.length} Permissões
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => {
                                                    setSelectedGroup(group);
                                                    setGroupForm({ name: group.name, permissions: group.permissions });
                                                    setIsGroupModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-indigo-600 transition-colors shadow-sm"
                                            >
                                                <Settings2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id)}
                                                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-600 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {group.permissions.slice(0, 3).map((p) => {
                                            const perm = availablePermissions.find(ap => ap.id === p);
                                            return (
                                                <span key={p} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100/50">
                                                    {perm?.label || p}
                                                </span>
                                            );
                                        })}
                                        {group.permissions.length > 3 && (
                                            <span className="text-[10px] font-bold text-gray-400 px-2 py-1">
                                                +{group.permissions.length - 3} mais
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Colaboradores e Convites */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Lista de Colaboradores */}
                <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Users className="text-blue-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Colaboradores</h3>
                        </div>
                    </div>
                    <div className="p-4 sm:p-6 flex-1">
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                                            {user.image ? (
                                                <img src={user.image} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-lg font-bold text-blue-600">
                                                    {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 flex items-center gap-2">
                                                {user.name || "Sem Nome"}
                                                {user.role === UserRole.SUPER_ADMIN && <Shield size={14} className="text-amber-500" />}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateUser(user.id, e.target.value, user.groupId)}
                                            className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-2 py-1.5 focus:border-blue-500 outline-none"
                                        >
                                            {Object.entries(internalRoles).map(([role, label]) => (
                                                <option key={role} value={role}>{label}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Convites Pendentes */}
                <section className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Clock className="text-amber-600" size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Convites Pendentes</h3>
                        </div>
                        <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                            Aguardando Aceite
                        </span>
                    </div>
                    <div className="p-8">
                        {invites.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="text-gray-200 mx-auto mb-4" size={48} />
                                <p className="text-gray-400 font-medium">Nenhum convite pendente no momento.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invites.map((invite) => (
                                    <div key={invite.id} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 border-l-4 border-l-amber-400">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                                                <Mail className="text-amber-500" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{invite.email}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                        {internalRoles[invite.role] || invite.role}
                                                    </span>
                                                    {invite.groupId && (
                                                        <>
                                                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {groups.find(g => g.id === invite.groupId)?.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteInvite(invite.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Modais Localizados */}
            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSuccess={onRefresh}
                groups={groups}
                internalRoles={internalRoles}
            />

            {/* Modal de Grupo (Simplified for this refactor) */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden p-8">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedGroup ? "Editar Grupo" : "Novo Grupo"}</h3>
                            <p className="text-gray-500">Defina o nome e as capacidades deste grupo.</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nome do Grupo</label>
                                <input
                                    type="text"
                                    value={groupForm.name}
                                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                    placeholder="ex: Engenharia, Board, Financeiro..."
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block ml-1">Capacidades e Permissões</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availablePermissions.map((perm) => (
                                        <div
                                            key={perm.id}
                                            onClick={() => {
                                                const newPerms = groupForm.permissions.includes(perm.id)
                                                    ? groupForm.permissions.filter(p => p !== perm.id)
                                                    : [...groupForm.permissions, perm.id];
                                                setGroupForm({ ...groupForm, permissions: newPerms });
                                            }}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${groupForm.permissions.includes(perm.id)
                                                ? "bg-indigo-50 border-indigo-200"
                                                : "bg-white border-gray-100 hover:border-indigo-200"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${groupForm.permissions.includes(perm.id)
                                                ? "bg-indigo-600 border-indigo-600"
                                                : "bg-white border-gray-300"
                                                }`}>
                                                {groupForm.permissions.includes(perm.id) && <CheckCircle2 className="text-white" size={12} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{perm.label}</p>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{perm.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setIsGroupModalOpen(false)}
                                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveGroup}
                                className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Salvar Grupo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
