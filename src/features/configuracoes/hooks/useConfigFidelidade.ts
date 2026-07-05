"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"

export interface LoyaltyProgram {
  id?: string
  name: string
  type: string
  stamps_to_reward?: number
  points_per_real?: number
  reward_description: string
  active: number
}

export function useConfigFidelidade() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Campos do form
  const [name, setName] = useState("")
  const [type, setType] = useState("stamps") // stamps, points
  const [stampsToReward, setStampsToReward] = useState("10")
  const [pointsPerReal, setPointsPerReal] = useState("1.0")
  const [rewardDescription, setRewardDescription] = useState("")
  const [active, setActive] = useState(true)

  const loadProgram = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await http.get<LoyaltyProgram>("/loyalty/program")
    setLoading(false)

    if (res.data) {
      setProgram(res.data)
      setName(res.data.name)
      setType(res.data.type)
      setStampsToReward(res.data.stamps_to_reward ? String(res.data.stamps_to_reward) : "10")
      setPointsPerReal(res.data.points_per_real ? String(res.data.points_per_real) : "1.0")
      setRewardDescription(res.data.reward_description)
      setActive(res.data.active === 1)
    } else {
      setName("Programa de Fidelidade Barber Club")
      setType("stamps")
      setStampsToReward("10")
      setPointsPerReal("1.0")
      setRewardDescription("Corte ou barba grátis após completar os requisitos!")
      setActive(false)
    }
  }

  useEffect(() => {
    loadProgram()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    const stampsNum = type === "stamps" ? parseInt(stampsToReward) : parseInt(stampsToReward) || 100
    const pointsNum = type === "points" ? parseFloat(pointsPerReal) : 0

    const body = {
      name,
      type,
      stamps_to_reward: stampsNum,
      points_per_real: pointsNum,
      reward_description: rewardDescription,
      active: active ? 1 : 0,
    }

    const res = await http.post<LoyaltyProgram>("/loyalty/program", body)
    setSaving(false)

    if (res.error) {
      if (res.error.message && res.error.message.includes("plan_feature_not_included")) {
        setErrorMsg("Seu plano atual não inclui a funcionalidade de Fidelidade. Faça upgrade para o plano Profissional ou Premium para habilitar!")
      } else {
        setErrorMsg(res.error.message || "Erro ao salvar programa de fidelidade")
      }
      return
    }

    if (res.data) {
      setProgram(res.data)
      setSuccessMsg("Programa de fidelidade configurado com sucesso!")
    }
  }

  return {
    program,
    loading,
    saving,
    successMsg,
    errorMsg,
    name,
    setName,
    type,
    setType,
    stampsToReward,
    setStampsToReward,
    pointsPerReal,
    setPointsPerReal,
    rewardDescription,
    setRewardDescription,
    active,
    setActive,
    handleSave,
  }
}
