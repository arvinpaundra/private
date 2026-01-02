import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookCopy, GraduationCap, Library } from 'lucide-react';
import { getModules, getSubjects, getGrades } from '@/lib/data-actions';

export default async function DashboardPage() {
    const modules = await getModules();
    const subjects = await getSubjects();
    const grades = await getGrades();

    const stats = [
        {
          title: 'Total Modul',
          count: modules.length,
          icon: <BookCopy className="h-4 w-4 text-muted-foreground" />,
        },
        {
          title: 'Total Mata Pelajaran',
          count: subjects.length,
          icon: <Library className="h-4 w-4 text-muted-foreground" />,
        },
        {
          title: 'Total Tingkat Kelas',
          count: grades.length,
          icon: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
        },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selamat Datang, Admin!</CardTitle>
        <CardDescription>
          Berikut adalah ringkasan dari sistem manajemen pembelajaran Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
                </CardHeader>
                <CardContent>
                <div className="text-4xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground pt-1">
                    saat ini ada di sistem
                </p>
                </CardContent>
            </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Tindakan Cepat</CardTitle>
            <CardDescription>
                Langsung kelola konten Anda.
            </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
            <Button asChild>
                <Link href="/dashboard/modules">Kelola Modul</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/dashboard/subjects">Kelola Mata Pelajaran</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/dashboard/grades">Kelola Tingkat Kelas</Link>
            </Button>
            <Button asChild variant="secondary">
                <Link href="/dashboard/submissions">Lihat Pengumpulan</Link>
            </Button>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
