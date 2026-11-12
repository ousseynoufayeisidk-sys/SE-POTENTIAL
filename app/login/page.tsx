'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Un lien de connexion a été envoyé à votre adresse e-mail. Vérifiez votre boîte de réception.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Une erreur est survenue lors de l\'envoi du lien.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-display text-baobab">SE-POTENTIAL 360°</CardTitle>
          <CardDescription>Connexion à votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-nuit/60">
                Un lien de connexion sécurisé sera envoyé à cette adresse
              </p>
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-baobab/10 text-baobab border border-baobab/20'
                    : 'bg-alerte/10 text-alerte border border-alerte/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Recevoir le lien de connexion'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-nuit/60">Première visite ? </span>
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => router.push('/signup')}
              >
                Créer un compte
              </Button>
            </div>

            <div className="text-center">
              <Button variant="link" className="text-sm" onClick={() => router.push('/')}>
                ← Retour à l'accueil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
