import { describe, it, expect } from 'vitest';
import {
  calcGEM,
  calcAIRpct,
  gateR1,
  gateR2,
  gateR3,
  gateR4,
  gateR5,
  gateG6,
  gateG7,
  gateG8,
  computeAllGates,
} from '../pnl.service';

describe('calcGEM', () => {
  it('returns 0 when receita is 0', () => {
    expect(calcGEM(0, 100, 50)).toBe(0);
  });

  it('returns 0 when receita is negative', () => {
    expect(calcGEM(-1, 0, 0)).toBe(0);
  });

  it('computes margin correctly', () => {
    // (1000 - 200 - 150) / 1000 = 0.65
    expect(calcGEM(1000, 200, 150)).toBeCloseTo(0.65);
  });

  it('returns negative value when costs exceed revenue', () => {
    expect(calcGEM(100, 80, 50)).toBeCloseTo(-0.3);
  });
});

describe('calcAIRpct', () => {
  it('returns 0 when receita is 0', () => {
    expect(calcAIRpct(0, 50)).toBe(0);
  });

  it('computes AI cost ratio correctly', () => {
    expect(calcAIRpct(1000, 400)).toBeCloseTo(0.4);
  });
});

describe('gateR1 — RICE Score', () => {
  it('pending when score is 0', () => expect(gateR1(0)).toBe('pending'));
  it('fail when score < 150', () => expect(gateR1(149)).toBe('fail'));
  it('warn when score is 150', () => expect(gateR1(150)).toBe('warn'));
  it('warn when score is 299', () => expect(gateR1(299)).toBe('warn'));
  it('pass when score is 300', () => expect(gateR1(300)).toBe('pass'));
  it('pass when score is 500', () => expect(gateR1(500)).toBe('pass'));
});

describe('gateR2 — AIR%', () => {
  it('pending when airPct is 0', () => expect(gateR2(0)).toBe('pending'));
  it('pass when airPct <= 35%', () => expect(gateR2(0.35)).toBe('pass'));
  it('warn when airPct is between 35% and 40%', () => expect(gateR2(0.38)).toBe('warn'));
  it('warn at exactly 40%', () => expect(gateR2(0.40)).toBe('warn'));
  it('fail when airPct > 40%', () => expect(gateR2(0.41)).toBe('fail'));
});

describe('gateR3 — GEM', () => {
  it('pending when gem is exactly 0', () => expect(gateR3(0)).toBe('pending'));
  it('fail when gem is negative', () => expect(gateR3(-0.05)).toBe('fail'));
  it('fail when gem < 10%', () => expect(gateR3(0.09)).toBe('fail'));
  it('warn when gem is 10%', () => expect(gateR3(0.10)).toBe('warn'));
  it('warn when gem is 14.99%', () => expect(gateR3(0.1499)).toBe('warn'));
  it('pass when gem is 15%', () => expect(gateR3(0.15)).toBe('pass'));
  it('pass when gem is 80%', () => expect(gateR3(0.80)).toBe('pass'));
});

describe('gateR4 — Moat', () => {
  it('pending when null', () => expect(gateR4(null)).toBe('pending'));
  it('pending when undefined', () => expect(gateR4(undefined)).toBe('pending'));
  it('pending when empty string', () => expect(gateR4('')).toBe('pending'));
  it('fail when "none"', () => expect(gateR4('none')).toBe('fail'));
  it('pass when defined and not "none"', () => expect(gateR4('network_effects')).toBe('pass'));
});

describe('gateR5 — KPI', () => {
  it('pending when null', () => expect(gateR5(null)).toBe('pending'));
  it('pending when empty string', () => expect(gateR5('')).toBe('pending'));
  it('pending when whitespace only', () => expect(gateR5('   ')).toBe('pending'));
  it('pass when kpi is defined', () => expect(gateR5('Custo por transação < R$0,10')).toBe('pass'));
});

describe('gateG6 — Vínculo Comercial', () => {
  it('pass when no clients linked', () =>
    expect(gateG6([], [])).toBe('pass'));

  it('pass when all linked clients have contract', () => {
    const ids = ['id-1', 'id-2'];
    expect(gateG6(ids, ['id-1', 'id-2', 'id-3'])).toBe('pass');
  });

  it('fail when at least one client has no contract', () => {
    expect(gateG6(['id-1', 'id-2'], ['id-1'])).toBe('fail');
  });
});

describe('gateG7 — Regulatório', () => {
  it('always returns warn', () => expect(gateG7()).toBe('warn'));
});

describe('gateG8 — Dependência Externa', () => {
  it('pass when no external dependency', () =>
    expect(gateG8(false, false)).toBe('pass'));

  it('fail when dependency exists but no tech feedback', () =>
    expect(gateG8(true, false)).toBe('fail'));

  it('pass when dependency exists and feedback registered', () =>
    expect(gateG8(true, true)).toBe('pass'));
});

describe('computeAllGates', () => {
  it('returns 8 gate results', () => {
    const results = computeAllGates({});
    expect(results).toHaveLength(8);
    expect(results.map((r) => r.code)).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'G6', 'G7', 'G8']);
  });

  it('computes GEM from receita/fixed/aiCogs when airEstimado is not given', () => {
    // receita=1000, fixed=200, aiCogs=300 → GEM=0.5 → R3=pass
    // AIR = 300/1000 = 30% → R2=pass
    const results = computeAllGates({ receita: 1000, fixed: 200, aiCogs: 300 });
    const r3 = results.find((r) => r.code === 'R3')!;
    const r2 = results.find((r) => r.code === 'R2')!;
    expect(r3.status).toBe('pass');
    expect(r2.status).toBe('pass');
  });

  it('uses airEstimado override when provided', () => {
    // airEstimado=45 (45%) → R2=fail
    const results = computeAllGates({ airEstimado: 45 });
    const r2 = results.find((r) => r.code === 'R2')!;
    expect(r2.status).toBe('fail');
  });

  it('G7 is always warn', () => {
    const results = computeAllGates({ receita: 9999 });
    expect(results.find((r) => r.code === 'G7')?.status).toBe('warn');
  });
});
