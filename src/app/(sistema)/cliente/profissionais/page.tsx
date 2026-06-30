"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

interface Professional {
	id: string
	name: string
	bio?: string
	photo_url?: string
	status: string
}

export default function ClienteProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("active")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadProfessionals = async () => {
    setLoading(true)
    const url = statusFilter ? `/professionals?status=${statusFilter}` : "/professionals"
    const res = await http.get<Professional[]>(url)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setProfessionals(res.data)
    }
  }

  useEffect(() => {
    loadProfessionals()
  }, [statusFilter])

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profissionais da Barbearia</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie a equipe de barbeiros, estilistas e a disponibilidade de agenda.</p>
        </div>
        <a href="/cliente/profissionais/novo">
          <Button className="flex items-center gap-2 font-semibold">
            <i className="ti ti-plus text-base" />
            Novo Profissional
          </Button>
        </a>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter("active")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
            statusFilter === "active"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Ativos
        </button>
        <button
          onClick={() => setStatusFilter("inactive")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
            statusFilter === "inactive"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Inativos
        </button>
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
            statusFilter === ""
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Todos
        </button>
      </div>

      {/* Grid de Profissionais */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse border-slate-100">
              <CardContent className="h-44 bg-slate-50/50 rounded-xl" />
            </Card>
          ))}
        </div>
      ) : professionals.length === 0 ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <i className="ti ti-users text-5xl" />
          <span className="font-semibold text-slate-500">Nenhum profissional encontrado com esse filtro.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition duration-200 border-slate-100 group relative overflow-hidden">
              <CardContent className="p-6 flex gap-4 items-start">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200/60">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <i className="ti ti-user text-2xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-primary transition">
                      {p.name}
                    </h3>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                        p.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-red-50 text-red-700 border-red-100"
                      }`}
                    >
                      {p.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {p.bio || "Nenhuma biografia informada para este profissional."}
                  </p>

                  <div className="pt-3 flex gap-2">
                    <a href={`/cliente/profissionais/${p.id}`} className="text-xs font-semibold text-primary hover:underline">
                      Editar Perfil
                    </a>
                    <span className="text-slate-300">|</span>
                    <a href={`/cliente/configuracoes/agenda?professional_id=${p.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-800 hover:underline">
                      Grade Horária
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
