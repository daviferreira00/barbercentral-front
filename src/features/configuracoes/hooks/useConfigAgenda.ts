"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { http } from "@/shared/lib/http"

export interface Professional {
  id: string
  name: string
}

export interface ProfessionalSchedule {
  id?: string
  professional_id?: string
  client_id?: string
  weekday: number
  start_time: string
  end_time: string
  enabled: number
}

export const WEEKDAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
]

export function useConfigAgenda() {
  const searchParams = useSearchParams()
  const initialProfId = searchParams.get("professional_id") || ""

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfId, setSelectedProfId] = useState(initialProfId)
  const [schedules, setSchedules] = useState<ProfessionalSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadProfessionals = async () => {
    const res = await http.get<Professional[]>("/professionals")
    if (res.data) {
      setProfessionals(res.data)
      if (!selectedProfId && res.data.length > 0) {
        setSelectedProfId(res.data[0].id)
      }
    }
  }

  const loadSchedules = async () => {
    if (!selectedProfId) return
    setLoading(true)
    setSuccessMsg(null)
    setErrorMsg(null)
    const res = await http.get<ProfessionalSchedule[]>(`/professionals/${selectedProfId}/schedule`)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      const current = res.data
      const filled: ProfessionalSchedule[] = []

      for (const w of WEEKDAYS) {
        const match = current.find((s) => s.weekday === w.value)
        if (match) {
          filled.push(match)
        } else {
          filled.push({
            weekday: w.value,
            start_time: "09:00:00",
            end_time: "19:00:00",
            enabled: 0,
          })
        }
      }

      setSchedules(filled)
    }
  }

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    loadSchedules()
  }, [selectedProfId])

  const handleCheckboxChange = (weekday: number, checked: boolean) => {
    setSchedules(
      schedules.map((s) => (s.weekday === weekday ? { ...s, enabled: checked ? 1 : 0 } : s))
    )
  }

  const handleTimeChange = (weekday: number, field: "start_time" | "end_time", val: string) => {
    const timeVal = val.length === 5 ? `${val}:00` : val
    setSchedules(
      schedules.map((s) => (s.weekday === weekday ? { ...s, [field]: timeVal } : s))
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)

    setSaving(true)
    const res = await http.put(`/professionals/${selectedProfId}/schedule`, {
      schedules: schedules,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccessMsg("Grade semanal de horários salva com sucesso!")
    loadSchedules()
  }

  const formatTimeToShow = (t: string) => {
    if (!t) return ""
    return t.substring(0, 5)
  }

  return {
    professionals,
    selectedProfId,
    setSelectedProfId,
    schedules,
    loading,
    saving,
    errorMsg,
    successMsg,
    handleCheckboxChange,
    handleTimeChange,
    handleSave,
    formatTimeToShow,
  }
}
