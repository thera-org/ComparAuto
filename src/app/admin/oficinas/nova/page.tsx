"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin-layout";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/WorkshopMap"), { ssr: false });

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  latitude: number | null;
  longitude: number | null;
  descricao: string;
  status: string;
}

export default function NovaOficinaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    descricao: "",
    status: "ativo",
    latitude: null,
    longitude: null,
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    // Validação de nome
    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.trim().length < 2) {
      errors.nome = "Nome deve ter pelo menos 2 caracteres";
    }

    // Validação de email
    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email deve ser válido";
    }

    // Validação de telefone
    if (!formData.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    } else if (formData.telefone.trim().length < 10) {
      errors.telefone = "Telefone deve ter pelo menos 10 dígitos";
    }

    // Validação de endereço
    if (!formData.endereco.trim()) {
      errors.endereco = "Endereço é obrigatório";
    } else if (formData.endereco.trim().length < 10) {
      errors.endereco = "Endereço deve ter pelo menos 10 caracteres";
    }

    // Validação de coordenadas
    if (formData.latitude === null || formData.longitude === null) {
      errors.latitude = "Selecione a localização no mapa";
      errors.longitude = "Selecione a localização no mapa";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
    // Limpar erros de coordenadas
    setFieldErrors(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");
    
    try {
      const { error } = await supabase.from("oficinas").insert({
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim(),
        endereco: formData.endereco.trim(),
        descricao: formData.descricao.trim(),
        status: formData.status,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      
      if (error) {
        throw error;
      }
      
      router.push("/admin/oficinas");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao cadastrar oficina";
      setError(errorMessage);
      setSaving(false);
    }
  };
  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Nova Oficina</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              placeholder="Nome da oficina" 
              className={fieldErrors.nome ? "border-red-500" : ""}
            />
            {fieldErrors.nome && <p className="text-red-500 text-sm mt-1">{fieldErrors.nome}</p>}
          </div>
          
          <div>
            <Input 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email da oficina" 
              type="email"
              className={fieldErrors.email ? "border-red-500" : ""}
            />
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>
          
          <div>
            <Input 
              name="telefone"
              value={formData.telefone}
              onChange={handleInputChange}
              placeholder="Telefone (XX) XXXXX-XXXX" 
              className={fieldErrors.telefone ? "border-red-500" : ""}
            />
            {fieldErrors.telefone && <p className="text-red-500 text-sm mt-1">{fieldErrors.telefone}</p>}
          </div>
          
          <div>
            <Input 
              name="endereco"
              value={formData.endereco}
              onChange={handleInputChange}
              placeholder="Endereço completo" 
              className={fieldErrors.endereco ? "border-red-500" : ""}
            />
            {fieldErrors.endereco && <p className="text-red-500 text-sm mt-1">{fieldErrors.endereco}</p>}
          </div>
          
          <div>
            <Textarea 
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descrição da oficina (opcional)" 
              rows={3}
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Localização no mapa <span className="text-red-500">*</span>
            </label>
            <div className="h-64 w-full rounded border overflow-hidden">
              <Map
                selectLocationMode={true}
                onLocationSelect={handleMapClick}
                marker={formData.latitude !== null && formData.longitude !== null ? { lat: formData.latitude, lng: formData.longitude } : null}
                height="256px"
              />
            </div>
            <div className="mt-2">
              {formData.latitude !== null && formData.longitude !== null ? (
                <div className="text-xs text-green-600">
                  ✓ Localização selecionada: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </div>
              ) : (
                <div className="text-xs text-gray-500">Clique no mapa para selecionar a localização</div>
              )}
            </div>
            {(fieldErrors.latitude || fieldErrors.longitude) && (
              <p className="text-red-500 text-sm mt-1">Selecione a localização no mapa</p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push("/admin/oficinas")}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Salvando..." : "Cadastrar oficina"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
