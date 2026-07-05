"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import type { Service, ServiceCategory } from "../types"

// Estado e ações do detalhe/edição de serviço (views desktop e mobile)
export function useServicoDetail(serviceId: string) {
  const router = useRouter()

  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30")
  const [price, setPrice] = useState("")
  const [active, setActive] = useState(1)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Insumos/Estoque
  const [serviceProducts, setServiceProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [linkQty, setLinkQty] = useState("1")
  const [linkError, setLinkError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    const resSvc = await http.get<Service>(`/services/${serviceId}`)
    const resCat = await http.get<ServiceCategory[]>("/service-categories")
    const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
    const resProds = await http.get<{ data: any[] }>("/products?page=1&page_size=1000&filter=active")
    setLoading(false)

    if (resSvc.error) {
      setSaveError(resSvc.error.message)
      return
    }

    if (resSvc.data) {
      setService(resSvc.data)
      setName(resSvc.data.name)
      setCategoryId(resSvc.data.category_id || "")
      setDescription(resSvc.data.description || "")
      setDuration(resSvc.data.duration_minutes.toString())
      setPrice(resSvc.data.price.toString())
      setActive(resSvc.data.active)
    }

    if (resCat.data) setCategories(resCat.data)
    if (resSvcProds.data) setServiceProducts(resSvcProds.data)
    if (resProds.data) setAllProducts(resProds.data.data || [])
  }

  useEffect(() => {
    loadData()
  }, [serviceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name || !price || !duration) {
      setSaveError("Nome, preço e duração são obrigatórios.")
      return
    }

    setSaving(true)
    const res = await http.put(`/services/${serviceId}`, {
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

    alert("Serviço atualizado com sucesso!")
    router.push("/cliente/servicos")
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover este serviço permanentemente?")) return

    setDeleting(true)
    const res = await http.delete(`/services/${serviceId}`)
    setDeleting(false)

    if (res.error) {
      alert(res.error.message)
      return
    }

    router.push("/cliente/servicos")
  }

  const handleLinkProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId || !linkQty) return

    setSaving(true)
    setLinkError(null)
    const res = await http.post(`/services/${serviceId}/products`, {
      product_id: selectedProductId,
      quantity: parseFloat(linkQty) || 0,
    })
    setSaving(false)

    if (res.error) {
      setLinkError(res.error.message)
      return
    }

    setSelectedProductId("")
    setLinkQty("1")

    const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
    if (resSvcProds.data) setServiceProducts(resSvcProds.data)
  }

  const handleUnlinkProduct = async (productId: string) => {
    if (!confirm("Remover este insumo do serviço?")) return
    setSaving(true)
    const res = await http.delete(`/services/${serviceId}/products/${productId}`)
    setSaving(false)
    if (res.error) {
      alert(res.error.message)
      return
    }
    const resSvcProds = await http.get<any[]>(`/services/${serviceId}/products`)
    if (resSvcProds.data) setServiceProducts(resSvcProds.data)
  }

  return {
    categories,
    service,
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
    deleting,
    saveError,
    serviceProducts,
    allProducts,
    selectedProductId,
    setSelectedProductId,
    linkQty,
    setLinkQty,
    linkError,
    handleSubmit,
    handleDelete,
    handleLinkProduct,
    handleUnlinkProduct,
  }
}
