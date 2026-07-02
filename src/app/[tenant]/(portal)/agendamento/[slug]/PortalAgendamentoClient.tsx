"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"

interface PublicClientData {
  client_id: string
  client_name: string
  client_slug: string
  logo_url?: string
  color_primary: string
  color_secondary: string
  font_family: string
  address?: string
  neighborhood?: string
  city?: string
  state?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  timezone: string
  cancellation_policy_hours: number
  booking_requires_login: number
  min_advance_hours: number
  max_advance_days: number
  interval_between_minutes: number
}

interface Service {
  id: string
  category_id?: string
  name: string
  description?: string
  duration_minutes: number
  price: number
}

interface Professional {
  id: string
  name: string
  bio?: string
  photo_url?: string
}

interface TimeSlot {
  start_time: string
  end_time: string
}

interface AppointmentResponse {
  id: string
  date: string
  start_time: string
  end_time: string
  cancel_token: string
  professional_name: string
  services: {
    service_id: string
    service_name: string
    price: number
    duration_minutes: number
  }[]
}

const STEPS = [
  { step: 1, label: "Serviço" },
  { step: 2, label: "Profissional" },
  { step: 3, label: "Data e Hora" },
  { step: 4, label: "Seus dados" },
  { step: 5, label: "Confirmação" },
]

