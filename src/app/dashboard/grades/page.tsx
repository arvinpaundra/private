'use client';

import * as React from 'react';
import { getGrades, deleteGrade } from '@/lib/data-actions';
import type { Grade } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { GradeForm } from '@/components/dashboard/grades/grade-form';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function GradesPage() {
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<Grade | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const { toast } = useToast();

  const fetchGrades = React.useCallback(async () => {
    const gradesData = await getGrades();
    setGrades(gradesData);
  }, []);

  React.useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  const handleFormSuccess = () => {
    fetchGrades();
    setIsFormOpen(false);
    setSelectedGrade(null);
  };

  const handleEditClick = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedGrade(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (gradeId: string) => {
    const result = await deleteGrade(gradeId);
    if(result.success) {
        toast({
            title: 'Tingkat Kelas Dihapus',
            description: 'Tingkat kelas telah dihapus secara permanen.',
            variant: 'destructive',
        });
        fetchGrades();
    } else {
        toast({
            title: 'Error',
            description: 'Gagal menghapus tingkat kelas.',
            variant: 'destructive',
        });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Tingkat Kelas</CardTitle>
            <CardDescription>
              Kelola tingkat kelas untuk kurikulum Anda.
            </CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2" />
            Tambah Tingkat Kelas
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {grades.map(grade => (
            <Card key={grade.id}>
                <CardHeader className="flex-row items-start justify-between">
                    <div>
                        <CardTitle>{grade.name}</CardTitle>
                        <CardDescription>{grade.description || 'Tidak ada deskripsi.'}</CardDescription>
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
                            <DropdownMenuItem onClick={() => handleEditClick(grade)}>
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
                                Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tingkat kelas <span className="font-bold">"{grade.name}"</span> secara permanen.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(grade.id)}>Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardHeader>
            </Card>
          ))}
           {grades.length === 0 && (
                <div className="text-center text-muted-foreground col-span-full p-8">
                    <p>Belum ada tingkat kelas.</p>
                </div>
            )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedGrade ? 'Ubah Tingkat Kelas' : 'Tambah Tingkat Kelas Baru'}</DialogTitle>
            </DialogHeader>
            <GradeForm grade={selectedGrade} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
