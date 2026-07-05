"use client"

import { useState } from "react"
import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { useBloqueios } from "@/features/agenda/hooks/useBloqueios"

export default function BloqueiosMobile() {
  const {
    professionals,
    blockedSlots,
    loading,
    professionalId,
    setProfessionalId,
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    reason,
    setReason,
    saving,
    saveError,
    successMsg,
    handleSubmit,
    handleDelete,
  } = useBloqueios()

  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
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
          <h1 className="text-xl font-extrabold text-slate-800">Bloqueios</h1>
          <p className="text-xs font-semibold text-slate-400">Horários de indisponibilidade da agenda.</p>
        </div>
      </div>

      {successMsg && !sheetOpen && <Alert variant="success" message={successMsg} />}

      {/* Lista de bloqueios em cards */}
      {loading && blockedSlots.length === 0 ? (
        <SkeletonList count={5} />
      ) : blockedSlots.length === 0 ? (
        <EmptyState
          icon="ti-lock-open"
          title="Nenhum horário bloqueado"
          description="Toque no botão + para criar um bloqueio."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {blockedSlots.map((b, i) => {
            const prof = professionals.find((p) => p.id === b.professional_id)
            return (
              <ListCard
                key={b.id}
                index={i}
                title={
                  <span>
                    <i className="ti ti-lock mr-1.5 text-slate-400" />
                    {b.professional_id ? (prof ? prof.name : "Carregando...") : "Toda a Barbearia"}
                  </span>
                }
                subtitle={b.reason || "Indisponível"}
                footerLeft={
                  <span>
                    <i className="ti ti-calendar mr-1 text-slate-400" />
                    {new Date(b.date + "T00:00:00").toLocaleDateString("pt-BR")}
                    <span className="ml-2 font-mono">
                      {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                    </span>
                  </span>
                }
                footerRight={
                  <button
                    onClick={() => handleDelete(b.id)}
                    aria-label="Remover bloqueio"
                    className="mobile-tap flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition active:scale-90"
                  >
                    <i className="ti ti-trash text-sm" />
                  </button>
                }
              />
            )
          })}
        </div>
      )}

      {/* Sheet: novo bloqueio */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => !saving && setSheetOpen(false)}
        title="Novo Bloqueio"
        subtitle="Indisponibilize horários na grade"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Profissional afetado
            </label>
            <Select value={professionalId} onValueChange={setProfessionalId} disabled={saving}>
              <SelectTrigger className="h-11 w-full rounded-xl text-sm font-semibold">
                <SelectValue placeholder="Selecione um profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda a Barbearia</SelectItem>
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={saving}
              className="h-11 rounded-xl text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Hora início
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={saving}
                className="h-11 rounded-xl text-base"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Hora fim
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={saving}
                className="h-11 rounded-xl text-base"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Motivo (opcional)
            </label>
            <Input
              placeholder="Ex: Almoço, Consulta médica..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={saving}
              className="h-11 rounded-xl text-base"
            />
          </div>

          {saveError && <Alert variant="error" message={saveError} />}
          {successMsg && <Alert variant="success" message={successMsg} />}

          <button
            type="submit"
            disabled={saving}
            className="mobile-tap rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {saving ? "Salvando..." : "Bloquear Horário"}
          </button>
        </form>
      </BottomSheet>

      <Fab icon="ti-lock-plus" onClick={() => setSheetOpen(true)} ariaLabel="Novo bloqueio" />
    </div>
  )
}
