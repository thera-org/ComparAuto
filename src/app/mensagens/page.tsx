'use client'

import Image from 'next/image'
import { useState } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

interface Conversation {
  id: string
  name: string
  avatar?: string
  initials?: string
  lastMessage: string
  time: string
  isOnline?: boolean
  status?: string
  unread?: boolean
}

interface Message {
  id: string
  content: string
  time: string
  isOwn: boolean
  avatar?: string
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Lanternagem Pro',
    avatar: '/placeholder.svg',
    lastMessage: 'O orçamento ficou pronto. Posso enviar?',
    time: '09:41',
    isOnline: true,
    unread: true,
  },
  {
    id: '2',
    name: 'Auto Elétrica Volts',
    avatar: '/placeholder.svg',
    lastMessage: 'Combinado! Te espero às 14h.',
    time: 'Ontem',
    status: 'Agendado',
  },
  {
    id: '3',
    name: 'São Luís Central',
    initials: 'SC',
    lastMessage: 'Você: Obrigado pelo serviço!',
    time: '23 Out',
  },
  {
    id: '4',
    name: 'Pneus & Alinhamento SLZ',
    avatar: '/placeholder.svg',
    lastMessage: 'Sim, temos pneus aro 17 em estoque.',
    time: '15 Out',
  },
]

const MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Olá! Recebi as fotos do amassado no paralamas.',
    time: '09:30',
    isOwn: false,
    avatar: '/placeholder.svg',
  },
  {
    id: '2',
    content: 'Parece ser um reparo simples de martelinho de ouro, sem necessidade de pintura completa.',
    time: '09:31',
    isOwn: false,
  },
  {
    id: '3',
    content: 'Que ótima notícia! Eu estava preocupado com o valor.',
    time: '09:35',
    isOwn: true,
  },
  {
    id: '4',
    content: 'Vocês conseguem me passar um orçamento aproximado?',
    time: '09:36',
    isOwn: true,
  },
  {
    id: '5',
    content: 'O orçamento ficou pronto. Posso enviar?',
    time: '09:41',
    isOwn: false,
    avatar: '/placeholder.svg',
  },
]

export default function MensagensPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(CONVERSATIONS[0])
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="flex min-h-screen flex-col bg-white  text-gray-800 ">
      <Header />

      <main className="flex-grow flex flex-col max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex border border-gray-200  rounded-xl overflow-hidden h-[calc(100vh-200px)] shadow-soft bg-white ">
          {/* Sidebar - Conversations List */}
          <aside className="w-full md:w-1/3 lg:w-[360px] flex flex-col border-r border-gray-200  bg-white  h-full">
            <div className="p-6 border-b border-gray-200  flex justify-between items-center">
              <h1 className="text-xl font-bold text-gray-900 ">Mensagens</h1>
              <button className="p-2 rounded-full hover:bg-gray-100 :bg-gray-800 text-gray-500 ">
                <span className="material-icons">filter_list</span>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {CONVERSATIONS.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-start gap-4 p-4 cursor-pointer transition-colors ${
                    selectedConversation.id === conv.id
                      ? 'bg-gray-100  border-r-4 border-primary'
                      : 'hover:bg-gray-50 :bg-gray-800 border-b border-gray-100 '
                  }`}
                >
                  {conv.avatar ? (
                    <Image
                      src={conv.avatar}
                      alt={conv.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100  flex items-center justify-center text-blue-600  font-bold text-lg flex-shrink-0">
                      {conv.initials}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900  truncate">{conv.name}</h3>
                      <span className="text-xs text-gray-500  whitespace-nowrap">{conv.time}</span>
                    </div>
                    <p className={`text-sm truncate ${conv.unread ? 'text-gray-900  font-medium' : 'text-gray-500 '}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.isOnline && (
                      <div className="mt-2 text-xs text-gray-500  flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Online
                      </div>
                    )}
                    {conv.status && (
                      <span className="mt-1 text-xs px-2 py-0.5 bg-gray-100  text-gray-500  rounded-md inline-block">
                        {conv.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Chat Area */}
          <section className="flex-grow flex flex-col bg-white  relative">
            {/* Chat Header */}
            <div className="h-20 border-b border-gray-200  flex items-center justify-between px-6 flex-shrink-0 bg-white  z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={selectedConversation.avatar || '/placeholder.svg'}
                    alt={selectedConversation.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white  rounded-full"></div>
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900  leading-tight">{selectedConversation.name}</h2>
                  <p className="text-sm text-gray-500 ">Tempo de resposta: &lt; 1 hora</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="hidden md:block px-4 py-2 border border-gray-300  rounded-lg text-sm font-medium hover:bg-gray-100 :bg-gray-800 transition-colors text-gray-900 ">
                  Ver Perfil
                </button>
                <button className="p-2 text-gray-500  hover:bg-gray-100 :bg-gray-800 rounded-full">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 bg-gray-50 ">
              <div className="flex justify-center">
                <span className="text-xs font-medium text-gray-500  bg-white  px-3 py-1 rounded-full border border-gray-200  shadow-sm">
                  Hoje
                </span>
              </div>

              {MESSAGES.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-3 max-w-[80%] ${msg.isOwn ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  {msg.avatar && !msg.isOwn ? (
                    <Image
                      src={msg.avatar}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover mb-1"
                    />
                  ) : msg.isOwn ? (
                    <div className="w-8 h-8 rounded-full bg-gray-200  flex items-center justify-center text-xs font-bold mb-1">
                      EU
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex-shrink-0"></div>
                  )}
                  <div>
                    <div
                      className={`p-4 rounded-2xl shadow-sm ${
                        msg.isOwn
                          ? 'bg-primary text-white rounded-br-none'
                          : 'bg-white  border border-gray-200  text-gray-900  rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span className={`text-xs text-gray-500  mt-1 block ${msg.isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200  bg-white ">
              <div className="flex items-center gap-3">
                <button className="p-2 text-gray-500  hover:bg-gray-100 :bg-gray-800 rounded-full">
                  <span className="material-icons">attach_file</span>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-grow px-4 py-3 rounded-full border border-gray-300  bg-gray-50  text-gray-900  placeholder-gray-500  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="p-3 bg-primary hover:bg-primary-hover text-white rounded-full transition-colors">
                  <span className="material-icons">send</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
