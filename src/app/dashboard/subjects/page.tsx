'use client';

import * as React from 'react';
import { getSubjects, deleteSubject } from '@/lib/data-actions';
import type { Subject } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { SubjectForm } from '@/components/dashboard/subjects/subject-form';

export default function SubjectsPage() {
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = React.useState<Subject | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchSubjects = React.useCallback(async () => {
    try {
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Gagal mengambil mata pelajaran.',
            variant: 'destructive',
        });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleFormSuccess = () => {
    fetchSubjects();
    setIsFormOpen(false);
    setSelectedSubject(null);
  };

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedSubject(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (subjectId: string) => {
    try {
        await deleteSubject(subjectId);
        toast({
            title: 'Mata Pelajaran Dihapus',
            description: 'Mata pelajaran telah dihapus secara permanen.',
            variant: 'destructive',
        });
        fetchSubjects();
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Gagal menghapus mata pelajaran.',
            variant: 'destructive',
        });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Mata Pelajaran</CardTitle>
            <CardDescription>
              Kelola mata pelajaran yang ditawarkan.
            </CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2" />
            Tambah Mata Pelajaran
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map(subject => (
            <Card key={subject.id} className="flex flex-col">
              <CardHeader className="flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-headline text-xl">{subject.name}</CardTitle>
                  <CardDescription className="pt-1">{subject.description || 'Tidak ada deskripsi.'}</CardDescription>
                </div>
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
                        <DropdownMenuItem onClick={() => handleEditClick(subject)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Ubah
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
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus mata pelajaran <span className="font-bold">"{subject.name}"</span> secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(subject.id)}>Hapus</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </CardHeader>
            </Card>
          ))}
          {subjects.length === 0 && (
            <div className="text-center text-muted-foreground col-span-full p-8">
              <p>Belum ada mata pelajaran yang dibuat.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedSubject ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</DialogTitle>
            </DialogHeader>
            <SubjectForm subject={selectedSubject} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
