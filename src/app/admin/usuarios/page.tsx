"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    const list: User[] = data.map((user) => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    }));
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error checking auth:", error);
        return;
      }
      fetchUsers();
    };

    checkAuth();
  }, []);

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id);

    if (error) {
      console.error("Error updating role:", error);
      return;
    }
    fetchUsers(); // Atualiza lista após edição
  };

  if (loading) return <p className="text-center mt-10">Carregando usuários...</p>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-4">Usuários</h1>

      <table className="w-full table-auto bg-white rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-3">Nome</th>
            <th className="p-3">Email</th>
            <th className="p-3">Função</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{user.nome}</td>
              <td className="p-3">{user.email}</td>
              <td className="p-3 capitalize">{user.role}</td>
              <td className="p-3 space-x-2">
                {user.role !== "admin" && (
                  <>
                    <button
                      className="text-blue-600 underline"
                      onClick={() => updateRole(user.id, "admin")}
                    >
                      Tornar Admin
                    </button>
                    <button
                      className="text-green-600 underline"
                      onClick={() => updateRole(user.id, "mechanic")}
                    >
                      Tornar Mecânico
                    </button>
                    <button
                      className="text-red-600 underline"
                      onClick={() => updateRole(user.id, "user")}
                    >
                      Tornar Cliente
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}