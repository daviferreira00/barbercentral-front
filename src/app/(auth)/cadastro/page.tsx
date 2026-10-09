"use client"

import { useState } from "react"
import Link from "next/link"
import { authService } from "@/shared/auth/auth-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Sparkles, ArrowRight } from "lucide-react"

export default function CadastroPage() {
  const [barberName, setBarberName] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!barberName.trim() || !name.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.")
      return
    }

    setLoading(true)

    try {
      const res = await authService.registerTrial({
        barber_name: barberName,
        name,
        email,
        phone,
        password,
      })

      if (res.error) {
        setError(res.error.message || "Erro ao realizar cadastro.")
        setLoading(false)
        return
      }

      window.location.href = "/cliente"
    } catch (err: any) {
      setError("Não foi possível conectar ao servidor. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>7 Dias Grátis — Sem Cartão de Crédito</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Cadastre sua Barbearia
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Crie sua conta em 2 minutos para liberar o acesso ao plano Pro.
        </p>
      </div>

      {error && <Alert variant="error" message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase">
            Nome da Barbearia <span className="text-amber-600">*</span>
          </label>
          <Input
            type="text"
            required
            value={barberName}
            onChange={(e) => setBarberName(e.target.value)}
            placeholder="Ex: Barbearia Central"
            className="h-10 text-xs"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase">
            Seu Nome Completo <span className="text-amber-600">*</span>
          </label>
          <Input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pedro Silva"
            className="h-10 text-xs"
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-500 uppercase">
            E-mail de Acesso <span className="text-amber-600">*</span>
          </label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.email@barbearia.com.br"
            className="h-10 text-xs"
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              WhatsApp
            </label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-8888"
              className="h-10 text-xs"
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">
              Senha <span className="text-amber-600">*</span>
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mín. 6 caracteres"
              className="h-10 text-xs"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 mt-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
        >
          {loading ? (
            <span>Criando sua conta...</span>
          ) : (
            <>
              <span>Liberar 7 Dias Grátis Agora</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Já possui uma conta?{" "}
          <Link href="/login" className="font-bold text-slate-800 hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
