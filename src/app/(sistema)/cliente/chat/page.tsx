"use client"

import { useEffect, useState, useRef } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Search, MessageSquare, User, Loader2, Phone } from "lucide-react"

interface Chat {
	id: string
	client_id: string
	contact_number: string
	contact_name?: string
	last_message?: string
	unread_count: number
	updated_at: string
	created_at: string
}

interface Message {
	id: string
	chat_id: string
	message_id: string
	direction: "inbound" | "outbound"
	content: string
	created_at: string
}

export default function ClientChatPage() {
	const [chats, setChats] = useState<Chat[]>([])
	const [activeChat, setActiveChat] = useState<Chat | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [loadingChats, setLoadingChats] = useState(true)
	const [loadingMessages, setLoadingMessages] = useState(false)
	const [sending, setSending] = useState(false)
	const [textMessage, setTextMessage] = useState("")
	const [searchQuery, setSearchQuery] = useState("")

	const messagesEndRef = useRef<HTMLDivElement>(null)
	const pollingRef = useRef<NodeJS.Timeout | null>(null)

	// Carrega lista de conversas
	const loadChats = async (isSilent = false) => {
		if (!isSilent) setLoadingChats(true)
		const res = await http.get<Chat[]>("/cliente/chats")
		if (res.data) {
			setChats(Array.isArray(res.data) ? res.data : [])
		}
		if (!isSilent) setLoadingChats(false)
	}

	// Carrega histórico de mensagens de uma conversa
	const loadMessages = async (chat: Chat, isSilent = false) => {
		if (!isSilent) setLoadingMessages(true)
		const res = await http.get<Message[]>(`/cliente/chats/${chat.id}/messages`)
		if (res.data) {
			setMessages(Array.isArray(res.data) ? res.data : [])
		}
		if (!isSilent) setLoadingMessages(false)
	}

	// Envia mensagem convencional
	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activeChat || !textMessage.trim() || sending) return

		setSending(true)
		const contentToSend = textMessage.trim()
		setTextMessage("")

		const res = await http.post<Message>("/cliente/chats/send", {
			contact_number: activeChat.contact_number,
			content: contentToSend,
		})

		if (res.data) {
			setMessages((prev) => [...prev, res.data as Message])
			// Atualiza a conversa na lista lateral
			loadChats(true)
		}
		setSending(false)
	}

	// Seleciona uma conversa
	const handleSelectChat = (chat: Chat) => {
		setActiveChat(chat)
		loadMessages(chat)
		// Marca como lida localmente para atualizar o badge imediatamente
		setChats((prev) =>
			prev.map((c) => (c.id === chat.id ? { ...c, unread_count: 0 } : c))
		)
	}

	// Efeito para scroll automático para última mensagem
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages])

	// Setup do polling a cada 4 segundos
	useEffect(() => {
		loadChats()

		pollingRef.current = setInterval(() => {
			loadChats(true)
		}, 4000)

		return () => {
			if (pollingRef.current) clearInterval(pollingRef.current)
		}
	}, [])

	// Polling de mensagens da conversa ativa
	useEffect(() => {
		if (!activeChat) return

		const interval = setInterval(() => {
			loadMessages(activeChat, true)
		}, 4000)

		return () => clearInterval(interval)
	}, [activeChat])

	// Filtra a lista de conversas com base na busca
	const filteredChats = chats.filter((c) => {
		const name = (c.contact_name || "").toLowerCase()
		const phone = c.contact_number.toLowerCase()
		const query = searchQuery.toLowerCase()
		return name.includes(query) || phone.includes(query)
	})

	const formatTime = (isoString: string) => {
		try {
			const date = new Date(isoString)
			return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
		} catch {
			return ""
		}
	}

	return (
		<div className="flex h-[calc(100vh-112px)] overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200">
			{/* LISTA DE CONVERSAS (LATERAL ESQUERDA) */}
			<div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col h-full">
				<div className="p-4 border-b border-slate-100 space-y-3">
					<h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
						<MessageSquare className="h-5 w-5 text-indigo-600" />
						Chat do Cliente
					</h2>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
						<Input
							placeholder="Buscar contato ou celular..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 h-9 rounded-xl border-slate-200 text-xs focus:ring-1 focus:ring-slate-400"
						/>
					</div>
				</div>

				<div className="flex-1 overflow-y-auto divide-y divide-slate-50">
					{loadingChats ? (
						<div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
							<Loader2 className="h-6 w-6 animate-spin" />
							<span className="text-xs">Carregando conversas...</span>
						</div>
					) : filteredChats.length === 0 ? (
						<div className="p-8 text-center text-xs text-slate-400 font-medium">
							Nenhuma conversa ativa encontrada.
						</div>
					) : (
						filteredChats.map((chat) => {
							const isActive = activeChat?.id === chat.id
							return (
								<div
									key={chat.id}
									onClick={() => handleSelectChat(chat)}
									className={`flex items-center gap-3 p-4 cursor-pointer transition hover:bg-slate-50 select-none ${
										isActive ? "bg-indigo-50/50 hover:bg-indigo-50/50 border-l-4 border-indigo-600" : ""
									}`}
								>
									<div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 relative flex-shrink-0">
										<User className="h-5 w-5" />
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-baseline mb-0.5">
											<h4 className="text-xs font-bold text-slate-800 truncate">
												{chat.contact_name || chat.contact_number}
											</h4>
											<span className="text-[10px] text-slate-400 font-medium">
												{formatTime(chat.updated_at)}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 truncate font-medium">
											{chat.last_message || "Sem mensagens"}
										</p>
									</div>
									{chat.unread_count > 0 && (
										<span className="h-5 min-w-[20px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
											{chat.unread_count}
										</span>
									)}
								</div>
							)
						})
					)}
				</div>
			</div>

			{/* CONVERSA ATIVA (LADO DIREITO) */}
			<div className="hidden md:flex flex-1 flex-col h-full bg-slate-50/30 relative">
				{activeChat ? (
					<>
						{/* HEADER DA CONVERSA */}
						<div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
									<User className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-xs font-bold text-slate-800">
										{activeChat.contact_name || activeChat.contact_number}
									</h3>
									<p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
										<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
										WhatsApp Conectado
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
								<Phone className="h-4 w-4" />
								{activeChat.contact_number}
							</div>
						</div>

						{/* CORPO DE MENSAGENS */}
						<div className="flex-1 overflow-y-auto p-6 space-y-4">
							{loadingMessages ? (
								<div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
									<Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
									<span className="text-xs">Carregando mensagens...</span>
								</div>
							) : messages.length === 0 ? (
								<div className="text-center text-xs text-slate-400 py-12">
									Nenhuma mensagem trocada ainda. Escreva uma mensagem abaixo!
								</div>
							) : (
								messages.map((msg) => {
									const isOutbound = msg.direction === "outbound"
									return (
										<div
											key={msg.id}
											className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
										>
											<div
												className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-xs font-semibold ${
													isOutbound
														? "bg-indigo-600 text-white rounded-br-none"
														: "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
												}`}
											>
												<p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
												<span
													className={`text-[9px] block text-right mt-1 font-normal ${
														isOutbound ? "text-indigo-200" : "text-slate-400"
													}`}
												>
													{formatTime(msg.created_at)}
												</span>
											</div>
										</div>
									)
								})
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* INPUT DE MENSAGEM */}
						<div className="p-4 border-t border-slate-200 bg-white">
							<form onSubmit={handleSendMessage} className="flex gap-2">
								<Input
									placeholder="Escreva sua mensagem aqui..."
									value={textMessage}
									onChange={(e) => setTextMessage(e.target.value)}
									className="flex-1 rounded-xl border-slate-200 text-xs focus:ring-1 focus:ring-slate-400"
									disabled={sending}
									required
								/>
								<Button
									type="submit"
									disabled={sending || !textMessage.trim()}
									className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 flex items-center justify-center gap-1.5 h-10 font-bold"
								>
									{sending ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<>
											<Send className="h-4 w-4" />
											Enviar
										</>
									)}
								</Button>
							</form>
						</div>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/10">
						<div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
							<MessageSquare className="h-8 w-8 text-indigo-600" />
						</div>
						<h3 className="font-bold text-slate-800 mb-1 text-sm">Selecione uma conversa</h3>
						<p className="text-xs text-slate-400 text-center max-w-sm font-medium">
							Escolha uma barbearia ou cliente ao lado para ler o histórico das mensagens e responder diretamente via WhatsApp.
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
