"use client"

import Link from "next/link"
import { useApp } from "@/shared/context/AppContext"
import { KpiCard } from "@/components/mobile/KpiCard"
import { ListCard } from "@/components/mobile/ListCard"
import { EmptyState } from "@/components/mobile/EmptyState"
import { SkeletonKpis, SkeletonList } from "@/components/mobile/Skeleton"
import { haptic } from "@/shared/lib/haptics"
import { useDashboard, type AppointmentStatus } from "@/features/dashboard/hooks/useDashboard"
import type { PillTone } from "@/components/mobile/StatusPill"

const STATUS_TONES: Record<AppointmentStatus, PillTone> = {
  Confirmado: "warning",
  Concluído: "success",
  Pendente: "info",
}

const SHORTCUTS = [
  { href: "/cliente/agenda/novo", icon: "ti-calendar-plus", label: "Agendar" },
  { href: "/cliente/clientes/novo", icon: "ti-user-plus", label: "Cliente" },
  { href: "/cliente/caixa", icon: "ti-cash", label: "Caixa" },
  { href: "/cliente/relatorios", icon: "ti-chart-bar", label: "Relatórios" },
]

export default function DashboardMobile() {
  const { user } = useApp()
  const { appointmentsToday, appointmentsDone, cashToday, occupancyRate, upcoming, loading } =
    useDashboard()

  if (!user) return null

  const firstName = user.name ? user.name.split(" ")[0] : ""

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Saudação */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800">Olá, {firstName} 👋</h1>
        <p className="text-xs font-semibold text-slate-400">
          Confira a movimentação da sua barbearia hoje.
        </p>
      </div>

      {/* Atalhos rápidos (estilo app de banco) */}
      <div className="grid grid-cols-4 gap-2">
        {SHORTCUTS.map((s, i) => (
          <Link
            key={s.href}
            href={s.href}
            onClick={() => haptic()}
            className="animate-card-enter mobile-tap flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white py-3 shadow-sm transition active:scale-95"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-white shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 60%, black))",
              }}
            >
              <i className={`ti ${s.icon}`} />
            </span>
            <span className="text-[10px] font-extrabold text-slate-600">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Indicadores do dia */}
      {loading ? (
        <SkeletonKpis />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <KpiCard
            className="col-span-2"
            label="Agendamentos hoje"
            value={appointmentsToday}
            icon="ti-calendar"
            hint={
              <>
                <span className="font-bold text-emerald-500">{appointmentsDone} finalizados</span> de um
                total de {appointmentsToday}
              </>
            }
          />
          <KpiCard label="Caixa diário" value={cashToday} icon="ti-cash" />
          <KpiCard label="Ocupação" value={occupancyRate} icon="ti-chart-pie" />
        </div>
      )}

      {/* Próximos atendimentos */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
          Próximos atendimentos
        </h2>
        <Link
          href="/cliente/agenda"
          onClick={() => haptic()}
          className="text-xs font-extrabold"
          style={{ color: "var(--color-primary)" }}
        >
          Ver agenda <i className="ti ti-chevron-right" />
        </Link>
      </div>

      {loading ? (
        <SkeletonList count={3} />
      ) : upcoming.length === 0 ? (
        <EmptyState
          icon="ti-calendar-off"
          title="Sem atendimentos programados"
          description="Os próximos agendamentos de hoje aparecem aqui."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {upcoming.map((a, i) => (
            <ListCard
              key={`${a.customer}-${a.time}`}
              index={i}
              title={a.customer}
              subtitle={a.services}
              pill={{ label: a.status, tone: STATUS_TONES[a.status] }}
              footerLeft={
                <span>
                  <i className="ti ti-user mr-1 text-slate-400" />
                  {a.professional}
                </span>
              }
              footerRight={
                <span className="text-slate-700">
                  <i className="ti ti-clock mr-1 text-slate-400" />
                  {a.time}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
