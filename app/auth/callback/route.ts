import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Créer ou mettre à jour le profil
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: data.user.id,
          full_name: data.user.user_metadata.full_name,
          phone: data.user.user_metadata.phone,
          role: 'candidat', // Par défaut
        },
        { onConflict: 'id' }
      );

      // Rediriger vers le tableau de bord approprié
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'candidat') {
        return NextResponse.redirect(new URL('/candidater', requestUrl.origin));
      } else if (profile?.role === 'evaluateur') {
        return NextResponse.redirect(new URL('/evaluateur', requestUrl.origin));
      } else if (profile?.role === 'jury') {
        return NextResponse.redirect(new URL('/jury', requestUrl.origin));
      } else if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin));
      }
    }
  }

  // En cas d'erreur, rediriger vers login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
