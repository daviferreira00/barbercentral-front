"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"

// Estado do formulário de novo profissional (views desktop e mobile)
export function useNovoProfissional() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("active")

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name) {
      setSaveError("O nome é obrigatório.")
      return
    }

    setSaving(true)
    const res = await http.post<{ id: string }>("/professionals", {
      name,
      bio: bio ? bio : null,
      status,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    // Redireciona para o detalhe para poder customizar serviços e fotos
    if (res.data) {
      router.push(`/cliente/profissionais/${res.data.id}`)
    }
  }

  return { name, setName, bio, setBio, status, setStatus, saving, saveError, handleSubmit }
}
