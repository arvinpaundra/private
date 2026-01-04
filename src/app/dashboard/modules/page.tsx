'use client';

import { useState, useEffect, useCallback } from 'react';
import { getModulesAction, deleteModuleAction } from '@/actions/modules';
import { getSubjectsAction } from '@/actions/subjects';
import { getGradesAction } from '@/actions/grades';
import { useDebounce } from '@/hooks/use-debounce';
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

const ITEMS_PER_PAGE = 10;

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toast } = useToast();

  const fetchFiltersData = useCallback(async () => {
    try {
      const [subjectsData, gradesData] = await Promise.all([
        getSubjectsAction(),
        getGradesAction(),
      ]);
      setSubjects(subjectsData);
      setGrades(gradesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengambil data filter.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getModulesAction({
        keyword: debouncedSearchTerm || undefined,
        grade_id: selectedGrade !== 'all' ? selectedGrade : undefined,
        subject_id: selectedSubject !== 'all' ? selectedSubject : undefined,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      });
      setModules(response.modules);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengambil data modul.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedGrade, selectedSubject, currentPage, toast]);

  useEffect(() => {
    fetchFiltersData();
  }, [fetchFiltersData]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedSubject, selectedGrade]);

  const handleDelete = async (moduleId: string, moduleTitle: string) => {
    try {
      await deleteModuleAction(moduleId);
      toast({
        title: 'Modul Dihapus',
        description: `Modul "${moduleTitle}" telah dihapus secara permanen.`,
        variant: 'destructive',
      });
      fetchModules();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Gagal menghapus modul.',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

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
              <DialogTitle className="font-headline">
                Tambah Modul Baru
              </DialogTitle>
            </DialogHeader>
            <ModuleForm
              subjects={subjects}
              grades={grades}
              onSuccess={() => {
                setOpen(false);
                fetchModules();
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
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Semua Tingkat Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tingkat Kelas</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade.id} value={grade.id}>
                  {grade.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {modules.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} />
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
                  <DialogTitle className="font-headline">
                    Tambah Modul Baru
                  </DialogTitle>
                </DialogHeader>
                <ModuleForm
                  subjects={subjects}
                  grades={grades}
                  onSuccess={() => {
                    setOpen(false);
                    fetchModules();
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
