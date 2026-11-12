'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DimensionRadar } from '@/components/jury/DimensionRadar';
import { DecisionForm } from '@/components/jury/DecisionForm';
import { computeScore } from '@/lib/scoring/engine';
import { recordDecision } from '@/app/actions/decisions';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Criterion, Evaluation, ScoreResult } from '@/lib/scoring/engine';

export default function JurySynthesePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const appId = params.appId as string;

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDecision, setHasDecision] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [appId]);

  const loadApplication = async () => {
    try {
      // Charger les critères
      const { data: criteriaData } = await supabase.from('criteria').select('*').order('position');

      if (!criteriaData) return;
      setCriteria(criteriaData);

      // Charger les évaluations soumises
      const { data: evaluationsData } = await supabase
        .from('evaluations')
        .select(
          `
          *,
          evaluation_scores(*, criterion:criteria(code)),
          evaluator:profiles(full_name)
        `
        )
        .eq('application_id', appId)
        .eq('status', 'submitted');

      if (!evaluationsData) return;
      setEvaluations(evaluationsData);

      // Calculer le score
      const ratingsByEvaluator = evaluationsData.map((eval: any) =>
        eval.evaluation_scores
          .filter((s: any) => s.note !== null)
          .map((s: any) => ({
            criterionCode: s.criterion.code,
            note: s.note,
          }))
      );

      const config = {
        bands: [
          { min: 80, key: 'ELEVE', label: 'Potentiel élevé' },
          { min: 65, key: 'INTERESSANT', label: 'Potentiel intéressant' },
          { min: 50, key: 'A_CONSOLIDER', label: 'À consolider' },
          { min: 0, key: 'INSUFFISANT', label: 'Insuffisamment démontré' },
        ],
        disagreementThreshold: 2,
        dimensionMinimums: {
          PEOPLE: 30,
          EXECUTION: 30,
          BUSINESS: 30,
          IMPACT: 20,
        },
      };

      const result = computeScore(criteriaData as any, ratingsByEvaluator, config);
      setScoreResult(result);

      // Vérifier si décision existe
      const { data: decision } = await supabase
        .from('jury_decisions')
        .select('*')
        .eq('application_id', appId)
        .single();

      setHasDecision(!!decision);
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (data: any) => {
    const result = await recordDecision(appId, {
      ...data,
      finalScore: scoreResult?.total || undefined,
      modelId: criteria[0]?.model_id,
    });

    if (result.error) {
      alert(result.error);
    } else {
      router.push('/jury');
    }
  };

  const getBandBadge = (band: any) => {
    const variants: Record<string, any> = {
      ELEVE: 'eleve',
      INTERESSANT: 'interessant',
      A_CONSOLIDER: 'consolider',
      INSUFFISANT: 'insuffisant',
    };

    return (
      <Badge variant={variants[band.key] || 'secondary'} className="text-lg px-4 py-1">
        {band.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!scoreResult) {
    return (
      <div className="min-h-screen bg-brume p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-nuit/60">Aucune évaluation soumise pour cette candidature.</p>
              <Button onClick={() => router.push('/jury')} className="mt-4">
                Retour au tableau
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brume p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/jury')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-display font-bold text-baobab">
            Synthèse candidat {appId.slice(0, 8)}
          </h1>
        </div>

        {/* Score et radar */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Score final</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-6xl font-bold text-baobab">{scoreResult.total}</div>
              <div>{scoreResult.band && getBandBadge(scoreResult.band)}</div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-nuit/60">Indice potentiel</div>
                  <div className="text-2xl font-bold text-ocean">{scoreResult.potentialIndex}%</div>
                  <div className="text-xs text-nuit/60">PEOPLE + EXECUTION</div>
                </div>
                <div>
                  <div className="text-sm text-nuit/60">Maturité projet</div>
                  <div className="text-2xl font-bold text-ocean">{scoreResult.projectMaturity}%</div>
                  <div className="text-xs text-nuit/60">BUSINESS</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Radar 4 dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <DimensionRadar
                people={scoreResult.byDimension.PEOPLE.pct}
                execution={scoreResult.byDimension.EXECUTION.pct}
                business={scoreResult.byDimension.BUSINESS.pct}
                impact={scoreResult.byDimension.IMPACT.pct}
              />
            </CardContent>
          </Card>
        </div>

        {/* Flags et alertes */}
        {scoreResult.flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-soleil" />
                Points d'attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {scoreResult.flags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-soleil/5 rounded-md">
                    <AlertCircle className="h-5 w-5 text-soleil flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{flag.type.replace('_', ' ')}</div>
                      <div className="text-sm text-nuit/70">{flag.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparaison évaluateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Évaluations ({evaluations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations.map((eval: any) => (
                <div key={eval.id} className="flex items-center justify-between p-3 bg-brume rounded-md">
                  <div>
                    <div className="font-medium">{eval.evaluator?.full_name || 'Évaluateur'}</div>
                    <div className="text-sm text-nuit/60">
                      Soumis le {new Date(eval.submitted_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-baobab" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulaire de décision */}
        {!hasDecision ? (
          <DecisionForm onSubmit={handleDecision} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-baobab mx-auto mb-4" />
              <p className="text-lg font-medium">Décision déjà enregistrée pour cette candidature</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
