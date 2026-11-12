'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Evaluation, Application } from '@/lib/supabase/types';

interface EvaluationWithApplication extends Evaluation {
  application: Application & {
    candidate: {
      full_name: string;
      region?: string;
    };
  };
}

export default function EvaluateurPage() {
  const [evaluations, setEvaluations] = useState<EvaluationWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Charger les évaluations assignées
      const { data } = await supabase
        .from('evaluations')
        .select(
          `
          *,
          application:applications (
            *,
            candidate:candidates (
              user_id,
              region
            )
          )
        `
        )
        .eq('evaluator_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        // TODO: Enrichir avec le nom du candidat
        setEvaluations(data as any);
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'draft') {
      return <Badge variant="secondary">En cours</Badge>;
    }
    return <Badge variant="default">Soumise</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brume p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-baobab mb-2">Mes évaluations</h1>
          <p className="text-nuit/60">Dossiers de candidats assignés pour évaluation</p>
        </div>

        {evaluations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-nuit/60">
                Aucun dossier assigné pour l'instant. Votre coordinateur vous en attribuera
                bientôt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {evaluations.map((evaluation) => (
              <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Candidat {evaluation.application_id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {evaluation.application.candidate?.region || 'Région non spécifiée'}
                      </CardDescription>
                    </div>
                    {getStatusBadge(evaluation.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-nuit/60">
                      Créé le {new Date(evaluation.created_at).toLocaleDateString('fr-FR')}
                    </div>
                    <Button onClick={() => router.push(`/evaluateur/${evaluation.application_id}`)}>
                      {evaluation.status === 'draft' ? 'Continuer' : 'Voir l\'évaluation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
