"use client";

import { useState } from "react";
import { Bell, Shield, Users, Plug, Globe, Save, Check } from "lucide-react";

type Tab = "geral" | "notificacoes" | "equipe" | "integracoes";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "geral", label: "Geral", icon: Globe },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "equipe", label: "Equipe & Acesso", icon: Users },
  { id: "integracoes", label: "Integrações", icon: Plug },
];

const teamMembers = [
  { name: "André Mileto", email: "andre@bloxs.com.br", role: "Product Manager", initials: "AM", color: "bg-amber-200 text-amber-800", status: "Ativo" },
  { name: "Sofia Lima", email: "sofia@bloxs.com.br", role: "Tech Lead", initials: "SL", color: "bg-pink-200 text-pink-800", status: "Ativo" },
  { name: "Lucas Mendes", email: "lucas@bloxs.com.br", role: "Engenheiro Sênior", initials: "LM", color: "bg-emerald-200 text-emerald-800", status: "Ativo" },
  { name: "Carla Rodrigues", email: "carla@bloxs.com.br", role: "Designer UX", initials: "CR", color: "bg-purple-200 text-purple-800", status: "Ativo" },
  { name: "Rafael Torres", email: "rafael@bloxs.com.br", role: "Engenheiro Pleno", initials: "RT", color: "bg-blue-200 text-blue-800", status: "Convidado" },
];

const integrations = [
  { name: "GitHub", desc: "Repositórios e commits vinculados às tasks", connected: true, icon: "GH", color: "bg-gray-900 text-white" },
  { name: "Supabase", desc: "Banco de dados e autenticação", connected: true, icon: "SB", color: "bg-emerald-600 text-white" },
  { name: "Slack", desc: "Notificações automáticas de sprint e deploy", connected: true, icon: "SL", color: "bg-purple-600 text-white" },
  { name: "Vercel", desc: "Deploy contínuo e ambientes de preview", connected: false, icon: "VC", color: "bg-black text-white" },
  { name: "Jira", desc: "Sincronização bidirecional de issues", connected: false, icon: "JR", color: "bg-blue-600 text-white" },
  { name: "Figma", desc: "Designs vinculados aos épicos", connected: false, icon: "FG", color: "bg-pink-500 text-white" },
];

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("geral");
  const [saved, setSaved] = useState(false);

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
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors border-b border-gray-100 last:border-b-0 ${
                    activeTab === tab.id
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
                  className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
                    saved
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

          {/* ── Equipe ── */}
          {activeTab === "equipe" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900">Membros da Equipe</h2>
                <button className="flex items-center gap-2 text-xs font-semibold text-white bg-blue-600 rounded-xl px-3.5 py-2 hover:bg-blue-700 transition-colors">
                  <Users size={12} />
                  Convidar membro
                </button>
              </div>

              <div className="divide-y divide-gray-50">
                {teamMembers.map((member) => (
                  <div key={member.email} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${member.color} shrink-0`}>
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      {member.role}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      member.status === "Ativo"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}>
                      {member.status}
                    </span>
                    <button className="text-xs text-gray-400 hover:text-gray-600">
                      <Shield size={14} />
                    </button>
                  </div>
                ))}
              </div>
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
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          integ.connected
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {integ.connected ? "Conectado" : "Desconectado"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{integ.desc}</p>
                      <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        integ.connected
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
    </div>
  );
}
