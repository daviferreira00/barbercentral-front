"use client"

import { useState, useRef } from "react"
import { Loader2 } from "lucide-react"
import { http } from "@/shared/lib/http"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { FilterChips } from "@/components/mobile/FilterChips"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { StatusPill, type PillTone } from "@/components/mobile/StatusPill"
import { haptic } from "@/shared/lib/haptics"
import { useAgenda } from "@/features/agenda/hooks/useAgenda"
import {
  formatDateString,
  cleanDate,
  getStatusLabel,
  type BlockedSlot,
  type EnrichedAppointment,
} from "@/features/agenda/types"

const STATUS_TONES: Record<string, PillTone> = {
  pending: "neutral",
  confirmed: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "danger",
  no_show: "danger",
}

const statusTone = (status: string): PillTone => STATUS_TONES[status] || "neutral"

export default function AgendaMobile() {
  const {
    professionals,
    services,
    selectedProfId,
    setSelectedProfId,
    currentDate,
    setCurrentDate,
    appointments,
    blockedSlots,
    loading,
    errorMsg,
    activeDateStr,
    selectedApp,
    setSelectedApp,
    updatingStatus,
    statusLogs,
    loadingLogs,
    isEditing,
    setIsEditing,
    editProfId,
    setEditProfId,
    editDate,
    setEditDate,
    editTime,
    setEditTime,
    editServiceIds,
    setEditServiceIds,
    toggleEditService,
    editSlots,
    loadingEditSlots,
    isCancellingWithReason,
    setIsCancellingWithReason,
    cancelReason,
    setCancelReason,
    checkoutModalOpen,
    setCheckoutModalOpen,
    checkoutMethod,
    setCheckoutMethod,
    checkoutNotes,
    setCheckoutNotes,
    navigateDate,
    changeStatus,
    handleCheckout,
    handleReschedule,
    handleCancelWithReason,
    getWeekDays,
  } = useAgenda()

  // Controle de múltiplos telefones e disparo de WhatsApp
  const [phoneSelectorOpen, setPhoneSelectorOpen] = useState(false)
  const [phoneSelectorOptions, setPhoneSelectorOptions] = useState<string[]>([])
  const [phoneSelectorAction, setPhoneSelectorAction] = useState<"chat" | "reminder" | "confirmation" | null>(null)
  const [sendingReminder, setSendingReminder] = useState(false)
  const sendingReminderRef = useRef(false)
  const [sendingConfirmation, setSendingConfirmation] = useState(false)
  const sendingConfirmationRef = useRef(false)

  const handleSendConfirmationButtons = async (app: EnrichedAppointment, phoneForce?: string) => {
    if (sendingConfirmationRef.current) return
    
    const phone = phoneForce || getPhoneOptions(app.customer_phone)[0]
    if (!phone) {
      const opts = getPhoneOptions(app.customer_phone)
      if (opts.length === 0) {
        alert("Este cliente não possui um número de telefone válido.")
        return
      }
      if (opts.length > 1 && !phoneForce) {
        setPhoneSelectorOptions(opts)
        setPhoneSelectorAction("confirmation")
        setPhoneSelectorOpen(true)
        return
      }
    }

    sendingConfirmationRef.current = true
    setSendingConfirmation(true)
    try {
      const res = await http.post(`/appointments/${app.id}/confirm-buttons`, {})
      if (res.error) {
        alert("Erro ao disparar botões de confirmação: " + res.error.message)
      } else {
        alert("Botões de confirmação disparados com sucesso via WhatsApp!")
        setPhoneSelectorOpen(false)
      }
    } catch (err: any) {
      alert("Erro ao enviar: " + err.message)
    } finally {
      sendingConfirmationRef.current = false
      setSendingConfirmation(false)
    }
  }

  const getPhoneOptions = (phoneStr?: string): string[] => {
    if (!phoneStr) return []
    const normalized = phoneStr
      .replace(/\//g, ",")
      .replace(/;/g, ",")
      .replace(/\sou\s/gi, ",")
      .replace(/\se\s/gi, ",")
      .replace(/-/g, ",")
    
    const parts = normalized.split(",")
    const numbers: string[] = []
    for (const p of parts) {
      const clean = p.replace(/\D/g, "")
      if (clean.length >= 8 && clean.length <= 14) {
        let formatted = clean
        if (formatted.length === 10 || formatted.length === 11) {
          formatted = "55" + formatted
        }
        if (!numbers.includes(formatted)) {
          numbers.push(formatted)
        }
      }
    }
    if (numbers.length === 0) {
      const cleanAll = phoneStr.replace(/\D/g, "")
      if (cleanAll.length >= 8) {
        let formatted = cleanAll
        if (formatted.length === 10 || formatted.length === 11) {
          formatted = "55" + formatted
        }
        numbers.push(formatted)
      }
    }
    return numbers
  }

  const handleTalkToClient = (app: EnrichedAppointment) => {
    const opts = getPhoneOptions(app.customer_phone)
    if (opts.length === 0) {
      alert("Este cliente não possui um número de telefone válido.")
      return
    }
    if (opts.length === 1) {
      window.location.href = `/cliente/chat?phone=${opts[0]}&name=${encodeURIComponent(app.customer_name || "")}`
      return
    }
    setPhoneSelectorOptions(opts)
    setPhoneSelectorAction("chat")
    setPhoneSelectorOpen(true)
  }

  const handleSendReminder = async (app: EnrichedAppointment, phoneForce?: string) => {
    if (sendingReminderRef.current) return

    const phone = phoneForce || getPhoneOptions(app.customer_phone)[0]
    if (!phone) {
      const opts = getPhoneOptions(app.customer_phone)
      if (opts.length === 0) {
        alert("Este cliente não possui um número de telefone válido.")
        return
      }
      if (opts.length > 1 && !phoneForce) {
        setPhoneSelectorOptions(opts)
        setPhoneSelectorAction("reminder")
        setPhoneSelectorOpen(true)
        return
      }
    }

    sendingReminderRef.current = true
    setSendingReminder(true)
    try {
      // 1. Buscar regras de notificação
      const resRules = await http.get<any[]>("/cliente/notificacoes")
      let template = "Olá, {nome_cliente}!\n\nPassando para lembrar do seu agendamento no dia {data_hora} com o profissional {nome_profissional}.\n\nServiços: {nome_servico}.\n\nAté logo!"
      
      if (resRules.data && Array.isArray(resRules.data)) {
        const activeReminderRule = resRules.data.find(r => r.trigger_type === "booking_reminder" && r.active)
        if (activeReminderRule && activeReminderRule.message_template) {
          template = activeReminderRule.message_template
        }
      }

      // 2. Substituir placeholders
      const dateFormatted = new Date(cleanDate(app.date) + "T00:00:00").toLocaleDateString("pt-BR")
      const timeFormatted = app.start_time.substring(0, 5)
      const servicesStr = (app.services || []).map(s => s.service_name).join(", ")
      const cancelLink = `${window.location.origin}/agendamento/cancelar/${app.cancel_token || ""}`

      const messageContent = template
        .replace(/{nome_cliente}/g, app.customer_name || "Cliente")
        .replace(/{data_hora}/g, `${dateFormatted} às ${timeFormatted}`)
        .replace(/{nome_profissional}/g, app.professional_name)
        .replace(/{nome_servico}/g, servicesStr)
        .replace(/{link_cancelamento}/g, cancelLink)

      // 3. Enviar mensagem
      const resSend = await http.post("/cliente/chats/send", {
        contact_number: phone,
        content: messageContent
      })

      if (resSend.error) {
        alert("Erro ao disparar lembrete via WhatsApp: " + resSend.error.message)
      } else {
        alert("Lembrete disparado com sucesso via WhatsApp!")
        setPhoneSelectorOpen(false)
      }
    } catch (err: any) {
      alert("Erro ao enviar: " + err.message)
    } finally {
      sendingReminderRef.current = false
      setSendingReminder(false)
    }
  }

  const activeApps = appointments.filter(
    (a) => (!selectedProfId || a.professional_id === selectedProfId) && cleanDate(a.date) === activeDateStr
  )
  const activeBlocks = blockedSlots.filter(
    (b) => (!selectedProfId || b.professional_id === selectedProfId) && cleanDate(b.date) === activeDateStr
  )

  const timelineItems = [
    ...activeApps.map((a) => ({ type: "app" as const, time: a.start_time, data: a })),
    ...activeBlocks.map((b) => ({ type: "block" as const, time: b.start_time, data: b })),
  ].sort((x, y) => x.time.localeCompare(y.time))

  const total = (app: EnrichedAppointment) =>
    (app.services || []).reduce((acc, s) => acc + s.price, 0)

  const sheetTitle = isEditing
    ? "Editar agendamento"
    : isCancellingWithReason
    ? "Confirmar cancelamento"
    : selectedApp?.customer_name || "Cliente Avulso"

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Cabeçalho: mês + ações */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 capitalize">
            {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </h1>
          <p className="text-xs font-semibold text-slate-400 capitalize">
            {currentDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptic()
              navigateDate("today")
            }}
            className="mobile-tap rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-extrabold uppercase text-slate-600 transition active:scale-95"
          >
            Hoje
          </button>
          <Link
            href="/cliente/agenda/bloqueios"
            onClick={() => haptic()}
            aria-label="Bloqueios de horário"
            className="mobile-tap flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
          >
            <i className="ti ti-lock" />
          </Link>
        </div>
      </div>

      {/* Carrossel de dias da semana */}
      <div className="flex items-center gap-1.5">
        <button
          aria-label="Semana anterior"
          onClick={() => {
            haptic()
            const d = new Date(currentDate)
            d.setDate(currentDate.getDate() - 7)
            setCurrentDate(d)
          }}
          className="mobile-tap flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 active:scale-90"
        >
          <i className="ti ti-chevron-left" />
        </button>

        <div className="no-scrollbar flex flex-1 justify-between gap-1.5 overflow-x-auto">
          {getWeekDays().map((day, idx) => {
            const isSelected = formatDateString(day) === activeDateStr
            const isToday = formatDateString(new Date()) === formatDateString(day)
            return (
              <button
                key={idx}
                onClick={() => {
                  haptic()
                  setCurrentDate(day)
                }}
                className={`mobile-tap flex min-w-[42px] flex-col items-center justify-center rounded-xl border py-2 transition active:scale-95 ${
                  isSelected
                    ? "border-transparent text-white shadow-md"
                    : isToday
                    ? "bg-white border-slate-300 text-slate-800"
                    : "bg-white border-slate-100 text-slate-600"
                }`}
                style={isSelected ? { backgroundColor: "var(--color-primary)" } : {}}
              >
                <span
                  className={`text-[8px] font-bold uppercase tracking-wider ${
                    isSelected ? "text-white/70" : "text-slate-400"
                  }`}
                >
                  {day.toLocaleDateString("pt-BR", { weekday: "short" }).substring(0, 3)}
                </span>
                <span className="mt-0.5 text-xs font-extrabold leading-none">{day.getDate()}</span>
              </button>
            )
          })}
        </div>

        <button
          aria-label="Próxima semana"
          onClick={() => {
            haptic()
            const d = new Date(currentDate)
            d.setDate(currentDate.getDate() + 7)
            setCurrentDate(d)
          }}
          className="mobile-tap flex h-9 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 active:scale-90"
        >
          <i className="ti ti-chevron-right" />
        </button>
      </div>

      {/* Filtro de profissional em chips */}
      <FilterChips
        options={[{ value: "", label: "Todos" }, ...professionals.map((p) => ({ value: p.id, label: p.name }))]}
        value={selectedProfId}
        onChange={setSelectedProfId}
      />

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Timeline do dia */}
      {loading ? (
        <SkeletonList count={5} />
      ) : timelineItems.length === 0 ? (
        <EmptyState
          icon="ti-calendar-event"
          title="Sem compromissos neste dia"
          description="Toque no botão + para criar um agendamento."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {timelineItems.map((item, i) => {
            if (item.type === "block") {
              const block = item.data as BlockedSlot
              return (
                <div
                  key={`block-${block.id}`}
                  className="animate-card-enter flex items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-100 p-3.5 text-xs text-slate-500"
                  style={{ animationDelay: `${(i % 10) * 40}ms` }}
                >
                  <div className="flex items-center gap-2.5">
                    <i className="ti ti-lock text-base text-slate-400" />
                    <div>
                      <p className="font-extrabold text-slate-700">
                        {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                      </p>
                      <p className="text-[10px] text-slate-400">Bloqueio: {block.reason || "Indisponível"}</p>
                    </div>
                  </div>
                  {block.professional_id && (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                      {professionals.find((p) => p.id === block.professional_id)?.name || "Barbeiro"}
                    </span>
                  )}
                </div>
              )
            }

            const app = item.data as EnrichedAppointment
            return (
              <ListCard
                key={`app-${app.id}`}
                index={i}
                title={app.customer_name || "Cliente Avulso"}
                subtitle={(app.services || []).map((s) => s.service_name).join(", ")}
                pill={{ label: getStatusLabel(app.status), tone: statusTone(app.status) }}
                footerLeft={
                  <span>
                    <i className="ti ti-clock mr-1 text-slate-400" />
                    {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                    <span className="ml-2 text-slate-400">· {app.professional_name.split(" ")[0]}</span>
                  </span>
                }
                footerRight={<span className="text-emerald-600">R$ {total(app).toFixed(2)}</span>}
                onClick={() => setSelectedApp(app)}
              />
            )
          })}
        </div>
      )}

      {/* Sheet de detalhe / reagendamento / cancelamento */}
      <BottomSheet
        open={selectedApp !== null && !checkoutModalOpen}
        onClose={() => !updatingStatus && setSelectedApp(null)}
        title={sheetTitle}
        subtitle={
          selectedApp
            ? `${new Date(cleanDate(selectedApp.date) + "T00:00:00").toLocaleDateString("pt-BR")} às ${selectedApp.start_time.substring(0, 5)}`
            : undefined
        }
        footer={
          selectedApp && !isEditing && !isCancellingWithReason ? (
            <div className="flex flex-col gap-2">
              {selectedApp.customer_phone && (
                <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-slate-100">
                  <button
                    onClick={() => {
                      haptic()
                      handleTalkToClient(selectedApp)
                    }}
                    className="mobile-tap rounded-xl bg-indigo-50 py-2.5 text-[10px] font-extrabold text-indigo-700 transition active:scale-95 flex items-center justify-center gap-1"
                  >
                    <i className="ti ti-brand-whatsapp text-xs" />
                    Falar
                  </button>
                  <button
                    disabled={sendingReminder}
                    onClick={() => {
                      haptic()
                      handleSendReminder(selectedApp)
                    }}
                    className="mobile-tap rounded-xl bg-emerald-50 py-2.5 text-[10px] font-extrabold text-emerald-700 transition active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {sendingReminder ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    ) : (
                      <i className="ti ti-bell text-xs" />
                    )}
                    Lembrete
                  </button>
                  <button
                    disabled={sendingConfirmation}
                    onClick={() => {
                      haptic()
                      handleSendConfirmationButtons(selectedApp)
                    }}
                    className="mobile-tap rounded-xl bg-indigo-50 py-2.5 text-[10px] font-extrabold text-indigo-700 transition active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {sendingConfirmation ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    ) : (
                      <i className="ti ti-check text-xs" />
                    )}
                    Confirmar
                  </button>
                </div>
              )}
              {selectedApp.status !== "completed" && selectedApp.status !== "cancelled" && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    disabled={updatingStatus}
                    onClick={() => changeStatus("confirmed", "Confirmado pelo recepcionista")}
                    className="mobile-tap rounded-xl bg-blue-50 py-2.5 text-[11px] font-extrabold text-blue-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-check mr-1" />
                    Confirmar
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => changeStatus("in_progress", "Profissional iniciou o atendimento")}
                    className="mobile-tap rounded-xl bg-amber-50 py-2.5 text-[11px] font-extrabold text-amber-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-scissors mr-1" />
                    Iniciar
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => {
                      haptic()
                      setCheckoutMethod("cash")
                      setCheckoutNotes("")
                      setCheckoutModalOpen(true)
                    }}
                    className="mobile-tap rounded-xl bg-emerald-50 py-2.5 text-[11px] font-extrabold text-emerald-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-cash mr-1" />
                    Concluir
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => changeStatus("no_show", "Cliente não compareceu")}
                    className="mobile-tap rounded-xl bg-red-950/5 py-2.5 text-[11px] font-extrabold text-red-950 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-user-x mr-1" />
                    Falta
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => {
                      setEditProfId(selectedApp.professional_id)
                      setEditDate(cleanDate(selectedApp.date))
                      setEditTime(selectedApp.start_time.substring(0, 5))
                      setEditServiceIds(selectedApp.services.map((service) => service.service_id))
                      setIsEditing(true)
                    }}
                    className="mobile-tap rounded-xl bg-slate-100 py-2.5 text-[11px] font-extrabold text-slate-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-edit mr-1" />
                    Editar
                  </button>
                  <button
                    disabled={updatingStatus}
                    onClick={() => {
                      setCancelReason("")
                      setIsCancellingWithReason(true)
                    }}
                    className="mobile-tap rounded-xl bg-red-50 py-2.5 text-[11px] font-extrabold text-red-700 transition active:scale-95 disabled:opacity-50"
                  >
                    <i className="ti ti-x mr-1" />
                    Cancelar
                  </button>
                </div>
              )}
              {selectedApp.status === "cancelled" && (
                <p className="text-center text-[11px] font-semibold text-slate-400">
                  Agendamento cancelado — sem ações disponíveis.
                </p>
              )}
              {selectedApp.status === "completed" && (
                <button
                  disabled={updatingStatus}
                  onClick={() => {
                    setCancelReason("")
                    setIsCancellingWithReason(true)
                  }}
                  className="mobile-tap rounded-xl bg-red-50 py-2.5 text-[11px] font-extrabold text-red-700 transition active:scale-95 disabled:opacity-50"
                >
                  Cancelar agendamento
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        {selectedApp && (
          <>
            {/* MODO CANCELAMENTO COM MOTIVO */}
            {isCancellingWithReason ? (
              <form onSubmit={handleCancelWithReason} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Motivo do cancelamento (obrigatório)
                  </label>
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Descreva o motivo do cancelamento para registro administrativo..."
                    className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCancellingWithReason(false)}
                    className="mobile-tap rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-600 transition active:scale-95"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="mobile-tap rounded-xl bg-red-600 py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50"
                  >
                    {updatingStatus ? "Cancelando..." : "Confirmar"}
                  </button>
                </div>
              </form>
            ) : isEditing ? (
              /* MODO DE EDIÇÃO */
              <form onSubmit={handleReschedule} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Serviços
                  </label>
                  <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto rounded-xl border border-slate-100 p-2">
                    {services.map((service) => {
                      const selected = editServiceIds.includes(service.id)
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleEditService(service.id)}
                          className={`mobile-tap flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition ${selected ? "border-slate-800 bg-slate-50" : "border-slate-100 bg-white"}`}
                        >
                          <span>
                            <span className="block text-xs font-extrabold text-slate-700">{service.name}</span>
                            <span className="text-[10px] font-semibold text-slate-400">{service.duration_minutes} min · R$ {service.price.toFixed(2)}</span>
                          </span>
                          <i className={`ti ${selected ? "ti-circle-check-filled text-emerald-600" : "ti-circle text-slate-300"}`} />
                        </button>
                      )
                    })}
                  </div>
                  {editServiceIds.length === 0 && <p className="mt-1 text-[10px] font-semibold text-red-600">Selecione pelo menos um serviço.</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Profissional
                  </label>
                  <Select
                    value={editProfId}
                    onValueChange={(val) => {
                      setEditProfId(val)
                      setEditTime("")
                    }}
                  >
                    <SelectTrigger className="h-11 rounded-xl text-sm font-semibold">
                      <SelectValue placeholder="Profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Data
                  </label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => {
                      setEditDate(e.target.value)
                      setEditTime("")
                    }}
                    className="h-11 rounded-xl text-base"
                  />
                </div>

                {editDate && editProfId && (
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Novo horário
                    </label>
                    {loadingEditSlots ? (
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="skeleton-shimmer h-10 rounded-xl" />
                        ))}
                      </div>
                    ) : editSlots.length === 0 ? (
                      <p className="rounded-xl bg-amber-50 p-3 text-[11px] font-semibold text-amber-600">
                        Sem horários disponíveis para este dia.
                      </p>
                    ) : (
                      <div className="grid max-h-40 grid-cols-4 gap-1.5 overflow-y-auto p-0.5">
                        {editSlots.map((slot) => (
                          <button
                            key={slot.start_time}
                            type="button"
                            onClick={() => {
                              haptic()
                              setEditTime(slot.start_time)
                            }}
                            className={`mobile-tap h-10 rounded-xl border text-[11px] font-extrabold transition active:scale-95 ${
                              editTime === slot.start_time
                                ? "border-transparent text-white shadow-md"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                            style={editTime === slot.start_time ? { backgroundColor: "var(--color-primary)" } : {}}
                          >
                            {slot.start_time.substring(0, 5)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="mobile-tap rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-600 transition active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus || !editTime || editServiceIds.length === 0}
                    className="mobile-tap rounded-xl py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {updatingStatus ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </form>
            ) : (
              /* MODO VISUALIZAÇÃO */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <StatusPill label={getStatusLabel(selectedApp.status)} tone={statusTone(selectedApp.status)} />
                  {selectedApp.customer_id && (
                    <Link
                      href={`/cliente/clientes/${selectedApp.customer_id}`}
                      className="text-[11px] font-extrabold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      Ver no CRM <i className="ti ti-chevron-right" />
                    </Link>
                  )}
                </div>

                <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-bold text-slate-400">Profissional</span>
                    <span className="text-xs font-extrabold text-slate-700">{selectedApp.professional_name}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-bold text-slate-400">Horário</span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {selectedApp.start_time.substring(0, 5)} - {selectedApp.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs font-bold text-slate-400">Telefone</span>
                    <span className="text-xs font-extrabold text-slate-700">
                      {selectedApp.customer_phone || "Sem telefone"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Serviços contratados
                  </p>
                  <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    {(selectedApp.services || []).map((s) => (
                      <div key={s.service_id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">
                          {s.service_name} ({s.duration_minutes} min)
                        </span>
                        <span className="font-bold text-slate-800">R$ {s.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-slate-200/50 pt-1.5 text-sm font-extrabold text-slate-800">
                      <span>Total estimado</span>
                      <span className="text-emerald-600">R$ {total(selectedApp).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
                      Observações
                    </p>
                    <p className="text-xs font-medium italic text-amber-800">{selectedApp.notes}</p>
                  </div>
                )}

                {/* Histórico de alterações */}
                <div>
                  <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Histórico de alterações
                  </p>
                  {loadingLogs ? (
                    <div className="space-y-2">
                      <div className="skeleton-shimmer h-8 rounded-lg" />
                      <div className="skeleton-shimmer h-8 rounded-lg" />
                    </div>
                  ) : statusLogs.length === 0 ? (
                    <p className="text-[11px] italic text-slate-400">Nenhum histórico registrado.</p>
                  ) : (
                    <div className="max-h-40 space-y-2.5 overflow-y-auto pr-1">
                      {statusLogs.map((log) => (
                        <div key={log.id} className="relative border-l border-slate-200 pl-4 text-[10px] leading-relaxed">
                          <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full border border-white bg-slate-400" />
                          <div className="font-bold text-slate-700">
                            Status alterado para{" "}
                            <span className="rounded border bg-slate-100 px-1 py-0.5 text-[9px] font-black uppercase text-slate-900">
                              {getStatusLabel(log.to_status)}
                            </span>
                          </div>
                          {log.notes && <div className="mt-0.5 italic text-slate-500">Motivo: "{log.notes}"</div>}
                          <div className="mt-0.5 text-[9px] text-slate-400">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </BottomSheet>

      {/* Sheet de checkout */}
      <BottomSheet
        open={checkoutModalOpen && selectedApp !== null}
        onClose={() => !updatingStatus && setCheckoutModalOpen(false)}
        title="Finalizar atendimento"
        subtitle="Checkout e recebimento"
      >
        {selectedApp && (
          <form onSubmit={handleCheckout} className="flex flex-col gap-4">
            <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-500">
                <span>Cliente:</span>
                <span className="font-bold text-slate-800">{selectedApp.customer_name || "Sem cadastro"}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-slate-500">
                <span>Profissional:</span>
                <span className="font-bold text-slate-800">{selectedApp.professional_name}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/50 pt-2 text-sm font-extrabold text-slate-800">
                <span>Total a pagar:</span>
                <span className="text-base font-black text-emerald-600">R$ {total(selectedApp).toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Forma de pagamento
              </label>
              <Select value={checkoutMethod} onValueChange={setCheckoutMethod}>
                <SelectTrigger className="h-11 rounded-xl bg-white text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="card_debit">Cartão de Débito</SelectItem>
                  <SelectItem value="card_credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Observações / Notas
              </label>
              <textarea
                value={checkoutNotes}
                onChange={(e) => setCheckoutNotes(e.target.value)}
                placeholder="Lançar observações sobre gorjetas ou facilidades de pagamento..."
                className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="mobile-tap rounded-xl border border-slate-200 bg-white py-3 text-xs font-extrabold text-slate-600 transition active:scale-95"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={updatingStatus}
                className="mobile-tap rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50"
              >
                {updatingStatus ? "Processando..." : "Confirmar Recebimento"}
              </button>
            </div>
          </form>
        )}
      </BottomSheet>

      {/* BOTTOM SHEET DE SELEÇÃO DE TELEFONE */}
      <BottomSheet
        open={phoneSelectorOpen}
        onClose={() => setPhoneSelectorOpen(false)}
        title="Selecionar Telefone"
        subtitle="Escolha qual número de WhatsApp deseja usar"
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-xs text-slate-500 font-medium">
            Este cliente possui mais de um telefone cadastrado. Selecione o número para prosseguir:
          </p>
          <div className="flex flex-col gap-2">
            {phoneSelectorOptions.map((phone) => (
              <button
                key={phone}
                onClick={() => {
                  haptic()
                  if (phoneSelectorAction === "chat") {
                    window.location.href = `/cliente/chat?phone=${phone}&name=${encodeURIComponent(selectedApp?.customer_name || "")}`
                  } else if (phoneSelectorAction === "reminder" && selectedApp) {
                    handleSendReminder(selectedApp, phone)
                  } else if (phoneSelectorAction === "confirmation" && selectedApp) {
                    handleSendConfirmationButtons(selectedApp, phone)
                  }
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white text-xs font-extrabold text-slate-700 active:bg-slate-50 transition"
              >
                <span>{phone}</span>
                <i className="ti ti-brand-whatsapp text-lg text-emerald-500" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setPhoneSelectorOpen(false)}
            className="w-full py-3 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-600 transition"
          >
            Cancelar
          </button>
        </div>
      </BottomSheet>

      <Fab icon="ti-plus" href="/cliente/agenda/novo" ariaLabel="Novo agendamento" />
    </div>
  )
}
