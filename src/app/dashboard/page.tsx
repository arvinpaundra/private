import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getGrades, getSubjects, getModules } from '@/lib/data-actions';
import { GraduationCap, Library, BookCopy } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const [grades, subjects, modules] = await Promise.all([
    getGrades(),
    getSubjects(),
    getModules(),
  ]);

  const stats = [
    {
      title: 'Total Tingkat Kelas',
      count: grades.length,
      icon: <GraduationCap className="h-6 w-6 text-muted-foreground" />,
      href: "/dashboard/grades"
    },
    {
      title: 'Total Mata Pelajaran',
      count: subjects.length,
      icon: <Library className="h-6 w-6 text-muted-foreground" />,
      href: "/dashboard/subjects"
    },
    {
      title: 'Total Modul',
      count: modules.length,
      icon: <BookCopy className="h-6 w-6 text-muted-foreground" />,
      href: "/dashboard/modules"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Selamat Datang, Admin!</h1>
        <p className="text-lg text-muted-foreground">
          Berikut adalah gambaran singkat dari sistem manajemen pembelajaran Anda.
        </p>
      </div>

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
                Saat ini ada di sistem
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
        </CardContent>
      </Card>
    </div>
  );
}
