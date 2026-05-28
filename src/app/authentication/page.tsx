import { ArrowLeft, CalendarCheck, Shield } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import SignInForm from "./_components/sign-in-form";
import SignUpForm from "./_components/sign-up-form";

const AuthenticationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // if (session?.user) {
  //   redirect("/dashboard");
  // }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Branding */}
      <div className="bg-primary relative hidden overflow-hidden lg:flex lg:w-1/2">
        {/* Padrão de fundo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="border-primary-foreground absolute top-20 left-20 h-72 w-72 rounded-full border" />
          <div className="border-primary-foreground absolute top-40 left-40 h-96 w-96 rounded-full border" />
          <div className="border-primary-foreground absolute -right-20 -bottom-20 h-80 w-80 rounded-full border" />
        </div>

        <div className="text-primary-foreground relative z-10 flex w-full flex-col justify-between p-12">
          {/* Logo e voltar */}
          <div>
            <Link
              href="/"
              className="text-primary-foreground/80 hover:text-primary-foreground mb-8 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">Medixy</span>
            </div>
          </div>

          {/* Conteúdo central */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-bold text-balance">
                Gerencie sua clínica com eficiência e simplicidade
              </h1>
              <p className="text-primary-foreground/80 max-w-md text-lg">
                A plataforma completa para modernizar a gestão da sua clínica
                médica.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 flex h-10 w-10 items-center justify-center rounded-lg">
                  <CalendarCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Agendamento Inteligente</p>
                  <p className="text-primary-foreground/70 text-sm">
                    Controle completo da sua agenda
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary-foreground/20 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Segurança Garantida</p>
                  <p className="text-primary-foreground/70 text-sm">
                    Dados protegidos e em conformidade
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-primary-foreground/60 text-sm">
            <p>
              &copy; {new Date().getFullYear()} Medixy. Todos os direitos
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
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div className="flex items-center justify-center gap-3">
              <Image src="/Logo.svg" alt="Medixy" width={207} height={32} />
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Bem-vindo!
            </h2>
            <p className="text-muted-foreground">
              Entre na sua conta ou crie uma nova
            </p>
          </div>

          {/* Tabs com formulários */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login" className="text-sm font-medium cursor-pointer">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium cursor-pointer">
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
            Ao continuar, você concorda com nossos{" "}
            <Link
              href="#"
              className="hover:text-primary underline underline-offset-4 cursor-pointer"
            >
              Termos de Serviço
            </Link>{" "}
            e{" "}
            <Link
              href="#"
              className="hover:text-primary underline underline-offset-4 cursor-pointer"
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
