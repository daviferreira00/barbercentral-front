"use client"

import { useState } from "react"
import { useApp } from "@/shared/context/AppContext"
import { http } from "@/shared/lib/http"
import {
  Scissors,
  Clock,
  Briefcase,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Phone,
  DollarSign,
} from "lucide-react"

interface WizardOnboardingProps {
  isOpen: boolean
  onClose: () => void
}

export function WizardOnboarding({ isOpen, onClose }: WizardOnboardingProps) {
  const { user, finishWizard } = useApp()

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Barbearia
  const [barberName, setBarberName] = useState(user?.name || "")
  const [phone, setPhone] = useState("")

  // Step 2: Horários
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ])
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("19:00")

  // Step 3: Primeiro Serviço
  const [serviceName, setServiceName] = useState("Corte Masculino")
  const [price, setPrice] = useState("35.00")
  const [duration, setDuration] = useState("30")

  // Step 4: Equipe
  const [ownerName, setOwnerName] = useState(user?.name || "")

  if (!isOpen) return null

  const daysList = [
    { id: "Segunda", label: "Seg" },
    { id: "Terça", label: "Ter" },
    { id: "Quarta", label: "Qua" },
    { id: "Quinta", label: "Qui" },
    { id: "Sexta", label: "Sex" },
    { id: "Sábado", label: "Sáb" },
    { id: "Domingo", label: "Dom" },
  ]

  const toggleDay = (dayId: string) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId))
    } else {
      setSelectedDays([...selectedDays, dayId])
    }
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleFinish = async () => {
    setSubmitting(true)

    try {
      // 1. Cria o primeiro serviço no backend se preenchido
      if (serviceName.trim()) {
        const parsedPrice = parseFloat(price) || 35.0
        const parsedDuration = parseInt(duration) || 30
        await http.post("/services", {
          name: serviceName,
          price: parsedPrice,
          duration_minutes: parsedDuration,
          allow_online_booking: true,
        }).catch(() => null)
      }

      // 2. Cria / Atualiza o primeiro profissional se informado
      if (ownerName.trim()) {
        await http.post("/professionals", {
          name: ownerName,
          phone: phone,
          commission_rate: 0,
        }).catch(() => null)
      }

      // 3. Atualiza dados de config da barbearia se informado
      if (barberName.trim() || phone.trim()) {
        await http.put("/config", {
          phone: phone,
          whatsapp: phone,
        }).catch(() => null)
      }

      // 4. Conclui o wizard
      await finishWizard({
        barber_name: barberName,
        phone,
        service_name: serviceName,
        price: parseFloat(price) || 35.0,
        duration: parseInt(duration) || 30,
        owner_name: ownerName,
      })

      setSubmitting(false)
      onClose()
    } catch (err) {
      setSubmitting(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Wizard */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configuração Inicial da Barbearia</h2>
              <p className="text-xs text-slate-400">
                Sua barbearia pronta para agendamentos em menos de 90 segundos!
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Passo {step} de 4
          </span>
        </div>

        {/* Indicador de Progresso em Passos */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className={`flex items-center gap-2 font-medium ${step >= 1 ? "text-amber-400" : "text-slate-500"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}>
              1
            </div>
            <span className="hidden sm:inline">1. Barbearia</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800" />

          <div className={`flex items-center gap-2 font-medium ${step >= 2 ? "text-amber-400" : "text-slate-500"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}>
              2
            </div>
            <span className="hidden sm:inline">2. Horários</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800" />

          <div className={`flex items-center gap-2 font-medium ${step >= 3 ? "text-amber-400" : "text-slate-500"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}>
              3
            </div>
            <span className="hidden sm:inline">3. Serviços</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800" />

          <div className={`flex items-center gap-2 font-medium ${step >= 4 ? "text-amber-400" : "text-slate-500"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}>
              4
            </div>
            <span className="hidden sm:inline">4. Equipe</span>
          </div>
        </div>

        {/* Conteúdo dos Passos */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center gap-3 text-amber-400">
                <Building2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Etapa 1: Dados da sua Barbearia</h3>
              </div>
              <p className="text-xs text-slate-400">
                Informe o nome fantasia da barbearia e o WhatsApp pelo qual os clientes receberão lembretes.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome da Barbearia
                  </label>
                  <input
                    type="text"
                    value={barberName}
                    onChange={(e) => setBarberName(e.target.value)}
                    placeholder="Ex: Barbearia Central"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp de Atendimento da Barbearia
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center gap-3 text-amber-400">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Etapa 2: Horários de Funcionamento</h3>
              </div>
              <p className="text-xs text-slate-400">
                Selecione os dias da semana em que sua barbearia abre e defina o horário de atendimento.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Dias de Funcionamento
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {daysList.map((day) => {
                      const active = selectedDays.includes(day.id)
                      return (
                        <button
                          key={day.id}
                          type="button"
                          onClick={() => toggleDay(day.id)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            active
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700"
                          }`}
                        >
                          {day.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Horário de Abertura
                    </label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => setOpenTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => setCloseTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center gap-3 text-amber-400">
                <Scissors className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Etapa 3: Cadastrar Primeiro Serviço</h3>
              </div>
              <p className="text-xs text-slate-400">
                Cadastre o primeiro serviço do seu catálogo para permitir agendamento imediato.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome do Serviço
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="Ex: Corte Masculino"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Preço (R$)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="35.00"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Duração (minutos)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="30"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center gap-3 text-amber-400">
                <UserCheck className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Etapa 4: Barbeiro Principal</h3>
              </div>
              <p className="text-xs text-slate-400">
                Confirme seu nome como o primeiro profissional a atender na barbearia.
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome do Barbeiro / Proprietário
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ex: Pedro Silva"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm">Tudo pronto para receber clientes!</span>
                    <span>
                      Ao clicar em concluir, sua agenda e link de agendamento online estarão ativos imediatamente.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botoes de Navegação do Wizard */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              <span>Próximo Passo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {submitting ? (
                <span>Salvando configurações...</span>
              ) : (
                <>
                  <span>Concluir & Acessar Sistema 🚀</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
