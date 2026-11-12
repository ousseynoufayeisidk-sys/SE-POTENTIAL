'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProgressBar } from '@/components/candidature/ProgressBar';
import { SaveIndicator } from '@/components/candidature/SaveIndicator';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { debounce } from '@/lib/utils';
import type { PrequalQuestion } from '@/lib/supabase/types';

export default function CandidaterPage() {
  const [questions, setQuestions] = useState<PrequalQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    initApplication();
  }, []);

  const initApplication = async () => {
    try {
      // Vérifier l'authentification
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signup');
        return;
      }

      // Charger les questions
      const { data: questionsData } = await supabase
        .from('prequal_questions')
        .select('*')
        .order('position');

      if (questionsData) {
        setQuestions(questionsData);
      }

      // Créer ou récupérer la candidature
      // TODO: Implémenter la logique complète
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing application:', error);
      setLoading(false);
    }
  };

  const saveAnswer = debounce(async (questionId: number, answer: string) => {
    if (!applicationId) return;

    setSaving(true);
    try {
      await supabase.from('prequal_answers').upsert({
        application_id: applicationId,
        question_id: questionId,
        answer,
        updated_at: new Date().toISOString(),
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setSaving(false);
    }
  }, 800);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    saveAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Soumettre la candidature
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // TODO: Implémenter la soumission complète
    router.push('/candidature/success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentStep - 1];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';

  return (
    <div className="min-h-screen bg-brume p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-6">
          <ProgressBar current={currentStep} total={questions.length} estimatedMinutes={12} />
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">
                Question {currentStep}/{questions.length}
              </CardTitle>
              <SaveIndicator saving={saving} saved={saved} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion && (
              <>
                <div>
                  <Label className="text-lg font-normal">{currentQuestion.text}</Label>
                  {currentQuestion.help && (
                    <p className="text-sm text-nuit/60 mt-2 bg-ocean/5 p-3 rounded-md border border-ocean/10">
                      💡 {currentQuestion.help}
                    </p>
                  )}
                </div>

                <Textarea
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Votre réponse..."
                  rows={6}
                  className="text-base"
                />

                {currentQuestion.proof_hint && (
                  <div className="text-sm text-nuit/60">
                    <strong>Preuve suggérée :</strong> {currentQuestion.proof_hint}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Précédent
                  </Button>

                  <Button onClick={handleNext} disabled={!currentAnswer.trim()}>
                    {currentStep === questions.length ? (
                      'Envoyer ma candidature'
                    ) : (
                      <>
                        Suivant
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
