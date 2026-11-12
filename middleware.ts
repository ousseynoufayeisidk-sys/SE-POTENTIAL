import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Routes publiques
  const publicRoutes = ['/', '/login', '/login-password', '/signup', '/auth/callback', '/test-supabase'];
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname === route);

  // Rediriger vers login si non authentifié
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rediriger vers home si déjà authentifié et sur login/signup
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/login-password' || request.nextUrl.pathname === '/signup')) {
    // Récupérer le rôle pour redirection appropriée
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'candidat') {
      return NextResponse.redirect(new URL('/candidater', request.url));
    } else if (profile?.role === 'evaluateur') {
      return NextResponse.redirect(new URL('/evaluateur', request.url));
    } else if (profile?.role === 'jury') {
      return NextResponse.redirect(new URL('/jury', request.url));
    } else if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
