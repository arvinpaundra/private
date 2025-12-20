import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import Logo from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar lg:flex flex-col items-center justify-center p-8 text-sidebar-foreground">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="font-headline text-2xl font-bold">Private</span>
        </div>
        <p className="mt-4 text-center text-sm">
            Buka potensimu. Cara modern untuk belajar.
        </p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="font-headline text-3xl font-bold">Selamat Datang Kembali</h1>
            <p className="text-balance text-muted-foreground">
              Masukkan kredensial Anda untuk mengakses akun Anda
            </p>
          </div>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{' '}
            <Link href="/register" className="underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
