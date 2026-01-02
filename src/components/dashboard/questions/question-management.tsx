'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Module } from '@/lib/types';
import { saveAllQuestionsAction } from '@/actions/modules';
import type { QuestionFormState } from '@/actions/modules';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle, Loader2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type QuestionManagementProps = {
  module: Module;
};

const choiceSchema = z.object({
    id: z.string(),
    text: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
});
  
const questionSchema = z.object({
    id: z.string(),
    prompt: z.string().min(5, 'Isi pertanyaan harus minimal 5 karakter'),
    choices: z.array(choiceSchema).min(2, 'Harus ada minimal 2 pilihan').max(4, 'Tidak boleh lebih dari 4 pilihan'),
    correctAnswer: z.string().min(1, 'Silakan pilih jawaban yang benar'),
});

const questionsSchema = z.object({
    moduleId: z.string(),
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
      moduleId: module.id,
      questions: module.questions,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  React.useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Sukses!',
          description: state.message,
        });
      } else {
        toast({
          title: 'Error',
          description: state.message || 'Terjadi masalah saat menyimpan pertanyaan.',
          variant: 'destructive',
        });
      }
    }
  }, [state]);

  const addNewQuestion = () => {
    const newQuestionId = `q-${Date.now()}`;
    append({
      id: newQuestionId,
      prompt: '',
      choices: [
        { id: `c-${Date.now()}-1`, text: '' },
        { id: `c-${Date.now()}-2`, text: '' },
      ],
      correctAnswer: '',
    });
  };

  const addNewChoice = (questionIndex: number) => {
    const choices = form.getValues(`questions.${questionIndex}.choices`);
    if (choices.length < 4) {
      const newChoice = { id: `c-${Date.now()}`, text: '' };
      form.setValue(`questions.${questionIndex}.choices`, [...choices, newChoice]);
    }
  };

  const removeChoice = (questionIndex: number, choiceIndex: number) => {
    const choices = form.getValues(`questions.${questionIndex}.choices`);
    if (choices.length > 2) {
        const newChoices = [...choices];
        newChoices.splice(choiceIndex, 1);
        form.setValue(`questions.${questionIndex}.choices`, newChoices);
    }
  };


  return (
    <Card>
      <Form {...form}>
        <form action={action}>
          <input type="hidden" {...form.register('moduleId')} />
          <CardHeader>
            <CardTitle>{module.title}</CardTitle>
            <CardDescription>
              Kelola pertanyaan untuk modul ini. Klik "Simpan Semua Perubahan" di bagian bawah setelah selesai.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {fields.length > 0 ? (
                fields.map((questionField, qIndex) => (
                    <div key={questionField.id} className="p-6 rounded-lg border bg-secondary/50 relative">
                        <input type="hidden" {...form.register(`questions.${qIndex}.id`)} />
                        
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
                                name={`questions.${qIndex}.prompt`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pertanyaan {qIndex + 1}</FormLabel>
                                        <FormControl>
                                        <Textarea placeholder="cth., Apa ibu kota Perancis?" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name={`questions.${qIndex}.correctAnswer`}
                                render={({ field: correctAnsField }) => (
                                    <FormItem>
                                        <FormLabel>Pilihan (pilih jawaban yang benar)</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={correctAnsField.onChange}
                                                defaultValue={correctAnsField.value}
                                                className="space-y-2"
                                            >
                                                {form.getValues(`questions.${qIndex}.choices`).map((choice, cIndex) => (
                                                    <div key={`${questionField.id}-choice-${cIndex}`} className="flex items-center gap-2">
                                                        <FormControl>
                                                            <RadioGroupItem value={choice.id} id={`${questionField.id}-choice-${choice.id}`} />
                                                        </FormControl>
                                                         <Input
                                                          {...form.register(`questions.${qIndex}.choices.${cIndex}.text`)}
                                                          placeholder={`Pilihan ${cIndex + 1}`}
                                                          className="flex-1"
                                                        />
                                                        <input type="hidden" {...form.register(`questions.${qIndex}.choices.${cIndex}.id`)} />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeChoice(qIndex, cIndex)}
                                                            disabled={form.getValues(`questions.${qIndex}.choices`).length <= 2}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => addNewChoice(qIndex)}
                                            disabled={form.getValues(`questions.${qIndex}.choices`).length >= 4}
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            Tambah Pilihan
                                        </Button>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 space-y-4">
                    <h3 className="text-lg font-semibold">Belum Ada Pertanyaan</h3>
                    <p className="mt-1 text-sm">Klik tombol di bawah untuk mulai membuat kuis Anda.</p>
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
