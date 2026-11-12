'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  estimatedMinutes?: number;
}

export function ProgressBar({ current, total, estimatedMinutes }: ProgressBarProps) {
  const percentage = (current / total) * 100;
  const remainingMinutes = estimatedMinutes
    ? Math.ceil((estimatedMinutes * (total - current)) / total)
    : null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-nuit/60">
          Question {current} sur {total}
        </span>
        {remainingMinutes && (
          <span className="text-nuit/60">Encore ~{remainingMinutes} min</span>
        )}
      </div>
      <div className="h-2 bg-brume rounded-full overflow-hidden">
        <div
          className="h-full bg-baobab transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
