"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"
import { haptic } from "@/shared/lib/haptics"
import { Mail, Lock, Eye, EyeOff, Sparkles, KeyRound, Smartphone } from "lucide-react"

type LoginMode = "credentials" | "magic-link"

export default function LoginFormMobile({ logoUrl = "/logo/barbercentral-logo-horizontal-white.svg" }: { logoUrl?: string }) {
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
    haptic()
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
    <div className="fixed inset-0 flex flex-col justify-between bg-slate-950 p-6 text-white overflow-y-auto select-none">
      {/* Background circular glowing elements */}
      <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-indigo-650/15 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Top section: Logo */}
      <div className="flex flex-col items-center pt-8 z-10 shrink-0">
        <div className="h-14 w-auto flex items-center justify-center">
          <img
            src={logoUrl}
            alt="BarberCentral Logo"
            className="h-full w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
          />
        </div>
        <p className="text-[10px] font-black tracking-widest text-slate-450 uppercase mt-2.5 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Gestão Inteligente</span>
        </p>
      </div>

      {/* Middle section: Form card */}
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 z-10 py-6">
        
        {/* Toggle Mode Segmented Control */}
        <div className="flex bg-white/5 border border-white/15 p-1 rounded-2xl w-full shadow-inner relative">
          <button
            type="button"
            onClick={() => {
              haptic()
              setMode("credentials")
              setFormError(null)
              setFormSuccess(null)
            }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === "credentials"
                ? "bg-white text-slate-950 shadow-md scale-[1.02]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Senha</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              haptic()
              setMode("magic-link")
              setFormError(null)
              setFormSuccess(null)
            }}
            className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === "magic-link"
                ? "bg-white text-slate-950 shadow-md scale-[1.02]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Sem Senha</span>
          </button>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-5 w-5 text-slate-450" />
              <input
                type="email"
                placeholder="nome@barbearia.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                className="w-full h-11 bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/10 rounded-xl pl-11 pr-4 text-base font-semibold text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Senha */}
          {mode === "credentials" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Senha de acesso
                </label>
                <a
                  href="/esqueci-senha"
                  onClick={() => haptic()}
                  className="text-xs font-bold text-amber-400 active:text-amber-500"
                >
                  Esqueceu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-5 w-5 text-slate-450" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                  className="w-full h-11 bg-white/5 border border-white/10 focus:border-white/20 focus:ring-2 focus:ring-white/10 rounded-xl pl-11 pr-11 text-base font-semibold text-white placeholder-slate-500 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    haptic()
                    setShowPassword(!showPassword)
                  }}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Feedbacks */}
          {formError && (
            <div className="mt-1">
              <Alert variant="error" message={formError} />
            </div>
          )}
          {formSuccess && (
            <div className="mt-1">
              <Alert variant="success" message={formSuccess} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="mobile-tap w-full h-12 mt-4 rounded-xl text-sm font-black text-slate-950 shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary, #fff)" }}
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                <span>Processando...</span>
              </div>
            ) : mode === "credentials" ? (
              "Entrar na conta"
            ) : (
              "Receber Link de Acesso"
            )}
          </button>
        </form>
      </div>

      {/* Bottom section: Footer */}
      <div className="text-center pb-4 z-10 shrink-0">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} BarberCentral
        </p>
      </div>
    </div>
  )
}
