"use client";

import { useState } from "react";
import {
    X,
    Mail,
    Shield,
    Users,
    Copy,
    CheckCircle2,
    Clock
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { createInviteAction } from "@/lib/actions/team.actions";
import { TeamGroup } from "@/lib/services/team.service";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    groups: TeamGroup[];
    internalRoles: Record<string, string>;
}

export function InviteModal({ isOpen, onClose, groups, internalRoles }: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.BLOXXS_TEAM);
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const invite = await createInviteAction({
                email,
                role: selectedRole,
                groupId: selectedGroupId || null,
            });

            const baseUrl = window.location.origin;
            setInviteLink(`${baseUrl}/invite?token=${invite.token}`);
        } catch (error) {
            console.error("Erro ao convidar:", error);
            alert("Erro ao gerar convite.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-8 pt-8 pb-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Convidar Membro</h2>
                        <p className="text-gray-500 text-sm mt-1">Expanda o time interno com segurança.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {!inviteLink ? (
                    <form onSubmit={handleInvite} className="p-8 space-y-6">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                E-mail do Colaborador
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="ex: nome@bloxs.com.br"
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    Cargo (Role)
                                </label>
                                <div className="relative group">
                                    <Shield className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold bg-white appearance-none"
                                    >
                                        {Object.entries(internalRoles).map(([role, label]) => (
                                            <option key={role} value={role}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">
                                    Grupo de Acesso
                                </label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <select
                                        value={selectedGroupId}
                                        onChange={(e) => setSelectedGroupId(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-semibold bg-white appearance-none shadow-sm"
                                    >
                                        <option value="">Sem Grupo</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                            <Clock className="text-blue-600 shrink-0 mt-0.5" size={16} />
                            <p className="text-[11px] text-blue-700 leading-relaxed">
                                <strong>Segurança:</strong> O convite expira em <strong>24 horas</strong> e está vinculado estritamente ao e-mail fornecido.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isLoading ? "Gerando link..." : "Gerar Link de Convite"}
                        </button>
                    </form>
                ) : (
                    <div className="p-8 text-center space-y-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="text-green-600" size={32} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Convite Gerado!</h3>
                            <p className="text-gray-500 text-sm mt-2 px-8">
                                Copie o link seguro abaixo e envie para <strong>{email}</strong>.
                            </p>
                        </div>

                        <div className="group relative">
                            <input
                                readOnly
                                value={inviteLink}
                                className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-mono text-gray-600 outline-none transition-all focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="absolute right-3 top-2.5 p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                            >
                                {copied ? <CheckCircle2 size={18} className="text-green-600" /> : <Copy size={18} className="text-gray-400" />}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors"
                        >
                            Fechar e voltar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
