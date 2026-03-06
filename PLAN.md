# PLAN.md - ReleasesService 🚀💎

## 🎼 Call de Especialistas (Ativação POAS)
Para esta missão, os seguintes especialistas foram convocados:
- **📐 Arquiteto (Planner)**: Responsável pela estrutura do serviço e schema.
- **⚙️ Backend Specialist**: Implementação da lógica de negócio e Prisma.
- **🕵️ QA Automation**: Proteção total via testes unitários (RED/GREEN).

---

## 🎯 Objetivo
Implementar o `ReleasesService` para gerenciar o ciclo de vida de lançamentos no produto. Este serviço deve permitir registrar novas versões, associar Changelog Entries e status da release (draft, beta, production).

## 🏗️ Arquitetura
O serviço seguirá o padrão `Service Core` já estabelecido para OKRs, Flags e Roadmap:
1. **Service**: `src/lib/services/releases.service.ts`
2. **Tests**: `src/lib/services/__tests__/releases.service.test.ts`
3. **Actions**: `src/lib/actions/releases.actions.ts`

---

## 🛠️ Passo a Passo (Workflow Elite)

### 1. Schema Sync [📐 Arquiteto]
- [ ] Validar no `schema.prisma` a estrutura de `Release` e `ChangelogEntry`.
- [ ] Realizar `db push` se necessário.

### 2. TDD RED Phase [🕵️ QA]
- [ ] Criar o arquivo de teste unitário.
- [ ] Definir casos de uso: `createRelease`, `getReleases`, `updateStatus`.
- [ ] Rodar testes e garantir a falha (RED).

### 3. Implementation [⚙️ Backend]
- [ ] Codificar o `ReleasesService` utilizando Prisma.
- [ ] Garantir tipagem forte com TypeScript.

### 4. TDD GREEN Phase [🕵️ QA]
- [ ] Rodar testes novamente e garantir 100% de aprovação (GREEN).

### 5. Integration Layer [⚙️ Backend]
- [ ] Criar Server Actions para exposição segura no frontend.

---

> [!IMPORTANT]
> **Estética Premium**: O Designer será consultado na fase de UI para garantir que o log de releases siga o padrão `UI/UX Pro Max`. 💎✨
