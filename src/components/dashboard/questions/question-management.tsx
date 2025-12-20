'use client';

import { Module } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionForm } from '@/components/dashboard/questions/question-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Pencil, PlusCircle, MoreHorizontal } from 'lucide-react';
import { deleteQuestionAction } from '@/actions/modules';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function QuestionManagement({ module }: { module: Module }) {
  return (
    <Card>
      <CardHeader>
          <div className="space-y-1.5">
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>{module.description || "Kelola pertanyaan untuk modul ini."}</CardDescription>
          </div>
      </CardHeader>
      <CardContent>
          {module.questions.length > 0 ? (
            <div className="space-y-6">
                <div className="flex justify-end">
                     <QuestionForm 
                        moduleId={module.id} 
                        trigger={<Button><PlusCircle className="mr-2" />Tambah Pertanyaan</Button>} 
                    />
                </div>
                <div className="space-y-4 rounded-lg border p-4">
                    {module.questions.map((question, index) => (
                        <div key={question.id}>
                            <div className="flex justify-between items-start gap-4 py-4">
                                <div className='flex-1'>
                                    <p className="font-semibold leading-relaxed">{index + 1}. {question.prompt}</p>
                                    <ul className="mt-3 space-y-2">
                                        {question.choices.map(choice => (
                                            <li key={choice.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant={choice.id === question.correctAnswer ? 'default' : 'secondary'}>
                                                    {choice.text}
                                                </Badge>
                                                {choice.id === question.correctAnswer && <span className="text-xs font-bold text-primary">(Jawaban Benar)</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='flex-shrink-0'>
                                <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <span className="sr-only">Buka menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <QuestionForm
                                                    moduleId={module.id}
                                                    question={question}
                                                    trigger={
                                                        <div className="flex w-full cursor-pointer items-center">
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            <span>Ubah</span>
                                                        </div>
                                                    }
                                                />
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive focus:bg-destructive/30 focus:text-destructive-foreground">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus pertanyaan ini secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <form action={deleteQuestionAction.bind(null, module.id, question.id)}>
                                                <AlertDialogAction type="submit">Lanjutkan</AlertDialogAction>
                                            </form>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </div>
                            </div>
                            {index < module.questions.length - 1 && <Separator />}
                        </div>
                    ))}
                </div>
            </div>
          ) : (
              <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12 space-y-4">
                  <h3 className="text-lg font-semibold">Belum Ada Pertanyaan</h3>
                  <p className="mt-1 text-sm">Klik tombol di bawah untuk memulai membuat kuis Anda.</p>
                   <QuestionForm 
                        moduleId={module.id} 
                        trigger={<Button><PlusCircle className="mr-2" />Tambah Pertanyaan</Button>} 
                    />
              </div>
          )}
      </CardContent>
    </Card>
  );
}
