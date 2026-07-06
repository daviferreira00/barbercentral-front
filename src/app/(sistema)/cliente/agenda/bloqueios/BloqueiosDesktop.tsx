"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useBloqueios } from "@/features/agenda/hooks/useBloqueios"

export default function BloqueiosDesktop() {
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

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex items-center gap-2">
        <a href="/cliente/agenda" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bloqueios de Agenda</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerenciar horários de indisponibilidade (como almoço, folgas ou reuniões).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form para novo bloqueio */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Novo Bloqueio</CardTitle>
            <CardDescription>Indisponibilize horários na grade da barbearia.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Profissional afetado</label>
                <Select value={professionalId} onValueChange={setProfessionalId} disabled={saving}>
                  <SelectTrigger className="w-full">
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={saving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Hora Início</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Hora Fim</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Motivo (Opcional)</label>
                <Input
                  placeholder="Ex: Almoço, Consulta médica..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={saving}
                />
              </div>

              {saveError && <Alert variant="error" message={saveError} />}
              {successMsg && <Alert variant="success" message={successMsg} />}

              <Button type="submit" className="w-full font-semibold" disabled={saving}>
                {saving ? "Salvando..." : "Bloquear Horário"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de bloqueios */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bloqueios Cadastrados</CardTitle>
            <CardDescription>Veja a lista de todos os períodos bloqueados na agenda.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading && blockedSlots.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs font-semibold">Buscando bloqueios...</span>
              </div>
            ) : blockedSlots.length === 0 ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <i className="ti ti-lock-open text-4xl" />
                <span className="text-sm font-semibold">Nenhum horário bloqueado no momento.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-4 pl-6">Profissional</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Período</th>
                      <th className="p-4">Motivo</th>
                      <th className="p-4 pr-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {blockedSlots.map((b) => {
                      const prof = professionals.find((p) => p.id === b.professional_id)
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/30">
                          <td className="p-4 pl-6 font-bold text-slate-800">
                            {b.professional_id ? (prof ? prof.name : "Carregando...") : "Toda a Barbearia"}
                          </td>
                          <td className="p-4">{new Date(b.date.split("T")[0] + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                          <td className="p-4 font-mono text-xs">
                            {b.start_time.substring(0, 5)} - {b.end_time.substring(0, 5)}
                          </td>
                          <td className="p-4 text-slate-500">{b.reason || "Indisponível"}</td>
                          <td className="p-4 pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(b.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              Remover
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
