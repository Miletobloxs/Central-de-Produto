# Central de Produto — Bloxs

Plataforma interna de gestão de produto da Bloxs, construída como protótipo de alta fidelidade. Centraliza OKRs, roadmap, sprints, backlog, analytics, discovery e operações em um único ambiente de trabalho para o time de produto.

---

## Visão Geral

A **Central de Produto** é um backoffice focado exclusivamente na orquestração da área de Produto da Bloxs — desde o planejamento estratégico até a observabilidade de produção, passando por discovery, analytics e competitive intelligence.

### Grupos de Features Implementados

#### Grupo 1 — Core de Produto
| Módulo | Rota | Descrição |
|---|---|---|
| Dashboard | `/dashboard` | KPIs principais, sprint ativo, epics, feedback loop e mapa geográfico |
| OKRs & Metas | `/okrs` | Objetivos e Key Results por quarter, com link para métricas do Dashboard |
| Roadmap | `/roadmap` | Timeline visual por épico com swim lanes e quarters |
| Backlog | `/backlog` | Priorização MoSCoW (Must/Should/Could/Won't Have) com 12 itens |
| Sprints | `/sprints` | Board Kanban com 4 colunas e cards de tasks por épico |
| Releases | `/releases` | Changelog com toggle público/interno e associação de tasks por sprint |

#### Grupo 2 — Profundidade Analítica
| Módulo | Rota | Descrição |
|---|---|---|
| Analytics | `/analytics` | Funis de conversão, cohort analysis de retenção e adoção de features |
| Feedback / NPS | `/feedback` | Score NPS, distribuição promotores/neutros/detratores e feedback recente |
| Health Score | `/health` | Uptime de serviços, P99, bugs por severidade e histórico de 90 dias |
| Incidents | `/incidents` | Registro de incidentes com timeline expandível, root cause e link para sprint |

#### Grupo 3 — Discovery & Inteligência
| Módulo | Rota | Descrição |
|---|---|---|
| Discovery Hub | `/discovery` | Pesquisas com usuários (entrevistas, testes, surveys) e feed de insights tagueados |
| Competitive Intel. | `/competitive` | Matriz de features vs. concorrentes e timeline de movimentos do mercado |
| Feature Flags | `/flags` | Controle de rollout por segmento, experimentos e kill switches com toggle interativo |

#### Sistema
| Módulo | Rota | Descrição |
|---|---|---|
| Configurações | `/configuracoes` | Geral, notificações, equipe & acesso, integrações |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| UI | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Icons | Lucide React |
| Font | Geist Sans / Geist Mono (via `next/font`) |
| Render | Static generation (SSG) — todos os 16 módulos pré-renderizados |

> **Backend / banco de dados**: o schema Prisma e a integração com Supabase estão presentes no repositório mas não conectados ao protótipo atual. O foco desta fase é o front-end de alta fidelidade com dados mock.

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (app)/                    # Route group — layout compartilhado (Sidebar + Header)
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── okrs/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── backlog/page.tsx
│   │   ├── sprints/page.tsx
│   │   ├── releases/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── feedback/page.tsx
│   │   ├── health/page.tsx
│   │   ├── incidents/page.tsx
│   │   ├── discovery/page.tsx
│   │   ├── competitive/page.tsx
│   │   ├── flags/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── globals.css               # Design system base
│   ├── layout.tsx                # Root layout (Geist font, pt-BR)
│   └── page.tsx                  # Redirect → /dashboard
├── components/
│   └── layout/
│       ├── Sidebar.tsx           # Navegação agrupada (7 grupos, 16 itens)
│       └── Header.tsx            # Search, notificações, avatar
prisma/
└── schema.prisma                 # Schema completo (12 modelos, 14 enums)
```

---

## Navegação (Sidebar)

```
Dashboard
─────────────────
Planejamento
  OKRs & Metas
  Roadmap
  Backlog
─────────────────
Execução
  Sprints
  Releases
  Feature Flags
─────────────────
Análise
  Analytics
  Feedback / NPS
─────────────────
Descoberta
  Discovery Hub
  Competitive Intel.
─────────────────
Operações
  Health Score
  Incidents
─────────────────
Sistema
  Configurações
```

---

## Setup & Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build

# Lint
npm run lint
```

Acesse: **http://localhost:3000** → redireciona automaticamente para `/dashboard`

---

## Roadmap do Protótipo

- [x] **Grupo 1** — Core de Produto (Dashboard, OKRs, Roadmap, Backlog, Sprints, Releases)
- [x] **Grupo 2** — Profundidade Analítica (Analytics, Feedback/NPS, Health Score, Incidents)
- [x] **Grupo 3** — Discovery & Inteligência (Discovery Hub, Competitive Intel., Feature Flags)
- [ ] **Grupo 4** — Automação & Gestão (Sprint Review Reports, Mural de Decisões, Notificações inteligentes)
- [ ] **Fase 2** — Integração real com Supabase, autenticação, dados ao vivo

---

## Licença

Proprietary — Bloxs Capital © 2026
