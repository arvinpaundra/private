'use client';

import * as React from 'react';
import { getModules, getSubjects, getGrades, deleteModule } from '@/lib/data-actions';
import { ModuleForm } from '@/components/dashboard/modules/module-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModuleCard } from '@/components/dashboard/modules/module-card';
import { Input } from '@/components/ui/input';
import { Module, Subject, Grade } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 6;

export default function ModulesPage() {
  const [modules, setModules] = React.useState<(Module & { subjectName: string; gradeName: string; })[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState<string>('all');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const fetchAllData = React.useCallback(async () => {
    try {
        const [modulesData, subjectsData, gradesData] = await Promise.all([
          getModules(),
          getSubjects(),
          getGrades(),
        ]);
        setModules(modulesData);
        setSubjects(subjectsData);
        setGrades(gradesData);
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Gagal mengambil data.',
            variant: 'destructive',
        });
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDelete = async (moduleId: string, moduleTitle: string) => {
    try {
        await deleteModule(moduleId);
        toast({
        title: 'Modul Dihapus',
        description: `Modul "${moduleTitle}" telah dihapus secara permanen.`,
        variant: 'destructive',
        });
        fetchAllData();
    } catch (error) {
        console.error(error);
        toast({
            title: 'Error',
            description: 'Gagal menghapus modul.',
            variant: 'destructive',
        });
    }
  };

  const filteredModules = modules.filter(module => {
    const subjectMatch = selectedSubject === 'all' || module.subjectId === selectedSubject;
    const gradeMatch = selectedGrade === 'all' || module.gradeId === selectedGrade;
    const searchMatch = module.title.toLowerCase().includes(searchTerm.toLowerCase());
    return subjectMatch && gradeMatch && searchMatch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredModules.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedModules = filteredModules.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, selectedGrade]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="font-headline">Modul</CardTitle>
          <CardDescription>
            Buat, ubah, dan kelola semua modul pembelajaran.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Tambah Modul Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Tambah Modul Baru</DialogTitle>
            </DialogHeader>
            <ModuleForm 
              subjects={subjects} 
              grades={grades} 
              onSuccess={() => {
                setOpen(false);
                fetchAllData();
              }}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-6 flex flex-wrap gap-4">
          <Input
              placeholder="Cari berdasarkan judul modul..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Mata Pelajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mata Pelajaran</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Tingkat Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat Kelas</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        {paginatedModules.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedModules.map(module => (
              <ModuleCard 
                key={module.id} 
                module={module} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
              <h3 className="text-xl font-bold tracking-tight">
                  Tidak Ada Modul Ditemukan
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                  Coba sesuaikan filter Anda atau buat modul baru.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                  <Button size="sm" className="relative">
                      <PlusCircle className="mr-2" />
                      Tambah Modul
                  </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                      <DialogTitle className="font-headline">Tambah Modul Baru</DialogTitle>
                  </DialogHeader>
                   <ModuleForm 
                      subjects={subjects} 
                      grades={grades} 
                      onSuccess={() => {
                        setOpen(false);
                        fetchAllData();
                      }}
                    />
                  </DialogContent>
              </Dialog>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-end border-t pt-6">
          <div className="flex items-center gap-2">
              <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
              >
                  Sebelumnya
              </Button>
              <span className="text-sm font-medium">
                  Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
              </span>
              <Button 
                  variant="outline" 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
              >
                  Berikutnya
              </Button>
          </div>
      </CardFooter>
    </Card>
  );
}
