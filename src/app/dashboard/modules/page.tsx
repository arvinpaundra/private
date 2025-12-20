'use client';

import * as React from 'react';
import { getModules, getSubjects, getGrades } from '@/lib/data-actions';
import { ModuleForm } from '@/components/dashboard/modules/module-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ModuleCard } from '@/components/dashboard/modules/module-card';
import { Input } from '@/components/ui/input';
import { Module, Subject, Grade } from '@/lib/types';

export default function ModulesPage() {
  const [modules, setModules] = React.useState<(Module & { subjectName: string; gradeName: string; })[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [open, setOpen] = React.useState(false);
  const [filteredModules, setFilteredModules] = React.useState(modules);

  React.useEffect(() => {
    getModules().then(setModules);
    getSubjects().then(setSubjects);
    getGrades().then(setGrades);
  }, []);

  React.useEffect(() => {
    setFilteredModules(modules);
  }, [modules]);
  
  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = modules.filter(module => 
      module.title.toLowerCase().includes(searchTerm) ||
      module.subjectName.toLowerCase().includes(searchTerm) ||
      module.gradeName.toLowerCase().includes(searchTerm)
    );
    setFilteredModules(filtered);
  };

  return (
    <div className="space-y-6">
      <Card>
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
              <ModuleForm subjects={subjects} grades={grades} setOpen={setOpen} />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
                placeholder="Filter modul berdasarkan judul, mata pelajaran, atau kelas..."
                className="max-w-sm"
                onChange={handleFilter}
              />
          </div>
          {filteredModules.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map(module => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
                <h3 className="text-xl font-bold tracking-tight">
                    Anda belum memiliki modul
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Mulailah dengan membuat yang baru.
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
                    <ModuleForm subjects={subjects} grades={grades} setOpen={setOpen} />
                    </DialogContent>
                </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
