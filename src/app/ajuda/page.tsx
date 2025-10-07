"use client"
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react"
import { useState, Fragment } from "react"

import Footer from "@/components/Footer"
import Header from "@/components/Header"
import { useAppNotifications } from "@/hooks/useAppNotifications"

const TOPICOS = [
  {
    title: "Conta",
    faqs: [
      { q: "Como altero meus dados de perfil?", a: "Acesse a aba 'Conta', clique em 'Editar Perfil' e salve." },
      { q: "Como redefinir minha senha?", a: "Vá em 'Conta > Segurança' e clique em 'Alterar senha'." }
    ]
  },
  {
    title: "Suporte",
    faqs: [
      { q: "Como entro em contato com o suporte?", a: "Você pode enviar um e-mail para suporte@comparauto.com ou preencher o formulário abaixo." }
    ]
  },
  {
    title: "Exclusão",
    faqs: [
      { q: "Como excluo minha conta?", a: "Entre em contato com o suporte e solicite a exclusão definitiva." }
    ]
  }
]

export default function AjudaPage() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<{ q: string; a: string } | null>(null)
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "", file: null as File | null })
  const [enviado, setEnviado] = useState(false)
  const { success } = useAppNotifications()

  const openModal = (faq: { q: string; a: string }) => {
    setSelectedFAQ(faq)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedFAQ(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, file: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
    // Simula envio
    setTimeout(() => {
      setForm({ nome: "", email: "", mensagem: "", file: null })
      setEnviado(false)
      success("Mensagem enviada!", "Sua mensagem foi enviada com sucesso. Retornaremos em breve.")
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-4xl font-bold text-[#4F46E5] mb-6">Central de Ajuda</h1>

          <input
            type="text"
            placeholder="Pesquise por palavra-chave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg mb-10 focus:ring-2 focus:ring-[#7C3AED]"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
            {TOPICOS.map((topico, idx) => (
              <div key={idx} className="bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition">
                <h2 className="text-[#7C3AED] text-lg font-semibold mb-3">{topico.title}</h2>
                <ul className="space-y-2">
                  {topico.faqs
                    .filter(f => f.q.toLowerCase().includes(search.toLowerCase()))
                    .map((faq, fIdx) => (
                      <li key={fIdx}>
                        <button
                          onClick={() => openModal(faq)}
                          className="text-left text-[#4F46E5] hover:underline"
                        >
                          {faq.q}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold text-[#7C3AED] mb-4">Fale com o Suporte</h2>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
            <div>
              <label className="block font-medium text-[#4F46E5]">Nome</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#4F46E5]">E-mail</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#4F46E5]">Mensagem</label>
              <textarea
                name="mensagem"
                value={form.mensagem}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-[#7C3AED]"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-[#4F46E5] mb-1">Anexo (opcional)</label>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-[#4F46E5] hover:bg-[#E0E7FF] transition"
                >
                  <svg className="w-5 h-5 mr-2 text-[#7C3AED]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485l6.586-6.586" />
                  </svg>
                  Selecionar arquivo
                </label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFile}
                  className="hidden"
                />
                {form.file && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {form.file.name}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, file: null })}
                      className="ml-2 text-red-500 hover:underline"
                      title="Remover arquivo"
                    >
                      Remover
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Formatos aceitos: PDF, JPG, PNG. Tamanho máx: 5MB.</p>
            </div>
            <button
              type="submit"
              disabled={enviado}
              className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white px-6 py-2 rounded hover:opacity-90 transition"
            >
              {enviado ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {/* Modal para FAQ */}
          <Transition show={modalOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-30" />
              </TransitionChild>

              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                >
                  <DialogPanel className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
                    <DialogTitle className="text-xl font-semibold text-[#4F46E5] mb-4">
                      {selectedFAQ?.q}
                    </DialogTitle>
                    <div className="text-gray-700">{selectedFAQ?.a}</div>
                    <div className="mt-6 text-right">
                      <button onClick={closeModal} className="text-[#7C3AED] font-medium hover:underline">
                        Fechar
                      </button>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </Dialog>
          </Transition>
        </div>
      </div>
      <Footer />
    </div>
  )
}
