"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"

export interface ClientConfig {
  client_id: string
  logo_url?: string
  logo_central?: string
  color_primary: string
  color_secondary: string
  color_button?: string
  background_type?: string
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

export const FONTS = [
  { value: "Inter", label: "Inter (Sleek/Modern)" },
  { value: "Outfit", label: "Outfit (Premium/Round)" },
  { value: "Roboto", label: "Roboto (Standard/Clean)" },
  { value: "Playfair Display", label: "Playfair (Classic/Barber)" },
]

export function useConfigIdentidadeVisual() {
  const [config, setConfig] = useState<ClientConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [logoUrl, setLogoUrl] = useState("")
  const [logoCentral, setLogoCentral] = useState("")
  const [colorPrimary, setColorPrimary] = useState("#1a1a1a")
  const [colorSecondary, setColorSecondary] = useState("#c9a84c")
  const [colorButton, setColorButton] = useState("#1a1a1a")
  const [backgroundType, setBackgroundType] = useState("gradient")
  const [fontFamily, setFontFamily] = useState("Inter")

  const [address, setAddress] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [instagram, setInstagram] = useState("")
  const [timezone, setTimezone] = useState("America/Sao_Paulo")
  const [cancelHours, setCancelHours] = useState("2")
  const [requiresLogin, setRequiresLogin] = useState(false)
  const [minAdvance, setMinAdvance] = useState("1")
  const [maxAdvance, setMaxAdvance] = useState("30")
  const [interval, setInterval] = useState("15")

  const loadConfig = async () => {
    setLoading(true)
    const res = await http.get<ClientConfig>("/config")
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      const c = res.data
      setConfig(c)
      setLogoUrl(c.logo_url || "")
      setLogoCentral(c.logo_central || "")
      setColorPrimary(c.color_primary || "#1a1a1a")
      setColorSecondary(c.color_secondary || "#c9a84c")
      setColorButton(c.color_button || c.color_primary || "#1a1a1a")
      setBackgroundType(c.background_type || "gradient")
      setFontFamily(c.font_family || "Inter")
      setAddress(c.address || "")
      setNeighborhood(c.neighborhood || "")
      setCity(c.city || "")
      setState(c.state || "")
      setPhone(c.phone || "")
      setWhatsapp(c.whatsapp || "")
      setInstagram(c.instagram || "")
      setTimezone(c.timezone)
      setCancelHours(c.cancellation_policy_hours.toString())
      setRequiresLogin(c.booking_requires_login === 1)
      setMinAdvance(c.min_advance_hours.toString())
      setMaxAdvance(c.max_advance_days.toString())
      setInterval(c.interval_between_minutes.toString())
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "header" | "central") => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      if (type === "header") {
        setLogoUrl(base64String)
      } else {
        setLogoCentral(base64String)
      }
      setUploading(false)
    }
    reader.onerror = () => {
      setErrorMsg("Erro ao ler o arquivo de imagem")
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await http.put<ClientConfig>("/config", {
      color_primary: colorPrimary,
      color_secondary: colorSecondary,
      color_button: colorButton,
      background_type: backgroundType,
      font_family: fontFamily,
      logo_url: logoUrl || null,
      logo_central: logoCentral || null,
      address: address ? address : null,
      neighborhood: neighborhood ? neighborhood : null,
      city: city ? city : null,
      state: state ? state : null,
      phone: phone ? phone : null,
      whatsapp: whatsapp ? whatsapp : null,
      instagram: instagram ? instagram : null,
      timezone,
      cancellation_policy_hours: parseInt(cancelHours) || 2,
      booking_requires_login: requiresLogin ? 1 : 0,
      min_advance_hours: parseInt(minAdvance) || 1,
      max_advance_days: parseInt(maxAdvance) || 30,
      interval_between_minutes: parseInt(interval) || 0,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccessMsg("Configurações atualizadas com sucesso!")
    loadConfig()
  }

  return {
    config,
    loading,
    saving,
    uploading,
    errorMsg,
    successMsg,
    logoUrl,
    logoCentral,
    colorPrimary,
    setColorPrimary,
    colorSecondary,
    setColorSecondary,
    colorButton,
    setColorButton,
    backgroundType,
    setBackgroundType,
    fontFamily,
    setFontFamily,
    address,
    setAddress,
    neighborhood,
    setNeighborhood,
    city,
    setCity,
    state,
    setState,
    phone,
    setPhone,
    whatsapp,
    setWhatsapp,
    instagram,
    setInstagram,
    timezone,
    cancelHours,
    setCancelHours,
    requiresLogin,
    setRequiresLogin,
    minAdvance,
    setMinAdvance,
    maxAdvance,
    setMaxAdvance,
    interval,
    setInterval,
    handleLogoUpload,
    handleSubmit,
  }
}
