"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    mechanics: 0,
    services: 0,
  });

  const fetchStats = async () => {
    const { data: users, error: usersError } = await supabase.from("users").select("*");
    const { data: services, error: servicesError } = await supabase.from("services").select("*");

    if (usersError || servicesError) {
      console.error("Erro ao buscar estatísticas:", usersError || servicesError);
      return;
    }

    const totalUsers = users?.length || 0;
    const totalMechanics = users?.filter((u) => u.role === "mechanic").length || 0;
    const totalServices = services?.length || 0;

    setStats({
      users: totalUsers,
      mechanics: totalMechanics,
      services: totalServices,
    });
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Visão Geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded shadow text-center">
          <h2 className="text-lg text-gray-500">Usuários cadastrados</h2>
          <p className="text-3xl font-bold text-blue-900">{stats.users}</p>
        </div>
        <div className="p-5 bg-white rounded shadow text-center">
          <h2 className="text-lg text-gray-500">Oficinas cadastradas</h2>
          <p className="text-3xl font-bold text-blue-900">{stats.mechanics}</p>
        </div>
        <div className="p-5 bg-white rounded shadow text-center">
          <h2 className="text-lg text-gray-500">Serviços Prestados</h2>
          <p className="text-3xl font-bold text-blue-900">{stats.services}</p>
        </div>
      </div>
    </AdminLayout>
  );
}