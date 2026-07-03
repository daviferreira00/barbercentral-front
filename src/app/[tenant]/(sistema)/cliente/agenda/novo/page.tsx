"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
}

interface Professional {
  id: string
  name: string
}

interface TimeSlot {
  start_time: string
  end_time: string
}

export default function NovoAgendamentoPainelPage() {
  const router = useRouter()

  // API Lists
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Selection states
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedProfId, setSelectedProfId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  // Customer search / form
  const [searchCustQuery, setSearchCustQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null)
  
  // Manual customer fields (for avulso or new)
  const [custName, setCustName] = useState("")
  const [custPhone, setCustPhone] = useState("")
  const [custEmail, setCustEmail] = useState("")
  const [isManualCust, setIsManualCust] = useState(false)

  // Status states
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load services and professionals on mount
  const loadInitialData = async () => {
    setLoadingInitial(true)
    const resSvc = await http.get<Service[]>("/services")
    const resProf = await http.get<Professional[]>("/professionals")
    setLoadingInitial(false)

    if (resSvc.data) setServices(resSvc.data)
    if (resProf.data) {
      setProfessionals(resProf.data)
      if (resProf.data.length > 0) setSelectedProfId(resProf.data[0].id)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Autocomplete search of customers
  useEffect(() => {
    if (searchCustQuery.length < 3) {
      setSearchResults([])
      return
    }
    const handler = setTimeout(async () => {
      const res = await http.get<Customer[]>(`/customers/search?q=${encodeURIComponent(searchCustQuery)}`)
      if (res.data) {
        setSearchResults(res.data)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchCustQuery])

  // Availability check
  const checkSlots = async () => {
    if (selectedServices.length === 0 || !selectedProfId || !selectedDate) {
      setSlots([])
      return
    }

    setLoadingSlots(true)
    setErrorMsg(null)

    const svcParam = selectedServices.map((id) => `service_ids=${id}`).join("&")
    const res = await http.get<TimeSlot[]>(
      `/appointments/availability?date=${selectedDate}&professional_id=${selectedProfId}&${svcParam}`
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
    checkSlots()
  }, [selectedServices, selectedProfId, selectedDate])

  const handleSelectCustomerFromSearch = (cust: Customer) => {
    setSelectedCust(cust)
    setCustName(cust.name)
    setCustPhone(cust.phone)
    setCustEmail(cust.email || "")
    setSearchCustQuery("")
    setSearchResults([])
    setIsManualCust(false)
  }

  const handleToggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setSelectedTime("") // reset selected time if services change
  }

  const calculateTotals = () => {
    let price = 0
    let duration = 0
    selectedServices.forEach((id) => {
      const svc = services.find((s) => s.id === id)
      if (svc) {
        price += svc.price
        duration += svc.duration_minutes
      }
    })
    return { price, duration }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServices.length === 0 || !selectedProfId || !selectedDate || !selectedTime) {
      setErrorMsg("Selecione serviços, profissional, data e horário.")
      return
    }

    if (!isManualCust && !selectedCust) {
      setErrorMsg("Busque e selecione um cliente ou marque a opção de preencher manualmente.")
      return
    }

    if (isManualCust && (!custName || !custPhone)) {
      setErrorMsg("Preencha nome e telefone do cliente avulso.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const res = await http.post("/appointments", {
      customer_id: isManualCust ? null : selectedCust?.id,
      customer_name: custName ? custName : null,
      customer_phone: custPhone ? custPhone : null,
      customer_email: custEmail ? custEmail : null,
      professional_id: selectedProfId,
      service_ids: selectedServices,
      date: selectedDate,
      start_time: selectedTime,
      notes: notes ? notes : null,
    })
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/agenda")
  }

  const { price: totalPrice, duration: totalDuration } = calculateTotals()

  if (loadingInitial) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
      {/* Topo com retorno */}
      <div className="flex items-center gap-3">
        <Link href="/cliente/agenda">
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
            <i className="ti ti-arrow-left text-sm mr-1" /> Voltar à Agenda
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Novo Agendamento</h1>
          <p className="text-xs text-slate-500 mt-0.5">Agende um horário diretamente pelo painel administrativo.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário (Esquerda) */}
        <div className="lg:col-span-8 space-y-6 pb-24 md:pb-0">
          {/* Seção 1: Cliente */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">1. Cliente</h2>

              {!isManualCust ? (
                <div className="space-y-4">
                  {selectedCust ? (
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{selectedCust.name}</p>
                        <p className="text-xs text-slate-400">{selectedCust.phone} {selectedCust.email && `• ${selectedCust.email}`}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCust(null)}
                        className="text-red-500 hover:text-red-600 h-8 text-xs font-bold"
                      >
                        Limpar
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Buscar Cliente Cadastrado</label>
                      <Input
                        placeholder="Digite pelo menos 3 caracteres do nome ou telefone..."
                        value={searchCustQuery}
                        onChange={(e) => setSearchCustQuery(e.target.value)}
                        className="pl-9"
                      />
                      <i className="ti ti-search absolute left-3 top-[34px] text-slate-400" />

                      {/* Dropdown Resultados */}
                      {searchResults.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                          {searchResults.map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() => handleSelectCustomerFromSearch(cust)}
                              className="p-3 hover:bg-slate-50 transition cursor-pointer text-xs font-medium"
                            >
                              <p className="font-bold text-slate-800">{cust.name}</p>
                              <p className="text-slate-400 mt-0.5">{cust.phone}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="manual-toggle"
                      checked={isManualCust}
                      onCheckedChange={(c) => {
                        setIsManualCust(!!c)
                        if (c) setSelectedCust(null)
                      }}
                    />
                    <label htmlFor="manual-toggle" className="text-xs font-bold text-slate-600 cursor-pointer select-none">
                      Não cadastrado / Preencher manualmente
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                      <Input
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Ex: Pedro da Silva"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                      <Input
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="Ex: 11999999999"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">E-mail (Opcional)</label>
                    <Input
                      type="email"
                      value={custEmail}
                      onChange={(e) => setCustEmail(e.target.value)}
                      placeholder="Ex: pedro@email.com"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsManualCust(false)
                      setCustName("")
                      setCustPhone("")
                      setCustEmail("")
                    }}
                    className="text-xs font-bold h-8 text-slate-500 border border-slate-200 bg-white"
                  >
                    Voltar para busca
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção 2: Serviços */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">2. Serviços</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((svc) => {
                  const isChecked = selectedServices.includes(svc.id)
                  return (
                    <div
                      key={svc.id}
                      onClick={() => handleToggleService(svc.id)}
                      className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-white border-slate-100 hover:border-slate-300 text-slate-800"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs">{svc.name}</p>
                        <p className={`text-[10px] mt-0.5 ${isChecked ? "text-white/70" : "text-slate-400"}`}>
                          {svc.duration_minutes} min
                        </p>
                      </div>
                      <span className="font-extrabold text-xs">R$ {svc.price.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Profissional e Horário */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">3. Profissional e Horário</h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Profissional</label>
                  <Select value={selectedProfId} onValueChange={setSelectedProfId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o profissional" />
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
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime("")
                    }}
                  />
                </div>
              </div>

              {selectedDate && selectedServices.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Horários Disponíveis</span>

                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-100 p-3 rounded-lg">
                      Nenhum horário livre neste dia para o profissional selecionado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => {
                        const isTimeSelected = selectedTime === slot.start_time
                        return (
                          <Button
                            key={slot.start_time}
                            type="button"
                            variant="ghost"
                            onClick={() => setSelectedTime(slot.start_time)}
                            className={`h-9 text-xs font-bold border transition ${
                              isTimeSelected
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            {slot.start_time.substring(0, 5)}
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção 4: Observações */}
          <Card>
            <CardContent className="p-4 md:p-6 space-y-4">
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">4. Observações</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: O cliente solicitou lavagem prévia de cabelo..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
              />
            </CardContent>
          </Card>
        </div>

        {/* Resumo da Fatura / Sidebar (Direita) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <Card className="border-slate-200 shadow-lg">
              <CardContent className="p-5 space-y-4 text-sm text-slate-700">
                <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-2">Resumo da Reserva</h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                    <p className="font-bold text-slate-800 text-xs">
                      {isManualCust ? custName || "Avulso não preenchido" : selectedCust ? selectedCust.name : "Nenhum selecionado"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Serviços Selecionados</span>
                    {selectedServices.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhum serviço selecionado</p>
                    ) : (
                      <ul className="space-y-1 mt-1">
                        {selectedServices.map((id) => {
                          const s = services.find((x) => x.id === id)
                          return (
                            <li key={id} className="flex justify-between items-center text-xs font-semibold text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <span>{s?.name}</span>
                              <span className="font-bold text-slate-800">R$ {s?.price.toFixed(2)}</span>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Data</span>
                      <p className="font-bold text-slate-800 text-xs">
                        {selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Horário</span>
                      <p className="font-bold text-slate-800 text-xs">
                        {selectedTime ? selectedTime.substring(0, 5) : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Duração Total</span>
                    <span>{totalDuration} min</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold text-slate-800 border-t border-slate-200/50 pt-1.5">
                    <span>Valor Total</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full font-bold h-11 text-sm shadow-md transition active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processando...
                    </>
                  ) : (
                    "Agendar Horário"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Barra de Rodapé Fixa de Resumo (Somente Mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-40 lg:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">Total Estimado</span>
            <span className="text-sm font-extrabold text-slate-900 leading-none">R$ {totalPrice.toFixed(2)}</span>
            <span className="text-[9px] font-semibold text-slate-500 mt-1">{totalDuration} min</span>
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="h-10 text-xs font-bold px-6 shadow-md transition active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Agendando...
              </>
            ) : (
              "Agendar"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
