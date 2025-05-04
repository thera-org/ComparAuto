"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useForm } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  nome: z.string().min(2).max(100),
  cnpj: z.string().min(14),
  endereco: z.string().min(5).max(200),
  telefone: z.string().min(11),
  email: z.string().email().max(100),
  descricao: z.string().min(10).max(500),
  horarioFuncionamento: z.string().min(5).max(50),
});

export default function CadastroOficina() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
      descricao: "",
      horarioFuncionamento: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase.from("oficinas").insert({
        ...values,
        status: "pendente",
        createdAt: new Date().toISOString(),
      });

      if (error) {
        throw new Error("Erro ao cadastrar oficina.");
      }

      toast.success("Oficina cadastrada com sucesso!");
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar oficina. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl mx-auto">
        <Input {...form.register("nome")} placeholder="Nome da oficina" />
        <Input {...form.register("cnpj")} placeholder="CNPJ" />
        <Input {...form.register("endereco")} placeholder="Endereço" />
        <Input {...form.register("telefone")} placeholder="Telefone" />
        <Input {...form.register("email")} placeholder="E-mail" />
        <Input {...form.register("descricao")} placeholder="Descrição" />
        <Input {...form.register("horarioFuncionamento")} placeholder="Horário de Funcionamento" />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </div>
  );
}