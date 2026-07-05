"use client"

import { useConfigAgenda, WEEKDAYS } from "@/features/configuracoes/hooks/useConfigAgenda"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export default function ConfigAgendaDesktop() {
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
    <div className="space-y-6 w-full max-w-4xl mx-auto animate-fade-in px-1 md:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Grade Horária dos Profissionais</h1>
        <p className="text-sm text-slate-500 mt-1">Configure os dias de trabalho e as janelas de agendamento por colaborador.</p>
      </div>

      <div className="flex gap-4 items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        <label className="text-xs font-bold text-slate-500 uppercase flex-shrink-0">Profissional:</label>
        <Select value={selectedProfId} onValueChange={setSelectedProfId}>
          <SelectTrigger className="w-64">
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
        <Card>
          <CardHeader>
            <CardTitle>Grade Semanal</CardTitle>
            <CardDescription>Defina quais dias e horas este profissional estará visível na agenda online.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs font-semibold">Carregando horários...</span>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="divide-y divide-slate-100">
                  {schedules.map((s) => {
                    const w = WEEKDAYS.find((wd) => wd.value === s.weekday)
                    if (!w) return null

                    return (
                      <div key={s.weekday} className="flex items-center justify-between py-4 flex-wrap gap-4">
                        <div className="flex items-center gap-3 w-40 flex-shrink-0">
                          <Checkbox
                            id={`day-${s.weekday}`}
                            checked={s.enabled === 1}
                            onCheckedChange={(checked) => handleCheckboxChange(s.weekday, !!checked)}
                          />
                          <label
                            htmlFor={`day-${s.weekday}`}
                            className="text-sm font-bold text-slate-800 cursor-pointer select-none"
                          >
                            {w.label}
                          </label>
                        </div>

                        {s.enabled === 1 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase">De</span>
                            <Input
                              type="time"
                              className="w-24 text-center h-9 font-medium"
                              value={formatTimeToShow(s.start_time)}
                              onChange={(e) => handleTimeChange(s.weekday, "start_time", e.target.value)}
                              required
                            />
                            <span className="text-xs text-slate-400 font-bold uppercase">Até</span>
                            <Input
                              type="time"
                              className="w-24 text-center h-9 font-medium"
                              value={formatTimeToShow(s.end_time)}
                              onChange={(e) => handleTimeChange(s.weekday, "end_time", e.target.value)}
                              required
                            />
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 uppercase bg-slate-100 border border-slate-200/60 rounded px-2.5 py-0.5">
                            Não trabalha (Folga)
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Grade Semanal"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
