"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { Service, ServiceCategory } from "../types"

// Estado e ações da listagem de serviços (views desktop e mobile)
export function useServicosList() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Dialog de Categoria
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const url = categoryFilter ? `/services?category_id=${categoryFilter}` : "/services"
    const resSvc = await http.get<Service[]>(url)
    const resCat = await http.get<ServiceCategory[]>("/service-categories")
    setLoading(false)

    if (resSvc.error) {
      setErrorMsg(resSvc.error.message)
      return
    }

    if (resSvc.data) setServices(resSvc.data)
    if (resCat.data) setCategories(resCat.data)
  }

  useEffect(() => {
    loadData()
  }, [categoryFilter])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatError(null)

    if (!newCatName) {
      setCatError("O nome é obrigatório.")
      return
    }

    setCatSaving(true)
    const res = await http.post("/service-categories", { name: newCatName })
    setCatSaving(false)

    if (res.error) {
      setCatError(res.error.message)
      return
    }

    setIsCategoryOpen(false)
    setNewCatName("")
    loadData()
  }

  return {
    services,
    categories,
    loading,
    categoryFilter,
    setCategoryFilter,
    errorMsg,
    isCategoryOpen,
    setIsCategoryOpen,
    newCatName,
    setNewCatName,
    catSaving,
    catError,
    handleCreateCategory,
  }
}
