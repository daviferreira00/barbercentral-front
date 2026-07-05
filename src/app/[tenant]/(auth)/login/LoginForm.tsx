"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"

type LoginMode = "credentials" | "magic-link"

export function LoginForm({ logoUrl = "/logo/barbercentral-logo-horizontal.svg" }: { logoUrl?: string }) {
  const router = useRouter()
  const params = useParams()
  const tenant = (params?.tenant as string) || ""

  const [mode, setMode] = useState<LoginMode>("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setFormSuccess(null)

    if (!email) {
      setFormError("O e-mail é obrigatório.")
      return
    }

    if (mode === "credentials") {
      if (!password) {
        setFormError("A senha é obrigatória.")
        return
      }

      setSubmitting(true)
      const res = await authService.login({ email, password, tenant })
      setSubmitting(false)

      if (res.error) {
        setFormError(res.error.message)
        return
      }

      if (res.data) {
        if (res.data.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/cliente")
        }
      }
    } else {
      setSubmitting(true)
      const res = await authService.requestMagicLink(email)
      setSubmitting(false)

      if (res.error) {
        setFormError(res.error.message)
        return
      }

      setFormSuccess("Link de acesso rápido enviado para seu e-mail! Verifique a sua caixa de entrada.")
    }
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Logo mobile */}
      <div className="flex lg:hidden justify-center mb-2">
        <img
          src={logoUrl}
          alt="BarberCentral"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">
          {mode === "credentials" ? "Acesse sua conta" : "Acesso sem senha"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {mode === "credentials"
            ? "Insira seu e-mail e senha cadastrados para entrar."
            : "Insira seu e-mail para receber um link de acesso direto."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Campo E-mail */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
          <div className="relative">
            <i className="ti ti-mail absolute left-3 top-3.5 text-slate-400 text-sm" />
            <Input
              type="email"
              placeholder="seu.email@barbercentral.com.br"
              className="pl-9 h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
            />
          </div>
        </div>

        {/* Campo Senha */}
        {mode === "credentials" && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
              <a href="/esqueci-senha" className="text-xs font-semibold text-primary hover:underline">
                Esqueceu a senha?
              </a>
            </div>
            <div className="relative">
              <i className="ti ti-lock absolute left-3 top-3.5 text-slate-400 text-sm" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                className="pl-9 pr-9 h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <i className={`ti ti-${showPassword ? "eye-off" : "eye"} text-sm`} />
              </button>
            </div>
          </div>
        )}

        {/* Feedbacks de erro e sucesso */}
        {formError && <Alert variant="error" message={formError} />}
        {formSuccess && <Alert variant="success" message={formSuccess} />}

        {/* Botão de submit com Skeleton/Loading */}
        <Button
          type="submit"
          className="w-full h-11 mt-2 text-sm font-semibold hover:opacity-90"
          style={{ backgroundColor: "var(--color-button, var(--color-primary))", color: "#fff" }}
          disabled={submitting}
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Processando...</span>
            </div>
          ) : mode === "credentials" ? (
            "Entrar na conta"
          ) : (
            "Enviar link de acesso"
          )}
        </Button>
      </form>

      {/* Switch de modo */}
      <div className="text-center pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setMode(mode === "credentials" ? "magic-link" : "credentials")
            setFormError(null)
            setFormSuccess(null)
          }}
          className="text-xs font-semibold text-primary hover:underline"
          disabled={submitting}
        >
          {mode === "credentials" ? "Entrar com magic link" : "Entrar com e-mail e senha"}
        </button>
      </div>
    </div>
  )
}
