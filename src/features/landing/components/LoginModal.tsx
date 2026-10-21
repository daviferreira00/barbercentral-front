"use client"

import { useState, useEffect } from "react"
import { X, Mail, Lock, Eye, EyeOff, User, Store, Phone, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react"
import { authService } from "@/shared/auth/auth-service"

export type ModalTab = "login" | "trial"
type LoginMode = "credentials" | "magic-link"

interface LoginModalProps {
  isOpen: boolean
  initialTab?: ModalTab
  onClose: () => void
}

export function LoginModal({ isOpen, initialTab = "login", onClose }: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab)
  const [loginMode, setLoginMode] = useState<LoginMode>("credentials")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null)

  // Trial form state
  const [barberName, setBarberName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [trialEmail, setTrialEmail] = useState("")
  const [trialPhone, setTrialPhone] = useState("")
  const [trialPassword, setTrialPassword] = useState("")
  const [showTrialPassword, setShowTrialPassword] = useState(false)
  const [trialSubmitting, setTrialSubmitting] = useState(false)
  const [trialError, setTrialError] = useState<string | null>(null)

  // Sincroniza tab inicial quando modal abre
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
      setLoginError(null)
      setLoginSuccess(null)
      setTrialError(null)
    }
  }, [isOpen, initialTab])

  // Fecha modal com tecla ESC e trava scroll do body
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Handler de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginSuccess(null)

    if (!loginEmail.trim()) {
      setLoginError("Informe o seu e-mail de acesso.")
      return
    }

    if (loginMode === "credentials") {
      if (!loginPassword) {
        setLoginError("Informe a sua senha.")
        return
      }

      setLoginSubmitting(true)
      try {
        const res = await authService.login({
          email: loginEmail.trim(),
          password: loginPassword,
        })
        setLoginSubmitting(false)

        if (res.error) {
          setLoginError(res.error.message || "E-mail ou senha incorretos.")
          return
        }

        if (res.data) {
          if (res.data.role === "admin") {
            window.location.href = "/admin"
          } else {
            window.location.href = "/cliente"
          }
        }
      } catch (err: any) {
        setLoginSubmitting(false)
        setLoginError("Não foi possível conectar ao servidor. Tente novamente.")
      }
    } else {
      // Magic Link
      setLoginSubmitting(true)
      try {
        const res = await authService.requestMagicLink(loginEmail.trim())
        setLoginSubmitting(false)

        if (res.error) {
          setLoginError(res.error.message || "Erro ao solicitar link de acesso.")
          return
        }

        setLoginSuccess("Link de acesso rápido enviado para seu e-mail! Verifique a sua caixa de entrada.")
      } catch (err: any) {
        setLoginSubmitting(false)
        setLoginError("Não foi possível enviar o link. Tente novamente.")
      }
    }
  }

  // Handler de Cadastro Trial
  const handleTrialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTrialError(null)

    if (!barberName.trim() || !ownerName.trim() || !trialEmail.trim() || !trialPassword.trim()) {
      setTrialError("Preencha todos os campos obrigatórios.")
      return
    }

    if (trialPassword.length < 6) {
      setTrialError("A senha deve conter no mínimo 6 caracteres.")
      return
    }

    setTrialSubmitting(true)
    try {
      const res = await authService.registerTrial({
        barber_name: barberName.trim(),
        name: ownerName.trim(),
        email: trialEmail.trim(),
        phone: trialPhone.trim(),
        password: trialPassword,
      })

      if (res.error) {
        setTrialError(res.error.message || "Erro ao criar conta de teste.")
        setTrialSubmitting(false)
        return
      }

      window.location.href = "/cliente"
    } catch (err: any) {
      setTrialSubmitting(false)
      setTrialError("Não foi possível conectar ao servidor. Tente novamente.")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop com blur escuro */}
      <div
        className="fixed inset-0 bg-[#060B17]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Caixa do Modal */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0E172F] p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
        {/* Glow dourado de topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#E4C56B] to-transparent blur-sm" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#E4C56B]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
          aria-label="Fechar modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Cabeçalho com Logo */}
        <div className="text-center mb-6">
          <img
            src="/logo/barbercentral-logo-horizontal-white.png"
            alt="BarberCentral"
            className="h-8 w-auto mx-auto object-contain mb-3"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/logo/barbercentral-logo-horizontal-white.svg"
            }}
          />
          <p className="text-xs text-slate-400 font-medium">
            {activeTab === "login" ? "Acesse sua conta para gerenciar sua barbearia" : "Crie sua conta e use 7 dias grátis sem cartão"}
          </p>
        </div>

        {/* Alternador de Abas (Entrar vs 7 Dias Grátis) */}
        <div className="flex rounded-2xl bg-white/5 p-1 mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
              activeTab === "login"
                ? "bg-[#162347] text-white shadow-md border border-white/10"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Acessar Conta
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("trial")}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "trial"
                ? "bg-[#E4C56B] text-[#0D172E] shadow-md shadow-[#E4C56B]/20 font-black"
                : "text-slate-400 hover:text-[#E4C56B]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            7 Dias Grátis
          </button>
        </div>

        {/* Conteúdo Aba LOGIN */}
        {activeTab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Alternador modo Senha / Magic Link */}
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-slate-400 font-medium">Como deseja entrar?</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMode("credentials")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    loginMode === "credentials"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Senha
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode("magic-link")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    loginMode === "magic-link"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Link Mágico
                </button>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {loginError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                {loginError}
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {loginSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                {loginSuccess}
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                />
              </div>
            </div>

            {/* Campo Senha (se modo credentials) */}
            {loginMode === "credentials" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Senha
                  </label>
                  <a
                    href="/recuperar-senha"
                    className="text-[11px] text-[#E4C56B] hover:underline font-semibold"
                  >
                    Esqueceu?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full rounded-xl bg-[#E4C56B] py-3 text-sm font-black text-[#0D172E] shadow-lg shadow-[#E4C56B]/20 hover:bg-[#ebd283] transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loginSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0D172E] border-t-transparent" />
              ) : (
                <>
                  <span>{loginMode === "credentials" ? "Entrar na Minha Barbearia" : "Enviar Link de Acesso"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Conteúdo Aba 7 DIAS GRÁTIS */}
        {activeTab === "trial" && (
          <form onSubmit={handleTrialSubmit} className="space-y-3.5">
            {trialError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium">
                {trialError}
              </div>
            )}

            {/* Nome da Barbearia */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nome da Barbearia *
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={barberName}
                  onChange={(e) => setBarberName(e.target.value)}
                  placeholder="Ex: Barbearia Imperial"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                />
              </div>
            </div>

            {/* Seu Nome Completo */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Seu Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                />
              </div>
            </div>

            {/* E-mail e WhatsApp lado a lado em telas maiores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="email@barbearia.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  WhatsApp (DDD)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={trialPhone}
                    onChange={(e) => setTrialPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                  />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Criar Senha (mínimo 6 caracteres) *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showTrialPassword ? "text" : "password"}
                  value={trialPassword}
                  onChange={(e) => setTrialPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-[#E4C56B] focus:outline-none focus:ring-1 focus:ring-[#E4C56B] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowTrialPassword(!showTrialPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showTrialPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Reassurance */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Sem cartão de crédito • 7 dias 100% gratuitos</span>
            </div>

            {/* Botão Registrar Trial */}
            <button
              type="submit"
              disabled={trialSubmitting}
              className="w-full rounded-xl bg-[#E4C56B] py-3 text-sm font-black text-[#0D172E] shadow-lg shadow-[#E4C56B]/20 hover:bg-[#ebd283] transition transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {trialSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0D172E] border-t-transparent" />
              ) : (
                <>
                  <span>Criar Barbearia & Começar</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
