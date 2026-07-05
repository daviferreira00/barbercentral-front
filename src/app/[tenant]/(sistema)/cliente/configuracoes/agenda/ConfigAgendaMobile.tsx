"use client"

import Link from "next/link"
import { useConfigAgenda, WEEKDAYS } from "@/features/configuracoes/hooks/useConfigAgenda"
import { Alert } from "@/components/ui/alert"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"

export default function ConfigAgendaMobile() {
  const {
    professionals,
    selectedProfId,
    setSelectedProfId,
    schedules,
    loading,
    saving,
    errorMsg,
    successMsg,
    handleCheckboxChange,
    handleTimeChange,
    handleSave,
    formatTimeToShow,
  } = useConfigAgenda()

  return (
    <div className="flex flex-col gap-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cliente"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90 shadow-sm"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Grade Horária</h1>
          <p className="text-xs font-semibold text-slate-400">Dias de expediente dos colaboradores.</p>
        </div>
      </div>

      {/* Select Professional */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-2">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Profissional
        </label>
        <Select value={selectedProfId} onValueChange={(val) => { haptic(); setSelectedProfId(val) }}>
          <SelectTrigger className="h-11 rounded-xl text-base w-full">
            <SelectValue placeholder="Selecione um profissional" />
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

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

      {selectedProfId && (
        <form onSubmit={(e) => { haptic(); handleSave(e) }} className="flex flex-col gap-4">
          <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-1">
            <h2 className="text-sm font-extrabold text-slate-800 border-b pb-2 mb-2">Grade Semanal</h2>
            
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs font-semibold">Carregando horários...</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {schedules.map((s) => {
                  const w = WEEKDAYS.find((wd) => wd.value === s.weekday)
                  if (!w) return null

                  return (
                    <div key={s.weekday} className="flex items-center justify-between py-3.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5 w-32 shrink-0">
                        <Checkbox
                          id={`day-${s.weekday}`}
                          checked={s.enabled === 1}
                          onCheckedChange={(checked) => {
                            haptic()
                            handleCheckboxChange(s.weekday, !!checked)
                          }}
                          className="h-5 w-5 rounded-lg"
                        />
                        <label
                          htmlFor={`day-${s.weekday}`}
                          className="text-sm font-extrabold text-slate-700 cursor-pointer select-none"
                        >
                          {w.label}
                        </label>
                      </div>

                      {s.enabled === 1 ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">De</span>
                          <Input
                            type="time"
                            className="w-20 text-center h-9 font-bold rounded-xl text-xs bg-slate-50 border-slate-200"
                            value={formatTimeToShow(s.start_time)}
                            onChange={(e) => handleTimeChange(s.weekday, "start_time", e.target.value)}
                            required
                          />
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Até</span>
                          <Input
                            type="time"
                            className="w-20 text-center h-9 font-bold rounded-xl text-xs bg-slate-50 border-slate-200"
                            value={formatTimeToShow(s.end_time)}
                            onChange={(e) => handleTimeChange(s.weekday, "end_time", e.target.value)}
                            required
                          />
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 border border-slate-200/50 rounded-lg px-2.5 py-1">
                          Folga
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <ActionBar>
            <button
              type="submit"
              disabled={saving || loading}
              className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {saving ? "Salvando..." : "Salvar Grade Semanal"}
            </button>
          </ActionBar>
        </form>
      )}
    </div>
  )
}
