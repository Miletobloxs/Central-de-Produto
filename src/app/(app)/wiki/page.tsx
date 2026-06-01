"use client";

import { useState } from "react";
import { ExternalLink, Globe, Layers, Monitor, Box, ChevronRight, BookOpen, Eye, EyeOff, Copy, Check, Activity, Code2 } from "lucide-react";

type Credentials = { login: string; password: string };

type Product = {
  name: string;
  url: string | null;
  desc: string;
  env: string;
  credentials?: Credentials;
};

const IBAS_PRODUCTS: Product[] = [
  { name: "Cadastro (Front)",     url: "https://cad.hmg.bloxs-services.com",           desc: "Portal de cadastro de investidores / clientes",    env: "HMG" },
  { name: "Cadastro (Backoffice)",url: "https://cad.hmg.bloxs-services.com/backoffice", desc: "Painel administrativo do portal de cadastro",       env: "HMG" },
  { name: "IB3",                  url: "https://ib3.hmg.bloxs-services.com",            desc: "Interface principal da plataforma IB3",             env: "HMG" },
  { name: "Fictor Asset",         url: "https://app-fictorasset.hmg.bloxs-services.com",desc: "App whitelabel Fictor Asset",                       env: "HMG" },
  { name: "Neela",                url: "https://neela.hmg.bloxs-services.com",          desc: "App whitelabel Neela",                              env: "HMG" },
  { name: "Gaia",                 url: "https://gaia.hmg.bloxs-services.com",           desc: "App whitelabel Gaia",                               env: "HMG" },
  {
    name: "Gaia (Backoffice)",
    url: "https://gaia.hmg.bloxs-services.com/backoffice/",
    desc: "Painel administrativo do app whitelabel Gaia",
    env: "HMG",
    credentials: { login: "backoffice@gaia.com", password: "BackofficeGaia@2026" },
  },
];

const WORKSPACE_PRODUCTS: Product[] = [
  { name: "Bloxs App",    url: "https://app.bloxs.com.br",                    desc: "Plataforma principal Bloxs Capital",                env: "PROD"   },
  { name: "Protótipo v2", url: "https://river-hook-04846886.figma.site/home", desc: "Protótipo da próxima versão do produto — Figma Site", env: "DESIGN" },
];

const SQUAD_TOOLS: Product[] = [
  {
    name: "Hous3 Tracker",
    url: "https://track.hous3.me/client",
    desc: "Plataforma de tracking do squad",
    env: "PROD",
    credentials: { login: "bloxs@hous3.digital", password: "MiletoBloxs@@HOUS3track" },
  },
];

const API_DOCS: Product[] = [
  {
    name: "Whitelabel API — Swagger",
    url: "https://whitelabel-api.bloxs-services.com/swagger",
    desc: "Documentação da API Whitelabel (requer autenticação Basic)",
    env: "PROD",
    credentials: { login: "bloxs", password: "9Id0WqB#4reBfjSltE!6" },
  },
  {
    name: "Bloxs API — Swagger",
    url: "https://api.bloxs-services.com/docs#/",
    desc: "Documentação pública da API principal Bloxs",
    env: "PROD",
  },
];

const ENV_STYLES: Record<string, string> = {
  HMG:    "bg-amber-50   text-amber-700   border-amber-200",
  PROD:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  DESIGN: "bg-purple-50  text-purple-700  border-purple-200",
};

function CredentialsToggle({ credentials }: { credentials: Credentials }) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"login" | "password" | null>(null);

  function copy(field: "login" | "password") {
    navigator.clipboard.writeText(credentials[field]);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  return (
    <div className="mt-3">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
      >
        {open ? <EyeOff size={11} /> : <Eye size={11} />}
        {open ? "Ocultar credenciais" : "Ver credenciais"}
      </button>

      {open && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2"
        >
          {(["login", "password"] as const).map((field) => (
            <div key={field} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{field === "login" ? "Login" : "Senha"}</p>
                <p className="text-xs font-mono text-gray-700 truncate">{credentials[field]}</p>
              </div>
              <button
                onClick={() => copy(field)}
                className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all shrink-0"
                title={`Copiar ${field}`}
              >
                {copiedField === field
                  ? <Check size={12} className="text-emerald-500" />
                  : <Copy size={12} className="text-gray-400" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ name, url, desc, env, credentials }: Product) {
  const inner = (
    <div className={`group flex items-start justify-between p-5 rounded-2xl border border-gray-100 transition-all duration-200 ${
      url ? "hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md cursor-pointer" : "bg-gray-50/50 cursor-default"
    }`}>
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          url ? "bg-white border border-gray-100 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-600 transition-all" : "bg-white border border-gray-100"
        }`}>
          {url
            ? <Globe size={16} className="text-gray-400 group-hover:text-white transition-colors" />
            : <Monitor size={16} className="text-gray-300" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest shrink-0 ${ENV_STYLES[env]}`}>
              {env}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          {url && (
            <p className="text-[10px] text-gray-400 font-mono mt-1.5 truncate">
              {url.replace("https://", "")}
            </p>
          )}
          {credentials && <CredentialsToggle credentials={credentials} />}
        </div>
      </div>
      {url && (
        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 ml-3 transition-colors" />
      )}
    </div>
  );

  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return <div>{inner}</div>;
}

type SectionProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  products: Product[];
  grid?: boolean;
};

function WikiSection({ icon, iconBg, title, subtitle, products, grid }: SectionProps) {
  return (
    <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
          {products.length} {products.length === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className={`p-5 ${grid ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "flex flex-col gap-3"}`}>
        {products.map((p) => (
          <ProductCard key={p.url ?? p.name} {...p} />
        ))}
      </div>
    </section>
  );
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
          <p className="text-sm text-gray-500 mt-0.5">Referência rápida de ambientes e produtos da Bloxs Capital.</p>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.HMG}`}>HMG</span>
        <span className="text-xs text-gray-400">Homologação</span>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.PROD}`}>PROD</span>
        <span className="text-xs text-gray-400">Produção</span>
        <span className="w-px h-4 bg-gray-200 mx-1" />
        <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-widest ${ENV_STYLES.DESIGN}`}>DESIGN</span>
        <span className="text-xs text-gray-400">Protótipo / Figma</span>
      </div>

      <WikiSection
        icon={<Layers size={16} className="text-indigo-600" />}
        iconBg="bg-indigo-50"
        title="IBaaS — Whitelabel"
        subtitle="Ambientes dos clientes hospedados na infraestrutura Bloxs"
        products={IBAS_PRODUCTS}
        grid
      />

      <WikiSection
        icon={<Box size={16} className="text-blue-600" />}
        iconBg="bg-blue-50"
        title="Workspace"
        subtitle="Produtos e ferramentas do time de produto"
        products={WORKSPACE_PRODUCTS}
      />

      <WikiSection
        icon={<Activity size={16} className="text-rose-600" />}
        iconBg="bg-rose-50"
        title="Ferramentas do Squad"
        subtitle="Plataformas de uso interno do time"
        products={SQUAD_TOOLS}
      />

      <WikiSection
        icon={<Code2 size={16} className="text-teal-600" />}
        iconBg="bg-teal-50"
        title="APIs & Documentação"
        subtitle="Swaggers e referências técnicas das APIs Bloxs"
        products={API_DOCS}
      />

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
        <ChevronRight size={12} />
        <span>Clique em qualquer card para abrir em nova aba. Use o toggle para ver credenciais.</span>
      </div>
    </div>
  );
}
