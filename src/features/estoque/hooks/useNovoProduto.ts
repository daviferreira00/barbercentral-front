"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"

export function useNovoProduto() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [quantityInStock, setQuantityInStock] = useState("0")
  const [lowStockAlert, setLowStockAlert] = useState("5")
  const [unit, setUnit] = useState("un")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !unit) {
      setErrorMsg("Nome e Unidade de Medida são obrigatórios.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const res = await http.post("/products", {
      name,
      sku: sku ? sku : null,
      description: description ? description : null,
      price: parseFloat(price) || 0,
      cost_price: parseFloat(costPrice) || 0,
      quantity_in_stock: parseFloat(quantityInStock) || 0,
      low_stock_alert: parseFloat(lowStockAlert) || 0,
      unit,
    })
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/estoque")
  }

  return {
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
    quantityInStock,
    setQuantityInStock,
    lowStockAlert,
    setLowStockAlert,
    unit,
    setUnit,
    submitting,
    errorMsg,
    handleSubmit,
  }
}
