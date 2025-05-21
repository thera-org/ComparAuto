"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import Image from "next/image"
import type { UserProfile } from "@/types/user"


export default function ContaPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    avatar_url: ""
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        setUser(null)
        setLoading(false)
        return
      }
      const { data: userDoc } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      const merged = { ...user, ...userDoc }
      setUser(merged)
      setForm({
        nome: merged.nome || "",
        email: merged.email || "",
        telefone: merged.telefone || "",
        endereco: merged.endereco || "",
        avatar_url: merged.avatar_url || ""
      })
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      setForm({ ...form, avatar_url: URL.createObjectURL(e.target.files[0]) })
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let avatar_url = form.avatar_url

    // Upload avatar se mudou
    if (avatarFile && user) {
      const { data, error } = await supabase.storage
        .from("avatars")
        .upload(`public/${user.id}`, avatarFile, { upsert: true })
      if (!error && data) {
        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(data.path)
        avatar_url = urlData.publicUrl
      }
    }

    // Atualiza tabela users
    if (user) {
      await supabase
        .from("users")
        .update({
          nome: form.nome,
          telefone: form.telefone,
          endereco: form.endereco,
          avatar_url
        })
        .eq("id", user.id)

      // Atualiza email se mudou
      if (form.email !== user.email) {
        await supabase.auth.updateUser({ email: form.email })
      }
    }

    setEdit(false)
    setSaving(false)
    window.location.reload()
  }

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: 40}}>Carregando dados do usuário...</div>
  }

  if (!user) {
    return <div style={{color: 'red', textAlign: 'center', marginTop: 40}}>Erro ao carregar usuário. Faça login novamente.</div>
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
       {edit ? (
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="flex items-center gap-4">
      <Image
        src={form.avatar_url || "/placeholder.svg"}
        alt="Avatar"
        width={64}
        height={64}
        className="w-16 h-16 rounded-full object-cover"
      />
      <input type="file" accept="image/*" onChange={handleAvatarChange} />
    </div>
            <div>
              <label className="font-medium block">Nome:</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="font-medium block">E-mail:</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="font-medium block">Telefone:</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div>
              <label className="font-medium block">Endereço:</label>
              <input
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded"
              disabled={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              className="ml-2 px-4 py-2 rounded border"
              onClick={() => setEdit(false)}
              disabled={saving}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-4">
      <Image
        src={user.avatar_url || "/placeholder.svg"}
        alt="Avatar"
        width={64}
        height={64}
        className="w-16 h-16 rounded-full object-cover"
      />
      <button
        className="ml-2 px-4 py-2 rounded border"
        onClick={() => setEdit(true)}
      >
                Editar Perfil
              </button>
            </div>
            <div>
              <span className="font-medium">Nome:</span> {user.nome}
            </div>
            <div>
              <span className="font-medium">E-mail:</span> {user.email}
            </div>
            <div>
              <span className="font-medium">Telefone:</span> {user.telefone || "-"}
            </div>
            <div>
              <span className="font-medium">Endereço:</span> {user.endereco || "-"}
            </div>
            <div>
              <span className="font-medium">Função:</span> usuário
            </div>
          </>
        )}
      </div>
    </div>
  )
}