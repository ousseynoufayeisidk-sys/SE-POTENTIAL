'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function startApplication(programId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Non authentifié' };
  }

  // Créer ou récupérer le candidat
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .upsert(
      {
        user_id: user.id,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (candidateError || !candidate) {
    return { error: 'Erreur lors de la création du profil candidat' };
  }

  // Créer l'application
  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .insert({
      candidate_id: candidate.id,
      program_id: programId,
      stage: 'REPERAGE',
    })
    .select()
    .single();

  if (applicationError) {
    return { error: 'Erreur lors de la création de la candidature' };
  }

  return { application };
}

export async function savePrequalAnswer(
  applicationId: string,
  questionId: number,
  answer: string,
  proofPath?: string,
  noProofReason?: string
) {
  const supabase = await createClient();

  const { error } = await supabase.from('prequal_answers').upsert(
    {
      application_id: applicationId,
      question_id: questionId,
      answer,
      proof_path: proofPath,
      no_proof_reason: noProofReason,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'application_id,question_id' }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function submitApplication(applicationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('applications')
    .update({
      stage: 'QUALIFICATION',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/candidature');
  return { success: true };
}

export async function uploadProof(applicationId: string, file: File) {
  const supabase = await createClient();

  const fileName = `${applicationId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage.from('proofs').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    return { error: error.message };
  }

  // Générer URL signée
  const { data: urlData } = await supabase.storage.from('proofs').createSignedUrl(fileName, 86400); // 24h

  return { path: fileName, url: urlData?.signedUrl };
}
