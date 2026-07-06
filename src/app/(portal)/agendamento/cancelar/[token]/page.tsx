"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

interface EnrichedAppointment {
  id: string
  client_id: string
  professional_id: string
  professional_name: string
  date: string
  start_time: string
  end_time: string
  status: string
  customer_name?: string
  customer_email?: string
  services: {
    service_id: string
    service_name: string
    price: number
    duration_minutes: number
  }[]
}

export default function CancelamentoPage({ params }: { params: { token: string } }) {
  const token = params.token

  const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadAppointment = async () => {
    setLoading(true)
    const res = await http.get<EnrichedAppointment>(`/public/appointments/cancel/${token}`)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setAppointment(res.data)
    }
  }

  useEffect(() => {
    loadAppointment()
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await http.post(`/public/appointments/cancel/${token}`, {})
    setCancelling(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccessMsg("Seu agendamento foi cancelado com sucesso!")
    loadAppointment()
  }

  if (loading && !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
        <div className="h-14 w-14 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center text-2xl mx-auto shadow-sm">
          <i className="ti ti-calendar-off" />
        </div>

        {errorMsg && <Alert variant="error" message={errorMsg} />}
        {successMsg && <Alert variant="success" message={successMsg} />}

        {appointment && (
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">Cancelar Agendamento</h1>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Confirme as informações abaixo antes de solicitar o cancelamento.
              </p>
            </div>

            <Card className="text-left bg-slate-50/50 border-slate-100">
              <CardContent className="p-4 space-y-3 text-xs text-slate-700 font-medium">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cliente</span>
                  <p className="font-extrabold text-slate-800">{appointment.customer_name || "Não informado"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200/40 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Data e Hora</span>
                    <p className="font-extrabold text-slate-800">
                      {new Date(appointment.date.split("T")[0] + "T00:00:00").toLocaleDateString("pt-BR")} às {appointment.start_time.substring(0, 5)}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Profissional</span>
                    <p className="font-extrabold text-slate-800">{appointment.professional_name}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200/40 pt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Serviços</span>
                  <p className="font-extrabold text-slate-800 leading-tight">
                    {appointment.services.map((s) => s.service_name).join(", ")}
                  </p>
                </div>

                <div className="border-t border-slate-200/40 pt-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold border capitalize ${
                        appointment.status === "cancelled"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {appointment.status === "cancelled" ? "Cancelado" : appointment.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {appointment.status !== "cancelled" && !successMsg && (
              <Button
                onClick={handleCancel}
                className="w-full font-bold h-11 text-sm bg-red-600 hover:bg-red-700 text-white shadow-md transition active:scale-[0.98]"
                disabled={cancelling}
              >
                {cancelling ? "Processando cancelamento..." : "Sim, Cancelar Agendamento"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
