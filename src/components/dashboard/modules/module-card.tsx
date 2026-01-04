'use client';

import * as React from 'react';
import { Module } from '@/lib/types';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Pencil,
  BookCopy,
  Trash2,
  Link as LinkIcon,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTransition, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import {
  deleteModuleAction,
  toggleModulePublishAction,
} from '@/actions/modules';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { set } from 'date-fns';

type ModuleCardProps = {
  module: Module;
};

const StatusToggle = ({ module }: { module: Module }) => {
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(module.is_published);

  const handleToggle = () => {
    const newStatus = !isPublished;
    setIsPublished(newStatus);

    startTransition(async () => {
      try {
        await toggleModulePublishAction(module.slug);
        toast({
          title: newStatus ? 'Modul Diterbitkan' : 'Modul Ditarik',
          description: `"${module.title}" sekarang ${
            newStatus ? 'terlihat' : 'tersembunyi'
          } bagi siswa.`,
        });
      } catch (error) {
        // Revert on error
        setIsPublished(!newStatus);

        toast({
          title: 'Gagal',
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat mengubah status publikasi.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-${module.id}`}
        checked={isPublished}
        onCheckedChange={handleToggle}
        disabled={isPending}
        aria-label="Toggle module status"
      />
      <Label htmlFor={`status-${module.id}`} className="text-sm cursor-pointer">
        {isPublished ? 'Diterbitkan' : 'Draf'}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent
            side="top"
            align="center"
            className="max-w-xs text-center"
          >
            <p>
              Menerbitkan modul membuatnya dapat diakses oleh siswa dan
              mengaktifkan tindakan berbagi.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export function ModuleCard({ module }: ModuleCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeleted, setIsDeleted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDialogOpen(false);
    setIsDeleted(true);
    startTransition(async () => {
      try {
        await deleteModuleAction(module.slug);
        toast({
          title: 'Modul Dihapus',
          description: `Modul "${module.title}" telah dihapus secara permanen.`,
          variant: 'destructive',
        });
      } catch (error) {
        setIsDeleted(false);
        toast({
          title: 'Gagal Menghapus',
          description:
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat menghapus modul.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/m/${module.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Tautan Disalin',
      description: 'Tautan kuis telah disalin ke papan klip Anda.',
    });
  };

  if (isDeleted) {
    return null;
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline text-lg">
              {module.title}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{module.grade.name}</Badge>
              <Badge variant="secondary">{module.subject.name}</Badge>
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/modules/${module.slug}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Ubah Pertanyaan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCopyLink}
                disabled={!module.is_published}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Salin Link
              </DropdownMenuItem>
              <DropdownMenuItem asChild disabled={!module.is_published}>
                <Link
                  href={`/m/${module.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lihat Halaman Siswa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/30 focus:text-destructive-foreground"
                    onSelect={(e) => {
                      e.preventDefault();
                      setIsDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Ini akan menghapus
                      modul
                      <span className="font-bold"> "{module.title}" </span>
                      secara permanen beserta semua pertanyaan terkait.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isPending}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isPending ? 'Menghapus...' : 'Hapus'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <BookCopy className="h-4 w-4" />
          <span>{module.questions_count} Pertanyaan</span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
          {module.description || 'Tidak ada deskripsi yang diberikan.'}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <StatusToggle module={module} />
      </CardFooter>
    </Card>
  );
}
