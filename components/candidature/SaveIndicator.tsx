'use client';

import { Check, Loader2 } from 'lucide-react';

interface SaveIndicatorProps {
  saving: boolean;
  saved: boolean;
}

export function SaveIndicator({ saving, saved }: SaveIndicatorProps) {
  if (saving) {
    return (
      <div className="flex items-center gap-2 text-sm text-ocean">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Enregistrement...</span>
      </div>
    );
  }

  if (saved) {
    return (
      <div className="flex items-center gap-2 text-sm text-baobab">
        <Check className="h-4 w-4" />
        <span>Enregistré</span>
      </div>
    );
  }

  return null;
}
