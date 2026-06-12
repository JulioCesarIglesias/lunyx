'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageContainer, PageHeader } from '@/components/ui/page-container';
import { authClient } from '@/lib/auth-client';

import { NavigationTabs } from './navigation-tabs';

export const AppHeaderV2 = () => {
  const session = authClient.useSession();
  const router = useRouter();

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

  const getName = () => {
    const name = session.data?.user?.name;
    if (!name) return 'Usuário';
    return name.trim().split(' ')[0];
  };

  const initialName = () => {
    const name = getName();

    if (!name) return '?';

    const names = name.trim().split(' ');

    if (names.length === 1) {
      return names[0][0].toUpperCase();
    }

    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  return (
    <PageContainer className="py-4 sm:py-5">
      <PageHeader className="flex-row items-center justify-between gap-3">
        {/* <div className="flex flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between"> */}
        <Image
          src="/Logo.svg"
          alt="Lunyx"
          width={207}
          height={32}
          className="w-[150px] shrink-0 sm:w-[180px] lg:w-[207px]"
          priority
        />

        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <NavigationTabs />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="shrink-0 rounded-full">
                <Avatar>
                  <AvatarFallback
                    className="bg-primary text-primary"
                    style={{ background: 'var(--lunyx-gradient)' }}
                  >
                    {initialName()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut />
                Sair
              </DropdownMenuItem>
              {/* <ToggleTheme /> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>
    </PageContainer>
  );
};
