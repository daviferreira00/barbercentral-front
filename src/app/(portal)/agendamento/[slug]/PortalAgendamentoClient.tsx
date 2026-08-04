"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { maskPhone } from "@/shared/lib/utils"

interface PublicClientData {
  client_id: string
  client_name: string
  client_slug: string
  logo_url?: string
  logo_central?: string
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
  whatsapp_verification_enabled?: number
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
  // Preenchidos pelo backend quando o cliente escolheu "Qualquer Profissional":
  // indicam qual profissional está de fato livre nesse horário.
  professional_id?: string
  professional_name?: string
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
  { step: 1, label: "Profissional" },
  { step: 2, label: "Serviços" },
  { step: 3, label: "Data e Hora" },
  { step: 4, label: "Seus dados" },
  { step: 5, label: "Confirmação" },
]

// Helper para formatar data YYYY-MM-DD local sem shift de timezone
const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const resolvePublicAssetUrl = (url?: string) => {
  if (!url) return ""
  try {
    const parsed = new URL(url)
    if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && parsed.pathname.startsWith("/uploads/")) {
      return `/backend-uploads/${parsed.pathname.slice("/uploads/".length)}`
    }
  } catch {
    // URLs relativas já são servidas pelo diretório public do frontend.
  }
  return url
}

