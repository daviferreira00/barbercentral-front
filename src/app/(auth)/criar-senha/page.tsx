"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"

import { Suspense } from "react"

function CreatePasswordFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  // Security requirements
  const requirements = [
    { label: "Mínimo de 8 caracteres", met: password.length >= 8 },
    { label: "Pelo menos 1 letra", met: /[a-zA-Z]/.test(password) },
    { label: "Pelo menos 1 número", met: /[0-9]/.test(password) },
    { label: "Pelo menos 1 caractere especial", met: /[^a-zA-Z0-9]/.test(password) },
  ]

  const satisfiedCount = requirements.filter((r) => r.met).length

  let strengthText = "Muito fraca"
  let strengthColor = "bg-red-500"
  let strengthWidth = "w-[20%]"

  if (satisfiedCount === 2) {
    strengthText = "Fraca"
    strengthColor = "bg-amber-500"
    strengthWidth = "w-[45%]"
  } else if (satisfiedCount === 3) {
    strengthText = "Média"
    strengthColor = "bg-yellow-500"
    strengthWidth = "w-[70%]"
  } else if (satisfiedCount === 4) {
    strengthText = "Forte"
    strengthColor = "bg-emerald-500"
    strengthWidth = "w-full"
  }

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError("As senhas não coincidem.")
    } else {
      setConfirmError(null)
    }
  }, [password, confirmPassword])

  const [countdown, setCountdown] = useState(5)
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (success && countdown === 0) {
      router.push("/login")
    }
  }, [success, countdown, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!token) {
      setFormError("Token de recuperação ausente ou inválido.")
      return
    }

    if (satisfiedCount < 4) {
      setFormError("A senha não atende a todos os requisitos de segurança.")
      return
    }

    if (password !== confirmPassword) {
      setConfirmError("As senhas não coincidem.")
      return
    }

    setSubmitting(true)
    const res = await authService.resetPassword(token, password)
    setSubmitting(false)

    if (res.error) {
      setFormError(res.error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="w-full text-center flex flex-col items-center gap-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
          <i className="ti ti-shield-check text-3xl" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">Senha redefinida com sucesso</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Sua nova senha foi salva. Você será redirecionado para a tela de login em{" "}
            <strong className="text-slate-800 font-bold">{countdown} segundos</strong>.
          </p>
        </div>

        <a
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 h-11 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition active:scale-[0.98]"
        >
          Ir para o login agora
        </a>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Crie sua nova senha</h2>
        <p className="text-sm text-slate-500 mt-1">
          Defina uma senha segura contendo números, letras e caracteres especiais.
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Nova Senha */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Nova Senha</label>
          <div className="relative">
            <i className="ti ti-lock absolute left-3 top-3.5 text-slate-400 text-sm" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua nova senha"
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

        {/* Força da senha indicador */}
        {password.length > 0 && (
          <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500">Força da senha:</span>
              <span className="font-bold text-slate-700">{strengthText}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full ${strengthColor} ${strengthWidth} transition-all duration-300`} />
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[10px] text-slate-400">
              {requirements.map((req) => (
                <div key={req.label} className="flex items-center gap-1">
                  <i className={`ti ti-${req.met ? "circle-check text-emerald-500" : "circle text-slate-300"}`} />
                  <span className={req.met ? "text-slate-600 font-semibold" : ""}>{req.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmação */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase">Confirmar Senha</label>
          <div className="relative">
            <i className="ti ti-lock-check absolute left-3 top-3.5 text-slate-400 text-sm" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme sua nova senha"
              className="pl-9 pr-9 h-11"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              <i className={`ti ti-${showConfirmPassword ? "eye-off" : "eye"} text-sm`} />
            </button>
          </div>
          {confirmError && (
            <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
              <i className="ti ti-alert-circle text-xs" />
              {confirmError}
            </p>
          )}
        </div>

        {formError && <Alert variant="error" message={formError} />}

        <Button
          type="submit"
          className="w-full h-11 mt-2 font-semibold"
          disabled={submitting || satisfiedCount < 4 || password !== confirmPassword}
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Salvando...</span>
            </div>
          ) : (
            "Salvar nova senha"
          )}
        </Button>
      </form>
    </div>
  )
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <CreatePasswordFormContent />
    </Suspense>
  )
}
