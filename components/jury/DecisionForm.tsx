'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Decision } from '@/lib/supabase/types';

interface DecisionFormProps {
  onSubmit: (data: {
    decision: Decision;
    justification: string;
    conditions?: string;
    plan90d?: string;
  }) => Promise<void>;
}

const DECISIONS: { value: Decision; label: string; description: string }[] = [
  {
    value: 'SELECTION_PRIORITAIRE',
    label: 'Sélection prioritaire',
    description: 'Potentiel élevé, à accompagner en priorité',
  },
  {
    value: 'ACCOMPAGNEMENT_CIBLE',
    label: 'Accompagnement ciblé',
    description: 'Potentiel intéressant, besoins spécifiques identifiés',
  },
  {
    value: 'PRE_INCUBATION',
    label: 'Pré-incubation',
    description: 'Projet à consolider avant intégration',
  },
  {
    value: 'NON_RETENU_A_CE_STADE',
    label: 'Non retenu à ce stade',
    description: 'Projet non mature, encourager à repostuler',
  },
  {
    value: 'COMPLEMENT_REQUIS',
    label: 'Complément d\'information requis',
    description: 'Besoin de clarifications avant décision',
  },
];

export function DecisionForm({ onSubmit }: DecisionFormProps) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [justification, setJustification] = useState('');
  const [conditions, setConditions] = useState('');
  const [plan90d, setPlan90d] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision || justification.length < 50) {
      alert('Veuillez choisir une décision et fournir une justification d\'au moins 50 caractères');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        decision,
        justification,
        conditions: conditions || undefined,
        plan90d: plan90d || undefined,
      });
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Erreur lors de la soumission de la décision');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Décision du jury</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Décision *</Label>
            <div className="space-y-2">
              {DECISIONS.map((d) => (
                <label
                  key={d.value}
                  className={`flex items-start gap-3 p-4 rounded-md border-2 cursor-pointer transition-all ${
                    decision === d.value
                      ? 'border-baobab bg-baobab/5'
                      : 'border-nuit/10 hover:border-baobab/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={d.value}
                    checked={decision === d.value}
                    onChange={(e) => setDecision(e.target.value as Decision)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{d.label}</div>
                    <div className="text-sm text-nuit/60">{d.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification" className="text-base font-semibold">
              Justification * (minimum 50 caractères)
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Expliquez les raisons de cette décision en vous appuyant sur les scores, les preuves et les observations..."
              rows={6}
              required
            />
            <div className="text-sm text-nuit/60 text-right">
              {justification.length}/50 caractères minimum
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions" className="text-base font-semibold">
              Conditions avant admission (optionnel)
            </Label>
            <Textarea
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Exemple : Formalisation administrative, formation comptabilité, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan90d" className="text-base font-semibold">
              Recommandations à 90 jours (optionnel)
            </Label>
            <Textarea
              id="plan90d"
              value={plan90d}
              onChange={(e) => setPlan90d(e.target.value)}
              placeholder="Plan d'action recommandé pour les 3 premiers mois..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !decision || justification.length < 50}
            className="w-full"
            size="lg"
          >
            {loading ? 'Enregistrement...' : 'Valider la décision'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
