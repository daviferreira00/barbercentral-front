"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useNovoProfissional } from "@/features/profissionais/hooks/useNovoProfissional"

export default function NovoProfissionalDesktop() {
  const { name, setName, bio, setBio, status, setStatus, saving, saveError, handleSubmit } =
    useNovoProfissional()

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in px-1 md:px-0">
      <div className="flex items-center gap-2">
        <a href="/cliente/profissionais" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Novo Profissional</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">Cadastrar um novo membro na equipe da barbearia.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 px-4 pb-4 md:px-6 md:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <Input
                placeholder="Ex: Carlos Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Biografia/Especialidades</label>
              <textarea
                placeholder="Descreva as especialidades do profissional..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Status Inicial</label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="accent-primary h-4 w-4"
                  />
                  Ativo (Disponível na agenda)
                </label>
                <label className="flex items-center gap-2 text-xs md:text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={() => setStatus("inactive")}
                    className="accent-primary h-4 w-4"
                  />
                  Inativo (Fora de serviço)
                </label>
              </div>
            </div>

            {saveError && <Alert variant="error" message={saveError} />}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 w-full md:flex md:justify-end md:w-auto">
              <a href="/cliente/profissionais" className="w-full md:w-auto">
                <Button type="button" variant="ghost" disabled={saving} className="w-full h-9 text-xs">
                  Cancelar
                </Button>
              </a>
              <Button type="submit" disabled={saving} className="w-full h-9 text-xs">
                {saving ? "Salvando..." : "Salvar e Continuar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
