'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';

interface ApplicationWithScore {
  id: string;
  candidate: {
    full_name?: string;
    region?: string;
    sector?: string;
  };
  stage: string;
  score?: number;
  band?: string;
  alerts_count: number;
}

export default function JuryPage() {
  const [applications, setApplications] = useState<ApplicationWithScore[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithScore[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = applications.filter(
        (app) =>
          app.candidate.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.candidate.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.candidate.sector?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications);
    }
  }, [searchQuery, applications]);

  const loadApplications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Charger les candidatures soumises
      // TODO: Implémenter le calcul du score
      const { data } = await supabase
        .from('applications')
        .select(
          `
          id,
          stage,
          candidate:candidates (
            region,
            sector
          )
        `
        )
        .eq('stage', 'QUALIFICATION')
        .order('submitted_at', { ascending: false });

      if (data) {
        // TODO: Calculer les scores
        setApplications(data as any);
        setFilteredApplications(data as any);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBandBadge = (band?: string) => {
    if (!band) return <Badge variant="secondary">En cours</Badge>;

    const variants = {
      ELEVE: 'eleve',
      INTERESSANT: 'interessant',
      A_CONSOLIDER: 'consolider',
      INSUFFISANT: 'insuffisant',
    };

    return (
      <Badge variant={variants[band as keyof typeof variants] || 'secondary'}>
        {band.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brume p-4">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-baobab mb-2">Tableau Jury</h1>
          <p className="text-nuit/60">
            Candidatures évaluées en attente de décision
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nuit/40" />
              <Input
                type="search"
                placeholder="Rechercher par nom, région, secteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-nuit/60">
                {searchQuery
                  ? 'Aucune candidature ne correspond à votre recherche.'
                  : 'Aucune candidature en attente de décision.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <div className="font-semibold">Candidat {app.id.slice(0, 8)}</div>
                      <div className="text-sm text-nuit/60">
                        {app.candidate.region || 'Non spécifié'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-baobab">
                        {app.score || '—'}
                      </div>
                      <div className="text-xs text-nuit/60">Score</div>
                    </div>
                    <div className="text-center">{getBandBadge(app.band)}</div>
                    <div className="text-center">
                      {app.alerts_count > 0 && (
                        <div className="flex items-center justify-center gap-1 text-alerte">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm">{app.alerts_count} alerte(s)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => router.push(`/jury/${app.id}`)}>Examiner</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
