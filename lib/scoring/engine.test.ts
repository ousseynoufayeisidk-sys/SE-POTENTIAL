import { describe, it, expect } from 'vitest';
import { computeScore, type Criterion, type Rating } from './engine';
import criteria from '../../supabase/seed/criteria.json';

const config = {
  bands: [
    { min: 80, key: 'ELEVE', label: 'Potentiel élevé' },
    { min: 65, key: 'INTERESSANT', label: 'Potentiel intéressant' },
    { min: 50, key: 'A_CONSOLIDER', label: 'À consolider' },
    { min: 0, key: 'INSUFFISANT', label: 'Insuffisamment démontré' },
  ],
  disagreementThreshold: 2,
};

const all = (note: 1 | 2 | 3 | 4 | 5): Rating[] =>
  criteria.map((c) => ({ criterionCode: c.code, note }));

describe('computeScore', () => {
  it('poids = 100', () => {
    expect(criteria.reduce((s, c) => s + c.weight, 0)).toBe(100);
  });

  it('tout à 5 => 100', () => {
    expect(computeScore(criteria as Criterion[], [all(5)], config).total).toBe(100);
  });

  it('tout à 4 => 80, Potentiel élevé', () => {
    const r = computeScore(criteria as Criterion[], [all(4)], config);
    expect(r.total).toBe(80);
    expect(r.band?.key).toBe('ELEVE');
  });

  it('tout à 3 => 60, À consolider', () => {
    const r = computeScore(criteria as Criterion[], [all(3)], config);
    expect(r.total).toBe(60);
    expect(r.band?.key).toBe('A_CONSOLIDER');
  });

  it('tout à 1 => 20', () => {
    expect(computeScore(criteria as Criterion[], [all(1)], config).total).toBe(20);
  });

  it('incomplet => pas de bande', () => {
    const r = computeScore(criteria as Criterion[], [all(5).slice(0, 10)], config);
    expect(r.band).toBeNull();
    expect(r.flags.some((f) => f.type === 'INCOMPLETE')).toBe(true);
  });

  it('désaccord ≥ 2 => flag', () => {
    const r = computeScore(criteria as Criterion[], [all(5), all(2)], config);
    expect(r.flags.some((f) => f.type === 'DISAGREEMENT')).toBe(true);
  });

  it('minimum de dimension => flag malgré un bon total', () => {
    const hi = criteria.map((c) => ({
      criterionCode: c.code,
      note: (c.dimension === 'IMPACT' ? 1 : 5) as 1 | 5,
    }));
    const r = computeScore(criteria as Criterion[], [hi], {
      ...config,
      dimensionMinimums: { IMPACT: 40 },
    });
    expect(r.flags.some((f) => f.type === 'DIMENSION_BELOW_MIN')).toBe(true);
  });

  it('calcul de potentialIndex (PEOPLE + EXECUTION)', () => {
    const r = computeScore(criteria as Criterion[], [all(5)], config);
    expect(r.potentialIndex).toBe(100);
  });

  it('calcul de projectMaturity (BUSINESS)', () => {
    const r = computeScore(criteria as Criterion[], [all(5)], config);
    expect(r.projectMaturity).toBe(100);
  });

  it('scores par dimension sont corrects', () => {
    const r = computeScore(criteria as Criterion[], [all(5)], config);
    expect(r.byDimension.PEOPLE.score).toBe(40);
    expect(r.byDimension.EXECUTION.score).toBe(25);
    expect(r.byDimension.BUSINESS.score).toBe(25);
    expect(r.byDimension.IMPACT.score).toBe(10);
  });

  it('moyenne de plusieurs évaluateurs', () => {
    // Tous les critères à 3 et 5 = moyenne 4
    const r = computeScore(criteria as Criterion[], [all(3), all(5)], config);
    expect(r.total).toBe(80); // moyenne de 4 => 80
  });
});
