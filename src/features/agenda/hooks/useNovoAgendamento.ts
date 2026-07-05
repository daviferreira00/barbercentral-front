"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

export interface Service {
  id: string
  name: string
  duration_minutes: number
  price: number
}

export interface Professional {
  id: string
  name: string
}

export interface TimeSlot {
  start_time: string
  end_time: string
}

// Estado e ações do formulário de novo agendamento (views desktop e mobile)
export function useNovoAgendamento() {
  const router = useRouter()

  // API Lists
  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])

  // Selection states
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedProfId, setSelectedProfId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  // Customer search / form
  const [searchCustQuery, setSearchCustQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Customer[]>([])
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null)

  // Manual customer fields (for avulso or new)
  const [custName, setCustName] = useState("")
  const [custPhone, setCustPhone] = useState("")
  const [custEmail, setCustEmail] = useState("")
  const [isManualCust, setIsManualCust] = useState(false)

  // Status states
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load services and professionals on mount
  const loadInitialData = async () => {
    setLoadingInitial(true)
    const resSvc = await http.get<Service[]>("/services")
    const resProf = await http.get<Professional[]>("/professionals")
    setLoadingInitial(false)

    if (resSvc.data) setServices(resSvc.data)
    if (resProf.data) {
      setProfessionals(resProf.data)
      if (resProf.data.length > 0) setSelectedProfId(resProf.data[0].id)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Autocomplete search of customers
  useEffect(() => {
    if (searchCustQuery.length < 3) {
      setSearchResults([])
      return
    }
    const handler = setTimeout(async () => {
      const res = await http.get<Customer[]>(`/customers/search?q=${encodeURIComponent(searchCustQuery)}`)
      if (res.data) {
        setSearchResults(res.data)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchCustQuery])

  // Availability check
  const checkSlots = async () => {
    if (selectedServices.length === 0 || !selectedProfId || !selectedDate) {
      setSlots([])
      return
    }

    setLoadingSlots(true)
    setErrorMsg(null)

    const svcParam = selectedServices.map((id) => `service_ids=${id}`).join("&")
    const res = await http.get<TimeSlot[]>(
      `/appointments/availability?date=${selectedDate}&professional_id=${selectedProfId}&${svcParam}`
    )
    setLoadingSlots(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }
    if (res.data) {
      setSlots(res.data)
    }
  }

  useEffect(() => {
    checkSlots()
  }, [selectedServices, selectedProfId, selectedDate])

  const handleSelectCustomerFromSearch = (cust: Customer) => {
    setSelectedCust(cust)
    setCustName(cust.name)
    setCustPhone(cust.phone)
    setCustEmail(cust.email || "")
    setSearchCustQuery("")
    setSearchResults([])
    setIsManualCust(false)
  }

  const handleToggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setSelectedTime("") // reset selected time if services change
  }

  const calculateTotals = () => {
    let price = 0
    let duration = 0
    selectedServices.forEach((id) => {
      const svc = services.find((s) => s.id === id)
      if (svc) {
        price += svc.price
        duration += svc.duration_minutes
      }
    })
    return { price, duration }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedServices.length === 0 || !selectedProfId || !selectedDate || !selectedTime) {
      setErrorMsg("Selecione serviços, profissional, data e horário.")
      return
    }

    if (!isManualCust && !selectedCust) {
      setErrorMsg("Busque e selecione um cliente ou marque a opção de preencher manualmente.")
      return
    }

    if (isManualCust && (!custName || !custPhone)) {
      setErrorMsg("Preencha nome e telefone do cliente avulso.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const res = await http.post("/appointments", {
      customer_id: isManualCust ? null : selectedCust?.id,
      customer_name: custName ? custName : null,
      customer_phone: custPhone ? custPhone : null,
      customer_email: custEmail ? custEmail : null,
      professional_id: selectedProfId,
      service_ids: selectedServices,
      date: selectedDate,
      start_time: selectedTime,
      notes: notes ? notes : null,
    })
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/agenda")
  }

  return {
    services,
    professionals,
    slots,
    selectedServices,
    selectedProfId,
    setSelectedProfId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    notes,
    setNotes,
    searchCustQuery,
    setSearchCustQuery,
    searchResults,
    selectedCust,
    setSelectedCust,
    custName,
    setCustName,
    custPhone,
    setCustPhone,
    custEmail,
    setCustEmail,
    isManualCust,
    setIsManualCust,
    loadingInitial,
    loadingSlots,
    submitting,
    errorMsg,
    handleSelectCustomerFromSearch,
    handleToggleService,
    calculateTotals,
    handleSubmit,
  }
}
