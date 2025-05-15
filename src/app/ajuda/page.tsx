"use client"

import { useState } from "react"

const FAQ = [
  {
    question: "Como altero meus dados de perfil?",
    answer: "Acesse a aba 'Conta', clique em 'Editar Perfil', faça as alterações desejadas e salve."
  },
  {
    question: "Como entro em contato com o suporte?",
    answer: "Envie um e-mail para suporte@comparauto.com ou utilize o formulário abaixo."
  },
  {
    question: "Como excluo minha conta?",
    answer: "Entre em contato com o suporte para solicitar a exclusão da sua conta."
  }
]

export default function AjudaPage() {
  const [open, setOpen] = useState<number | null>(null)
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" })
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Fazer a lógica de envio do formulário aqui por email
    setEnviado(true)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Central de Ajuda</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Perguntas Frequentes</h2>
        <div className="space-y-2">
          {FAQ.map((item, idx) => (
            <div key={idx} className="border rounded">
              <button
                className="w-full text-left px-4 py-2 font-medium"
                onClick={() => setOpen(open === idx ? null : idx)}
              >
                {item.question}
              </button>
              {open === idx && (
                <div className="px-4 py-2 text-gray-700 bg-gray-50">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Fale com o Suporte</h2>
        {enviado ? (
          <div className="p-4 bg-green-100 rounded text-green-700">Mensagem enviada! Em breve entraremos em contato.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium">Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                required
              />
            </div>
            <div>
              <label className="block font-medium">E-mail</label>
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
              <label className="block font-medium">Mensagem</label>
              <textarea
                name="mensagem"
                value={form.mensagem}
                onChange={handleChange}
                className="border rounded px-2 py-1 w-full"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded"
            >
              Enviar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}