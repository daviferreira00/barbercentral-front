"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import type { Product } from "../types"

interface StockMovement {
  id: string
  type: string // in, out, adjustment
  quantity: number
  reason?: string
  appointment_id?: string
  created_by: string
  created_at: string
}

interface EnrichedServiceProduct {
  service_id: string
  product_id: string
  product_name: string
  quantity: number
  unit: string
}

interface Service {
  id: string
  name: string
}

export function useProdutoDetail(productID: string) {
  const router = useRouter()

  const [product, setProduct] = useState<Product | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [linkedServices, setLinkedServices] = useState<EnrichedServiceProduct[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Tab control state
  const [activeTab, setActiveTab] = useState<"cadastro" | "movements" | "services">("cadastro")

  // Edit states
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [lowStockAlert, setLowStockAlert] = useState("")
  const [unit, setUnit] = useState("")
  const [active, setActive] = useState(1)

  // Service link form states
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [selectedServiceID, setSelectedServiceID] = useState("")
  const [linkQty, setLinkQty] = useState("1")

  const loadProduct = async () => {
    setLoading(true)
    setErrorMsg(null)

    const resProd = await http.get<Product>(`/products/${productID}`)
    if (resProd.error) {
      setErrorMsg(resProd.error.message)
      setLoading(false)
      return
    }

    if (resProd.data) {
      const p = resProd.data
      setProduct(p)
      setName(p.name)
      setSku(p.sku || "")
      setDescription(p.description || "")
      setPrice(p.price.toString())
      setCostPrice(p.cost_price.toString())
      setLowStockAlert(p.low_stock_alert.toString())
      setUnit(p.unit)
      setActive(p.active)
    }

    // List movements
    const resMove = await http.get<StockMovement[]>(`/products/${productID}/movements`)
    if (resMove.data) setMovements(resMove.data)

    // List linked services
    const resSrv = await http.get<{ data: Service[] }>("/services?page=1&page_size=100")
    if (resSrv.data) {
      const svcs = resSrv.data.data || []
      setAllServices(svcs)

      const links: EnrichedServiceProduct[] = []
      for (const s of svcs) {
        const resLinks = await http.get<any[]>(`/services/${s.id}/products`)
        if (resLinks.data) {
          const matched = resLinks.data.filter((l) => l.product_id === productID)
          matched.forEach((m) => {
            links.push({
              service_id: s.id,
              product_id: productID,
              product_name: s.name,
              quantity: m.quantity,
              unit: m.unit,
            })
          })
        }
      }
      setLinkedServices(links)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadProduct()
  }, [productID])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !unit) return

    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const res = await http.put(`/products/${productID}`, {
      name,
      sku: sku ? sku : null,
      description: description ? description : null,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      low_stock_alert: parseFloat(lowStockAlert) || 0,
      unit,
      active,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccessMsg("Produto atualizado com sucesso!")
    loadProduct()
  }

  const handleDelete = async () => {
    if (!window.confirm("Deseja realmente desativar este produto do estoque? Ele não aparecerá mais nos formulários.")) {
      return
    }

    setDeleting(true)
    setErrorMsg(null)

    const res = await http.delete(`/products/${productID}`)
    setDeleting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/estoque")
  }

  const handleLinkService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedServiceID || !linkQty) return

    setSaving(true)
    setErrorMsg(null)

    const res = await http.post(`/services/${selectedServiceID}/products`, {
      product_id: productID,
      quantity: parseFloat(linkQty) || 0,
    })
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setLinkModalOpen(false)
    setSelectedServiceID("")
    setLinkQty("1")
    loadProduct()
  }

  const handleUnlinkService = async (serviceID: string) => {
    if (!window.confirm("Deseja desvincular o produto deste serviço? O serviço deixará de dar baixa automática nele.")) {
      return
    }

    setSaving(true)
    setErrorMsg(null)

    const res = await http.delete(`/services/${serviceID}/products/${productID}`)
    setSaving(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    loadProduct()
  }

  return {
    product,
    movements,
    linkedServices,
    allServices,
    loading,
    saving,
    deleting,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    activeTab,
    setActiveTab,
    name,
    setName,
    sku,
    setSku,
    description,
    setDescription,
    price,
    setPrice,
    costPrice,
    setCostPrice,
    lowStockAlert,
    setLowStockAlert,
    unit,
    setUnit,
    active,
    setActive,
    linkModalOpen,
    setLinkModalOpen,
    selectedServiceID,
    setSelectedServiceID,
    linkQty,
    setLinkQty,
    handleUpdate,
    handleDelete,
    handleLinkService,
    handleUnlinkService,
  }
}
