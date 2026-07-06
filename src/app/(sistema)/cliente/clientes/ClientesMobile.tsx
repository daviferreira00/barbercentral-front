"use client"

import { useState } from "react"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { FilterSection } from "@/components/mobile/FilterSection"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { useClientesList } from "@/features/clientes/hooks/useClientesList"
import { MONTHS, type CustomerStats } from "@/features/clientes/types"

const formatDate = (iso?: string) =>
  iso ? new Date(iso.split("T")[0] + "T00:00:00").toLocaleDateString("pt-BR") : "Nunca"

const whatsappUrl = (phone: string) => {
  const digits = phone.replace(/\D/g, "")
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`
}

export default function ClientesMobile() {
  const {
    customers,
    total,
    totalPages,
    loading,
    errorMsg,
    searchQuery,
    setSearchQuery,
    birthMonth,
    setBirthMonth,
    page,
    setPage,
    handleExport,
  } = useClientesList()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<CustomerStats | null>(null)

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Título + exportar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Clientes</h1>
          <p className="text-xs font-semibold text-slate-400">
            {loading ? "Carregando..." : `${total} cliente${total === 1 ? "" : "s"} na base`}
          </p>
        </div>
        <button
          aria-label="Exportar CSV"
          onClick={handleExport}
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-download" />
        </button>
      </div>

      {/* Busca sempre visível */}
      <div className="relative">
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 rounded-xl bg-white pl-10 text-base"
        />
        <i className="ti ti-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Filtros recolhidos por padrão */}
      <FilterSection
        open={filtersOpen}
        onToggle={() => setFiltersOpen(!filtersOpen)}
        activeCount={birthMonth !== "0" ? 1 : 0}
      >
        <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Mês de aniversário
        </label>
        <Select value={birthMonth} onValueChange={setBirthMonth}>
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Mês de aniversário" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Listagem em cards */}
      {loading ? (
        <SkeletonList count={6} />
      ) : customers.length === 0 ? (
        <EmptyState
          icon="ti-users-group"
          title="Nenhum cliente encontrado"
          description="Cadastre seu primeiro cliente no botão + abaixo."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {customers.map((c, i) => (
            <ListCard
              key={c.id}
              index={i}
              title={c.name}
              subtitle={
                <span>
                  <i className="ti ti-phone mr-1" />
                  {c.phone}
                </span>
              }
              pill={{ label: `${c.total_visits} visita${c.total_visits === 1 ? "" : "s"}`, tone: "neutral" }}
              footerLeft={
                <span>
                  <i className="ti ti-calendar-event mr-1 text-slate-400" />
                  {formatDate(c.last_visit)}
                </span>
              }
              footerRight={<span className="text-emerald-600">R$ {c.total_spent.toFixed(2)}</span>}
              onClick={() => setSelected(c)}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="mobile-tap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition active:scale-95 disabled:opacity-40"
          >
            <i className="ti ti-chevron-left mr-1" />
            Anterior
          </button>
          <span className="text-[11px] font-bold text-slate-400">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="mobile-tap rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition active:scale-95 disabled:opacity-40"
          >
            Próxima
            <i className="ti ti-chevron-right ml-1" />
          </button>
        </div>
      )}

      {/* Detalhe do cliente em bottom sheet */}
      <BottomSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name || ""}
        subtitle={selected?.email || "Sem e-mail"}
        footer={
          selected && (
            <Link
              href={`/cliente/clientes/${selected.id}`}
              className="mobile-tap flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98]"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <i className="ti ti-user-search text-base" />
              Ver perfil completo
            </Link>
          )
        }
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Ações rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${selected.phone.replace(/\D/g, "")}`}
                className="mobile-tap flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-extrabold text-slate-700 transition active:scale-95"
              >
                <i className="ti ti-phone text-base" />
                Ligar
              </a>
              <a
                href={whatsappUrl(selected.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-tap flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-xs font-extrabold text-emerald-700 transition active:scale-95"
              >
                <i className="ti ti-brand-whatsapp text-base" />
                WhatsApp
              </a>
            </div>

            {/* Indicadores */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-extrabold text-slate-800">{selected.total_visits}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Visitas</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-lg font-extrabold text-emerald-600">
                  R$ {selected.total_spent.toFixed(0)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Gasto</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-sm font-extrabold text-slate-800 leading-6">{formatDate(selected.last_visit)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Última visita</p>
              </div>
            </div>

            {/* Dados cadastrais */}
            <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-100">
              {[
                { label: "Telefone", value: selected.phone },
                { label: "E-mail", value: selected.email || "—" },
                { label: "CPF", value: selected.cpf || "—" },
                {
                  label: "Nascimento",
                  value: selected.birth_date ? formatDate(selected.birth_date) : "—",
                },
                { label: "Cliente desde", value: selected.first_visit ? formatDate(selected.first_visit) : "—" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs font-bold text-slate-400">{row.label}</span>
                  <span className="text-xs font-extrabold text-slate-700">{row.value}</span>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 mb-1">
                  Observações
                </p>
                <p className="text-xs font-medium text-amber-800">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      <Fab icon="ti-plus" href="/cliente/clientes/novo" ariaLabel="Novo cliente" />
    </div>
  )
}
