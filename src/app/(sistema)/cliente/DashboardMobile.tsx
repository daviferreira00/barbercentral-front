"use client"

import { useState } from "react"
import Link from "next/link"
import { useApp } from "@/shared/context/AppContext"
import { KpiCard } from "@/components/mobile/KpiCard"
import { ListCard } from "@/components/mobile/ListCard"
import { EmptyState } from "@/components/mobile/EmptyState"
import { SkeletonKpis, SkeletonList } from "@/components/mobile/Skeleton"
import { haptic } from "@/shared/lib/haptics"
import { useDashboard, type AppointmentStatus } from "@/features/dashboard/hooks/useDashboard"
import type { PillTone } from "@/components/mobile/StatusPill"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const STATUS_TONES: Record<AppointmentStatus, PillTone> = {
  Confirmado: "warning",
  Concluído: "success",
  Pendente: "info",
}

export default function DashboardMobile() {
  const { user } = useApp()
  const { appointmentsToday, appointmentsDone, cashToday, occupancyRate, upcoming, loading, clientSlug } =
    useDashboard()

  const [sharingMenu, setSharingMenu] = useState<{ title: string; path: string } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!user) return null

  const firstName = user.name ? user.name.split(" ")[0] : ""

  const shortcuts = [
    { href: "/cliente/agenda/novo", icon: "ti-calendar-plus", label: "Agendar" },
    { 
      href: "#", 
      icon: "ti-device-desktop-analytics", 
      label: "KDS", 
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        setSharingMenu({ title: "Painel KDS", path: "/cliente/agenda/kds" })
      }
    },
    { 
      href: "#", 
      icon: "ti-world", 
      label: "Link Público", 
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        setSharingMenu({ title: "Link de Agendamento", path: `/agendamento/${clientSlug}` })
      }
    },
    { href: "/cliente/clientes/novo", icon: "ti-user-plus", label: "Cliente" },
    { href: "/cliente/caixa", icon: "ti-cash", label: "Caixa" },
    { href: "/cliente/relatorios", icon: "ti-chart-bar", label: "Relatórios" },
  ]

  const handleShareAction = async (action: "open" | "copy" | "share") => {
    if (!sharingMenu) return
    const fullUrl = `${window.location.origin}${sharingMenu.path}`

    const nav = (typeof navigator !== "undefined" ? navigator : null) as any
    if (!nav) return

    if (action === "open") {
      window.open(fullUrl, "_blank")
      setSharingMenu(null)
    } else if (action === "copy") {
      if (nav.clipboard) {
        await nav.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
          setSharingMenu(null)
        }, 1000)
      }
    } else if (action === "share") {
      if (nav.share) {
        try {
          await nav.share({
            title: sharingMenu.title,
            text: `Acesse o ${sharingMenu.title} da barbearia!`,
            url: fullUrl
          })
        } catch (e) {
          // Ignora
        }
      } else {
        if (nav.clipboard) {
          await nav.clipboard.writeText(fullUrl)
          setCopied(true)
          setTimeout(() => {
            setCopied(false)
            setSharingMenu(null)
          }, 1000)
        }
      }
    }
  }

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
      <div className="grid grid-cols-3 gap-2.5">
        {shortcuts.map((s, i) => {
          const isAction = s.href === "#"
          if (isAction) {
            return (
              <button
                key={s.label}
                onClick={(e: any) => {
                  haptic()
                  if (s.onClick) s.onClick(e)
                }}
                className="animate-card-enter mobile-tap flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white py-3 shadow-sm transition active:scale-95 text-center cursor-pointer w-full"
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
                <span className="text-[10px] font-extrabold text-slate-600 truncate w-full px-1">{s.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={s.label}
              href={s.href}
              onClick={() => haptic()}
              className="animate-card-enter mobile-tap flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white py-3 shadow-sm transition active:scale-95 text-center cursor-pointer w-full"
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
              <span className="text-[10px] font-extrabold text-slate-600 truncate w-full px-1">{s.label}</span>
            </Link>
          )
        })}
      </div>

      {/* DIALOG DE COMPARTILHAMENTO DE LINKS */}
      <Dialog open={!!sharingMenu} onOpenChange={(open) => !open && setSharingMenu(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-[90%] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-slate-900 text-center">
              Opções do {sharingMenu?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col gap-2.5">
            <Button
              onClick={() => handleShareAction("open")}
              variant="outline"
              className="w-full flex items-center justify-start gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-11 px-4 cursor-pointer"
            >
              <i className="ti ti-external-link text-lg text-indigo-600" />
              <span>Abrir em Nova Aba</span>
            </Button>
            <Button
              onClick={() => handleShareAction("copy")}
              variant="outline"
              className="w-full flex items-center justify-start gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-11 px-4 cursor-pointer"
            >
              <i className={`ti ${copied ? "ti-check text-emerald-600 animate-bounce" : "ti-copy text-indigo-600"}`} />
              <span>{copied ? "Copiado com sucesso!" : "Copiar Link"}</span>
            </Button>
            <Button
              onClick={() => handleShareAction("share")}
              variant="outline"
              className="w-full flex items-center justify-start gap-3 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold h-11 px-4 cursor-pointer"
            >
              <i className="ti ti-share text-lg text-indigo-600" />
              <span>{typeof navigator !== "undefined" && "share" in navigator ? "Compartilhar..." : "Compartilhar (Copiar Link)"}</span>
            </Button>
          </div>
          <DialogFooter className="mt-2">
            <Button
              onClick={() => setSharingMenu(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 cursor-pointer"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
