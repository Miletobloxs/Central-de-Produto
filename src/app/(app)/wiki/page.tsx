"use client";

import { useState } from "react";
import {
  ExternalLink, Globe, Layers, Box, ChevronRight, BookOpen,
  Eye, EyeOff, Copy, Check, Activity, Code2, LayoutGrid,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Credentials = { login: string; password: string };

type ClientLink = {
  label: string;
  url: string;
  credentials?: Credentials;
};

type IBaaSClient = {
  name: string;
  accent: string;      // tailwind bg color for avatar
  textAccent: string;  // tailwind text color
  links: ClientLink[];
};

type Product = {
  name: string;
  url: string | null;
  desc: string;
  env: string;
  credentials?: Credentials;
};

// ── Data ───────────────────────────────────────────────────────────────────────

const IBAS_CLIENTS: IBaaSClient[] = [
  {
    name: "Gaia",
    accent: "bg-violet-100",
    textAccent: "text-violet-700",
    links: [
      { label: "App de Investimento", url: "https://gaia.hmg.bloxs-services.com" },
      { label: "Backoffice",          url: "https://gaia.hmg.bloxs-services.com/backoffice/", credentials: { login: "backoffice@gaia.com", password: "BackofficeGaia@2026" } },
    ],
  },
  {
    name: "IB3",
    accent: "bg-sky-100",
    textAccent: "text-sky-700",
    links: [
      { label: "App de Investimento", url: "https://ib3.hmg.bloxs-services.com" },
    ],
  },
  {
    name: "Neela",
    accent: "bg-teal-100",
    textAccent: "text-teal-700",
    links: [
      { label: "App de Investimento", url: "https://neela.hmg.bloxs-services.com" },
    ],
  },
  {
    name: "Fictor Asset",
    accent: "bg-orange-100",
    textAccent: "text-orange-700",
    links: [
      { label: "App de Investimento", url: "https://app-fictorasset.hmg.bloxs-services.com" },
    ],
  },
  {
    name: "Cadastro",
    accent: "bg-gray-100",
    textAccent: "text-gray-600",
    links: [
      { label: "Portal de Cadastro",  url: "https://cad.hmg.bloxs-services.com" },
      { label: "Backoffice",          url: "https://cad.hmg.bloxs-services.com/backoffice" },
    ],
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

// ── CredentialsToggle ──────────────────────────────────────────────────────────

function CredentialsToggle({ credentials }: { credentials: Credentials }) {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<"login" | "password" | null>(null);

  function copy(field: "login" | "password", e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(credentials[field]);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  return (
    <div className="mt-2">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-wider"
      >
        {open ? <EyeOff size={11} /> : <Eye size={11} />}
        {open ? "Ocultar" : "Ver credenciais"}
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
              <button onClick={(e) => copy(field, e)} className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-all shrink-0">
                {copiedField === field
                  ? <Check size={12} className="text-emerald-500" />
                  : <Copy size={12} className="text-gray-400" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── IBaaSClientCard ────────────────────────────────────────────────────────────

function IBaaSClientCard({ client }: { client: IBaaSClient }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Client header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${client.accent} ${client.textAccent}`}>
          {client.name.charAt(0)}
        </div>
        <p className="font-bold text-gray-900 text-sm">{client.name}</p>
        <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest bg-amber-50 text-amber-700 border-amber-200">
          HMG
        </span>
      </div>

      {/* Links */}
      <div className="divide-y divide-gray-50">
        {client.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between px-5 py-3.5 hover:bg-blue-50/40 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">{link.label}</p>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 pl-5 truncate">
                {link.url.replace("https://", "")}
              </p>
              {link.credentials && (
                <div className="pl-5">
                  <CredentialsToggle credentials={link.credentials} />
                </div>
              )}
            </div>
            <ExternalLink size={12} className="text-gray-200 group-hover:text-blue-400 shrink-0 mt-0.5 ml-2 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

// ── ProductCard ────────────────────────────────────────────────────────────────

function ProductCard({ name, url, desc, env, credentials }: Product) {
  const inner = (
    <div className={`group flex items-start justify-between p-5 rounded-2xl border border-gray-100 transition-all duration-200 ${
      url ? "hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md cursor-pointer" : "bg-gray-50/50 cursor-default"
    }`}>
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
          url ? "bg-white border border-gray-100 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-600 transition-all" : "bg-white border border-gray-100"
        }`}>
          <Globe size={16} className="text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-gray-900 text-sm">{name}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest shrink-0 ${ENV_STYLES[env]}`}>
              {env}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          {url && <p className="text-[10px] text-gray-400 font-mono mt-1.5 truncate">{url.replace("https://", "")}</p>}
          {credentials && <CredentialsToggle credentials={credentials} />}
        </div>
      </div>
      {url && <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0 mt-1 ml-3 transition-colors" />}
    </div>
  );

  if (url) return <a href={url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return <div>{inner}</div>;
}

// ── WikiSection ────────────────────────────────────────────────────────────────

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
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
          {products.length} {products.length === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className={`p-5 ${grid ? "grid grid-cols-1 md:grid-cols-2 gap-3" : "flex flex-col gap-3"}`}>
        {products.map((p) => <ProductCard key={p.url ?? p.name} {...p} />)}
      </div>
    </section>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

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

      {/* IBaaS — por cliente */}
      <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Layers size={16} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">IBaaS — Whitelabel</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ambientes por cliente — homologação</p>
          </div>
          <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
            {IBAS_CLIENTS.length} clientes
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {IBAS_CLIENTS.map((client) => (
            <IBaaSClientCard key={client.name} client={client} />
          ))}
        </div>
      </section>

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

      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
        <ChevronRight size={12} />
        <span>Clique em qualquer link para abrir em nova aba. Use o toggle para ver credenciais.</span>
      </div>
    </div>
  );
}
