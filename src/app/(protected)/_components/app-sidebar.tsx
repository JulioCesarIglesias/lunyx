'use client';

import {
  ArrowRightLeft,
  CreditCard,
  //   Diamond,
  LayoutDashboard,
  LogOut,
  TagIcon,
  //   UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { SidebarHeaderLogo } from '@/components/ui/sidebar-header-logo';
import { authClient } from '@/lib/auth-client';

// import { ToggleTheme } from "./toggle-theme";

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Transações',
    url: '/transactions',
    icon: ArrowRightLeft,
  },
  {
    title: 'Carteiras',
    url: '/wallets',
    icon: CreditCard,
  },
  {
    title: 'Categorias',
    url: '/categories',
    icon: TagIcon,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        credentials: 'include', // ADICIONA ISSO
        onSuccess: () => {
          router.push('/authentication');
        },
      },
    });
  };

  const initialName = () => {
    const name = session.data?.user?.name;
    if (!name) return '?';

    const names = name.trim().split(' ');

    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }

    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <Sidebar collapsible="icon">
      {/* <SidebarHeader className="border-b p-4"> */}
      <SidebarHeader className="m-0 p-0">
        {/* <Image src="/Logo.svg" alt="Clinic Z" width={207} height={32} /> */}
        <SidebarHeaderLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon
                        className={`size-4 ${
                          pathname === item.url ? 'text-transparent' : ''
                        } `}
                        style={
                          pathname === item.url
                            ? {
                                stroke: 'var(--lunyx-indigo)',
                              }
                            : undefined
                        }
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Outros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/subscription"}
                >
                  <Link href={"/subscription"}>
                    <Diamond />
                    <span>Assinatura</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar>
                    <AvatarFallback
                      className="bg-primary text-primary"
                      style={{ background: 'var(--lunyx-gradient)' }}
                    >
                      {initialName()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col overflow-hidden">
                    <p className="truncate text-sm">
                      {session.data?.user?.name}
                    </p>

                    <p
                      className="text-muted-foreground truncate text-sm"
                      title={session.data?.user.email}
                    >
                      {session.data?.user.email}
                    </p>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
                {/* <ToggleTheme /> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
