"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { Professional, Service, ProfessionalServiceLink } from "../types"

// Estado e ações do detalhe/edição de profissional (views desktop e mobile)
export function useProfissionalDetail(professionalId: string) {
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [links, setLinks] = useState<ProfessionalServiceLink[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Campos do formulário do Profissional
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("active")
  const [saving, setSaving] = useState(false)

  // Upload de Foto
  const [uploading, setUploading] = useState(false)

  // Dialog de Vínculo de Serviço
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [selectedServiceId, setSelectedServiceId] = useState("")
  const [customPrice, setCustomPrice] = useState("")
  const [customDuration, setCustomDuration] = useState("")
  const [linking, setLinking] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const resProf = await http.get<Professional>(`/professionals/${professionalId}`)
    const resServ = await http.get<Service[]>("/services")
    const resLinks = await http.get<ProfessionalServiceLink[]>(`/professionals/${professionalId}/services`)
    setLoading(false)

    if (resProf.error) {
      setErrorMsg(resProf.error.message)
      return
    }

    if (resProf.data) {
      setProfessional(resProf.data)
      setName(resProf.data.name)
      setBio(resProf.data.bio || "")
      setStatus(resProf.data.status)
    }

    if (resServ.data) setServices(resServ.data)
    if (resLinks.data) setLinks(resLinks.data)
  }

  useEffect(() => {
    loadData()
  }, [professionalId])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    setSaving(true)
    const res = await http.put<Professional>(`/professionals/${professionalId}`, {
      name,
      bio: bio ? bio : null,
      status,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setProfessional(res.data)
      alert("Perfil atualizado com sucesso!")
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg(null)

    const formData = new FormData()
    formData.append("photo", file)

    const res = await http.post<{ photo_url: string }>(`/professionals/${professionalId}/photo`, formData)
    setUploading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data && professional) {
      setProfessional({ ...professional, photo_url: res.data.photo_url })
    }
  }

  const handleLinkService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceId) return

    setLinking(true)
    const res = await http.post(`/professionals/${professionalId}/services`, {
      service_id: selectedServiceId,
      custom_price: customPrice ? parseFloat(customPrice) : null,
      custom_duration: customDuration ? parseInt(customDuration) : null,
    })
    setLinking(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    setIsLinkOpen(false)
    setSelectedServiceId("")
    setCustomPrice("")
    setCustomDuration("")
    loadData()
  }

  const handleUnlinkService = async (serviceId: string) => {
    if (!confirm("Tem certeza que deseja desvincular este serviço?")) return

    const res = await http.delete(`/professionals/${professionalId}/services/${serviceId}`)
    if (res.error) {
      alert(res.error.message)
      return
    }
    loadData()
  }

  // Filtra serviços que ainda não foram vinculados
  const unlinkedServices = services.filter((s) => !links.some((l) => l.service_id === s.id))

  return {
    professional,
    services,
    links,
    unlinkedServices,
    loading,
    errorMsg,
    name,
    setName,
    bio,
    setBio,
    status,
    setStatus,
    saving,
    uploading,
    isLinkOpen,
    setIsLinkOpen,
    selectedServiceId,
    setSelectedServiceId,
    customPrice,
    setCustomPrice,
    customDuration,
    setCustomDuration,
    linking,
    handleUpdateProfile,
    handlePhotoUpload,
    handleLinkService,
    handleUnlinkService,
  }
}
