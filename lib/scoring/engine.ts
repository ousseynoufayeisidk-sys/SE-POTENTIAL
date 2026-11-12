export type Dimension = 'PEOPLE' | 'EXECUTION' | 'BUSINESS' | 'IMPACT';

export interface Criterion {
  code: string;
  dimension: Dimension;
  label: string;
  weight: number;
}

export interface Rating {
  criterionCode: string;
  note: 1 | 2 | 3 | 4 | 5;
}

export interface Band {
  min: number;
  key: string;
  label: string;
}

export interface ModelConfig {
  bands: Band[];
  dimensionMinimums?: Partial<Record<Dimension, number>>;
  disagreementThreshold: number;
}

export type FlagType = 'INCOMPLETE' | 'DISAGREEMENT' | 'DIMENSION_BELOW_MIN';

export interface Flag {
  type: FlagType;
  detail: string;
}

export interface DimensionScore {
  score: number;
  max: number;
  pct: number;
}

export interface ScoreResult {
  total: number | null;
  complete: boolean;
  byDimension: Record<Dimension, DimensionScore>;
  potentialIndex: number | null; // (PEOPLE+EXECUTION) / max * 100
  projectMaturity: number | null; // BUSINESS / max * 100
  band: Band | null;
  flags: Flag[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const DIMS: Dimension[] = ['PEOPLE', 'EXECUTION', 'BUSINESS', 'IMPACT'];

export function computeScore(
  criteria: Criterion[],
  ratingsByEvaluator: Rating[][],
  config: ModelConfig
): ScoreResult {
  const flags: Flag[] = [];
  const notes = new Map<string, number[]>();

  // Agréger les notes de tous les évaluateurs
  for (const ratings of ratingsByEvaluator) {
    for (const r of ratings) {
      notes.set(r.criterionCode, [...(notes.get(r.criterionCode) ?? []), r.note]);
    }
  }

  // Initialiser les scores par dimension
  const dims = Object.fromEntries(
    DIMS.map((d) => [d, { score: 0, max: 0, pct: 0 }])
  ) as Record<Dimension, DimensionScore>;

  let rated = 0;

  // Calculer les scores
  for (const c of criteria) {
    dims[c.dimension].max += c.weight;
    const n = notes.get(c.code);
    if (!n?.length) continue;
    rated++;
    const avg = n.reduce((s, x) => s + x, 0) / n.length;
    dims[c.dimension].score += (c.weight * avg) / 5;

    // Vérifier les désaccords entre évaluateurs
    if (n.length > 1 && Math.max(...n) - Math.min(...n) >= config.disagreementThreshold) {
      flags.push({
        type: 'DISAGREEMENT',
        detail: `${c.label} : notes ${n.join(' / ')}`,
      });
    }
  }

  // Arrondir et calculer les pourcentages
  for (const d of DIMS) {
    dims[d].score = r1(dims[d].score);
    dims[d].pct = dims[d].max ? r1((dims[d].score / dims[d].max) * 100) : 0;
  }

  const complete = criteria.length > 0 && rated === criteria.length;
  if (!complete) {
    flags.push({
      type: 'INCOMPLETE',
      detail: `${rated}/${criteria.length} critères notés`,
    });
  }

  const total = rated ? r1(DIMS.reduce((s, d) => s + dims[d].score, 0)) : null;

  // Vérifier les minimums par dimension
  if (complete) {
    for (const [d, min] of Object.entries(config.dimensionMinimums ?? {}) as [
      Dimension,
      number
    ][]) {
      if (dims[d].pct < min) {
        flags.push({
          type: 'DIMENSION_BELOW_MIN',
          detail: `${d} à ${dims[d].pct} % (minimum ${min} %)`,
        });
      }
    }
  }

  // Calculer l'indice de potentiel (PEOPLE + EXECUTION)
  const pe = dims.PEOPLE.max + dims.EXECUTION.max;
  const potentialIndex =
    complete && pe ? r1(((dims.PEOPLE.score + dims.EXECUTION.score) / pe) * 100) : null;

  // Calculer la maturité du projet (BUSINESS)
  const projectMaturity = complete ? dims.BUSINESS.pct : null;

  // Déterminer la bande
  const band =
    complete && total !== null
      ? [...config.bands].sort((a, b) => b.min - a.min).find((b) => total >= b.min) ?? null
      : null;

  return {
    total,
    complete,
    byDimension: dims,
    potentialIndex,
    projectMaturity,
    band,
    flags,
  };
}
