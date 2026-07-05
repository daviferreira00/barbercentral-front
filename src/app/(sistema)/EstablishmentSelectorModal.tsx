"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/shared/context/AppContext"
import { http } from "@/shared/lib/http"

interface AdminClient {
  id: string
  name: string
  slug: string
  status: string
}

interface SelectorOption {
  id: string
  name: string
  subtitle: string
  isReturnToAdmin: boolean
  clientId?: string
}

// Seletor de estabelecimento estilo Spotlight (Cmd+K).
// Três modos, decididos pelo usuário logado:
// - Admin (impersonando ou não): lista todas as barbearias → impersonate;
//   quando impersonando, item fixo no topo "Voltar para Painel Admin".
// - Usuário comum: lista os vínculos dele (myClients) → switch-client.
// Quando mustSelectClient (2+ vínculos sem seleção), não deixa fechar.
export function EstablishmentSelectorModal() {
  const {
    user,
    myClients,
    activeClient,
    mustSelectClient,
    selectorOpen,
    setSelectorOpen,
    switchClient,
    returnToAdmin,
    impersonate,
  } = useApp()

  const [searchQuery, setSearchQuery] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [adminClients, setAdminClients] = useState<AdminClient[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const isAdminSession = user?.role === "admin" || !!user?.impersonating
  const canClose = !mustSelectClient

  // Cmd/Ctrl+K abre/fecha (fechar só se permitido)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchQuery("")
        setHighlightedIndex(0)
        setActionError(null)
        setSelectorOpen(selectorOpen ? !canClose : true)
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [selectorOpen, canClose, setSelectorOpen])

  // Admin: busca a lista completa de barbearias ao abrir
  useEffect(() => {
    if (!selectorOpen || !isAdminSession) return
    let cancelled = false
    setLoadingList(true)
    http.get<AdminClient[]>("/admin/clients").then((res) => {
      if (cancelled) return
      setAdminClients(res.data ?? [])
      setLoadingList(false)
    })
    return () => {
      cancelled = true
    }
  }, [selectorOpen, isAdminSession])

  if (!user || !selectorOpen) return null

  const query = searchQuery.toLowerCase().trim()

  const options: SelectorOption[] = [
    ...(user.impersonating
      ? [
          {
            id: "return-to-admin",
            name: "Voltar para Painel Admin",
            subtitle: "Encerrar acesso a esta barbearia",
            isReturnToAdmin: true,
          },
        ]
      : []),
    ...(isAdminSession
      ? adminClients
          .filter((c) => c.status !== "blocked")
          .filter((c) => !query || c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query))
          .map((c) => ({
            id: c.id,
            name: c.name,
            subtitle: c.slug,
            isReturnToAdmin: false,
            clientId: c.id,
          }))
      : myClients
          .filter((m) => m.status === "active")
          .filter((m) => !query || m.client_name.toLowerCase().includes(query) || m.client_slug.toLowerCase().includes(query))
          .map((m) => ({
            id: m.link_id,
            name: m.client_name,
            subtitle: roleLabel(m.role),
            isReturnToAdmin: false,
            clientId: m.client_id,
          }))),
  ]

  const close = () => {
    if (!canClose) return
    setSelectorOpen(false)
    setSearchQuery("")
    setHighlightedIndex(0)
    setActionError(null)
  }

  const handleSelect = async (opt: SelectorOption) => {
    if (acting) return
    setActionError(null)

    // Já está nessa barbearia — só fecha (se puder)
    if (!opt.isReturnToAdmin && opt.clientId && opt.clientId === user.client_id) {
      close()
      return
    }

    setActing(true)
    let error: string | null
    if (opt.isReturnToAdmin) {
      error = await returnToAdmin()
    } else if (isAdminSession) {
      error = await impersonate(opt.clientId!)
    } else {
      error = await switchClient(opt.clientId!)
    }
    // Em sucesso a página navega com reload; só chega aqui em erro
    if (error) {
      setActing(false)
      setActionError(error)
    }
  }

  const handleModalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % Math.max(options.length, 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev - 1 + options.length) % Math.max(options.length, 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = options[highlightedIndex]
      if (selected) handleSelect(selected)
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/40 backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Busca */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <i className="ti ti-search text-base text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder={isAdminSession ? "Buscar barbearia por nome ou slug..." : "Buscar barbearia..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setHighlightedIndex(0)
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400"
            onKeyDown={handleModalKeyDown}
          />
          {canClose && (
            <span className="text-[9px] font-bold text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded-md bg-slate-50 uppercase select-none">
              ESC
            </span>
          )}
        </div>

        {mustSelectClient && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 font-medium">
            Você tem acesso a mais de uma barbearia. Escolha uma para continuar.
          </div>
        )}

        {actionError && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-100 text-xs text-red-600 font-medium">
            {actionError}
          </div>
        )}

        {/* Lista */}
        <div className="overflow-y-auto p-2 flex flex-col gap-1">
          {loadingList ? (
            <div className="py-8 flex justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
            </div>
          ) : options.length > 0 ? (
            options.map((opt, idx) => {
              const isHighlighted = idx === highlightedIndex
              const isActive = !opt.isReturnToAdmin && !!opt.clientId && opt.clientId === user.client_id

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isHighlighted ? "bg-primary/10 text-primary" : "hover:bg-slate-50 text-slate-700"
                  } ${acting ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {opt.isReturnToAdmin ? (
                        <i className="ti ti-arrow-back-up text-amber-500 text-sm" />
                      ) : (
                        <i className="ti ti-building-store text-slate-400 text-sm" />
                      )}
                      <span className="text-sm font-bold truncate">{opt.name}</span>
                      {isActive && (
                        <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 truncate">{opt.subtitle}</span>
                  </div>

                  {isHighlighted && (
                    <span className="text-[9px] font-bold text-primary px-1.5 py-0.5 border border-primary/20 rounded-md bg-primary/5 flex items-center gap-1 flex-shrink-0">
                      Selecionar <i className="ti ti-corner-down-left text-[9px]" />
                    </span>
                  )}
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              {query ? `Nenhuma barbearia encontrada para "${searchQuery}"` : "Nenhuma barbearia disponível"}
            </div>
          )}
        </div>

        {/* Rodapé com atalhos */}
        <div className="bg-slate-50 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[9px] font-semibold text-slate-400 uppercase">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <i className="ti ti-arrow-up" />
              <i className="ti ti-arrow-down" /> Navegar
            </span>
            <span className="flex items-center gap-1">
              <i className="ti ti-corner-down-left" /> Selecionar
            </span>
          </div>
          <div>{options.length} {options.length === 1 ? "opção" : "opções"}</div>
        </div>
      </div>
    </div>
  )
}

function roleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Proprietário"
    case "manager":
      return "Gerente"
    case "professional":
      return "Profissional"
    case "receptionist":
      return "Recepcionista"
    default:
      return role
  }
}
