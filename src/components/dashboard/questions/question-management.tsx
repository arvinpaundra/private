'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ModuleDetail } from '@/lib/types';
import { saveAllQuestionsAction } from '@/actions/modules';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle, Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type QuestionManagementProps = {
  module: ModuleDetail;
};

const choiceSchema = z.object({
  id: z.string(),
  content: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
  is_correct_answer: z.boolean(),
});

const questionSchema = z.object({
  id: z.string(),
  content: z.string().min(5, 'Isi pertanyaan harus minimal 5 karakter'),
  slug: z.string().optional(),
  choices: z
    .array(choiceSchema)
    .min(2, 'Harus ada minimal 2 pilihan')
    .max(4, 'Tidak boleh lebih dari 4 pilihan'),
});

const questionsSchema = z.object({
  moduleSlug: z.string(),
  questions: z.array(questionSchema),
});

export function QuestionManagement({ module }: QuestionManagementProps) {
  const [state, action, isPending] = useActionState(saveAllQuestionsAction, {
    message: '',
    success: false,
  });

  const form = useForm<z.infer<typeof questionsSchema>>({
    resolver: zodResolver(questionsSchema),
    defaultValues: {
      moduleSlug: module.slug,
      questions: module.questions,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  // Watch all questions at once to avoid multiple subscriptions
  const watchedQuestions = form.watch('questions');

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Sukses!',
          description: state.message,
        });
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
        // Restore form values if they were submitted but failed validation
        if (state.questions) {
          form.setValue('questions', state.questions, {
            shouldValidate: false,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      }
    }
  }, [state.message, state.success, state.questions, form]);

  const addNewQuestion = () => {
    append({
      id: '',
      content: '',
      slug: '',
      choices: [
        { id: '', content: '', is_correct_answer: false },
        { id: '', content: '', is_correct_answer: false },
      ],
    });
  };

  const addNewChoice = (questionIndex: number) => {
    const choices = form.getValues(`questions.${questionIndex}.choices`);
    if (choices.length < 4) {
      const newChoice = {
        id: '',
        content: '',
        is_correct_answer: false,
      };
      form.setValue(`questions.${questionIndex}.choices`, [
        ...choices,
        newChoice,
      ]);
    }
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const choices = form.getValues(`questions.${questionIndex}.choices`);
    if (choices.length > 2) {
      const newChoices = [...choices];
      newChoices.splice(choiceIndex, 1);
      form.setValue(`questions.${questionIndex}.choices`, newChoices, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form action={action}>
          <input type="hidden" {...form.register('moduleSlug')} />
          <CardHeader>
            <CardTitle>{module.title}</CardTitle>
            <CardDescription>
              Kelola pertanyaan untuk modul ini. Klik "Simpan Semua Perubahan"
              di bagian bawah setelah selesai.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {fields.length > 0 ? (
              fields.map((questionField, qIndex) => (
                <div
                  key={questionField.id}
                  className="p-6 rounded-lg border bg-secondary/50 relative"
                >
                  <input
                    type="hidden"
                    {...form.register(`questions.${qIndex}.id`)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Hapus pertanyaan</span>
                  </Button>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name={`questions.${qIndex}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pertanyaan {qIndex + 1}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="cth., Apa ibu kota Perancis?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormLabel>Pilihan (pilih jawaban yang benar)</FormLabel>
                      <RadioGroup
                        value={(watchedQuestions?.[qIndex]?.choices || [])
                          .findIndex((c) => c.is_correct_answer)
                          .toString()}
                        onValueChange={(value) => {
                          const choiceIndex = parseInt(value);
                          const choices =
                            watchedQuestions?.[qIndex]?.choices || [];
                          choices.forEach((_, idx) => {
                            form.setValue(
                              `questions.${qIndex}.choices.${idx}.is_correct_answer`,
                              idx === choiceIndex
                            );
                          });
                        }}
                        className="space-y-2"
                      >
                        {(watchedQuestions?.[qIndex]?.choices || []).map(
                          (choice, cIndex) => (
                            <div
                              key={`question-${qIndex}-choice-${cIndex}`}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="hidden"
                                {...form.register(
                                  `questions.${qIndex}.choices.${cIndex}.id`
                                )}
                              />
                              <input
                                type="hidden"
                                {...form.register(
                                  `questions.${qIndex}.choices.${cIndex}.is_correct_answer`
                                )}
                              />
                              <FormControl>
                                <RadioGroupItem
                                  value={cIndex.toString()}
                                  id={`question-${qIndex}-choice-${cIndex}`}
                                />
                              </FormControl>
                              <Input
                                {...form.register(
                                  `questions.${qIndex}.choices.${cIndex}.content`
                                )}
                                placeholder={`Pilihan ${cIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChoice(qIndex, cIndex)}
                                disabled={
                                  (watchedQuestions?.[qIndex]?.choices || [])
                                    .length <= 2
                                }
                              >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          )
                        )}
                      </RadioGroup>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => addNewChoice(qIndex)}
                        disabled={
                          (watchedQuestions?.[qIndex]?.choices || []).length >=
                          4
                        }
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Pilihan
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 space-y-4">
                <h3 className="text-lg font-semibold">Belum Ada Pertanyaan</h3>
                <p className="mt-1 text-sm">
                  Klik tombol di bawah untuk mulai membuat kuis Anda.
                </p>
              </div>
            )}

            <Button type="button" variant="outline" onClick={addNewQuestion}>
              <PlusCircle className="mr-2" /> Tambah Pertanyaan
            </Button>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Semua Perubahan
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
