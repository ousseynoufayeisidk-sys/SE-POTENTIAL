import { z } from 'zod';

export const scoreInput = z
  .object({
    criterionCode: z.string(),
    note: z.number().int().min(1).max(5),
    evidences: z.array(z.string().min(5)).default([]),
    strongProof: z.boolean().default(false),
    toVerify: z.boolean().default(false),
    comment: z.string().optional(),
  })
  .refine((s) => s.note < 4 || s.evidences.length >= 2 || s.strongProof, {
    message: 'Une note 4 ou 5 demande au moins 2 preuves, ou 1 preuve très forte.',
    path: ['evidences'],
  });

export type ScoreInput = z.infer<typeof scoreInput>;
