"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
    .max(50, { message: "Nome deve ter no máximo 50 caracteres" }),

  email: z
    .string()
    .trim()
    .min(1, { message: "Email é obrigatório" })
    .toLowerCase()
    .email({ message: "Email inválido" }),

  password: z
    .string()
    .trim()
    .min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
});

type RegisterSchema = z.infer<typeof registerSchema>;

const SignUpForm = () => {
  const router = useRouter();

  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    // console.log(values);
    await authClient.signUp.email(
      {
        email: values.email, // required
        password: values.password, // required
        name: values.name, // required
      },
      {
        onSuccess: async () => {
          setIsRedirecting(true);
          toast.success("Conta criada com sucesso");
          
          await router.push("/dashboard");
        },
        onError: (ctx) => {
          // if (ctx.error.code == "USER_ALREADY_EXISTS") {
          if (ctx.error.message == "User already exists") {
            toast.error("E-mail já cadastrado");
            return;
          }
          // toast.error(ctx.error.message);
          toast.error("Erro ao criar conta.");
        },
      },
    );
  }

  const isLoading =
    form.formState.isSubmitting || isRedirecting;

  return (
    <div className="space-y-6">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <FieldGroup>
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-medium">
                  Nome completo
                </FieldLabel>

                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                  <Input
                    {...field}
                    placeholder="Seu nome"
                    className="h-11 pl-10"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-medium">
                  Email
                </FieldLabel>

                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                  <Input
                    {...field}
                    placeholder="seu@email.com"
                    className="h-11 pl-10"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-medium">
                  Senha
                </FieldLabel>

                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                  <Input
                    {...field}
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    className="h-11 pl-10"
                    disabled={isLoading}
                    aria-invalid={fieldState.invalid}
                  />
                </div>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          className="h-11 w-full font-medium cursor-pointer"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              {isRedirecting
                ? "Redirecionando..."
                : "Criando conta..."}
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        Sua senha deve ter no mínimo 8 caracteres
      </p>
    </div>
  );
};

export default SignUpForm;