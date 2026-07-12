"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAgenda } from "@/features/agenda/hooks/useAgenda"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { http } from "@/shared/lib/http"
import {
  VIEW_MODES,
  formatDateString,
  cleanDate,
  getStatusStyle,
  getStatusLabel,
  type EnrichedAppointment,
} from "@/features/agenda/types"

export default function AgendaDesktop() {
  const {
    professionals,
    selectedProfId,
    setSelectedProfId,
    currentDate,
    viewMode,
    setViewMode,
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
    getHeaderDateLabel,
  } = useAgenda()

  // Controle de múltiplos telefones e disparo de WhatsApp
  const [phoneSelectorOpen, setPhoneSelectorOpen] = useState(false)
  const [phoneSelectorOptions, setPhoneSelectorOptions] = useState<string[]>([])
  const [phoneSelectorAction, setPhoneSelectorAction] = useState<"chat" | "reminder" | null>(null)
  const [sendingReminder, setSendingReminder] = useState(false)

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
      setSendingReminder(false)
    }
  }

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Controles */}
      <div className="flex justify-between items-center flex-wrap gap-4 bg-white border border-slate-100 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigateDate("prev")} className="border border-slate-200 h-9 px-3">
            <i className="ti ti-chevron-left text-base" />
          </Button>
          <Button variant="ghost" onClick={() => navigateDate("today")} className="border border-slate-200 h-9 text-xs font-bold uppercase">
            Hoje
          </Button>
          <Button variant="ghost" onClick={() => navigateDate("next")} className="border border-slate-200 h-9 px-3">
            <i className="ti ti-chevron-right text-base" />
          </Button>
          <span className="text-sm font-bold text-slate-800 capitalize pl-1">
            {getHeaderDateLabel()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Profissional */}
          <Select value={selectedProfId} onValueChange={setSelectedProfId}>
            <SelectTrigger className="w-52 h-9 text-xs font-semibold">
              <SelectValue placeholder="Filtrar Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos Profissionais</SelectItem>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Toggle Modo Dia/Semana */}
          <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setViewMode(mode.value as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === mode.value
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/40"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <a href="/cliente/agenda/bloqueios">
            <Button size="sm" variant="outline" className="border-slate-200 bg-white h-9 font-semibold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
              <i className="ti ti-lock text-sm text-slate-500" />
              Bloquear Horário
            </Button>
          </a>

          <Link href="/cliente/agenda/kds" target="_blank">
            <Button size="sm" variant="outline" className="border-slate-200 bg-white h-9 font-semibold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm">
              <i className="ti ti-device-tv text-sm text-indigo-600" />
              Painel KDS
            </Button>
          </Link>

          <Link href="/cliente/agenda/novo">
            <Button size="sm" className="h-9 font-semibold flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800">
              <i className="ti ti-plus text-sm" />
              Novo Agendamento
            </Button>
          </Link>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Visualização de Agenda */}
      {loading ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-bold mt-2">Buscando horários da agenda...</span>
        </div>
      ) : (
        <div className="w-full">
          {viewMode === "day" ? (
            // Day view timeline
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals
                .filter((p) => !selectedProfId || p.id === selectedProfId)
                .map((prof) => {
                  const profApps = appointments.filter((a) => a.professional_id === prof.id && cleanDate(a.date) === activeDateStr)
                  const profBlocks = blockedSlots.filter((b) => (!b.professional_id || b.professional_id === prof.id) && cleanDate(b.date) === activeDateStr)

                  return (
                    <Card key={prof.id} className="border-slate-100 flex flex-col min-h-[450px]">
                      <CardHeader className="bg-slate-50 border-b border-slate-100 py-3 px-5">
                        <CardTitle className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px]">
                            {prof.name[0]}
                          </div>
                          {prof.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 space-y-3 bg-slate-50/20">
                        {profBlocks.map((block) => (
                          <div
                            key={block.id}
                            className="bg-slate-200/50 border border-dashed border-slate-300 text-slate-500 rounded-xl p-3 text-xs flex items-center gap-2 font-semibold"
                          >
                            <i className="ti ti-lock text-sm" />
                            <div>
                              <p className="font-bold">
                                {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                              </p>
                              <p className="text-[10px] text-slate-400">Bloqueio: {block.reason || "Indisponível"}</p>
                            </div>
                          </div>
                        ))}

                        {profApps.length === 0 && profBlocks.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-300 py-24 text-center">
                            <i className="ti ti-calendar-event text-4xl mb-2" />
                            <span className="text-xs font-bold">Sem compromissos hoje</span>
                          </div>
                        ) : (
                          profApps.map((app) => (
                            <div
                              key={app.id}
                              onClick={() => setSelectedApp(app)}
                              className={`border rounded-xl p-3.5 shadow-sm hover:shadow transition duration-150 cursor-pointer flex flex-col gap-2 font-sans ${getStatusStyle(
                                app.status
                              )}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-extrabold leading-none">
                                  {app.start_time.substring(0, 5)} - {app.end_time.substring(0, 5)}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  {getStatusLabel(app.status)}
                                </span>
                              </div>
                              <p className="text-xs font-extrabold text-slate-900 leading-tight">
                                {app.customer_name || "Cliente Avulso"}
                              </p>
                              <div className="flex justify-between items-center text-[10px] text-slate-500/80 font-bold border-t border-slate-200/50 pt-2 mt-1">
                                <span className="truncate max-w-[120px]">
                                  {(app.services || []).map((s) => s.service_name).join(", ")}
                                </span>
                                <span>
                                  R$ {(app.services || []).reduce((acc, s) => acc + s.price, 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          ) : (
            // Week view timeline
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, idx) => {
                const dayOfWeek = currentDate.getDay()
                const start = new Date(currentDate)
                const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // ajusta para segunda
                start.setDate(diff + idx)

                const dayStr = formatDateString(start)
                const dayApps = appointments.filter((a) => cleanDate(a.date) === dayStr)

                const isToday = formatDateString(new Date()) === dayStr

                return (
                  <Card key={idx} className={`border-slate-100 flex flex-col min-h-[350px] ${isToday ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-2.5 px-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {start.toLocaleDateString("pt-BR", { weekday: "short" })}
                      </p>
                      <p className="text-base font-extrabold text-slate-800 leading-none mt-1">
                        {start.getDate()}
                      </p>
                    </CardHeader>
                    <CardContent className="p-2 flex-1 space-y-2 bg-slate-50/10">
                      {dayApps.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 py-16 text-center">
                          <span className="text-[10px] font-bold">Sem agendamentos</span>
                        </div>
                      ) : (
                        dayApps.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`border rounded-lg p-2 shadow-sm hover:shadow transition duration-150 cursor-pointer flex flex-col gap-1 text-[11px] font-sans ${getStatusStyle(
                              app.status
                            )}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{app.start_time.substring(0, 5)}</span>
                              <span className="text-[8px] font-bold uppercase">{getStatusLabel(app.status)}</span>
                            </div>
                            <p className="font-extrabold text-slate-900 truncate leading-none">
                              {app.customer_name || "Cliente Avulso"}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate leading-none">
                              Pro: {app.professional_name.split(" ")[0]}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate leading-none">
                              {(app.services || []).map((s) => s.service_name).join(", ")}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={selectedApp !== null} onOpenChange={(open) => !open && setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Reagendar Agendamento" : isCancellingWithReason ? "Confirmar Cancelamento" : "Detalhes do Agendamento"}
              </DialogTitle>
            </DialogHeader>

            {/* MODO CANCELAMENTO COM MOTIVO */}
            {isCancellingWithReason ? (
              <form onSubmit={handleCancelWithReason} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Motivo do Cancelamento (Obrigatório)</label>
                  <textarea
                    required
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Descreva o motivo do cancelamento para registro administrativo..."
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsCancellingWithReason(false)}>
                    Voltar
                  </Button>
                  <Button type="submit" disabled={updatingStatus} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                    Confirmar Cancelamento
                  </Button>
                </div>
              </form>
            ) : isEditing ? (
              /* MODO REAGENDAMENTO / EDIÇÃO */
              <form onSubmit={handleReschedule} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Profissional</label>
                    <Select
                      value={editProfId}
                      onValueChange={(val) => {
                        setEditProfId(val)
                        setEditTime("")
                      }}
                    >
                      <SelectTrigger className="text-xs font-semibold">
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                    <Input
                      type="date"
                      value={editDate}
                      onChange={(e) => {
                        setEditDate(e.target.value)
                        setEditTime("")
                      }}
                      className="text-xs"
                    />
                  </div>
                </div>

                {editDate && editProfId && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase block">Novo Horário</label>
                    {loadingEditSlots ? (
                      <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : editSlots.length === 0 ? (
                      <p className="text-[11px] text-amber-600 font-semibold bg-amber-50 p-2 rounded">
                        Sem horários disponíveis para este dia.
                      </p>
                    ) : (
                      <div className="grid grid-cols-4 gap-1.5 max-h-28 overflow-y-auto p-0.5">
                        {editSlots.map((slot) => (
                          <Button
                            key={slot.start_time}
                            type="button"
                            variant="ghost"
                            onClick={() => setEditTime(slot.start_time)}
                            className={`h-8 text-[10px] font-bold border ${editTime === slot.start_time
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                              }`}
                          >
                            {slot.start_time.substring(0, 5)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={updatingStatus || !editTime} className="font-bold">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            ) : (
              /* MODO VISUALIZAÇÃO PADRÃO */
              <div className="space-y-4 py-2 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                    <p className="font-bold text-slate-800 text-sm flex items-center">
                      {selectedApp.customer_name || "Cliente Avulso"}
                      {selectedApp.customer_id && (
                        <Link
                          href={`/cliente/clientes/${selectedApp.customer_id}`}
                          className="text-indigo-600 hover:underline text-[9px] font-extrabold pl-1.5 border-l border-slate-200 ml-1.5"
                        >
                          Ver CRM
                        </Link>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedApp.customer_phone || "Sem telefone"}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional / Horário</span>
                    <p className="font-bold text-slate-800">{selectedApp.professional_name}</p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      {new Date(cleanDate(selectedApp.date) + "T00:00:00").toLocaleDateString("pt-BR")} às {selectedApp.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Serviços Contratados</span>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5">
                    {(selectedApp.services || []).map((s) => (
                      <div key={s.service_id} className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-700">{s.service_name} ({s.duration_minutes} min)</span>
                        <span className="font-bold text-slate-800">R$ {s.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200/50 pt-1.5 flex justify-between items-center font-extrabold text-slate-800">
                      <span>Total Estimado</span>
                      <span>R$ {(selectedApp.services || []).reduce((acc, s) => acc + s.price, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedApp.notes && (
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Observações</span>
                    <p className="bg-slate-50 border border-slate-100 p-2 rounded text-slate-600 italic">
                      {selectedApp.notes}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status do Agendamento</span>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusStyle(selectedApp.status)}`}>
                      {getStatusLabel(selectedApp.status)}
                    </span>
                  </div>
                </div>

                {/* TIMELINE DE LOGS DE STATUS */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Histórico de Alterações</span>
                  {loadingLogs ? (
                    <div className="text-[10px] text-slate-400">Carregando timeline...</div>
                  ) : statusLogs.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic">Nenhum histórico registrado.</div>
                  ) : (
                    <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
                      {statusLogs.map((log) => (
                        <div key={log.id} className="relative pl-4 border-l border-slate-200 text-[10px] leading-relaxed">
                          {/* Dot indicador */}
                          <div className="absolute -left-[4.5px] top-1.5 h-2 w-2 rounded-full bg-slate-400 border border-white" />
                          <div className="font-bold text-slate-700">
                            Status alterado para{" "}
                            <span className="text-slate-900 uppercase font-black text-[9px] bg-slate-100 px-1 py-0.5 rounded border">
                              {getStatusLabel(log.to_status)}
                            </span>
                          </div>
                          {log.notes && <div className="text-slate-500 italic mt-0.5">Motivo: "{log.notes}"</div>}
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            {new Date(log.created_at).toLocaleString("pt-BR")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer de botões padrão do Modal */}
            {!isEditing && !isCancellingWithReason && (
              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5 justify-start flex-1">
                  {selectedApp.customer_phone && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTalkToClient(selectedApp)}
                        className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        <i className="ti ti-brand-whatsapp mr-1 text-xs" />
                        Falar com Cliente
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendReminder(selectedApp)}
                        disabled={sendingReminder}
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        {sendingReminder ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <i className="ti ti-bell mr-1 text-xs" />
                        )}
                        Enviar Lembrete
                      </Button>
                    </>
                  )}
                  {selectedApp.status !== "completed" && selectedApp.status !== "cancelled" && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("confirmed", "Confirmado pelo recepcionista")}
                        disabled={updatingStatus}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("in_progress", "Profissional iniciou o atendimento")}
                        disabled={updatingStatus}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Iniciar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCheckoutMethod("cash")
                          setCheckoutNotes("")
                          setCheckoutModalOpen(true)
                        }}
                        disabled={updatingStatus}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold h-8 px-2.5"
                      >
                        Concluir
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => changeStatus("no_show", "Cliente não compareceu")}
                        disabled={updatingStatus}
                        className="bg-red-950/5 text-red-950 hover:bg-red-950/10 text-[10px] font-bold h-8 px-2.5"
                      >
                        Falta
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditProfId(selectedApp.professional_id)
                          setEditDate(cleanDate(selectedApp.date))
                          setEditTime(selectedApp.start_time.substring(0, 5))
                          setIsEditing(true)
                        }}
                        disabled={updatingStatus}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-[10px] font-bold h-8 px-2.5"
                      >
                        Reagendar
                      </Button>
                    </>
                  )}
                  {selectedApp.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCancelReason("")
                        setIsCancellingWithReason(true)
                      }}
                      disabled={updatingStatus}
                      className="bg-red-50 text-red-700 hover:bg-red-100 text-[10px] font-bold h-8 px-2.5"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                <Button type="button" variant="ghost" onClick={() => setSelectedApp(null)} disabled={updatingStatus}>
                  Fechar
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>

      {/* MODAL CHECKOUT DE PAGAMENTO */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        {selectedApp && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Finalizar Atendimento e Checkout</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCheckout} className="space-y-4 py-2">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Cliente:</span>
                  <span className="font-bold text-slate-800">{selectedApp.customer_name || "Sem cadastro"}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-semibold">
                  <span>Profissional:</span>
                  <span className="font-bold text-slate-800">{selectedApp.professional_name}</span>
                </div>
                <div className="flex justify-between items-center font-extrabold border-t border-slate-200/50 pt-2 text-slate-800 text-sm">
                  <span>Total a Pagar:</span>
                  <span className="text-primary text-base font-black">
                    R$ {(selectedApp.services || []).reduce((acc: number, curr: any) => acc + curr.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Forma de Pagamento</label>
                <Select value={checkoutMethod} onValueChange={setCheckoutMethod}>
                  <SelectTrigger className="text-xs font-semibold bg-white">
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Observações / Notas</label>
                <textarea
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Lançar observações sobre gorjetas ou facilidades de pagamento..."
                  className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setCheckoutModalOpen(false)}>
                  Voltar
                </Button>
                <Button type="submit" disabled={updatingStatus} className="font-bold">
                  {updatingStatus ? "Processando..." : "Confirmar Recebimento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* DIALOG DE SELEÇÃO DE TELEFONE */}
      <Dialog open={phoneSelectorOpen} onOpenChange={setPhoneSelectorOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-slate-800 font-bold text-base">
              Selecionar Telefone
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Este cliente possui múltiplos números no cadastro. Escolha um para continuar:
            </p>
            <div className="space-y-2">
              {phoneSelectorOptions.map((phone) => (
                <button
                  key={phone}
                  onClick={() => {
                    if (phoneSelectorAction === "chat") {
                      window.location.href = `/cliente/chat?phone=${phone}&name=${encodeURIComponent(selectedApp?.customer_name || "")}`
                    } else if (phoneSelectorAction === "reminder" && selectedApp) {
                      handleSendReminder(selectedApp, phone)
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/20 text-xs font-bold text-slate-700 transition"
                >
                  <span>{phone}</span>
                  <i className="ti ti-brand-whatsapp text-lg text-emerald-500" />
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPhoneSelectorOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
