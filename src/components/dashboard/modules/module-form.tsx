'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { createModuleAction } from '@/actions/modules';
import type { FormState } from '@/actions/modules';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Subject, Grade } from '@/lib/types';
import { Loader2, Save } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, 'Judul harus minimal 3 karakter'),
  subjectId: z.string().min(1, 'Silakan pilih mata pelajaran'),
  gradeId: z.string().min(1, 'Silakan pilih tingkat kelas'),
  description: z.string().optional(),
});

type ModuleFormProps = {
  subjects: Subject[];
  grades: Grade[];
  setOpen?: (open: boolean) => void;
};

export function ModuleForm({ subjects, grades, setOpen }: ModuleFormProps) {
  const [createState, createAction, isCreating] = useActionState(
    createModuleAction,
    { message: '', success: false }
  );
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      subjectId: '',
      gradeId: '',
      description: '',
    },
  });

  React.useEffect(() => {
    if (!isCreating && createState?.message) {
      if (createState.success && createState.data) {
        toast({ title: 'Modul Dibuat', description: createState.message });
        setOpen?.(false);
        router.push(`/dashboard/modules/${createState.data.id}`);
      } else if (!createState.success) {
        toast({
          title: 'Error',
          description: createState.message,
          variant: 'destructive',
        });
      }
    }
  }, [createState, isCreating, setOpen, router]);

  return (
    <Form {...form}>
      <form action={createAction} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Modul</FormLabel>
              <FormControl>
                <Input
                  placeholder="cth., Pengenalan Fotosintesis"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
                control={form.control}
                name="subjectId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mata Pelajaran</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        name={field.name}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih mata pelajaran" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tingkat Kelas</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        name={field.name}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkat kelas" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {grades.map(grade => (
                            <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi (Opsional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Berikan deskripsi singkat tentang modul ini."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Ini akan ditampilkan kepada siswa sebagai gambaran umum.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan dan Tambah Pertanyaan
          </Button>
        </div>
      </form>
    </Form>
  );
}
