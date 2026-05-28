"use client";

import { ExternalLink, Globe, Layers, Monitor, Box, ChevronRight, BookOpen } from "lucide-react";

const IBAS_PRODUCTS = [
  {
    name: "Cadastro (Front)",
    url: "https://cad.hmg.bloxs-services.com",
    desc: "Portal de cadastro de investidores / clientes",
    env: "HMG",
  },
  {
    name: "Cadastro (Backoffice)",
    url: "https://cad.hmg.bloxs-services.com/backoffice",
    desc: "Painel administrativo do portal de cadastro",
    env: "HMG",
  },
  {
    name: "IB3",
    url: "https://ib3.hmg.bloxs-services.com",
    desc: "Interface principal da plataforma IB3",
    env: "HMG",
  },
  {
    name: "Fictor Asset",
    url: "https://app-fictorasset.hmg.bloxs-services.com",
    desc: "App whitelabel Fictor Asset",
    env: "HMG",
  },
  {
    name: "Neela",
    url: "https://neela.hmg.bloxs-services.com",
    desc: "App whitelabel Neela",
    env: "HMG",
  },
  {
    name: "Gaia",
    url: "https://gaia.hmg.bloxs-services.com",
    desc: "App whitelabel Gaia",
    env: "HMG",
  },
  {
    name: "Gaia (Backoffice)",
    url: "https://gaia.hmg.bloxs-services.com/backoffice/",
    desc: "Painel administrativo do app whitelabel Gaia",
    env: "HMG",
  },
];

const WORKSPACE_PRODUCTS = [
  {
    name: "Bloxs App",
    url: "https://app.bloxs.com.br",
    desc: "Plataforma principal Bloxs Capital",
    env: "PROD",
  },
  {
    name: "Protótipo v2",
    url: "https://river-hook-04846886.figma.site/home",
    desc: "Protótipo da próxima versão do produto — Figma Site",
    env: "DESIGN",
  },
];

const ENV_STYLES: Record<string, string> = {
  HMG: "bg-amber-50 text-amber-700 border-amber-200",
  PROD: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DESIGN: "bg-purple-50 text-purple-700 border-purple-200",
};

function ProductCard({ name, url, desc, env }: { name: string; url: string | null; desc: string; env: string }) {
  const content = (
    <div className={`group flex items-start justify-between p-5 rounded-2xl border border-gray-100 transition-all duration-200 ${
      url
        ? "hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md cursor-pointer"
        : "bg-gray-50/50 cursor-default"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          url ? "bg-white border border-gray-100 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-600 transition-all" : "bg-white border border-gray-100"
        }`}>
          {url
            ? <Globe size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            : <Monitor size={16} className="text-gray-300" />
          }
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${ENV_STYLES[env]}`}>
              {env}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          {url && (
            <p className="text-[10px] text-gray-400 font-mono mt-1.5 truncate max-w-xs">
              {url.replace("https://", "")}
            </p>
          )}
        </div>
      </div>
      {url && (
        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 transition-colors" />
      )}
    </div>
  );

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}

export default function WikiPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Wiki de Produtos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Referência rápida de ambientes e produtos da Bloxs Capital.
          </p>
        </div>
      </div>

      {/* Breadcrumb de legenda */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.HMG}`}>HMG</span>
        <span className="text-xs text-gray-400">Ambiente de homologação</span>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.PROD}`}>PROD</span>
        <span className="text-xs text-gray-400">Ambiente de produção</span>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.DESIGN}`}>DESIGN</span>
        <span className="text-xs text-gray-400">Protótipo / Figma</span>
      </div>

      {/* IBaaS (Whitelabel) */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Layers size={16} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">IBaaS — Whitelabel</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ambientes dos clientes hospedados na infraestrutura Bloxs</p>
          </div>
          <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
            {IBAS_PRODUCTS.length} ambientes
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {IBAS_PRODUCTS.map((p) => (
            <ProductCard key={p.url} {...p} />
          ))}
        </div>
      </section>

      {/* Workspace */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
            <Box size={16} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Workspace</h2>
            <p className="text-xs text-gray-400 mt-0.5">Produtos e ferramentas do time de produto</p>
          </div>
          <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
            {WORKSPACE_PRODUCTS.length} itens
          </span>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {WORKSPACE_PRODUCTS.map((p) => (
            <ProductCard key={p.name} {...p} />
          ))}
        </div>
      </section>

      {/* Footer info */}
      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
        <ChevronRight size={12} />
        <span>Clique em qualquer card para abrir o ambiente em uma nova aba.</span>
      </div>
    </div>
  );
}
