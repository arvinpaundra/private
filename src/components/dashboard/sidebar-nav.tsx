'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import Logo from '@/components/logo';
import { LayoutDashboard, GraduationCap, Library, BookCopy, ChevronsLeft, ChevronsRight, FileCheck } from 'lucide-react';
import { Button } from '../ui/button';
import * as React from 'react';

const menuItems = [
    {
      href: '/dashboard',
      label: 'Dasbor',
      icon: LayoutDashboard,
    },
    {
      href: '/dashboard/subjects',
      label: 'Mata Pelajaran',
      icon: Library,
    },
    {
      href: '/dashboard/grades',
      label: 'Tingkat Kelas',
      icon: GraduationCap,
    },
    {
      href: '/dashboard/modules',
      label: 'Modul',
      icon: BookCopy,
    },
    {
      href: '/dashboard/submissions',
      label: 'Pengumpulan',
      icon: FileCheck,
    },
  ];

export function SidebarNav() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      side="left"
    >
        <SidebarHeader>
            <Link href="/dashboard" className="flex items-center gap-2 font-bold group-data-[collapsible=icon]:justify-center">
            <Logo className="text-primary-foreground" />
            <span className="font-headline text-lg text-primary-foreground group-data-[collapsible=icon]:hidden">
                Private
            </span>
            </Link>
        </SidebarHeader>
        <SidebarMenu className="flex-1 p-2">
            {menuItems.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
                <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(href) && (href !== '/dashboard' || pathname === href)}
                tooltip={label}
                >
                <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            ))}
        </SidebarMenu>
      <SidebarFooter className="p-2">
            <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2"
                onClick={toggleSidebar}
            >
                {state === 'expanded' ? <ChevronsLeft /> : <ChevronsRight />}
                <span className="group-data-[collapsible=icon]:hidden">Tutup Sidebar</span>
            </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
