'use server';

import { createClient } from '@/lib/supabase/server';
import { scoreInput } from '@/lib/scoring/validation';
import { revalidatePath } from 'next/cache';

export async function saveScore(evaluationId: string, data: any) {
  const supabase = await createClient();

  // Valider les données
  const validated = scoreInput.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.errors[0].message };
  }

  const { criterionCode, note, evidences, strongProof, toVerify, comment } = validated.data;

  // Récupérer le criterion_id
  const { data: criterion } = await supabase
    .from('criteria')
    .select('id')
    .eq('code', criterionCode)
    .single();

  if (!criterion) {
    return { error: 'Critère non trouvé' };
  }

  // Enregistrer le score
  const { error } = await supabase.from('evaluation_scores').upsert(
    {
      evaluation_id: evaluationId,
      criterion_id: criterion.id,
      note,
      evidences,
      strong_proof: strongProof,
      to_verify: toVerify,
      comment,
    },
    { onConflict: 'evaluation_id,criterion_id' }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function submitEvaluation(evaluationId: string) {
  const supabase = await createClient();

  // Vérifier que tous les critères sont notés
  const { count: totalCriteria } = await supabase
    .from('criteria')
    .select('*', { count: 'exact', head: true });

  const { count: scoredCriteria } = await supabase
    .from('evaluation_scores')
    .select('*', { count: 'exact', head: true })
    .eq('evaluation_id', evaluationId)
    .not('note', 'is', null);

  if (scoredCriteria !== totalCriteria) {
    return { error: 'Tous les critères doivent être notés avant de soumettre' };
  }

  // Soumettre l'évaluation
  const { error } = await supabase
    .from('evaluations')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', evaluationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/evaluateur');
  return { success: true };
}

export async function raiseAlert(
  applicationId: string,
  type: string,
  facts: string,
  source: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('alerts').insert({
    application_id: applicationId,
    type,
    facts,
    source,
    raised_by: user?.id,
    status: 'open',
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
