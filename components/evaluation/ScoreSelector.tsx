'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ScoreSelectorProps {
  value?: number;
  onChange: (value: number) => void;
  label: string;
  weight: number;
  disabled?: boolean;
}

const ANCHORS = [
  { value: 1, label: 'Non démontré', description: 'Pas de preuve ou réponse floue' },
  { value: 2, label: 'Émergent', description: 'Début de démonstration, exemple partiel' },
  {
    value: 3,
    label: 'Opérationnel',
    description: 'Exemple précis, action personnelle identifiable',
  },
  {
    value: 4,
    label: 'Confirmé',
    description: 'Plusieurs exemples, résultats mesurables',
  },
  {
    value: 5,
    label: 'Très solide',
    description: 'Exemples multiples, impact quantifié, apprentissage',
  },
];

export function ScoreSelector({ value, onChange, label, weight, disabled }: ScoreSelectorProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const displayValue = hoveredValue ?? value;
  const currentAnchor = displayValue ? ANCHORS.find((a) => a.value === displayValue) : null;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <Label className="text-base font-medium">{label}</Label>
        <span className="text-sm text-nuit/60">Poids: {weight}</span>
      </div>

      <div className="flex gap-2">
        {ANCHORS.map((anchor) => (
          <button
            key={anchor.value}
            type="button"
            onClick={() => onChange(anchor.value)}
            onMouseEnter={() => setHoveredValue(anchor.value)}
            onMouseLeave={() => setHoveredValue(null)}
            disabled={disabled}
            className={cn(
              'flex-1 h-12 rounded-md border-2 transition-all text-lg font-semibold',
              'hover:scale-105 active:scale-95',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              value === anchor.value
                ? 'bg-baobab text-white border-baobab shadow-md'
                : 'bg-white text-nuit border-nuit/20 hover:border-baobab/50'
            )}
            aria-label={`Note ${anchor.value}: ${anchor.label}`}
          >
            {anchor.value}
          </button>
        ))}
      </div>

      {currentAnchor && (
        <div className="bg-ocean/5 p-3 rounded-md border border-ocean/10 min-h-[60px]">
          <div className="font-medium text-sm text-ocean mb-1">{currentAnchor.label}</div>
          <div className="text-sm text-nuit/70">{currentAnchor.description}</div>
        </div>
      )}
    </div>
  );
}
