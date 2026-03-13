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
    content:
      'Parece ser um reparo simples de martelinho de ouro, sem necessidade de pintura completa.',
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

      <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-6 pb-8 pt-24">
        <div className="flex h-[calc(100vh-200px)] overflow-hidden  rounded-xl border border-gray-200 bg-white shadow-soft ">
          {/* Sidebar - Conversations List */}
          <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white  md:w-1/3  lg:w-[360px]">
            <div className="flex items-center justify-between  border-b border-gray-200 p-6">
              <h1 className="text-xl font-bold text-gray-900 ">Mensagens</h1>
              <button className=":bg-gray-800 rounded-full p-2 text-gray-500 hover:bg-gray-100 ">
                <span className="material-icons">filter_list</span>
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {CONVERSATIONS.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex cursor-pointer items-start gap-4 p-4 transition-colors ${selectedConversation.id === conv.id
                      ? 'border-r-4  border-primary bg-gray-100'
                      : ':bg-gray-800 border-b border-gray-100 hover:bg-gray-50 '
                    }`}
                >
                  {conv.avatar ? (
                    <Image
                      src={conv.avatar}
                      alt={conv.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0  items-center justify-center rounded-full bg-blue-100  text-lg font-bold text-blue-600">
                      {conv.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-grow">
                    <div className="mb-1 flex items-baseline justify-between">
                      <h3 className="truncate font-semibold  text-gray-900">{conv.name}</h3>
                      <span className="whitespace-nowrap text-xs  text-gray-500">{conv.time}</span>
                    </div>
                    <p
                      className={`truncate text-sm ${conv.unread ? 'font-medium  text-gray-900' : 'text-gray-500 '}`}
                    >
                      {conv.lastMessage}
                    </p>
                    {conv.isOnline && (
                      <div className="mt-2 flex items-center  gap-1 text-xs text-gray-500">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500"></span>{' '}
                        Online
                      </div>
                    )}
                    {conv.status && (
                      <span className="mt-1 inline-block rounded-md bg-gray-100 px-2  py-0.5  text-xs text-gray-500">
                        {conv.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Chat Area */}
          <section className="relative flex flex-grow flex-col  bg-white">
            {/* Chat Header */}
            <div className="z-10 flex h-20  flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white  px-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src={selectedConversation.avatar || '/placeholder.svg'}
                    alt={selectedConversation.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  {selectedConversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white  bg-green-500"></div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold leading-tight  text-gray-900">
                    {selectedConversation.name}
                  </h2>
                  <p className="text-sm text-gray-500 ">Tempo de resposta: &lt; 1 hora</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className=":bg-gray-800 hidden rounded-lg border border-gray-300 px-4  py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 md:block ">
                  Ver Perfil
                </button>
                <button className=":bg-gray-800 rounded-full  p-2 text-gray-500 hover:bg-gray-100">
                  <span className="material-icons">more_vert</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex flex-grow flex-col gap-6 overflow-y-auto bg-gray-50 p-6 ">
              <div className="flex justify-center">
                <span className="rounded-full border border-gray-200  bg-white  px-3 py-1 text-xs font-medium text-gray-500  shadow-sm">
                  Hoje
                </span>
              </div>

              {MESSAGES.map(msg => (
                <div
                  key={msg.id}
                  className={`flex max-w-[80%] items-end gap-3 ${msg.isOwn ? 'flex-row-reverse self-end' : 'self-start'}`}
                >
                  {msg.avatar && !msg.isOwn ? (
                    <Image
                      src={msg.avatar}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="mb-1 h-8 w-8 rounded-full object-cover"
                    />
                  ) : msg.isOwn ? (
                    <div className="mb-1 flex h-8 w-8  items-center justify-center rounded-full bg-gray-200 text-xs font-bold">
                      EU
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex-shrink-0"></div>
                  )}
                  <div>
                    <div
                      className={`rounded-2xl p-4 shadow-sm ${msg.isOwn
                          ? 'rounded-br-none bg-primary text-white'
                          : 'rounded-bl-none  border border-gray-200  bg-white  text-gray-900'
                        }`}
                    >
                      <p>{msg.content}</p>
                    </div>
                    <span
                      className={`mt-1 block  text-xs text-gray-500 ${msg.isOwn ? 'mr-1 text-right' : 'ml-1'}`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white  p-4 ">
              <div className="flex items-center gap-3">
                <button className=":bg-gray-800 rounded-full  p-2 text-gray-500 hover:bg-gray-100">
                  <span className="material-icons">attach_file</span>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-grow rounded-full border border-gray-300 bg-gray-50 px-4  py-3  text-gray-900  placeholder-gray-500  focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="rounded-full bg-primary p-3 text-white transition-colors hover:bg-primary-hover">
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