export default function PortalAgendamentoClient({ config }: { config: PublicClientData }) {
  const [step, setStep] = useState(1)

  // API Data
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Selection states
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null) // null = Tanto faz
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)

  // Form states
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [notes, setNotes] = useState("")

  // Status states
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successApp, setSuccessApp] = useState<AppointmentResponse | null>(null)
  const [watermarkFailed, setWatermarkFailed] = useState(false)

  // Verification states
  const [showVerificationStep, setShowVerificationStep] = useState(false)
  const [verificationCodeInput, setVerificationCodeInput] = useState("")
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  // Filter state for services
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("")

  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth())

  const getDaysForCalendar = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayIndex = new Date(year, month, 1).getDay()
    
    const calendarDays: (Date | null)[] = []
    
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day))
    }
    
    return calendarDays
  }

  // Todos os serviços precisam ficar com o mesmo profissional: se o cliente
  // escolheu "Qualquer Profissional", o profissional real só é conhecido
  // depois de escolher o horário (o backend resolve quem está livre).
  const resolvedProfessionalId = selectedProf ? selectedProf.id : selectedSlot?.professional_id || ""
  const resolvedProfessionalName = selectedProf
    ? selectedProf.name
    : selectedSlot?.professional_name || "Qualquer Profissional"

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)

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

  // Carrega slots disponíveis (soma a duração de todos os serviços escolhidos)
  const loadSlots = async (date: Date) => {
    if (selectedServices.length === 0) return
    setLoadingSlots(true)
    setErrorMsg(null)

    const dateStr = getLocalDateString(date)
    const profParam = selectedProf ? `&professional_id=${selectedProf.id}` : ""
    const svcParam = selectedServices.map((s) => `&service_ids=${s.id}`).join("")

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

  const handleProfSelect = (prof: Professional | null) => {
    setSelectedProf(prof)
    setStep(2)
  }

  const toggleService = (svc: Service) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === svc.id) ? prev.filter((s) => s.id !== svc.id) : [...prev, svc]
    )
  }

  const handleServicesContinue = () => {
    if (selectedServices.length === 0) return
    setStep(3)
    // Reseta data/hora ao mudar a seleção de serviços
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

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !customerPhone) {
      setErrorMsg("Por favor, preencha todos os campos obrigatórios.")
      return
    }
    setErrorMsg(null)
    setVerificationError(null)

    if (config.whatsapp_verification_enabled === 1) {
      setVerifying(true)
      const res = await http.post<{ ok: boolean }>(`/public/${config.client_slug}/verification-code`, {
        phone: customerPhone,
      })
      setVerifying(false)
      if (res.error) {
        setErrorMsg("Erro ao enviar código de verificação por WhatsApp: " + res.error.message)
        return
      }
      setShowVerificationStep(true)
    } else {
      setStep(5)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!verificationCodeInput) {
      setVerificationError("Por favor, digite o código de 6 dígitos.")
      return
    }
    setVerificationError(null)
    setVerifying(true)

    const res = await http.post<{ verified: boolean }>(`/public/${config.client_slug}/verify-code`, {
      phone: customerPhone,
      code: verificationCodeInput,
    })
    setVerifying(false)

    if (res.error) {
      setVerificationError(res.error.message || "Código incorreto ou expirado. Tente novamente.")
      return
    }

    if (res.data?.verified) {
      setShowVerificationStep(false)
      await handleConfirmBooking()
    }
  }

  const handleResendCode = async () => {
    setVerificationError(null)
    setVerifying(true)
    const res = await http.post<{ ok: boolean }>(`/public/${config.client_slug}/verification-code`, {
      phone: customerPhone,
    })
    setVerifying(false)
    if (res.error) {
      setVerificationError("Erro ao reenviar código: " + res.error.message)
      return
    }
    setVerificationCodeInput("")
  }

  const handleConfirmBooking = async () => {
    if (selectedServices.length === 0 || !selectedDate || !selectedSlot || !resolvedProfessionalId) return

    setSubmitting(true)
    setErrorMsg(null)

    const dateStr = getLocalDateString(selectedDate)
    const res = await http.post<AppointmentResponse>(`/public/${config.client_slug}/appointments`, {
      professional_id: resolvedProfessionalId,
      service_ids: selectedServices.map((s) => s.id),
      date: dateStr,
      start_time: selectedSlot.start_time,
      customer_name: customerName,
      customer_phone: customerPhone,
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
    const serviceNames = selectedServices.map((s) => s.name).join(" + ")
    const text = encodeURIComponent(`${serviceNames} - ${config.client_name}`)
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
                <img src={resolvePublicAssetUrl(config.logo_url)} alt="Logo" className="h-full w-full object-contain p-1" />
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
      <main className="relative flex-1 w-full overflow-hidden">
        {config.logo_central && !watermarkFailed && (
          <img
            src={resolvePublicAssetUrl(config.logo_central)}
            alt=""
            aria-hidden="true"
            onError={() => setWatermarkFailed(true)}
            className="pointer-events-none fixed left-1/2 top-[58%] z-0 max-h-[65vh] w-[clamp(360px,92vw,400px)] md:w-[clamp(520px,78vw,680px)] lg:w-[clamp(420px,32vw,520px)] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.05]"
          />
        )}
        <div className="relative z-10 w-full max-w-2xl mx-auto p-4 md:py-8 space-y-6">
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

        {/* STEP 1: Seleção de Profissional */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800">Quem vai te atender?</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Opção Qualquer Profissional */}
              <Card
                onClick={() => handleProfSelect(null)}
                className="w-full max-w-56 mx-auto lg:max-w-none hover:border-slate-300 transition duration-150 cursor-pointer text-center group border-dashed active:scale-[0.99]"
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
                  className="w-full max-w-56 mx-auto lg:max-w-none hover:border-slate-300 transition duration-150 cursor-pointer text-center group active:scale-[0.99]"
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

        {/* STEP 2: Seleção de Serviços (múltiplos) */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep(1)} className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">Selecione os Serviços</h2>
            </div>

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
                {filteredServices.map((svc) => {
                  const isSelected = selectedServices.some((s) => s.id === svc.id)
                  return (
                    <Card
                      key={svc.id}
                      onClick={() => toggleService(svc)}
                      className={`transition duration-150 cursor-pointer active:scale-[0.99] ${
                        isSelected ? "border-slate-900 shadow-md" : "hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      <CardContent className="p-4 flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-5 w-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                              isSelected ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && <i className="ti ti-check text-white text-xs" />}
                          </div>
                          <div className="min-w-0 pr-2">
                            <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{svc.name}</h3>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{svc.description}</p>
                            <span className="text-[10px] font-bold text-slate-500 mt-2 block bg-slate-100 w-fit px-2 py-0.5 rounded-md">
                              {svc.duration_minutes} minutos
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-slate-800 block">
                            R$ {svc.price.toFixed(2)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Barra de resumo + Continuar (fixa ao fim da lista) */}
            {selectedServices.length > 0 && (
              <div className="sticky bottom-4 bg-white border border-slate-200 rounded-xl shadow-lg p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">
                    {selectedServices.length} {selectedServices.length === 1 ? "serviço" : "serviços"} · {totalDuration} min
                  </p>
                  <p className="text-base font-extrabold text-slate-800">R$ {totalPrice.toFixed(2)}</p>
                </div>
                <Button
                  onClick={handleServicesContinue}
                  className="font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--bc-secondary)" }}
                >
                  Continuar
                </Button>
              </div>
            )}
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

            {/* Calendário Mensal Responsivo */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Selecione o Dia</span>
              
              <div className="space-y-4 bg-slate-50/50 border border-slate-200/80 p-4 rounded-2xl shadow-sm max-w-md mx-auto sm:mx-0">
                {/* Mês/Ano e Navegação */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                    {(() => {
                      const label = new Date(calendarYear, calendarMonth).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                      return label.charAt(0).toUpperCase() + label.slice(1)
                    })()}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={calendarYear === new Date().getFullYear() && calendarMonth === new Date().getMonth()}
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11)
                          setCalendarYear(calendarYear - 1)
                        } else {
                          setCalendarMonth(calendarMonth - 1)
                        }
                      }}
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-200/50 rounded-lg cursor-pointer flex items-center justify-center border border-slate-200 bg-white"
                    >
                      <i className="ti ti-chevron-left text-sm" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={(() => {
                        const limitFuture = new Date(2028, 11, 31)
                        const nextMonthFirstDay = new Date(calendarYear, calendarMonth + 1, 1)
                        return nextMonthFirstDay > limitFuture
                      })()}
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0)
                          setCalendarYear(calendarYear + 1)
                        } else {
                          setCalendarMonth(calendarMonth + 1)
                        }
                      }}
                      className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-200/50 rounded-lg cursor-pointer flex items-center justify-center border border-slate-200 bg-white"
                    >
                      <i className="ti ti-chevron-right text-sm" />
                    </Button>
                  </div>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Dom</span>
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1.5 text-center mt-1">
                  {getDaysForCalendar(calendarYear, calendarMonth).map((day, idx) => {
                    if (day === null) {
                      return <div key={`empty-${idx}`} className="h-8 w-8 sm:h-9 sm:w-9" />
                    }

                    const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString()
                    
                    const todayDate = new Date()
                    todayDate.setHours(0, 0, 0, 0)
                    const isToday = day.toDateString() === todayDate.toDateString()
                    
                    const isPast = day < todayDate
                    
                    const limitFuture = new Date(2028, 11, 31)
                    const isTooFar = day > limitFuture
                    
                    const isDisabled = isPast || isTooFar

                    return (
                      <button
                        key={`day-${day.getDate()}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleDateSelect(day)}
                        style={isSelected ? { backgroundColor: "var(--bc-primary)", color: "#fff" } : isToday ? { borderColor: "var(--bc-primary)", color: "var(--bc-primary)" } : undefined}
                        className={`h-8 w-8 sm:h-9 sm:w-9 text-xs font-bold rounded-lg flex items-center justify-center transition active:scale-90 select-none ${
                          isSelected
                            ? "shadow-md font-extrabold"
                            : isToday
                            ? "border font-extrabold hover:bg-slate-100/50"
                            : isDisabled
                            ? "text-slate-300 cursor-not-allowed bg-slate-50/10 opacity-40"
                            : "text-slate-700 hover:bg-slate-150/60 border border-slate-200/50"
                        }`}
                      >
                        {day.getDate()}
                      </button>
                    )
                  })}
                </div>
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
                        className="h-10 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition active:scale-95 flex-col gap-0"
                      >
                        <span>{slot.start_time}</span>
                        {!selectedProf && slot.professional_name && (
                          <span className="text-[9px] font-semibold text-slate-400 leading-none mt-0.5">
                            {slot.professional_name}
                          </span>
                        )}
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
              <Button
                variant="ghost"
                onClick={() => {
                  if (showVerificationStep) {
                    setShowVerificationStep(false)
                  } else {
                    setStep(3)
                  }
                }}
                className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white"
              >
                <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
              </Button>
              <h2 className="text-lg font-extrabold text-slate-800">
                {showVerificationStep ? "Confirmação do WhatsApp" : "Preencha seus dados"}
              </h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                {showVerificationStep ? (
                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                      Enviamos um código de verificação de 6 dígitos via WhatsApp para o número <strong className="text-slate-700">{customerPhone}</strong>. Insira o código abaixo para confirmar o número e prosseguir.
                    </p>

                    {verificationError && <Alert variant="error" message={verificationError} />}

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Código de 6 dígitos</label>
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-xl font-bold tracking-[8px] h-12"
                        value={verificationCodeInput}
                        onChange={(e) => setVerificationCodeInput(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={verifying} className="w-full font-bold h-11">
                      {verifying ? "Verificando..." : "Confirmar Código"}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={verifying}
                        className="text-xs font-bold text-indigo-600 hover:underline hover:text-indigo-700 transition"
                      >
                        Não recebeu o código? Reenviar código
                      </button>
                    </div>
                  </form>
                ) : (
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
                        placeholder="Ex: (11) 99999-9999"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(maskPhone(e.target.value))}
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

                    <Button type="submit" disabled={verifying} className="w-full font-bold">
                      {verifying ? "Enviando código..." : "Continuar"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* STEP 5: Confirmar Reserva */}
        {step === 5 && selectedServices.length > 0 && selectedDate && selectedSlot && (
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
                      {resolvedProfessionalName}
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
                  {selectedServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg font-semibold"
                    >
                      <span className="text-xs text-slate-600">{svc.name} ({svc.duration_minutes} min)</span>
                      <span className="text-sm font-extrabold text-slate-800">R$ {svc.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs font-bold text-slate-500">Total ({totalDuration} min)</span>
                    <span className="text-base font-extrabold text-slate-800">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Seus Dados</span>
                  <p className="text-xs font-bold text-slate-700">{customerName}</p>
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
        {step === 6 && successApp && selectedServices.length > 0 && selectedDate && (
          <div className="space-y-6 text-center py-6 animate-fade-in">
            {/* Ícone Sucesso */}
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">
              <i className="ti ti-check" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-800">Horário Agendado!</h2>
              <p className="text-sm text-slate-500 mt-2">
                Tudo pronto, {customerName}! Seu horário na barbearia {config.client_name} está garantido.
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Serviços</span>
                  {selectedServices.map((svc) => (
                    <div key={svc.id} className="flex justify-between items-center font-bold text-slate-800">
                      <span>{svc.name}</span>
                      <span>R$ {svc.price.toFixed(2)}</span>
                    </div>
                  ))}
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
        </div>
      </main>

      {/* Footer simples do Portal */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex-shrink-0 mt-8">
        Powered by BarberCentral
      </footer>
    </div>
  )
}
