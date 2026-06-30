"use client"

import { useState } from "react"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NovoClientePage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [cpf, setCpf] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [notes, setNotes] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) {
      setErrorMsg("Nome e Telefone são campos obrigatórios.")
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    const res = await http.post("/customers", {
      name,
      phone,
      email: email ? email : null,
      cpf: cpf ? cpf : null,
      birth_date: birthDate ? birthDate : null,
      notes: notes ? notes : null,
    })
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    router.push("/cliente/clientes")
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto w-full animate-fade-in">
      {/* Topo */}
      <div className="flex items-center gap-3">
        <Link href="/cliente/clientes">
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs text-slate-500 border border-slate-200 bg-white">
            <i className="ti ti-arrow-left text-sm mr-1" /> Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Novo Cliente</h1>
          <p className="text-xs text-slate-500 mt-0.5">Cadastre um novo cliente manualmente na base do CRM.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rafael da Silva"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 11999999999"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">E-mail (Opcional)</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 uppercase">CPF (Opcional)</label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="Ex: 123.456.789-00"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Data de Nascimento (Opcional)</label>
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Observações Internas (Opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Prefere corte de cabelo navalhado nas laterais..."
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-100"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3 justify-end">
              <Link href="/cliente/clientes">
                <Button type="button" variant="ghost" className="border border-slate-200 bg-white font-semibold">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="font-semibold">
                {submitting ? "Cadastrando..." : "Cadastrar Cliente"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
