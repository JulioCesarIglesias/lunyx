import { ArrowLeft, ChartSpline, PiggyBank, TrendingUp } from 'lucide-react';
import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/lib/auth';

import SignInForm from './_components/sign-in-form';
import SignUpForm from './_components/sign-up-form';

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Branding */}
      <div className="bg-primary relative hidden overflow-hidden lg:flex lg:w-1/2">
        {/* Fundo com projeções financeiras */}
        <div className="absolute inset-0 overflow-hidden">
          <svg
            className="absolute inset-0 h-full w-full opacity-20"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
          >
            <path
              d="M0 700 C150 650, 250 500, 400 520 S700 300, 1000 150"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />

            <path
              d="M0 850 C180 800, 350 650, 500 600 S800 450, 1000 250"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.6"
            />

            <path
              d="M0 900 C200 850, 350 800, 600 650 S850 500, 1000 350"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.4"
            />
          </svg>

          {/* Gradientes decorativos */}
          <div className="bg-primary-foreground/10 absolute top-0 left-0 h-96 w-96 rounded-full blur-3xl" />
          <div className="bg-primary-foreground/5 absolute right-0 bottom-0 h-96 w-96 rounded-full blur-3xl" />
        </div>

        <div className="text-primary-foreground relative z-20 flex w-full flex-col justify-between p-12">
          {/* Logo e voltar */}
          <div>
            {/* <Link
              href="/"
              className="text-primary-foreground/80 hover:text-primary-foreground mb-8 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link> */}

            {/* <div className="flex items-center">
              <Image src="/Logo.svg" alt="Lunyx" width={207} height={32} />
            </div> */}
          </div>

          {/* Conteúdo principal */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold text-balance xl:text-5xl">
                Assuma o controle das suas finanças e planeje seu futuro
              </h1>

              <p className="text-primary-foreground/80 max-w-md text-lg">
                Organize receitas, despesas, patrimônio e acompanhe projeções
                financeiras em uma plataforma simples, moderna e intuitiva.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 flex h-10 w-10 items-center justify-center rounded-lg">
                  <PiggyBank className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium">Controle Financeiro</p>
                  <p className="text-primary-foreground/70 text-sm">
                    Registre receitas e despesas com facilidade
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 flex h-10 w-10 items-center justify-center rounded-lg">
                  <ChartSpline className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium">Análises Inteligentes</p>
                  <p className="text-primary-foreground/70 text-sm">
                    Visualize tendências e padrões de consumo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 flex h-10 w-10 items-center justify-center rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-medium">Projeções Financeiras</p>
                  <p className="text-primary-foreground/70 text-sm">
                    Planeje metas e acompanhe seu crescimento patrimonial
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-primary-foreground/60 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Lunyx. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="bg-background flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Header mobile */}
          <div className="space-y-2 text-center lg:hidden">
            {/* <Link
              href="/"
              className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link> */}
            <div className="flex items-center justify-center gap-3">
              <Image src="/Logo.svg" alt="Medixy" width={207} height={32} />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Bem-vindo!</h2>
            <p className="text-muted-foreground">
              Entre na sua conta ou crie uma nova
            </p>
          </div>

          {/* Tabs com formulários */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger
                value="login"
                className="cursor-pointer text-sm font-medium"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="cursor-pointer text-sm font-medium"
              >
                Criar conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-0">
              <SignInForm />
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          {/* Termos */}
          <p className="text-muted-foreground text-center text-xs">
            Ao continuar, você concorda com nossos{' '}
            <Link
              href="#"
              className="hover:text-primary cursor-pointer underline underline-offset-4"
            >
              Termos de Serviço
            </Link>{' '}
            e{' '}
            <Link
              href="#"
              className="hover:text-primary cursor-pointer underline underline-offset-4"
            >
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
