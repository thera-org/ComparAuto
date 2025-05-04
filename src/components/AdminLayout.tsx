"use client";

import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-white p-5 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4">Painel Admin</h2>
        <nav className="flex flex-col gap-2">
          <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/admin/usuarios" className="hover:underline">Usários</Link>
          <Link href="/admin/oficinas" className="hover:underline">Oficinas</Link>
        </nav>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
