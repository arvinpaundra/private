'use client';

import { useState, useCallback, useEffect, FormEvent } from 'react';
import type { Module, QuestionFromAPI } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  PartyPopper,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSummaryAction } from '@/actions/students';
import {
  createSubmissionAction,
  getQuestionAction,
  submitAnswerAction,
  finalizeSubmissionAction,
  type SubmitAnswerResponse,
  type FinalizeSubmissionResponse,
} from '@/actions/submissions';
import Logo from './logo';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Stage = 'intro' | 'quiz' | 'results';
type AnswerState = 'unanswered' | 'correct' | 'incorrect';

interface StoredSession {
  submission_code: string;
  module_slug: string;
  student_name: string;
  question_slug: string;
  question_index: number;
}

const STORAGE_KEY = 'quiz_session';

const saveSession = (data: StoredSession) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

const getSession = (moduleSlug: string): StoredSession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const session = JSON.parse(stored) as StoredSession;
    return session.module_slug === moduleSlug ? session : null;
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

export function ModuleRunner({ module }: { module: Module }) {
  const { toast } = useToast();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('intro');
  const [studentName, setStudentName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionCode, setSubmissionCode] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionFromAPI | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [answerResponse, setAnswerResponse] =
    useState<SubmitAnswerResponse | null>(null);
  const [finalResult, setFinalResult] =
    useState<FinalizeSubmissionResponse | null>(null);

  const totalQuestions = module.questions_count;

  // Check for existing session on mount
  useEffect(() => {
    const existingSession = getSession(module.slug);
    if (existingSession && existingSession.question_slug) {
      // Restore session
      setSubmissionCode(existingSession.submission_code);
      setStudentName(existingSession.student_name);
      setCurrentQuestionIndex(existingSession.question_index);

      // Fetch the question and start quiz
      fetchQuestion(
        existingSession.question_slug,
        existingSession.question_index
      )
        .then(() => {
          setStage('quiz');
          toast({
            title: 'Melanjutkan Kuis',
            description: 'Anda melanjutkan dari pertanyaan terakhir.',
          });
        })
        .catch(() => {
          // If fetching fails, clear the session
          clearSession();
        });
    }
  }, [module.slug]);

  const handleStart = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await createSubmissionAction(module.slug, studentName);
      setSubmissionCode(response.code);

      await fetchQuestion(response.first_question_slug, 0);

      // Save session to localStorage
      saveSession({
        submission_code: response.code,
        module_slug: module.slug,
        student_name: studentName,
        question_slug: response.first_question_slug,
        question_index: 0,
      });

      setStage('quiz');
      toast({
        title: 'Selamat datang!',
        description: 'Anda dapat memulai mengerjakan kuis.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Gagal memulai modul.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchQuestion = async (
    questionSlug: string,
    questionIndex?: number
  ) => {
    setQuestionLoading(true);
    try {
      const question = await getQuestionAction(module.slug, questionSlug);
      setCurrentQuestion(question);

      // Update URL with current question slug
      router.replace(`/m/${module.slug}?q=${questionSlug}`, { scroll: false });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Gagal mengambil pertanyaan.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setQuestionLoading(false);
    }
  };

  const checkAnswer = async () => {
    if (
      answerState !== 'unanswered' ||
      !userAnswer ||
      !currentQuestion ||
      !submissionCode
    )
      return;

    setIsSubmitting(true);
    try {
      const response = await submitAnswerAction(
        module.slug,
        submissionCode,
        currentQuestion.slug,
        userAnswer
      );

      setAnswerResponse(response);

      // Save session to localStorage with next question info if available
      if (submissionCode && studentName && response.next_question_slug) {
        saveSession({
          submission_code: submissionCode,
          module_slug: module.slug,
          student_name: studentName,
          question_slug: response.next_question_slug,
          question_index: currentQuestionIndex + 1,
        });
      } else if (submissionCode && !response.next_question_slug) {
        // Last question answered, clear session
        clearSession();
      }

      if (response.is_correct) {
        setAnswerState('correct');
      } else {
        setAnswerState('incorrect');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Gagal mengirim jawaban.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const finishModule = useCallback(async () => {
    if (!submissionCode) return;

    setIsSubmitting(true);
    try {
      const result = await finalizeSubmissionAction(
        module.slug,
        submissionCode
      );
      setFinalResult(result);
      setStage('results');

      // Clear session from localStorage
      clearSession();

      if (module.description) {
        setSummaryLoading(true);
        generateSummaryAction(module.description).then((res) => {
          if (res.summary) setSummary(res.summary);
          setSummaryLoading(false);
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Gagal menyelesaikan kuis.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [module.slug, module.description, submissionCode, toast]);

  const nextQuestion = async () => {
    setUserAnswer('');
    setAnswerState('unanswered');
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);

    if (answerResponse?.next_question_slug) {
      await fetchQuestion(answerResponse.next_question_slug, nextIndex);
      setAnswerResponse(null);
    } else {
      finishModule();
    }
  };

  const resetModule = () => {
    // Clear session from localStorage
    clearSession();

    setStage('intro');
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setAnswerState('unanswered');
    setSummary('');
    setStudentName('');
    setCurrentQuestion(null);
    setSubmissionCode(null);
    setAnswerResponse(null);
    setFinalResult(null);
  };

  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const renderIntro = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
        <CardDescription>
          {module.description || 'Modul pembelajaran baru.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleStart}>
        <CardContent>
          <Input
            placeholder="Nama Anda"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            autoFocus
          />
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={!studentName.trim() || !totalQuestions || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memulai...
              </>
            ) : totalQuestions > 0 ? (
              <>
                Mulai Modul ({totalQuestions} Pertanyaan)
                <BookOpen className="ml-2" />
              </>
            ) : (
              'Tidak Ada Pertanyaan Tersedia'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  const renderQuiz = () => {
    if (questionLoading || !currentQuestion) {
      return (
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="font-headline text-2xl">
            Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
          </CardTitle>
          <CardDescription className="text-lg pt-2">
            {currentQuestion.content}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={userAnswer}
            onValueChange={setUserAnswer}
            disabled={answerState !== 'unanswered'}
            className="space-y-2"
          >
            {currentQuestion.choices.map((choice) => {
              const isCorrect = answerResponse?.correct_choice_id === choice.id;
              const isSelected = choice.id === userAnswer;
              return (
                <Label
                  key={choice.id}
                  htmlFor={choice.id}
                  className={cn(
                    'flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent/50 transition-colors',
                    answerState !== 'unanswered' &&
                      isCorrect &&
                      'border-green-500 bg-green-500/10',
                    answerState === 'incorrect' &&
                      isSelected &&
                      'border-destructive bg-destructive/10'
                  )}
                >
                  <RadioGroupItem value={choice.id} id={choice.id} />
                  <span>{choice.content}</span>
                </Label>
              );
            })}
          </RadioGroup>
          {answerState === 'correct' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-green-600"
            >
              <CheckCircle /> Benar!
            </motion.div>
          )}
          {answerState === 'incorrect' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-destructive"
            >
              <XCircle /> Salah. Jawaban yang benar adalah "
              {answerResponse?.correct_choice_content}".
            </motion.div>
          )}
        </CardContent>
        <CardFooter>
          {answerState === 'unanswered' ? (
            <Button
              onClick={checkAnswer}
              className="w-full"
              disabled={!userAnswer || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                'Periksa Jawaban'
              )}
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="w-full"
              disabled={questionLoading}
            >
              {questionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {answerResponse?.next_question_slug
                    ? 'Pertanyaan Selanjutnya'
                    : 'Selesaikan Modul'}{' '}
                  <ArrowRight className="ml-2" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  const renderResults = () => (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
          <PartyPopper className="w-12 h-12 text-primary" />
        </div>
        <CardTitle className="font-headline text-3xl">Modul Selesai!</CardTitle>
        <CardDescription>Kerja bagus, {studentName}!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubmitting || !finalResult ? (
          <div className="py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-4">
              Menghitung skor...
            </p>
          </div>
        ) : (
          <>
            <p className="text-lg">Skor Anda:</p>
            <p className="font-bold text-5xl text-primary">
              {finalResult.score}/{finalResult.total}
            </p>
          </>
        )}
        {module.description && (
          <div className="text-left bg-secondary p-4 rounded-lg">
            <h4 className="font-semibold font-headline mb-2">Poin Penting</h4>
            {summaryLoading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={resetModule} className="w-full">
          Coba Lagi
        </Button>
      </CardFooter>
    </Card>
  );

  const renderStage = () => {
    switch (stage) {
      case 'intro':
        return renderIntro();
      case 'quiz':
        return renderQuiz();
      case 'results':
        return renderResults();
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
      >
        <Logo />
        <span className="font-headline font-semibold">Private</span>
      </Link>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          {renderStage()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
