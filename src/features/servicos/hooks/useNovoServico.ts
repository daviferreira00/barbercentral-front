"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import type { ServiceCategory } from "../types"

// Estado do formulário de novo serviço (views desktop e mobile)
export function useNovoServico() {
  const router = useRouter()

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30")
  const [price, setPrice] = useState("")
  const [active, setActive] = useState(1)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      const res = await http.get<ServiceCategory[]>("/service-categories")
      setLoading(false)
      if (res.data) setCategories(res.data)
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name || !price || !duration) {
      setSaveError("Nome, preço e duração são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.post("/services", {
      name,
      category_id: categoryId ? categoryId : null,
      description: description ? description : null,
      duration_minutes: parseInt(duration),
      price: parseFloat(price),
      active,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    router.push("/cliente/servicos")
  }

  return {
    categories,
    loading,
    name,
    setName,
    categoryId,
    setCategoryId,
    description,
    setDescription,
    duration,
    setDuration,
    price,
    setPrice,
    active,
    setActive,
    saving,
    saveError,
    handleSubmit,
  }
}
