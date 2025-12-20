'use client';

import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/types';
import { SidebarTrigger } from '@/components/ui/sidebar';
import * as React from 'react';

function getTitleFromPathname(pathname: string): string {
  const titles: { [key: string]: string } = {
    '/dashboard': 'Dasbor',
    '/dashboard/grades': 'Tingkat Kelas',
    '/dashboard/subjects': 'Mata Pelajaran',
    '/dashboard/modules': 'Modul',
    '/dashboard/submissions': 'Pengumpulan',
  };

  if (titles[pathname]) {
    return titles[pathname];
  }

  const parts = pathname.split('/').filter(Boolean);
  const lastPart = parts[parts.length - 1];
  
  if (parts[1] === 'modules' && parts.length > 2) {
    return 'Ubah Modul';
  }

  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
}

export function Header({ user }: { user: User | null }) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
      {isClient && <SidebarTrigger className="md:hidden"/>}
      <div className="w-full flex-1">
        <h1 className="font-headline text-xl md:text-2xl font-semibold hidden md:block">{title}</h1>
      </div>
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari..."
              className="w-full appearance-none bg-secondary pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
                <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <span className="sr-only">Buka menu pengguna</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <UserIcon className="mr-2" /> Profil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
