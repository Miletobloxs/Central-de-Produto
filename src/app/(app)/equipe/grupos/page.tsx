"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Plus,
    Shield,
    MoreVertical,
    Settings2,
    CheckCircle2,
    AlertCircle,
    Loader2
} from "lucide-react";

import { getGroupsAction, createGroupAction } from "@/lib/actions/team.actions";
import type { Permission } from "@/lib/services/access.service";

const AVAILABLE_PERMISSIONS = [
    { id: 'ORCHESTRATE_PRODUCT' as Permission, label: 'Orquestrar Produto', desc: 'Gerenciar Roadmaps, Épicos e Configurações' },
    { id: 'CREATE_TASK' as Permission, label: 'Criar Tarefas', desc: 'Adicionar novos itens ao backlog ou sprints' },
    { id: 'MOVE_CARDS' as Permission, label: 'Mover Cards', desc: 'Gestar o fluxo de trabalho no board' },
    { id: 'VIEW_REPORTS' as Permission, label: 'Ver Relatórios', desc: 'Acesso a dashboards de analytics e saúde' },
    { id: 'PARTICIPATE_REVIEWS' as Permission, label: 'Participar de Reviews', desc: 'Comentar e votar em revisões de sprint' },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await getGroupsAction();
            setGroups(data);
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!newName || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await createGroupAction({
                name: newName,
                description: newDescription,
                permissions: selectedPermissions
            });
            setIsModalOpen(false);
            setNewName("");
            setNewDescription("");
            setSelectedPermissions([]);
            fetchGroups();
        } catch (error) {
            console.error("Failed to create group:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePermission = (permId: Permission) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
        );
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Grupos e Acesso</h1>
                    <p className="text-sm text-gray-500 mt-1">Gerencie permissões dinâmicas para o time da Bloxs.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
                >
                    <Plus size={18} />
                    Novo Grupo
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Shield size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grupos Ativos</p>
                        <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                        <Users size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Colaboradores</p>
                        <p className="text-2xl font-bold text-gray-900">11</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Permissões Mapeadas</p>
                        <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                </div>
            </div>

            {/* Groups List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <p className="text-sm text-gray-500 font-medium">Carregando grupos...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Grupo</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Usuários</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Permissões</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {groups.map((group) => (
                                <tr key={group.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {group.name[0]}
                                            </div>
                                            <span className="font-semibold text-gray-900">{group.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{group.description}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {group._count?.users ?? 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            {group.permissions?.length ?? 0} Ativas
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Criação */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Configurar Grupo</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Defina o nome e as regras de acesso.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
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
                                onClick={() => setIsModalOpen(false)}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                disabled={isSubmitting || !newName}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                                Salvar Grupo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
