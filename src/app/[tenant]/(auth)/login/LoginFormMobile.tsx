"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"
import { haptic } from "@/shared/lib/haptics"
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  KeyRound, 
  Smartphone, 
  Sun, 
  Moon, 
  Fingerprint 
} from "lucide-react"

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

  // Novas opções da experiência mobile
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [rememberMe, setRememberMe] = useState(false)
  const [enableBiometrics, setEnableBiometrics] = useState(false)
  const [hasStoredBiometrics, setHasStoredBiometrics] = useState(false)

  // Verifica se o navegador suporta WebAuthn (Biometria / Face ID)
  const isBiometricSupported = typeof window !== "undefined" && !!window.PublicKeyCredential

  useEffect(() => {
    // Carrega tema salvo ou usa padrão "light"
    const savedTheme = localStorage.getItem("login_theme")
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark")
    }

    // Carrega e-mail salvo (Lembrar-me)
    const savedEmail = localStorage.getItem("remembered_email")
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }

    // Verifica se possui biometria cadastrada localmente
    const savedBiometrics = localStorage.getItem("biometric_data")
    if (savedBiometrics) {
      setHasStoredBiometrics(true)
    }
  }, [])

  const toggleTheme = () => {
    haptic()
    const nextTheme = theme === "light" ? "dark" : "light"
    setTheme(nextTheme)
    localStorage.setItem("login_theme", nextTheme)
  }

  const handleRegisterBiometrics = async (userEmail: string, userPass: string) => {
    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const options: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: { name: "BarberCentral" },
          user: {
            id: new Uint8Array(16),
            name: userEmail,
            displayName: userEmail
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      }

      await navigator.credentials.create(options)
      
      const encryptedData = btoa(JSON.stringify({ email: userEmail, password: userPass }))
      localStorage.setItem("biometric_data", encryptedData)
      setHasStoredBiometrics(true)
    } catch (err) {
      console.warn("Falha ao registrar biometria:", err)
    }
  }

  const handleBiometricLogin = async () => {
    haptic()
    if (!hasStoredBiometrics) return

    setFormError(null)
    setFormSuccess(null)

    try {
      const challenge = new Uint8Array(32)
      window.crypto.getRandomValues(challenge)

      const options: CredentialRequestOptions = {
        publicKey: {
          challenge,
          userVerification: "required",
          timeout: 60000
        }
      }

      // Chama prompt nativo de Face ID / Touch ID / Touch code do aparelho
      await navigator.credentials.get(options)

      const savedData = localStorage.getItem("biometric_data")
      if (!savedData) return

      const { email: savedEmail, password: savedPassword } = JSON.parse(atob(savedData))

      setSubmitting(true)
      const res = await authService.login({ email: savedEmail, password: savedPassword, tenant })
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
    } catch (err) {
      console.warn("Falha na biometria:", err)
      setFormError("Erro ou cancelamento na biometria do dispositivo.")
    }
  }

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

      // Lembrar e-mail
      if (rememberMe) {
        localStorage.setItem("remembered_email", email)
      } else {
        localStorage.removeItem("remembered_email")
      }

      // Registrar Face ID se solicitado
      if (enableBiometrics && isBiometricSupported) {
        await handleRegisterBiometrics(email, password)
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

  // Definições de estilo de acordo com o tema selecionado (Light ou Dark)
  const isDark = theme === "dark"
  
  const bgClass = isDark 
    ? "bg-slate-950 text-white" 
    : "bg-slate-50 text-slate-900"

  const cardBgClass = isDark
    ? "bg-white/5 border-white/10"
    : "bg-white border-slate-200 shadow-sm"

  const inputBgClass = isDark
    ? "bg-white/5 border-white/10 focus:border-white/20 focus:ring-white/10 text-white placeholder-slate-500"
    : "bg-slate-100 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100 text-slate-900 placeholder-slate-400"

  const labelClass = isDark
    ? "text-slate-400"
    : "text-slate-500"

  const toggleBtnActive = isDark
    ? "bg-white text-slate-950 shadow-md scale-[1.02]"
    : "bg-slate-900 text-white shadow-md scale-[1.02]"

  const toggleBtnInactive = isDark
    ? "text-slate-400 hover:text-slate-200"
    : "text-slate-500 hover:text-slate-700"

  return (
    <div className={`fixed inset-0 flex flex-col justify-between p-6 overflow-y-auto select-none transition-colors duration-300 ${bgClass}`}>
      
      {/* Background circular glowing elements (Visíveis apenas em Dark) */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-indigo-650/15 blur-[90px] pointer-events-none animate-pulse duration-[4000ms]" />
          <div className="absolute bottom-[10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
        </>
      )}

      {/* Header com Toggle de Tema */}
      <div className="flex justify-between items-center pt-4 z-10 shrink-0">
        <div>
          <span className={`text-[9px] font-black tracking-widest uppercase flex items-center gap-1 ${isDark ? "text-slate-450" : "text-slate-500"}`}>
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Gestão Inteligente</span>
          </span>
        </div>
        
        {/* Botão de Troca de Tema */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Trocar tema"
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition active:scale-90 ${
            isDark 
              ? "bg-white/5 border-white/10 text-amber-300" 
              : "bg-white border-slate-200 text-slate-600 shadow-sm"
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Middle section: Form card */}
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6 z-10 py-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-auto flex items-center justify-center">
            <img
              src={isDark ? logoUrl : "/logo/barbercentral-logo-horizontal.svg"}
              alt="BarberCentral Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        </div>

        {/* Toggle Mode Segmented Control */}
        <div className={`flex p-1 rounded-2xl w-full relative border ${cardBgClass}`}>
          <button
            type="button"
            onClick={() => {
              haptic()
              setMode("credentials")
              setFormError(null)
              setFormSuccess(null)
            }}
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === "credentials" ? toggleBtnActive : toggleBtnInactive
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
            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
              mode === "magic-link" ? toggleBtnActive : toggleBtnInactive
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
            <label className={`text-[10px] font-extrabold uppercase tracking-widest ${labelClass}`}>
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="nome@barbearia.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                required
                className={`w-full h-11 border rounded-xl pl-10 pr-4 text-sm font-semibold focus:outline-none transition ${inputBgClass}`}
              />
            </div>
          </div>

          {/* Senha */}
          {mode === "credentials" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-extrabold uppercase tracking-widest ${labelClass}`}>
                  Senha de acesso
                </label>
                <a
                  href="/esqueci-senha"
                  onClick={() => haptic()}
                  className="text-xs font-bold text-amber-500 active:text-amber-600"
                >
                  Esqueceu?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  required
                  className={`w-full h-11 border rounded-xl pl-10 pr-10 text-sm font-semibold focus:outline-none transition ${inputBgClass}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    haptic()
                    setShowPassword(!showPassword)
                  }}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Opções extras (Lembrar-me e Ativar Face ID) */}
          {mode === "credentials" && (
            <div className="flex flex-col gap-2.5 mt-1 px-1">
              {/* Checkbox Lembrar-me */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => { haptic(); setRememberMe(e.target.checked) }}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                />
                <span className="text-xs font-bold text-slate-500">Lembrar meu e-mail</span>
              </label>

              {/* Toggle Habilitar Face ID */}
              {isBiometricSupported && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableBiometrics}
                    onChange={(e) => { haptic(); setEnableBiometrics(e.target.checked) }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    Ativar Face ID neste celular
                  </span>
                </label>
              )}
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

          {/* Botões de Ação */}
          <div className="flex flex-col gap-2.5 mt-2">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="mobile-tap w-full h-11 rounded-xl text-xs font-black text-slate-900 shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary, #f59e0b)" }}
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

            {/* Botão Biometria / Face ID */}
            {mode === "credentials" && hasStoredBiometrics && isBiometricSupported && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={submitting}
                className={`w-full h-11 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition active:scale-[0.98] ${
                  isDark
                    ? "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
                }`}
              >
                <Fingerprint className="h-4.5 w-4.5 text-amber-500" />
                <span>Entrar com Face ID</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Bottom section: Footer */}
      <div className="text-center pb-4 z-10 shrink-0">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} BarberCentral
        </p>
      </div>
    </div>
  )
}
