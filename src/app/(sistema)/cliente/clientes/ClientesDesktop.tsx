"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { useClientesList } from "@/features/clientes/hooks/useClientesList"
import { MONTHS } from "@/features/clientes/types"

export default function ClientesDesktop() {
  const {
    customers,
    total,
    totalPages,
    loading,
    errorMsg,
    searchQuery,
    setSearchQuery,
    birthMonth,
    setBirthMonth,
    page,
    setPage,
    handleExport,
  } = useClientesList()

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Topo */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes (CRM)</h1>
          <p className="text-sm text-slate-500 mt-1">Visualize o histórico e gerencie a base de dados de seus clientes.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="ghost" className="border border-slate-200 bg-white font-bold" onClick={handleExport}>
            <i className="ti ti-download mr-1.5" /> Exportar CSV
          </Button>
          <Link href="/cliente/clientes/novo">
            <Button className="font-bold">
              <i className="ti ti-plus mr-1.5" /> Novo Cliente
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Input
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="w-[240px]">
            <Select value={birthMonth} onValueChange={setBirthMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mês de aniversário" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Nome / Contato</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4 text-center">Visitas Concluídas</th>
                  <th className="px-6 py-4 text-right">Total Gasto</th>
                  <th className="px-6 py-4">Última Visita</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-12 mx-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-16 ml-auto" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded-lg w-16 mx-auto" /></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold">
                      Nenhum cliente cadastrado nesta barbearia.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal lowercase">{c.email || "Sem e-mail"}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{c.phone}</td>
                      <td className="px-6 py-4 text-center font-extrabold text-slate-700">
                        {c.total_visits}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-slate-800">
                        R$ {c.total_spent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {c.last_visit ? new Date(c.last_visit + "T00:00:00").toLocaleDateString("pt-BR") : "Nunca"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/cliente/clientes/${c.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 text-xs font-bold border border-slate-200 bg-white">
                            Ver Perfil
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-semibold">
                Mostrando página {page} de {totalPages} ({total} clientes)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-slate-200 bg-white"
                >
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="border border-slate-200 bg-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
