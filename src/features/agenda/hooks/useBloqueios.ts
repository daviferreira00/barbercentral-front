"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { Professional, BlockedSlot } from "../types"

// Estado e ações da tela de bloqueios de agenda (views desktop e mobile)
export function useBloqueios() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)

  // Form Fields
  const [professionalId, setProfessionalId] = useState<string>("all") // "all" = toda a barbearia
  const [date, setDate] = useState(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  const [startTime, setStartTime] = useState("12:00")
  const [endTime, setEndTime] = useState("13:00")
  const [reason, setReason] = useState("")

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const resProf = await http.get<Professional[]>("/professionals")
    const resBlock = await http.get<BlockedSlot[]>("/blocked-slots")
    setLoading(false)

    if (resProf.data) setProfessionals(resProf.data)
    if (resBlock.data) setBlockedSlots(resBlock.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)
    setSuccessMsg(null)

    if (!date || !startTime || !endTime) {
      setSaveError("Data, horário de início e término são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.post("/blocked-slots", {
      professional_id: professionalId === "all" ? null : professionalId,
      date,
      start_time: startTime.length === 5 ? `${startTime}:00` : startTime,
      end_time: endTime.length === 5 ? `${endTime}:00` : endTime,
      reason: reason ? reason : null,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    setSuccessMsg("Horário bloqueado com sucesso na agenda!")
    setReason("")
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este bloqueio?")) return

    const res = await http.delete(`/blocked-slots/${id}`)
    if (res.error) {
      alert(res.error.message)
      return
    }
    loadData()
  }

  return {
    professionals,
    blockedSlots,
    loading,
    professionalId,
    setProfessionalId,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    reason,
    setReason,
    saving,
    saveError,
    successMsg,
    handleSubmit,
    handleDelete,
  }
}
