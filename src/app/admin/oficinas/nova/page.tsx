"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin-layout";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/WorkshopMap"), { ssr: false });

export default function NovaOficinaPage() {
  const router = useRouter();
  const [form, setForm] = useState<{
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    descricao: string;
    status: string;
    latitude: number | null;
    longitude: number | null;
  }>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    descricao: "",
    status: "ativo",
    latitude: null,
    longitude: null,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMapClick = (lat: number, lng: number) => {
    setForm({ ...form, latitude: lat, longitude: lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    if (!form.nome || !form.email || !form.telefone || !form.endereco || form.latitude === null || form.longitude === null) {
      setError("Preencha todos os campos e selecione a localização no mapa.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("oficinas").insert({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone,
      endereco: form.endereco,
      descricao: form.descricao,
      status: form.status,
      latitude: form.latitude,
      longitude: form.longitude,
    });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    router.push("/admin/oficinas");
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Nova Oficina</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} required />
          <Input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} required />
          <Textarea name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} />
          <div>
            <label className="block mb-1 font-medium">Localização no mapa <span className="text-red-500">*</span></label>
            <div className="h-64 w-full rounded border overflow-hidden">
              <Map
                selectLocationMode={true}
                onLocationSelect={handleMapClick}
                marker={form.latitude !== null && form.longitude !== null ? { lat: form.latitude, lng: form.longitude } : null}
                height="256px"
              />
            </div>
            {form.latitude !== null && form.longitude !== null ? (
              <div className="text-xs mt-1">Lat: {form.latitude}, Lng: {form.longitude}</div>
            ) : (
              <div className="text-xs mt-1 text-red-500">Selecione a localização no mapa</div>
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Cadastrar oficina"}</Button>
        </form>
      </div>
    </AdminLayout>
  );
}
