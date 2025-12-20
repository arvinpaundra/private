'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { saveGradeAction } from '@/actions/grades';
import type { GradeFormState } from '@/actions/grades';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Grade } from '@/lib/types';
import { Loader2, Save } from 'lucide-react';
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

const formSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter'),
  description: z.string().optional(),
});

type GradeFormProps = {
  grade: Grade | null;
  onSuccess: () => void;
};

export function GradeForm({ grade, onSuccess }: GradeFormProps) {
  const saveAction = saveGradeAction.bind(null, grade?.id || null);
  const [state, action, isPending] = useActionState(saveAction, {
    message: '',
    success: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: grade?.name || '',
      description: grade?.description || '',
    },
  });

  React.useEffect(() => {
    if (!isPending && state.message) {
      if (state.success) {
        toast({
          title: grade ? 'Tingkat Kelas Diperbarui' : 'Tingkat Kelas Dibuat',
          description: state.message,
        });
        onSuccess();
      } else if (!state.success) {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, isPending, grade, onSuccess]);

  React.useEffect(() => {
    form.reset({
      name: grade?.name || '',
      description: grade?.description || '',
    });
  }, [grade, form]);

  return (
    <Form {...form}>
      <form action={action} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tingkat Kelas</FormLabel>
              <FormControl>
                <Input placeholder="cth., Kelas 9" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Berikan deskripsi singkat tentang tingkat kelas ini."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {grade ? 'Simpan Perubahan' : 'Buat Tingkat Kelas'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
