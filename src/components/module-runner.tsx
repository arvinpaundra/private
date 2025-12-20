'use client';

import * as React from 'react';
import type { Module, Question } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, ArrowRight, BookOpen, PartyPopper, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSummaryAction } from '@/actions/students';
import { createSubmission } from '@/lib/data-actions';
import Logo from './logo';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Stage = 'intro' | 'quiz' | 'results';
type AnswerState = 'unanswered' | 'correct' | 'incorrect';

export function ModuleRunner({ module }: { module: Module }) {
  const { toast } = useToast();
  const [stage, setStage] = React.useState<Stage>('intro');
  const [studentName, setStudentName] = React.useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [userAnswer, setUserAnswer] = React.useState(''); // Now stores the choice ID
  const [answerState, setAnswerState] = React.useState<AnswerState>('unanswered');
  const [summary, setSummary] = React.useState('');
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const totalQuestions = module.questions.length;
  const currentQuestion = module.questions[currentQuestionIndex];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentName.trim()) {
      setStage('quiz');
    }
  };

  const checkAnswer = () => {
    if (answerState !== 'unanswered' || !userAnswer) return;

    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      setAnswerState('correct');
    } else {
      setAnswerState('incorrect');
    }
  };

  const finishModule = React.useCallback(async () => {
    setIsSubmitting(true);
    setStage('results');

    try {
      await createSubmission(module.id, studentName, score);
       toast({
        title: "Pengumpulan Terkirim",
        description: "Hasil Anda telah disimpan.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan hasil Anda.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
    
    if (module.description) {
      setSummaryLoading(true);
      generateSummaryAction(module.description).then(res => {
        if(res.summary) setSummary(res.summary);
        setSummaryLoading(false);
      });
    }
  }, [module.id, studentName, score, module.description, toast]);

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setUserAnswer('');
      setAnswerState('unanswered');
    } else {
      finishModule();
    }
  };

  const resetModule = () => {
    setStage('intro');
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer('');
    setAnswerState('unanswered');
    setSummary('');
  };

  const progress = (currentQuestionIndex / totalQuestions) * 100;

  const renderIntro = () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{module.title}</CardTitle>
        <CardDescription>{module.description || 'Modul pembelajaran baru.'}</CardDescription>
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
          <Button type="submit" className="w-full" disabled={!studentName.trim() || !totalQuestions}>
            {totalQuestions > 0 ? `Mulai Modul (${totalQuestions} Pertanyaan)` : 'Tidak Ada Pertanyaan Tersedia'} 
            {totalQuestions > 0 && <BookOpen className="ml-2" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );

  const renderQuiz = () => (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Progress value={progress} className="mb-4" />
        <CardTitle className="font-headline text-2xl">
          Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
        </CardTitle>
        <CardDescription className="text-lg pt-2">{currentQuestion.prompt}</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={userAnswer}
          onValueChange={setUserAnswer}
          disabled={answerState !== 'unanswered'}
          className="space-y-2"
        >
          {currentQuestion.choices.map((choice) => {
            const isCorrect = choice.id === currentQuestion.correctAnswer;
            const isSelected = choice.id === userAnswer;
            return (
              <Label
                key={choice.id}
                htmlFor={choice.id}
                className={cn(
                  "flex items-center gap-4 rounded-md border p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                  answerState !== 'unanswered' && isCorrect && "border-green-500 bg-green-500/10",
                  answerState === 'incorrect' && isSelected && "border-destructive bg-destructive/10",
                )}
              >
                <RadioGroupItem value={choice.id} id={choice.id} />
                <span>{choice.text}</span>
              </Label>
            )
          })}
        </RadioGroup>
          {answerState === 'correct' && (
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle /> Benar!
            </motion.div>
          )}
          {answerState === 'incorrect' && (
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="mt-4 flex items-center gap-2 text-destructive">
              <XCircle /> Salah. Jawaban yang benar adalah "{currentQuestion.choices.find(c => c.id === currentQuestion.correctAnswer)?.text}".
            </motion.div>
          )}
      </CardContent>
      <CardFooter>
        {answerState === 'unanswered' ? (
          <Button onClick={checkAnswer} className="w-full" disabled={!userAnswer}>Periksa Jawaban</Button>
        ) : (
          <Button onClick={nextQuestion} className="w-full">
            {currentQuestionIndex < totalQuestions - 1 ? 'Pertanyaan Selanjutnya' : 'Selesaikan Modul'} <ArrowRight className="ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const renderResults = () => (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <PartyPopper className="w-12 h-12 text-primary"/>
        </div>
        <CardTitle className="font-headline text-3xl">Modul Selesai!</CardTitle>
        <CardDescription>Kerja bagus, {studentName}!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubmitting ? (
           <Loader2 className="animate-spin mx-auto"/>
        ) : (
            <>
                <p className="text-lg">Skor Anda:</p>
                <p className="font-bold text-5xl text-primary">
                {score}/{totalQuestions}
                </p>
            </>
        )}
        {module.description && (
          <div className="text-left bg-secondary p-4 rounded-lg">
            <h4 className="font-semibold font-headline mb-2">Poin Penting</h4>
            {summaryLoading ? <Loader2 className="animate-spin mx-auto"/> : <p className="text-sm text-muted-foreground">{summary}</p>}
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
    switch(stage) {
      case 'intro': return renderIntro();
      case 'quiz': return renderQuiz();
      case 'results': return renderResults();
      default: return null;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-secondary">
        <Link href="/subjects" className="absolute top-4 left-4 flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
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
