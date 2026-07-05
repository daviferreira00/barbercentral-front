"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ActionBar } from "@/components/mobile/ActionBar"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { haptic } from "@/shared/lib/haptics"
import { useNovoAgendamento } from "@/features/agenda/hooks/useNovoAgendamento"

export default function NovoAgendamentoMobile() {
  const {
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
  } = useNovoAgendamento()

  const { price: totalPrice, duration: totalDuration } = calculateTotals()

  if (loadingInitial) {
    return <SkeletonList count={4} />
  }

  const sectionTitle = (n: string, label: string) => (
    <div className="mb-3 flex items-center gap-2">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-extrabold text-white"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {n}
      </span>
      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">{label}</h2>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-24 animate-fade-in">
      {/* Topo com retorno */}
      <div className="flex items-center gap-3">
        <Link
          href="/cliente/agenda"
          aria-label="Voltar à agenda"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Novo Agendamento</h1>
          <p className="text-xs font-semibold text-slate-400">Agende um horário pelo painel.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* 1. Cliente */}
      <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {sectionTitle("1", "Cliente")}

        {!isManualCust ? (
          <div className="flex flex-col gap-3">
            {selectedCust ? (
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">{selectedCust.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {selectedCust.phone} {selectedCust.email && `• ${selectedCust.email}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCust(null)}
                  className="mobile-tap shrink-0 text-xs font-extrabold text-red-500 transition active:scale-95"
                >
                  Limpar
                </button>
              </div>
            ) : (
              <div className="relative">
                <Input
                  placeholder="Buscar cliente (mín. 3 caracteres)..."
                  value={searchCustQuery}
                  onChange={(e) => setSearchCustQuery(e.target.value)}
                  className="h-11 rounded-xl pl-10 text-base"
                />
                <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 z-40 mt-1.5 max-h-48 divide-y divide-slate-100 overflow-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {searchResults.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          haptic()
                          handleSelectCustomerFromSearch(cust)
                        }}
                        className="mobile-tap cursor-pointer p-3 text-xs font-medium active:bg-slate-50"
                      >
                        <p className="font-bold text-slate-800">{cust.name}</p>
                        <p className="mt-0.5 text-slate-400">{cust.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="manual-toggle-mobile"
                checked={isManualCust}
                onCheckedChange={(c) => {
                  setIsManualCust(!!c)
                  if (c) setSelectedCust(null)
                }}
              />
              <label htmlFor="manual-toggle-mobile" className="cursor-pointer select-none text-xs font-bold text-slate-600">
                Não cadastrado / Preencher manualmente
              </label>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Nome completo
              </label>
              <Input
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                placeholder="Ex: Pedro da Silva"
                className="h-11 rounded-xl text-base"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Telefone
              </label>
              <Input
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                placeholder="Ex: 11999999999"
                className="h-11 rounded-xl text-base"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                E-mail (opcional)
              </label>
              <Input
                type="email"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                placeholder="Ex: pedro@email.com"
                className="h-11 rounded-xl text-base"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsManualCust(false)
                setCustName("")
                setCustPhone("")
                setCustEmail("")
              }}
              className="mobile-tap self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 transition active:scale-95"
            >
              <i className="ti ti-arrow-left mr-1" />
              Voltar para busca
            </button>
          </div>
        )}
      </div>

      {/* 2. Serviços */}
      <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {sectionTitle("2", "Serviços")}
        <div className="flex flex-col gap-2">
          {services.map((svc) => {
            const isChecked = selectedServices.includes(svc.id)
            return (
              <div
                key={svc.id}
                onClick={() => {
                  haptic()
                  handleToggleService(svc.id)
                }}
                className={`mobile-tap flex cursor-pointer select-none items-center justify-between rounded-xl border p-3.5 transition active:scale-[0.98] ${
                  isChecked ? "border-transparent text-white shadow-md" : "border-slate-100 bg-white text-slate-800"
                }`}
                style={isChecked ? { backgroundColor: "var(--color-primary)" } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                      isChecked ? "border-white/40 bg-white/20" : "border-slate-200"
                    }`}
                  >
                    {isChecked && <i className="ti ti-check" />}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold">{svc.name}</p>
                    <p className={`mt-0.5 text-[10px] ${isChecked ? "text-white/70" : "text-slate-400"}`}>
                      {svc.duration_minutes} min
                    </p>
                  </div>
                </div>
                <span className="text-xs font-extrabold">R$ {svc.price.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Profissional e Horário */}
      <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {sectionTitle("3", "Profissional e Horário")}
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Profissional
            </label>
            <Select value={selectedProfId} onValueChange={setSelectedProfId}>
              <SelectTrigger className="h-11 rounded-xl text-sm font-semibold">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Data
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime("")
              }}
              className="h-11 rounded-xl text-base"
            />
          </div>

          {selectedDate && selectedServices.length > 0 && (
            <div className="border-t border-slate-100 pt-3">
              <label className="mb-2 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Horários disponíveis
              </label>

              {loadingSlots ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-shimmer h-10 rounded-xl" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold text-amber-600">
                  Nenhum horário livre neste dia para o profissional selecionado.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map((slot) => {
                    const isTimeSelected = selectedTime === slot.start_time
                    return (
                      <button
                        key={slot.start_time}
                        type="button"
                        onClick={() => {
                          haptic()
                          setSelectedTime(slot.start_time)
                        }}
                        className={`mobile-tap h-10 rounded-xl border text-[11px] font-extrabold transition active:scale-95 ${
                          isTimeSelected ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white text-slate-700"
                        }`}
                        style={isTimeSelected ? { backgroundColor: "var(--color-primary)" } : {}}
                      >
                        {slot.start_time.substring(0, 5)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Observações */}
      <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        {sectionTitle("4", "Observações")}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: O cliente solicitou lavagem prévia de cabelo..."
          className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
        />
      </div>

      {/* Barra fixa de total + submit */}
      <ActionBar>
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase leading-none text-slate-400">Total estimado</span>
            <span className="mt-1 text-base font-extrabold leading-none text-slate-900">
              R$ {totalPrice.toFixed(2)}
            </span>
            <span className="mt-0.5 text-[9px] font-semibold text-slate-500">{totalDuration} min</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mobile-tap flex items-center justify-center gap-1.5 rounded-xl px-8 py-3 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {submitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Agendando...
              </>
            ) : (
              "Agendar"
            )}
          </button>
        </div>
      </ActionBar>
    </form>
  )
}
