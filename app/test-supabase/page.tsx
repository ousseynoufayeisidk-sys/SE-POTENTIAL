'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function testConnection() {
      try {
        // Test 1: Vérifier la configuration
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Test 2: Query simple
        const { data, error } = await supabase.from('profiles').select('count');

        if (error && error.code !== 'PGRST116') {
          // PGRST116 = table vide, c'est OK
          throw error;
        }

        setStatus('success');
        setDetails({
          supabaseUrl,
          hasAnonKey,
          queryWorked: true,
          currentUrl: window.location.origin,
          error: null,
        });
      } catch (err: any) {
        setStatus('error');
        setDetails({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          queryWorked: false,
          currentUrl: window.location.origin,
          error: err.message,
        });
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-baobab/5 to-ocean/5">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-baobab mb-8">
          🔍 Test Connexion Supabase
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {status === 'loading' && (
              <>
                <div className="w-6 h-6 border-4 border-ocean border-t-transparent rounded-full animate-spin" />
                <span className="text-lg">Test en cours...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="w-6 h-6 bg-baobab rounded-full flex items-center justify-center text-white">
                  ✓
                </div>
                <span className="text-lg text-baobab font-semibold">
                  ✅ Connexion Supabase OK !
                </span>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="w-6 h-6 bg-alerte rounded-full flex items-center justify-center text-white">
                  ✗
                </div>
                <span className="text-lg text-alerte font-semibold">
                  ❌ Erreur de connexion
                </span>
              </>
            )}
          </div>

          {details && (
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="font-semibold w-40">Supabase URL:</span>
                <span className="font-mono text-xs break-all">{details.supabaseUrl}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold w-40">Anon Key présente:</span>
                <span>{details.hasAnonKey ? '✅ Oui' : '❌ Non'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold w-40">Query test:</span>
                <span>{details.queryWorked ? '✅ Succès' : '❌ Échec'}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold w-40">URL actuelle:</span>
                <span className="font-mono text-xs">{details.currentUrl}</span>
              </div>
              {details.error && (
                <div className="mt-4 p-3 bg-alerte/10 border border-alerte/20 rounded">
                  <span className="font-semibold text-alerte">Erreur:</span>
                  <pre className="mt-2 text-xs overflow-auto">{details.error}</pre>
                </div>
              )}
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="bg-baobab/10 border border-baobab/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-baobab mb-3">
              🎉 Configuration OK !
            </h2>
            <p className="mb-4">
              Votre application peut communiquer avec Supabase. Maintenant :
            </p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Vérifiez les Redirect URLs dans Supabase Authentication</li>
              <li>Testez la création de compte sur <a href="/signup" className="text-ocean underline">/signup</a></li>
              <li>Vérifiez votre email pour le magic link</li>
            </ol>
            <a
              href="/signup"
              className="inline-block px-6 py-2 bg-baobab text-white rounded-md hover:bg-baobab/90 transition-colors"
            >
              Créer mon compte →
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-alerte/10 border border-alerte/20 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-alerte mb-3">
              ⚠️ Action requise
            </h2>
            <p className="mb-4">
              Vérifiez votre fichier <code className="bg-nuit/10 px-2 py-1 rounded">.env.local</code>
            </p>
            <pre className="bg-nuit/5 p-3 rounded text-xs overflow-auto mb-4">
{`NEXT_PUBLIC_SUPABASE_URL=https://kmrphnmviesuxltywjvk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...votre_clé
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...votre_clé`}
            </pre>
            <p className="text-sm">
              📖 Consultez{' '}
              <code className="bg-nuit/10 px-2 py-1 rounded">CONFIGURATION-CODESPACES.md</code>
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-ocean hover:underline">
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}
