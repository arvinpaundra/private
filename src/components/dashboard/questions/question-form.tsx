'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { saveQuestionAction } from '@/actions/modules';
import type { QuestionFormState } from '@/actions/modules';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Question } from '@/lib/types';
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';

const choiceSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Teks pilihan tidak boleh kosong'),
});

const formSchema = z.object({
    prompt: z.string().min(5, 'Prompt harus minimal 5 karakter'),
    choices: z.array(choiceSchema).min(2, 'Anda harus memberikan setidaknya dua pilihan.').max(4, 'Anda dapat memberikan paling banyak empat pilihan.'),
    correctAnswer: z.string().min(1, 'Anda harus memilih jawaban yang benar.'),
});

type QuestionFormProps = {
  moduleId: string;
  question?: Question;
  trigger?: React.ReactNode;
};

export function QuestionForm({ moduleId, question, trigger }: QuestionFormProps) {
  const [open, setOpen] = React.useState(false);
  const initialState: QuestionFormState = { message: '', success: false };
  const [state, action, isPending] = useActionState(saveQuestionAction, initialState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: question?.prompt || '',
      choices: question?.choices || [{ id: `c-${Date.now()}-1`, text: ''}, { id: `c-${Date.now()}-2`, text: ''}],
      correctAnswer: question?.correctAnswer || '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "choices",
  });

  React.useEffect(() => {
    if (!isPending && state.message) {
      if (state.success) {
        toast({ title: 'Sukses', description: state.message });
        if (open) {
            setOpen(false);
            if (!question) {
                form.reset({
                    prompt: '',
                    choices: [{ id: `c-${Date.now()}-1`, text: ''}, { id: `c-${Date.now()}-2`, text: ''}],
                    correctAnswer: '',
                });
            }
        }
      } else {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
      }
    }
  }, [state, isPending, form, question, open, setOpen]);
  
  // When used inside a dropdown, we need to handle the opening manually
  const handleTriggerClick = (e: React.MouseEvent) => {
    if (trigger) {
      e.stopPropagation();
      setOpen(true);
    }
  };

  const formContent = (
    <Form {...form}>
      <form action={action} className="space-y-6">
        <input type="hidden" name="moduleId" value={moduleId} />
        {question && <input type="hidden" name="questionId" value={question.id} />}

        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Pertanyaan</FormLabel>
              <FormControl>
                <Textarea placeholder="cth., Apa ibukota Perancis?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="correctAnswer"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Pilihan</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  name={field.name}
                  defaultValue={field.value}
                  className="space-y-2"
                >
                  {fields.map((choice, index) => (
                    <div key={choice.id} className="flex items-center space-x-3">
                        <RadioGroupItem value={choice.id} id={choice.id} />
                        <FormField
                            control={form.control}
                            name={`choices.${index}.id`}
                            render={({ field }) => <input type="hidden" {...field} />}
                        />
                        <FormField
                        control={form.control}
                        name={`choices.${index}.text`}
                        render={({ field }) => (
                            <div className="flex items-center gap-2 w-full">
                                <Input {...field} placeholder={`Pilihan ${index + 1}`} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        )}
                        />
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center">
            <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `c-${Date.now()}`, text: ''})} disabled={fields.length >= 4}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pilihan
            </Button>
            <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {question ? 'Perbarui Pertanyaan' : 'Simpan Pertanyaan'}
            </Button>
        </div>
      </form>
    </Form>
  );

  if (!trigger) {
    return (
        <div onClick={handleTriggerClick}>
            {formContent}
        </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
    <div onClick={handleTriggerClick} className='w-full'>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
    </div>
    <DialogContent>
        <DialogHeader>
        <DialogTitle>{question ? 'Ubah Pertanyaan' : 'Tambah Pertanyaan Baru'}</DialogTitle>
        </DialogHeader>
        {formContent}
    </DialogContent>
    </Dialog>
  );
}
