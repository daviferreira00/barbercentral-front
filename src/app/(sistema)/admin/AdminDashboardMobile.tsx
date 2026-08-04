"use client"

import Link from "next/link"
import { useApp } from "@/shared/context/AppContext"
import { haptic } from "@/shared/lib/haptics"

const shortcuts = [
  { href: "/admin/clientes", icon: "ti-building-store", label: "Barbearias" },
  { href: "/admin/usuarios", icon: "ti-users", label: "Usuários" },
  { href: "/admin/planos", icon: "ti-credit-card", label: "Planos" },
  { href: "/admin/whatsapp", icon: "ti-brand-whatsapp", label: "WhatsApp" },
]

const recentClients = [
  { name: "Barbearia Modelo", slug: "barbearia-modelo", plan: "Profissional", status: "Ativo", date: "29/06/2026" },
  { name: "Navalha de Ouro", slug: "navalha-de-ouro", plan: "Premium", status: "Ativo", date: "28/06/2026" },
  { name: "Corte Imperial", slug: "corte-imperial", plan: "Básico", status: "Bloqueado", date: "27/06/2026" },
]

export function AdminDashboardMobile() {
  const { user } = useApp()
  const firstName = user?.name?.split(" ")[0] || "Admin"

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800">Olá, {firstName} 👋</h1>
        <p className="text-xs font-semibold text-slate-400">Confira a movimentação da plataforma hoje.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {shortcuts.map((shortcut, index) => (
          <Link key={shortcut.href} href={shortcut.href} onClick={() => haptic()} className="animate-card-enter mobile-tap flex min-w-0 flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center shadow-sm transition active:scale-95" style={{ animationDelay: `${index * 40}ms` }}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg text-white shadow-md"><i className={`ti ${shortcut.icon}`} /></span>
            <span className="w-full truncate text-[9px] font-extrabold text-slate-600">{shortcut.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl text-white"><i className="ti ti-building-store" /></span>
          <div><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Barbearias ativas</p><p className="text-2xl font-black text-slate-800">12</p><p className="text-[10px] font-bold text-emerald-500">↑ 15% este mês</p></div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg text-white"><i className="ti ti-cash" /></span>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Faturamento mensal</p><p className="mt-0.5 text-lg font-black text-slate-800">R$ 1.188</p><p className="text-[9px] font-bold text-emerald-500">↑ 8%</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg text-white"><i className="ti ti-crown" /></span>
          <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Plano principal</p><p className="mt-0.5 text-lg font-black text-slate-800">Profissional</p><p className="text-[9px] font-semibold text-slate-400">65% das assinaturas</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Barbearias recentes</h2>
        <Link href="/admin/clientes" className="text-xs font-extrabold text-indigo-600">Ver todas <i className="ti ti-chevron-right" /></Link>
      </div>

      <div className="flex flex-col gap-3">
        {recentClients.map((client, index) => (
          <Link href="/admin/clientes" key={client.slug} onClick={() => haptic()} className="animate-card-enter mobile-tap rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition active:scale-[0.98]" style={{ animationDelay: `${index * 40}ms` }}>
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-800">{client.name}</p><p className="truncate text-[10px] font-semibold text-slate-400">{client.slug}</p></div><span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase ${client.status === "Ativo" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{client.status}</span></div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-500"><span><i className="ti ti-credit-card mr-1 text-slate-400" />{client.plan}</span><span><i className="ti ti-calendar mr-1 text-slate-400" />{client.date}</span></div>
          </Link>
        ))}
      </div>
    </div>
  )
}
