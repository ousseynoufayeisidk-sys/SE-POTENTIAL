'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Decision } from '@/lib/supabase/types';

interface DecisionData {
  decision: Decision;
  justification: string;
  twoProofs?: string[];
  twoRisks?: string[];
  strengths?: string[];
  toDevelop?: string[];
  conditions?: string;
  plan90d?: string;
  finalScore?: number;
  modelId?: string;
}

export async function recordDecision(applicationId: string, data: DecisionData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Vérifier que la justification est présente
  if (!data.justification || data.justification.length < 50) {
    return { error: 'La justification doit contenir au moins 50 caractères' };
  }

  // Enregistrer la décision
  const { error: decisionError } = await supabase.from('jury_decisions').upsert(
    {
      application_id: applicationId,
      decision: data.decision,
      final_score: data.finalScore,
      model_id: data.modelId,
      two_proofs: data.twoProofs,
      two_risks: data.twoRisks,
      strengths: data.strengths,
      to_develop: data.toDevelop,
      justification: data.justification,
      conditions: data.conditions,
      plan_90d: data.plan90d,
      decided_by: user.id,
      decided_at: new Date().toISOString(),
    },
    { onConflict: 'application_id' }
  );

  if (decisionError) {
    return { error: decisionError.message };
  }

  // Mettre à jour le stage de l'application
  await supabase
    .from('applications')
    .update({ stage: 'DECISION' })
    .eq('id', applicationId);

  // Enregistrer dans l'audit log
  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'JURY_DECISION',
    entity: 'applications',
    entity_id: applicationId,
    diff: { decision: data.decision, score: data.finalScore },
  });

  revalidatePath('/jury');
  return { success: true };
}
