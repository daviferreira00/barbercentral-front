"use client"

import { useEffect, useState } from "react"
import { http } from "@/shared/lib/http"
import type { Product, ProductListResponse } from "../types"

export function useEstoqueList() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([]) // For select dropdown in movements
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)

  // Filters
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all") // all, active, low_stock, inactive
  const [page, setPage] = useState(1)
  const pageSize = 10

  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modal
  const [movementModalOpen, setMovementModalOpen] = useState(false)
  const [moveProductID, setMoveProductID] = useState("")
  const [moveType, setMoveType] = useState("in")
  const [moveQty, setMoveQty] = useState("")
  const [moveReason, setMoveReason] = useState("")

  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [query])

  const loadProducts = async () => {
    setLoading(true)
    setErrorMsg(null)

    const searchParam = debouncedQuery ? `&query=${encodeURIComponent(debouncedQuery)}` : ""
    const resList = await http.get<ProductListResponse>(`/products?page=${page}&page_size=${pageSize}&filter=${filter}${searchParam}`)
    const resLow = await http.get<Product[]>("/products/low-stock")

    // Also load all products list (for dropdown selection in the movement modal)
    const resAll = await http.get<ProductListResponse>(`/products?page=1&page_size=1000&filter=active`)

    setLoading(false)

    if (resList.error) {
      setErrorMsg(resList.error.message)
      return
    }

    if (resList.data) {
      setProducts(resList.data.data || [])
      setTotal(resList.data.total || 0)
    }
    if (resLow.data) {
      setLowStockProducts(resLow.data || [])
    }
    if (resAll.data) {
      setAllProducts(resAll.data.data || [])
    }
  }

  useEffect(() => {
    loadProducts()
  }, [page, debouncedQuery, filter])

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!moveProductID || !moveQty) return

    setActionLoading(true)
    setErrorMsg(null)

    const res = await http.post(`/products/${moveProductID}/movements`, {
      type: moveType,
      quantity: parseFloat(moveQty) || 0,
      reason: moveReason ? moveReason : null,
    })
    setActionLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setMovementModalOpen(false)
    setMoveProductID("")
    setMoveQty("")
    setMoveReason("")
    loadProducts()
  }

  const handleExport = () => {
    window.open("/api/stock/export", "_blank")
  }

  const totalPages = Math.ceil(total / pageSize)

  return {
    products,
    allProducts,
    lowStockProducts,
    total,
    query,
    setQuery,
    filter,
    setFilter,
    page,
    setPage,
    loading,
    actionLoading,
    errorMsg,
    setErrorMsg,
    movementModalOpen,
    setMovementModalOpen,
    moveProductID,
    setMoveProductID,
    moveType,
    setMoveType,
    moveQty,
    setMoveQty,
    moveReason,
    setMoveReason,
    handleCreateMovement,
    handleExport,
    totalPages,
    pageSize,
  }
}