export default function PortalAgendamentoClient({ config }: { config: PublicClientData }) {
  const [step, setStep] = useState(1)

  // API Data
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Selection states
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null) // null = Tanto faz
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Form states
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [notes, setNotes] = useState("")

  // Status states
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successApp, setSuccessApp] = useState<AppointmentResponse | null>(null)

  // Filter state for services
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")

  // Generate 14 days starting from seed base (2026-06-29)
  const [availableDays, setAvailableDays] = useState<Date[]>([])

  useEffect(() => {
    // Inicializa os próximos 14 dias para o swiper
    const start = new Date("2026-06-29") // fixo no dia do seed
    const days: Date[] = []
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    setAvailableDays(days)
  }, [])

  // Carrega serviços e profissionais
  const loadInitialData = async () => {
    setLoading(true)
    const resSvc = await http.get<Service[]>(`/public/${config.client_slug}/services`)
    const resProf = await http.get<Professional[]>(`/public/${config.client_slug}/professionals`)
    const resCat = await http.get<{ id: string; name: string }[]>("/service-categories") // BFF/public
    setLoading(false)

    if (resSvc.data) setServices(resSvc.data)
    if (resProf.data) setProfessionals(resProf.data)

    // Junta as categorias retornadas para preencher o filtro
    if (resCat.data) {
      setCategories(resCat.data)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Carrega slots disponíveis
  const loadSlots = async (date: Date) => {
    if (!selectedService) return
    setLoadingSlots(true)
    setErrorMsg(null)

    const dateStr = date.toISOString().split("T")[0]
    const profParam = selectedProf ? `&professional_id=${selectedProf.id}` : ""
    const svcParam = `&service_ids=${selectedService.id}`

    const res = await http.get<TimeSlot[]>(
      `/public/${config.client_slug}/availability?date=${dateStr}${profParam}${svcParam}`
    )
    setLoadingSlots(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }
    if (res.data) {
      setSlots(res.data)
    }
  }

  useEffect(() => {
    if (selectedDate && step === 3) {
      loadSlots(selectedDate)
    }
  }, [selectedDate, selectedProf])

  const handleServiceSelect = (svc: Service) => {
    setSelectedService(svc)
    setStep(2)
  }

  const handleProfSelect = (prof: Professional | null) => {
    setSelectedProf(prof)
    setStep(3)
    // Reseta data/hora se mudou o profissional
    setSelectedDate(null)
    setSelectedSlot(null)
    setSlots([])
  }

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d)
    setSelectedSlot(null)
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep(4)
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone || !customerEmail) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.")
      return
    }
    setErrorMsg(null)
    setStep(5)
  }

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return

    setSubmitting(true)
    setErrorMsg(null)

    const dateStr = selectedDate.toISOString().split("T")[0]
    const res = await http.post<AppointmentResponse>(`/public/${config.client_slug}/appointments`, {
      professional_id: selectedProf ? selectedProf.id : professionals[0]?.id || "", // fallback se "Tanto faz"
      service_ids: [selectedService.id],
      date: dateStr,
      start_time: selectedSlot.start_time,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      notes: notes ? notes : null,
    })
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      // Se colidir, manda de volta para o passo 3
      if (res.error.code === "CONFLITO" || res.error.message.includes("não está mais disponível")) {
        setStep(3)
        setSelectedSlot(null)
        if (selectedDate) loadSlots(selectedDate)
      }
      return
    }

    if (res.data) {
      setSuccessApp(res.data)
      setStep(6)
    }
  }

  // Google Agenda link generator
  const getGoogleCalendarLink = (app: AppointmentResponse) => {
    const dateStr = app.date.replace(/-/g, "")
    const startStr = app.start_time.replace(/:/g, "")
    const endStr = app.end_time.replace(/:/g, "")

    const dates = `${dateStr}T${startStr}/${dateStr}T${endStr}`
    const text = encodeURIComponent(`${selectedService?.name} - ${config.client_name}`)
    const details = encodeURIComponent(`Profissional: ${app.professional_name}\nPowered by BarberCentral`)
    const location = encodeURIComponent(config.address || "")

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`
  }

  // Filtra serviços ativos por categoria
  const filteredServices = services.filter(
    (s) => !selectedCategoryFilter || s.category_id === selectedCategoryFilter
  )

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header do Portal */}
      <header
        className="text-white py-6 px-4 text-center transition shadow-md flex-shrink-0"
        style={{ backgroundColor: "var(--bc-primary)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="h-full w-full object-contain p-1" />
              ) : (
                <i className="ti ti-cut text-lg" />
              )}
            </div>
            <div className="text-left">
              <h1 className="font-extrabold text-base leading-none">{config.client_name}</h1>
              <p className="text-[10px] text-white/70 mt-1 leading-none">
                {config.address ? `${config.address}, ${config.neighborhood}` : "Portal de Agendamento"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {config.whatsapp && (
              <a
                href={`https://wa.me/55${config.whatsapp}`}
                target="_blank"
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center border border-white/5 transition"
              >
                <i className="ti ti-brand-whatsapp text-base" />
              </a>
            )}
            {config.instagram && (
              <a
                href={`https://instagram.com/${config.instagram}`}
                target="_blank"
                className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center border border-white/5 transition"
              >
                <i className="ti ti-brand-instagram text-base" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 md:py-8 space-y-6">
        {/* Stepper visual (Passos 1 a 5) */}
        {step <= 5 && (
          <div className="flex justify-between items-center bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm overflow-x-auto whitespace-nowrap gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="flex items-center gap-1.5">
                <div
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition ${
                    step === s.step
                      ? "bg-slate-900 text-white border-slate-900"
                      : step > s.step
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {step > s.step ? <i className="ti ti-check text-xs" /> : s.step}
                </div>
                <span
                  className={`text-xs font-bold transition ${
                    step === s.step ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
                {s.step < 5 && <i className="ti ti-chevron-right text-[10px] text-slate-300" />}
              </div>
            ))}
          </div>
        )}

        {/* Alerta de erro geral */}
        {errorMsg && <Alert variant="error" message={errorMsg} />}

        {/* STEP 1: Seleção de Serviço */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h2 className="text-lg font-extrabold text-slate-800">Selecione o Serviço</h2>
              {/* Categorias Filtros */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedCategoryFilter("")}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                    selectedCategoryFilter === ""
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-500 border-slate-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                      selectedCategoryFilter === cat.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredServices.length === 0 ? (
              <p className="text-sm font-semibold text-slate-400 text-center py-8">Nenhum serviço disponível.</p>
            ) : (
              <div className="space-y-3">
                {filteredServices.map((svc) => (
                  <Card
                    key={svc.id}
                    onClick={() => handleServiceSelect(svc)}
                    className="hover:border-slate-300 transition duration-150 cursor-pointer shadow-sm active:scale-[0.99]"
                  >
                    <CardContent className="p-4 flex justify-between items-center gap-4">
                      <div className="min-w-0 pr-2">
                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{svc.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{svc.description}</p>
                        <span className="text-[10px] font-bold text-slate-500 mt-2 block bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                          {svc.duration_minutes} minutos
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-extrabold text-slate-800 block">
                          R$ {svc.price.toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-[10px] h-7 px-3 font-extrabold text-white transition active:scale-[0.97]"
                          style={{ backgroundColor: "var(--bc-secondary)" }}
                        >
                          Escolher
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Seleção de Profissional */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">Quem vai te atender?</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção Qualquer Profissional */}
              <Card
                onClick={() => handleProfSelect(null)}
                className="hover:border-slate-300 transition duration-150 cursor-pointer text-center group border-dashed active:scale-[0.99]"
              >
                <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
                  <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-105 transition duration-200">
                    <i className="ti ti-users text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">Qualquer Profissional</h3>
                    <p className="text-[10px] text-slate-400 mt-1">Busca a maior disponibilidade de horários.</p>
                  </div>
                </CardContent>
              </Card>

              {professionals.map((prof) => (
                <Card
                  key={prof.id}
                  onClick={() => handleProfSelect(prof)}
                  className="hover:border-slate-300 transition duration-150 cursor-pointer text-center group active:scale-[0.99]"
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm group-hover:scale-105 transition duration-200">
                      {prof.photo_url ? (
                        <img src={prof.photo_url} alt={prof.name} className="h-full w-full object-cover" />
                      ) : (
                        <i className="ti ti-user text-xl text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-sm">{prof.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {prof.bio || "Especialista em cabelo e barba."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Data e Horário */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(2)} className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">Escolha a data e hora</h2>
            </div>

            {/* Horizontal Date Swiper */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selecione o Dia</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap">
                {availableDays.map((d, i) => {
                  const isSelected = selectedDate && selectedDate.toDateString() === d.toDateString()
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateSelect(d)}
                      className={`h-16 w-14 rounded-xl flex flex-col items-center justify-center border transition flex-shrink-0 active:scale-95 ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                      </span>
                      <span className="text-base font-extrabold mt-0.5">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Slots de Horários */}
            {selectedDate && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Horários para {selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                </span>

                {loadingSlots ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm font-semibold text-amber-600 text-center py-6 bg-amber-50 rounded-xl border border-amber-100">
                    Nenhum horário disponível para esta data. Tente outro dia!
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((slot, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        onClick={() => handleSlotSelect(slot)}
                        className="h-10 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition active:scale-95"
                      >
                        {slot.start_time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Dados do Cliente */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(3)} className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">Preencha seus dados</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <Input
                      placeholder="Ex: Pedro de Souza"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone celular</label>
                    <Input
                      placeholder="Ex: 11999999999"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">E-mail para Confirmação</label>
                    <Input
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Alguma observação? (Opcional)</label>
                    <textarea
                      placeholder="Ex: Cabelo molhado, prefiro corte mais curto na lateral..."
                      className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full font-bold">
                    Continuar
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 5: Confirmar Reserva */}
        {step === 5 && selectedService && selectedDate && selectedSlot && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(4)} className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">Confirmar Agendamento</h2>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4 text-sm text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Barbearia</span>
                    <p className="font-extrabold text-slate-800 text-sm leading-tight">{config.client_name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional</span>
                    <p className="font-extrabold text-slate-800 text-sm leading-tight">
                      {selectedProf ? selectedProf.name : "Qualquer Profissional"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                    <p className="font-extrabold text-slate-800 text-sm leading-tight">
                      {selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Horário</span>
                    <p className="font-extrabold text-slate-800 text-sm leading-tight">
                      {selectedSlot.start_time}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Resumo de Valores</span>
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg font-semibold">
                    <span className="text-xs text-slate-600">{selectedService.name} ({selectedService.duration_minutes} min)</span>
                    <span className="text-sm font-extrabold text-slate-800">R$ {selectedService.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Seus Dados</span>
                  <p className="text-xs font-bold text-slate-700">{customerName} ({customerEmail})</p>
                  <p className="text-[10px] text-slate-400">{customerPhone}</p>
                </div>

                <Button
                  onClick={handleConfirmBooking}
                  className="w-full font-bold h-11 text-base mt-2 shadow-md transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                  disabled={submitting}
                  style={{ backgroundColor: "var(--bc-primary)" }}
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Reservando horário...
                    </>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 6: Agendamento Concluído (Sucesso) */}
        {step === 6 && successApp && selectedService && selectedDate && (
          <div className="space-y-6 text-center py-6 animate-fade-in">
            {/* Ícone Sucesso */}
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">
              <i className="ti ti-check" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Horário Agendado!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Tudo pronto, {customerName}! Enviamos uma confirmação detalhada para seu e-mail: <strong className="text-slate-700">{customerEmail}</strong>.
              </p>
            </div>

            {/* Recibo com cores customizadas */}
            <Card className="text-left max-w-md mx-auto">
              <CardContent className="p-6 space-y-4 text-sm text-slate-700">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Barbearia</span>
                  <p className="font-extrabold text-slate-800">{config.client_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Data e Hora</span>
                    <p className="font-extrabold text-slate-800">
                      {selectedDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} às {successApp.start_time}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional</span>
                    <p className="font-extrabold text-slate-800">{successApp.professional_name}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Serviço</span>
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span>{selectedService.name}</span>
                    <span>R$ {selectedService.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                  <a
                    href={getGoogleCalendarLink(successApp)}
                    target="_blank"
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 text-xs transition active:scale-[0.98] shadow-sm"
                  >
                    <i className="ti ti-brand-google text-base" />
                    Adicionar ao Google Agenda
                  </a>

                  <a
                    href={`/agendamento/cancelar/${successApp.cancel_token}`}
                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline block text-center py-2 transition"
                  >
                    Cancelar Agendamento
                  </a>
                </div>
              </CardContent>
            </Card>

            <a href={`/agendamento/${config.client_slug}`} className="block">
              <Button variant="ghost" className="border border-slate-200 bg-white font-semibold">
                Voltar à Página Inicial
              </Button>
            </a>
          </div>
        )}
      </main>

      {/* Footer simples do Portal */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex-shrink-0 mt-8">
        Powered by BarberCentral
      </footer>
    </div>
  )
}
