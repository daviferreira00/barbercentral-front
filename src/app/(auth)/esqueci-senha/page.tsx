"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (!email) {
      setErrorMsg("O e-mail é obrigatório.")
      return
    }

    setSubmitting(true)
    const res = await authService.requestPasswordReset(email)
    setSubmitting(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="w-full text-center flex flex-col items-center gap-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
          <i className="ti ti-mail-fast text-3xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">Verifique seu e-mail</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Enviamos as instruções e o link de recuperação para <strong className="text-slate-800 font-semibold">{email}</strong>.
          </p>
        </div>

        <a
          href="/login"
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 h-11 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-[0.98]"
        >
          <i className="ti ti-arrow-left text-base" />
          Voltar para o login
        </a>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Esqueci minha senha</h2>
        <p className="text-sm text-slate-500 mt-1">
          Informe seu e-mail cadastrado e enviaremos instruções para você redefinir sua senha.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">E-mail corporativo</label>
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

        {errorMsg && <Alert variant="error" message={errorMsg} />}

        <Button type="submit" className="w-full h-11 mt-2 font-semibold" disabled={submitting}>
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Enviando...</span>
            </div>
          ) : (
            "Enviar link de recuperação"
          )}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <a href="/login" className="text-xs font-semibold text-primary hover:underline">
          Voltar para o login
        </a>
      </div>
    </div>
  )
}
