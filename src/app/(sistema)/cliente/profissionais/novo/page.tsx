"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function NovoProfissionalPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [status, setStatus] = useState("active")

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveError(null)

    if (!name) {
      setSaveError("O nome é obrigatório.")
      return
    }

    setSaving(true)
    const res = await http.post<{ id: string }>("/professionals", {
      name,
      bio: bio ? bio : null,
      status,
    })
    setSaving(false)

    if (res.error) {
      setSaveError(res.error.message)
      return
    }

    // Redireciona para o detalhe para poder customizar serviços e fotos
    if (res.data) {
      router.push(`/cliente/profissionais/${res.data.id}`)
    }
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2">
        <a href="/cliente/profissionais" className="text-slate-400 hover:text-slate-600 transition">
          <i className="ti ti-arrow-left text-xl" />
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Novo Profissional</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cadastrar um novo membro na equipe da barbearia.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
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
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
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
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <a href="/cliente/profissionais">
                <Button type="button" variant="ghost" disabled={saving}>
                  Cancelar
                </Button>
              </a>
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Salvar e Continuar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
