"use client"

import { useApp } from "@/shared/context/AppContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AdminDashboardMobile } from "./AdminDashboardMobile"

export default function AdminPage() {
  const { user } = useApp()

  if (!user) return null

  return (
    <>
      <div className="xl:hidden"><AdminDashboardMobile /></div>
      <div className="hidden xl:block space-y-6 w-full animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bem-vindo, {user.name}. Acompanhe os principais números da plataforma BarberCentral.
        </p>
      </div>

      {/* Grid de Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Barbearias Ativas
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">12</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              <span className="text-emerald-500 font-bold mr-1">↑ 15%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Faturamento Mensal
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">R$ 1.188,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              <span className="text-emerald-500 font-bold mr-1">↑ 8%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Plano Mais Assinado
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold text-slate-800">Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium">
              Representa 65% de todas as assinaturas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Barbearias Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Barbearias Recentes</CardTitle>
          <CardDescription>Lista dos últimos clientes que se cadastraram no SaaS.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                <tr>
                  <th className="p-4 pl-6">Nome da Barbearia</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Plano</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Barbearia Modelo</td>
                  <td className="p-4">barbearia-modelo</td>
                  <td className="p-4">Profissional</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      Ativo
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-400">29/06/2026</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Navalha de Ouro</td>
                  <td className="p-4">navalha-de-ouro</td>
                  <td className="p-4">Premium</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      Ativo
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-400">28/06/2026</td>
                </tr>
                <tr>
                  <td className="p-4 pl-6 font-bold text-slate-800">Corte Imperial</td>
                  <td className="p-4">corte-imperial</td>
                  <td className="p-4">Básico</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-100">
                      Bloqueado
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-slate-400">27/06/2026</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  )
}
