import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-baobab text-white',
        secondary: 'border-transparent bg-ocean/10 text-ocean',
        outline: 'text-foreground',
        eleve: 'border-transparent bg-band-eleve text-white',
        interessant: 'border-transparent bg-band-interessant text-white',
        consolider: 'border-transparent bg-band-consolider text-white',
        insuffisant: 'border-transparent bg-band-insuffisant text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
