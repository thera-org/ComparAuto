"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/admin-layout";
import AdminAuthGate from "@/components/AdminAuthGate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from '@/contexts/NotificationContext';

export default function CadastroUsuario() {
  const { success, error: showError } = useNotifications();
  const [tipo, setTipo] = useState("cliente");
  const [form, setForm] = useState({
    email: "",
    nome: "",
    sobrenome: "",
    telefone: "",
    endereco: "",
    cpf: "",
    cnpj: "",
    username: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  interface CadastroPayload {
    tipo: string;
    email?: string;
    nome?: string;
    telefone?: string;
    endereco?: string;
    cpf?: string;
    cnpj?: string;
    username?: string;
    senha?: string;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let payload: CadastroPayload = { tipo };

    if (tipo === "cliente") {
      payload = {
        ...payload,
        email: form.email,
        nome: `${form.nome} ${form.sobrenome}`.trim(),
        telefone: form.telefone,
        endereco: form.endereco,
        cpf: form.cpf,
      };
    } else if (tipo === "oficina") {
      payload = {
        ...payload,
        email: form.email,
        nome: form.nome, // nome da oficina
        telefone: form.telefone,
        endereco: form.endereco,
        cnpj: form.cnpj,
      };
    } else if (tipo === "admin") {
      payload = {
        ...payload,
        username: form.username,
        senha: form.senha,
      };
    }

    const { error } = await supabase.from("usuarios").insert([payload]);
    setLoading(false);
    if (error) {
      showError("Erro ao cadastrar", error.message);
    } else {
      success("Usuário cadastrado!", "Usuário cadastrado com sucesso!");
      setForm({
        email: "",
        nome: "",
        sobrenome: "",
        telefone: "",
        endereco: "",
        cpf: "",
        cnpj: "",
        username: "",
        senha: "",
      });
      setTipo("cliente");
    }
  };

  return (
    <AdminAuthGate>
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Card className="max-w-2xl mx-auto bg-white shadow-lg">
            <CardHeader className="pb-4 border-b border-gray-200">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                Cadastro de Usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuário *
                  </label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="w-full h-10 border border-gray-300">
                      <SelectValue placeholder="Selecione o tipo de usuário" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipo === "cliente" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input 
                        name="email" 
                        type="email"
                        placeholder="Email" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome *
                      </label>
                      <Input 
                        name="nome" 
                        placeholder="Nome" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sobrenome *
                      </label>
                      <Input 
                        name="sobrenome" 
                        placeholder="Último sobrenome" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <Input 
                        name="telefone" 
                        placeholder="Telefone" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço *
                      </label>
                      <Input 
                        name="endereco" 
                        placeholder="Endereço" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF *
                      </label>
                      <Input 
                        name="cpf" 
                        placeholder="CPF" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {tipo === "oficina" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input 
                        name="email" 
                        type="email"
                        placeholder="Email" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Oficina *
                      </label>
                      <Input 
                        name="nome" 
                        placeholder="Nome da oficina" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone *
                      </label>
                      <Input 
                        name="telefone" 
                        placeholder="Telefone" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço *
                      </label>
                      <Input 
                        name="endereco" 
                        placeholder="Endereço" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ
                      </label>
                      <Input 
                        name="cnpj" 
                        placeholder="CNPJ (opcional)" 
                        onChange={handleChange} 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                  </div>
                )}

                {tipo === "admin" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <Input 
                        name="username" 
                        placeholder="Username" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha *
                      </label>
                      <Input 
                        name="senha" 
                        type="password" 
                        placeholder="Senha" 
                        onChange={handleChange} 
                        required 
                        className="h-10 border border-gray-300"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Cadastrando..." : "Cadastrar Usuário"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminAuthGate>
  );
}
