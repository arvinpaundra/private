import { getGrades } from '@/lib/data-actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Logo from '@/components/logo';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function GradesPage() {
  const grades = await getGrades();

  return (
    <div className="flex min-h-screen flex-col bg-secondary">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Logo />
            <span className="font-headline text-xl">Private</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button asChild>
              <Link href="/dashboard">Login Admin</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="mb-8">
                <h1 className="font-headline text-4xl font-bold tracking-tight">
                Tingkat Kelas
                </h1>
                <p className="mt-2 text-lg text-muted-foreground">
                Jelajahi tingkat kelas yang tersedia.
                </p>
            </div>
            <div className="grid gap-4">
                {grades.map(grade => (
                    <Card key={grade.id}>
                        <CardHeader>
                            <CardTitle>{grade.name}</CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
