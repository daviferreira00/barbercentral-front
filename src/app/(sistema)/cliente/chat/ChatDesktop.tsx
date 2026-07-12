"use client"

import { useEffect, useState, useRef } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
	Send, 
	Search, 
	MessageSquare, 
	User, 
	Loader2, 
	Phone, 
	Plus, 
	X, 
	UserPlus, 
	Check, 
	CheckCheck,
	Sparkles
} from "lucide-react"

interface Chat {
	id: string
	client_id: string
	contact_number: string
	contact_name?: string
	last_message?: string
	unread_count: number
	updated_at: string
	created_at: string

	// Campos enriquecidos / WhatsApp metadata
	profile_pic_url?: string
	whatsapp_name?: string
	customer_id?: string
	customer_name?: string
}

interface Message {
	id: string
	chat_id: string
	message_id: string
	direction: "inbound" | "outbound"
	content: string
	created_at: string
}

interface Customer {
	id: string
	name: string
	phone: string
	email?: string
}

export default function ChatDesktop() {
	const [chats, setChats] = useState<Chat[]>([])
	const [activeChat, setActiveChat] = useState<Chat | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [loadingChats, setLoadingChats] = useState(true)
	const [loadingMessages, setLoadingMessages] = useState(false)
	const [sending, setSending] = useState(false)
	const [textMessage, setTextMessage] = useState("")
	const [searchQuery, setSearchQuery] = useState("")

	// Modais
	const [showAddContactModal, setShowAddContactModal] = useState(false)
	const [showNewChatModal, setShowNewChatModal] = useState(false)
	const [newChatMode, setNewChatMode] = useState<"select" | "create">("select")

	// Cadastro de cliente novo
	const [contactNameInput, setContactNameInput] = useState("")
	const [contactPhoneInput, setContactPhoneInput] = useState("")
	const [savingContact, setSavingContact] = useState(false)

	// Listagem de clientes para "Nova Conversa"
	const [crmCustomers, setCrmCustomers] = useState<Customer[]>([])
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
	const [newChatFirstMsg, setNewChatFirstMsg] = useState("")
	const [customerSearchQuery, setCustomerSearchQuery] = useState("")
	const [loadingCrm, setLoadingCrm] = useState(false)

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
			loadChats(true)
		}
		setSending(false)
	}

	// Seleciona uma conversa
	const handleSelectChat = (chat: Chat) => {
		setActiveChat(chat)
		loadMessages(chat)
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

	// Busca clientes do CRM para o modal "Nova Conversa"
	const loadCrmCustomers = async (search = "") => {
		setLoadingCrm(true)
		if (search) {
			const res = await http.get<Customer[]>(`/customers/search?q=${encodeURIComponent(search)}`)
			if (res.data) {
				setCrmCustomers(Array.isArray(res.data) ? res.data : [])
			}
		} else {
			const res = await http.get<{ data: Customer[] }>("/customers")
			if (res.data && res.data.data) {
				setCrmCustomers(Array.isArray(res.data.data) ? res.data.data : [])
			}
		}
		setLoadingCrm(false)
	}

	// Gatilho de busca ao digitar no seletor de clientes
	useEffect(() => {
		if (showNewChatModal && newChatMode === "select") {
			const delayDebounceFn = setTimeout(() => {
				loadCrmCustomers(customerSearchQuery)
			}, 300)
			return () => clearTimeout(delayDebounceFn)
		}
	}, [customerSearchQuery, showNewChatModal, newChatMode])

	// Abre o modal de cadastrar contato rápido
	const handleOpenAddContact = (chat: Chat) => {
		setContactNameInput(chat.whatsapp_name || chat.contact_name || "")
		setContactPhoneInput(chat.contact_number)
		setShowAddContactModal(true)
	}

	// Salva novo cliente no CRM e vincula ao chat
	const handleAddContact = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!contactNameInput.trim() || !contactPhoneInput.trim() || savingContact) return

		setSavingContact(true)
		const res = await http.post<Customer>("/customers", {
			name: contactNameInput.trim(),
			phone: contactPhoneInput.trim(),
		})

		if (res.data) {
			setShowAddContactModal(false)
			// Atualiza a conversa ativa para pegar a alteração
			if (activeChat && activeChat.contact_number === contactPhoneInput) {
				setActiveChat(prev => prev ? { ...prev, customer_id: res.data?.id, customer_name: res.data?.name } : null)
			}
			loadChats(true)
		}
		setSavingContact(false)
	}

	// Inicia nova conversa (selecionando cliente do CRM ou criando um novo)
	const handleStartNewChat = async (e: React.FormEvent) => {
		e.preventDefault()
		if (savingContact) return

		let phoneToSend = ""
		let contentMsg = newChatFirstMsg.trim() || "Olá!"

		setSavingContact(true)

		if (newChatMode === "select") {
			if (!selectedCustomer) return
			phoneToSend = selectedCustomer.phone
		} else {
			if (!contactNameInput.trim() || !contactPhoneInput.trim()) return
			phoneToSend = contactPhoneInput.trim()

			// 1. Cadastra o novo cliente no CRM
			const resCust = await http.post<Customer>("/customers", {
				name: contactNameInput.trim(),
				phone: phoneToSend,
			})
			if (!resCust.data) {
				setSavingContact(false)
				return
			}
		}

		// 2. Envia a mensagem inicial via Evolution para iniciar a conversa no banco
		const resSend = await http.post<Message>("/cliente/chats/send", {
			contact_number: phoneToSend,
			content: contentMsg,
		})

		if (resSend.data) {
			setShowNewChatModal(false)
			setNewChatFirstMsg("")
			setSelectedCustomer(null)
			setContactNameInput("")
			setContactPhoneInput("")
			
			// 3. Atualiza a lista de chats e auto-seleciona a nova conversa
			await loadChats(true)
			
			// Tenta achar o chat recém criado
			const resChats = await http.get<Chat[]>("/cliente/chats")
			if (resChats.data) {
				const match = resChats.data.find(c => c.contact_number === cleanNumber(phoneToSend))
				if (match) {
					handleSelectChat(match)
				}
			}
		}
		setSavingContact(false)
	}

	// Filtra a lista de conversas com base na busca
	const filteredChats = chats.filter((c) => {
		const name = (c.customer_name || c.whatsapp_name || c.contact_name || "").toLowerCase()
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

	const cleanNumber = (number: string) => {
		let clean = ""
		for (const char of number) {
			if (char >= '0' && char <= '9') {
				clean += char
			}
		}
		if (clean.length === 10 || clean.length === 11) {
			clean = "55" + clean
		}
		return clean
	}

	return (
		<div className="flex h-[calc(100vh-112px)] overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200 shadow-sm relative">
			
			{/* LISTA DE CONVERSAS (LATERAL ESQUERDA) */}
			<div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col h-full z-10">
				
				{/* HEADER & BUSCA */}
				<div className="p-4 border-b border-slate-100 space-y-3">
					<div className="flex items-center justify-between">
						<h2 className="font-bold text-slate-800 text-base flex items-center gap-2">
							<MessageSquare className="h-5 w-5 text-indigo-600 animate-pulse" />
							Chat do Cliente
						</h2>
						<Button
							onClick={() => {
								setNewChatMode("select")
								loadCrmCustomers("")
								setShowNewChatModal(true)
							}}
							className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 w-8 p-0 flex items-center justify-center shadow-sm hover:scale-105 transition duration-200"
							title="Nova Conversa"
						>
							<Plus className="h-4 w-4" />
						</Button>
					</div>
					<div className="relative">
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
						<Input
							placeholder="Buscar contato ou celular..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 h-9 rounded-xl border-slate-200 text-xs focus:ring-1 focus:ring-slate-400"
						/>
					</div>
				</div>

				{/* CONVERSAS */}
				<div className="flex-1 overflow-y-auto divide-y divide-slate-50">
					{loadingChats ? (
						<div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
							<Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
							<span className="text-xs">Carregando conversas...</span>
						</div>
					) : filteredChats.length === 0 ? (
						<div className="p-8 text-center text-xs text-slate-400 font-medium">
							Nenhuma conversa ativa encontrada.
						</div>
					) : (
						filteredChats.map((chat) => {
							const isActive = activeChat?.id === chat.id
							const displayName = chat.customer_name || chat.whatsapp_name || chat.contact_name || chat.contact_number
							
							return (
								<div
									key={chat.id}
									onClick={() => handleSelectChat(chat)}
									className={`flex items-center gap-3 p-4 cursor-pointer transition select-none border-l-4 border-transparent ${
										isActive ? "bg-indigo-50/40 border-indigo-600" : "hover:bg-slate-50/80"
									}`}
								>
									{/* FOTO DE PERFIL / AVATAR */}
									<div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-slate-500 relative flex-shrink-0 border border-slate-200">
										{chat.profile_pic_url ? (
											<img 
												src={chat.profile_pic_url} 
												alt={displayName} 
												className="h-full w-full object-cover animate-in fade-in duration-300"
											/>
										) : (
											<User className="h-5 w-5 text-slate-400" />
										)}
										{chat.customer_id && (
											<span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center" title="Contato no CRM">
												<Check className="h-2 w-2 text-white" />
											</span>
										)}
									</div>

									{/* METADADOS */}
									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-baseline mb-0.5">
											<h4 className={`text-xs truncate ${chat.customer_name ? "font-bold text-indigo-950" : "font-semibold text-slate-700"}`}>
												{displayName}
											</h4>
											<span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
												{formatTime(chat.updated_at)}
											</span>
										</div>
										<p className="text-[11px] text-slate-500 truncate font-medium">
											{chat.last_message || "Sem mensagens"}
										</p>
									</div>

									{/* BADGE NÃO LIDA */}
									{chat.unread_count > 0 && (
										<span className="h-5 min-w-[20px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
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
			<div className="flex flex-1 flex-col h-full bg-slate-50/20 relative">
				{activeChat ? (
					<>
						{/* HEADER DA CONVERSA */}
						<div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between z-10 shadow-sm">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 bg-slate-100 rounded-full overflow-hidden flex items-center justify-center text-slate-500 border border-slate-200 flex-shrink-0">
									{activeChat.profile_pic_url ? (
										<img 
											src={activeChat.profile_pic_url} 
											alt="Perfil" 
											className="h-full w-full object-cover"
										/>
									) : (
										<User className="h-5 w-5" />
									)}
								</div>
								<div>
									<h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
										{activeChat.customer_name || activeChat.whatsapp_name || activeChat.contact_name || activeChat.contact_number}
										{activeChat.customer_id && (
											<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
												<Check className="h-2.5 w-2.5" /> Agenda
											</span>
										)}
									</h3>
									<p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
										<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
										WhatsApp Conectado
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 text-xs text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
								<Phone className="h-3.5 w-3.5 text-slate-400" />
								{activeChat.contact_number}
							</div>
						</div>

						{/* BANNER SYNC CRM */}
						{!activeChat.customer_id && (
							<div className="bg-amber-50/80 backdrop-blur-sm border-b border-amber-200 px-6 py-2.5 flex items-center justify-between animate-in slide-in-from-top duration-300">
								<span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1.5">
									⚠️ Este contato não está cadastrado em sua Agenda do CRM.
								</span>
								<Button
									onClick={() => handleOpenAddContact(activeChat)}
									className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold h-7 text-[10px] rounded-lg px-3 shadow-sm hover:scale-102 transition"
								>
									<UserPlus className="h-3 w-3 mr-1" />
									Salvar na Agenda
								</Button>
							</div>
						)}

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
											className={`flex ${isOutbound ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
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
							Escolha um contato ao lado ou inicie uma nova conversa com os clientes cadastrados no CRM do Barber Central.
						</p>
					</div>
				)}
			</div>

			{/* MODAL: ADICIONAR CONTATO À AGENDA (CRM) */}
			{showAddContactModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
					<form 
						onSubmit={handleAddContact}
						className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
					>
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
								<UserPlus className="h-5 w-5 text-indigo-600" />
								Adicionar Cliente ao CRM
							</h3>
							<button 
								type="button"
								onClick={() => setShowAddContactModal(false)} 
								className="text-slate-400 hover:text-slate-600 transition"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<p className="text-[11px] text-slate-400 font-medium">
							O contato ficará salvo permanentemente na sua agenda e as conversas de WhatsApp serão associadas a ele de forma integrada.
						</p>

						<div className="space-y-3">
							<div className="space-y-1">
								<label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
								<Input
									placeholder="Ex: Eva Vilma"
									value={contactNameInput}
									onChange={(e) => setContactNameInput(e.target.value)}
									required
									className="rounded-xl border-slate-200 text-xs h-10"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-[10px] font-bold text-slate-500 uppercase">Telefone/WhatsApp</label>
								<Input
									placeholder="Ex: 558399999999"
									value={contactPhoneInput}
									onChange={(e) => setContactPhoneInput(e.target.value)}
									disabled
									className="rounded-xl border-slate-100 text-xs h-10 bg-slate-50 text-slate-400"
								/>
							</div>
						</div>

						<div className="flex gap-2 justify-end pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowAddContactModal(false)}
								className="rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-600 px-4"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={savingContact || !contactNameInput.trim()}
								className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 text-xs font-bold px-4 flex items-center gap-1.5"
							>
								{savingContact ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<Check className="h-4 w-4" />
										Salvar Cliente
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			)}

			{/* MODAL: NOVA CONVERSA */}
			{showNewChatModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm animate-in fade-in duration-200">
					<form 
						onSubmit={handleStartNewChat}
						className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200"
					>
						<div className="flex items-center justify-between">
							<h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
								<MessageSquare className="h-5 w-5 text-indigo-600" />
								Nova Conversa
							</h3>
							<button 
								type="button"
								onClick={() => setShowNewChatModal(false)} 
								className="text-slate-400 hover:text-slate-600 transition"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Opção de selecionar ou cadastrar */}
						<div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
							<button
								type="button"
								onClick={() => setNewChatMode("select")}
								className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
									newChatMode === "select" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
								}`}
							>
								Agenda (CRM)
							</button>
							<button
								type="button"
								onClick={() => setNewChatMode("create")}
								className={`py-1.5 text-[11px] font-bold rounded-lg transition ${
									newChatMode === "create" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
								}`}
							>
								Novo Número
							</button>
						</div>

						<div className="space-y-3 pt-1">
							{newChatMode === "select" ? (
								<div className="space-y-1">
									<label className="text-[10px] font-bold text-slate-500 uppercase">Selecione o Cliente</label>
									<div className="relative">
										<Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
										<Input
											placeholder="Buscar cliente por nome ou celular..."
											value={customerSearchQuery}
											onChange={(e) => setCustomerSearchQuery(e.target.value)}
											className="pl-9 h-10 rounded-xl border-slate-200 text-xs"
										/>
									</div>
									<div className="border border-slate-100 rounded-xl max-h-[160px] overflow-y-auto mt-2 divide-y divide-slate-50 bg-slate-50/20">
										{loadingCrm ? (
											<div className="p-4 text-center text-slate-400 flex justify-center items-center gap-1.5">
												<Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
												<span className="text-[11px] font-medium">Buscando clientes...</span>
											</div>
										) : crmCustomers.length === 0 ? (
											<div className="p-4 text-center text-[11px] text-slate-400 font-medium">
												Nenhum cliente cadastrado com este termo.
											</div>
										) : (
											crmCustomers.map((cust) => {
												const isSelected = selectedCustomer?.id === cust.id
												return (
													<div
														key={cust.id}
														onClick={() => setSelectedCustomer(cust)}
														className={`p-2.5 text-xs cursor-pointer transition flex items-center justify-between select-none ${
															isSelected ? "bg-indigo-50/70 font-bold text-indigo-900" : "hover:bg-slate-50 text-slate-700"
														}`}
													>
														<div>
															<div className="font-bold">{cust.name}</div>
															<div className="text-[10px] text-slate-400 font-medium">{cust.phone}</div>
														</div>
														{isSelected && <Check className="h-4 w-4 text-indigo-600" />}
													</div>
												)
											})
										)}
									</div>
								</div>
							) : (
								<div className="space-y-3">
									<div className="space-y-1">
										<label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
										<Input
											placeholder="Ex: Eva Vilma"
											value={contactNameInput}
											onChange={(e) => setContactNameInput(e.target.value)}
											required
											className="rounded-xl border-slate-200 text-xs h-10"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-[10px] font-bold text-slate-500 uppercase">Número do WhatsApp</label>
										<Input
											placeholder="Ex: 5583999999999"
											value={contactPhoneInput}
											onChange={(e) => setContactPhoneInput(e.target.value)}
											required
											className="rounded-xl border-slate-200 text-xs h-10"
										/>
									</div>
								</div>
							)}

							<div className="space-y-1">
								<label className="text-[10px] font-bold text-slate-500 uppercase">Mensagem Inicial</label>
								<Input
									placeholder="Escreva a mensagem que iniciará o chat..."
									value={newChatFirstMsg}
									onChange={(e) => setNewChatFirstMsg(e.target.value)}
									required
									className="rounded-xl border-slate-200 text-xs h-10"
								/>
							</div>
						</div>

						<div className="flex gap-2 justify-end pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowNewChatModal(false)}
								className="rounded-xl h-10 text-xs font-bold border-slate-200 text-slate-600 px-4"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={savingContact || (newChatMode === "select" ? !selectedCustomer : (!contactNameInput.trim() || !contactPhoneInput.trim())) || !newChatFirstMsg.trim()}
								className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 text-xs font-bold px-4 flex items-center gap-1.5"
							>
								{savingContact ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<>
										<Send className="h-4 w-4" />
										Iniciar Chat
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			)}

		</div>
	)
}
