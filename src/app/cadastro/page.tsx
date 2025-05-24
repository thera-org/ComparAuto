import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CadastroUsuario() {
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
      alert("Erro ao cadastrar: " + error.message);
    } else {
      alert("Usuário cadastrado com sucesso!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <label className="block mb-2 font-semibold">
        Tipo:
        <select name="tipo" value={tipo} onChange={e => setTipo(e.target.value)} className="ml-2 border rounded p-1">
          <option value="cliente">Cliente</option>
          <option value="oficina">Oficina</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      {tipo === "cliente" && (
        <>
          <input name="email" placeholder="Email" onChange={handleChange} required className="input" />
          <input name="nome" placeholder="Nome" onChange={handleChange} required className="input" />
          <input name="sobrenome" placeholder="Último sobrenome" onChange={handleChange} required className="input" />
          <input name="telefone" placeholder="Telefone" onChange={handleChange} required className="input" />
          <input name="endereco" placeholder="Endereço" onChange={handleChange} required className="input" />
          <input name="cpf" placeholder="CPF" onChange={handleChange} required className="input" />
        </>
      )}

      {tipo === "oficina" && (
        <>
          <input name="email" placeholder="Email" onChange={handleChange} required className="input" />
          <input name="nome" placeholder="Nome da oficina" onChange={handleChange} required className="input" />
          <input name="telefone" placeholder="Telefone" onChange={handleChange} required className="input" />
          <input name="endereco" placeholder="Endereço" onChange={handleChange} required className="input" />
          <input name="cnpj" placeholder="CNPJ (opcional)" onChange={handleChange} className="input" />
        </>
      )}

      {tipo === "admin" && (
        <>
          <input name="username" placeholder="Username" onChange={handleChange} required className="input" />
          <input name="senha" type="password" placeholder="Senha" onChange={handleChange} required className="input" />
        </>
      )}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
