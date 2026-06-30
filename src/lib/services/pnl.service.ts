// Pure calculation functions for the P&L module.
// No side effects — safe to call from server actions, client components, or tests.

export type GateStatus = 'pass' | 'warn' | 'fail' | 'pending';

export type GateResult = {
  code: string;
  status: GateStatus;
  computedValue?: number;
  note: string;
};

// ── Core financial formulas ────────────────────────────────────

/** Gross Economic Margin = (receita - fixed - aiCogs) / receita */
export function calcGEM(receita: number, fixed: number, aiCogs: number): number {
  if (receita <= 0) return 0;
  return (receita - fixed - aiCogs) / receita;
}

/** AI Run-rate Cost % = aiCogs / receita */
export function calcAIRpct(receita: number, aiCogs: number): number {
  if (receita <= 0) return 0;
  return aiCogs / receita;
}

/** Format a ratio as a rounded percentage string (e.g. 0.153 → "15.3%") */
export function fmtPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

/** Format a BRL value with 2 decimal places */
export function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Gate R1 — RICE Score ──────────────────────────────────────

/** R1: rice_score >= 300 → pass; 150–299 → warn; < 150 → fail; 0 → pending */
export function gateR1(riceScore: number): GateStatus {
  if (riceScore <= 0) return 'pending';
  if (riceScore >= 300) return 'pass';
  if (riceScore >= 150) return 'warn';
  return 'fail';
}

// ── Gate R2 — AIR% ────────────────────────────────────────────

/** R2: air% <= 35% → pass; 35–40% → warn; > 40% → fail; 0 receita → pending */
export function gateR2(airPct: number): GateStatus {
  if (airPct <= 0) return 'pending';
  if (airPct <= 0.35) return 'pass';
  if (airPct <= 0.40) return 'warn';
  return 'fail';
}

// ── Gate R3 — GEM ─────────────────────────────────────────────

/** R3: GEM >= 15% → pass; 10–14.99% → warn; < 10% → fail; receita 0 → pending */
export function gateR3(gem: number): GateStatus {
  if (gem === 0) return 'pending';
  if (gem >= 0.15) return 'pass';
  if (gem >= 0.10) return 'warn';
  return 'fail';
}

// ── Gate R4 — Moat ────────────────────────────────────────────

/** R4: moat defined and != 'none' → pass; 'none' → fail; null/undefined → pending */
export function gateR4(moat: string | null | undefined): GateStatus {
  if (!moat) return 'pending';
  if (moat === 'none') return 'fail';
  return 'pass';
}

// ── Gate R5 — KPI de Negócio ──────────────────────────────────

/** R5: kpi_negocio_alvo set → pass; empty/null → pending */
export function gateR5(kpiNegocioAlvo: string | null | undefined): GateStatus {
  if (!kpiNegocioAlvo?.trim()) return 'pending';
  return 'pass';
}

// ── Gate G6 — Vínculo Comercial ───────────────────────────────

/**
 * G6: epic with linked clients → all must have contract_signed_at.
 * Pass: no clients OR all have contract. Fail: at least one without contract.
 * @param clientesVinculados  IDs of clients linked to this epic
 * @param clientsWithContract IDs of commercial clients that have contract_signed_at
 */
export function gateG6(
  clientesVinculados: string[],
  clientsWithContract: string[],
): GateStatus {
  if (clientesVinculados.length === 0) return 'pass';
  const contractSet = new Set(clientsWithContract);
  const allSigned = clientesVinculados.every((id) => contractSet.has(id));
  return allSigned ? 'pass' : 'fail';
}

// ── Gate G7 — Documentação Regulatória ───────────────────────

/** G7: soft gate — always warn (never blocks go-live, just alerts) */
export function gateG7(): GateStatus {
  return 'warn';
}

// ── Gate G8 — Dependência Externa ────────────────────────────

/**
 * G8: if epic has external dependencies (Utila / BS2 / RISE),
 * technical feedback must be registered before sprint starts.
 * @param hasExternalDep  true if epic mentions external dependency
 * @param hasTechFeedback true if tech feedback was registered
 */
export function gateG8(hasExternalDep: boolean, hasTechFeedback: boolean): GateStatus {
  if (!hasExternalDep) return 'pass';
  if (hasTechFeedback) return 'pass';
  return 'fail';
}

// ── Aggregate helper ──────────────────────────────────────────

export type EpicPnlInput = {
  riceScore?: number | null;
  receita?: number | null;
  fixed?: number | null;
  aiCogs?: number | null;
  airEstimado?: number | null;
  moatClassificacao?: string | null;
  kpiNegocioAlvo?: string | null;
  clientesVinculados?: string[];
  clientsWithContract?: string[];
  hasExternalDep?: boolean;
  hasTechFeedback?: boolean;
};

export function computeAllGates(input: EpicPnlInput): GateResult[] {
  const receita = Number(input.receita ?? 0);
  const fixed   = Number(input.fixed   ?? 0);
  const aiCogs  = Number(input.aiCogs  ?? 0);
  const rice    = Number(input.riceScore ?? 0);
  const airPct  = input.airEstimado != null
    ? Number(input.airEstimado) / 100
    : calcAIRpct(receita, aiCogs);
  const gem = calcGEM(receita, fixed, aiCogs);

  return [
    {
      code: 'R1',
      status: gateR1(rice),
      computedValue: rice,
      note: `RICE Score: ${rice}`,
    },
    {
      code: 'R2',
      status: gateR2(airPct),
      computedValue: Math.round(airPct * 10000) / 100,
      note: `AIR: ${fmtPct(airPct)}`,
    },
    {
      code: 'R3',
      status: gateR3(gem),
      computedValue: Math.round(gem * 10000) / 100,
      note: `GEM: ${fmtPct(gem)}`,
    },
    {
      code: 'R4',
      status: gateR4(input.moatClassificacao),
      note: `Moat: ${input.moatClassificacao ?? 'não definido'}`,
    },
    {
      code: 'R5',
      status: gateR5(input.kpiNegocioAlvo),
      note: input.kpiNegocioAlvo ? `KPI: ${input.kpiNegocioAlvo}` : 'KPI não definido',
    },
    {
      code: 'G6',
      status: gateG6(
        input.clientesVinculados ?? [],
        input.clientsWithContract ?? [],
      ),
      note: `${input.clientesVinculados?.length ?? 0} cliente(s) vinculado(s)`,
    },
    {
      code: 'G7',
      status: gateG7(),
      note: 'Verificar documentação regulatória antes do go-live',
    },
    {
      code: 'G8',
      status: gateG8(input.hasExternalDep ?? false, input.hasTechFeedback ?? false),
      note: input.hasExternalDep
        ? (input.hasTechFeedback ? 'Feedback técnico registrado' : 'Feedback técnico pendente')
        : 'Sem dependência externa',
    },
  ];
}
