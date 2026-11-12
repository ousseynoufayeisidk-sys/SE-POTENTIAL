'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScoreSelector } from '@/components/evaluation/ScoreSelector';
import { SaveIndicator } from '@/components/candidature/SaveIndicator';
import { saveScore, submitEvaluation } from '@/app/actions/evaluations';
import { debounce } from '@/lib/utils';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import type { Criterion, PrequalAnswer } from '@/lib/supabase/types';

interface ScoreData {
  note?: number;
  evidences: string[];
  strongProof: boolean;
  toVerify: boolean;
  comment?: string;
}

export default function EvaluationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const appId = params.appId as string;

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [answers, setAnswers] = useState<PrequalAnswer[]>([]);
  const [scores, setScores] = useState<Record<string, ScoreData>>({});
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentDimension, setCurrentDimension] = useState<string>('PEOPLE');

  useEffect(() => {
    loadEvaluation();
  }, [appId]);

  const loadEvaluation = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Charger l'évaluation
      const { data: evaluation } = await supabase
        .from('evaluations')
        .select('*')
        .eq('application_id', appId)
        .eq('evaluator_id', user.id)
        .single();

      if (!evaluation) {
        router.push('/evaluateur');
        return;
      }

      setEvaluationId(evaluation.id);

      // Charger les critères
      const { data: criteriaData } = await supabase
        .from('criteria')
        .select('*')
        .order('position');

      if (criteriaData) {
        setCriteria(criteriaData);
      }

      // Charger les réponses du candidat
      const { data: answersData } = await supabase
        .from('prequal_answers')
        .select('*')
        .eq('application_id', appId);

      if (answersData) {
        setAnswers(answersData);
      }

      // Charger les scores existants
      const { data: scoresData } = await supabase
        .from('evaluation_scores')
        .select('*, criterion:criteria(code)')
        .eq('evaluation_id', evaluation.id);

      if (scoresData) {
        const scoresMap: Record<string, ScoreData> = {};
        scoresData.forEach((s: any) => {
          scoresMap[s.criterion.code] = {
            note: s.note,
            evidences: s.evidences || [],
            strongProof: s.strong_proof,
            toVerify: s.to_verify,
            comment: s.comment,
          };
        });
        setScores(scoresMap);
      }
    } catch (error) {
      console.error('Error loading evaluation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = debounce(async (criterionCode: string, data: Partial<ScoreData>) => {
    if (!evaluationId) return;

    setSaving(true);
    const currentScore = scores[criterionCode] || {
      evidences: [],
      strongProof: false,
      toVerify: false,
    };

    const updatedScore = { ...currentScore, ...data };
    setScores((prev) => ({ ...prev, [criterionCode]: updatedScore }));

    try {
      await saveScore(evaluationId, {
        criterionCode,
        note: updatedScore.note!,
        evidences: updatedScore.evidences,
        strongProof: updatedScore.strongProof,
        toVerify: updatedScore.toVerify,
        comment: updatedScore.comment,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setSaving(false);
    }
  }, 500);

  const handleSubmit = async () => {
    if (!evaluationId) return;

    if (!confirm('Voulez-vous vraiment soumettre cette évaluation ? Elle ne pourra plus être modifiée.')) {
      return;
    }

    const result = await submitEvaluation(evaluationId);
    if (result.error) {
      alert(result.error);
    } else {
      router.push('/evaluateur');
    }
  };

  const criteriaByDimension = criteria.filter((c) => c.dimension === currentDimension);
  const dimensions = ['PEOPLE', 'EXECUTION', 'BUSINESS', 'IMPACT'];
  const completedCount = criteria.filter((c) => scores[c.code]?.note).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brume">
      <div className="grid lg:grid-cols-2 gap-4 p-4 max-w-screen-2xl mx-auto">
        {/* Volet gauche : Réponses du candidat */}
        <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.push('/evaluateur')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <SaveIndicator saving={saving} saved={saved} />
              </div>
              <CardTitle>Réponses du candidat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {answers.map((answer, idx) => (
                <div key={answer.question_id} className="border-b border-nuit/10 pb-4 last:border-0">
                  <div className="font-medium text-sm text-nuit/60 mb-2">Question {idx + 1}</div>
                  <div className="text-sm whitespace-pre-wrap">{answer.answer}</div>
                  {answer.proof_path && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-baobab">
                      <Check className="h-4 w-4" />
                      <span>Preuve jointe</span>
                    </div>
                  )}
                  {answer.no_proof_reason && (
                    <div className="mt-2 text-sm text-nuit/60 bg-brume p-2 rounded">
                      Pas de preuve : {answer.no_proof_reason}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Volet droit : Grille d'évaluation */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Grille d'évaluation</CardTitle>
                <div className="text-sm">
                  <span className="font-semibold">{completedCount}</span>
                  <span className="text-nuit/60">/{criteria.length} critères</span>
                </div>
              </div>

              {/* Tabs pour dimensions */}
              <div className="flex gap-2 flex-wrap">
                {dimensions.map((dim) => {
                  const dimCriteria = criteria.filter((c) => c.dimension === dim);
                  const dimCompleted = dimCriteria.filter((c) => scores[c.code]?.note).length;
                  return (
                    <button
                      key={dim}
                      onClick={() => setCurrentDimension(dim)}
                      className={cn(
                        'px-4 py-2 rounded-md text-sm font-medium transition-all',
                        currentDimension === dim
                          ? 'bg-baobab text-white'
                          : 'bg-white text-nuit border border-nuit/20 hover:border-baobab/50'
                      )}
                    >
                      {dim} ({dimCompleted}/{dimCriteria.length})
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {criteriaByDimension.map((criterion) => {
                const score = scores[criterion.code] || {
                  evidences: [],
                  strongProof: false,
                  toVerify: false,
                };

                const needsProof = score.note && score.note >= 4 && score.evidences.length < 2 && !score.strongProof;

                return (
                  <div key={criterion.code} className="border rounded-lg p-4 space-y-4">
                    <ScoreSelector
                      label={criterion.label}
                      weight={criterion.weight}
                      value={score.note}
                      onChange={(note) => handleScoreChange(criterion.code, { note })}
                    />

                    {needsProof && (
                      <div className="bg-soleil/10 border border-soleil/30 p-3 rounded-md flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-soleil flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium text-soleil">Preuves requises</div>
                          <div className="text-nuit/70">
                            Une note 4 ou 5 nécessite au moins 2 preuves, ou 1 preuve très forte
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Preuves observées</Label>
                      <Textarea
                        value={score.evidences.join('\n')}
                        onChange={(e) =>
                          handleScoreChange(criterion.code, {
                            evidences: e.target.value.split('\n').filter(Boolean),
                          })
                        }
                        placeholder="• Preuve 1&#10;• Preuve 2&#10;• ..."
                        rows={3}
                      />
                      <div className="text-xs text-nuit/60">Une preuve par ligne</div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={score.strongProof}
                          onChange={(e) =>
                            handleScoreChange(criterion.code, { strongProof: e.target.checked })
                          }
                        />
                        <span className="text-sm">Preuve très forte (remplace les 2 preuves)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={score.toVerify}
                          onChange={(e) =>
                            handleScoreChange(criterion.code, { toVerify: e.target.checked })
                          }
                        />
                        <span className="text-sm">À vérifier</span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <Label>Commentaire (optionnel)</Label>
                      <Textarea
                        value={score.comment || ''}
                        onChange={(e) =>
                          handleScoreChange(criterion.code, { comment: e.target.value })
                        }
                        placeholder="Observations complémentaires..."
                        rows={2}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmit}
            disabled={completedCount < criteria.length}
            size="lg"
            className="w-full"
          >
            Soumettre l'évaluation
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
