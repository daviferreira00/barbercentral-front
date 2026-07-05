"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { authService } from "@/shared/auth/auth-service"
import { useApp } from "@/shared/context/AppContext"

import { Suspense } from "react"

function MagicLinkPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const { refreshSession } = useApp()

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const hasTriggeredRef = useRef(false)

  const verifyToken = async () => {
    if (!token) {
      setErrorMsg("Link de acesso rápido inválido ou ausente.")
      setLoading(false)
      return
    }

    try {
      const res = await authService.verifyMagicLink(token)
      if (res.error) {
        setErrorMsg(res.error.message)
        setLoading(false)
        return
      }

      // Atualiza o contexto do App de usuário logado
      await refreshSession()

      if (res.data) {
        if (res.data.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/cliente")
        }
      }
    } catch (e) {
      setErrorMsg("Erro de conexão ao validar o acesso rápido.")
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      verifyToken()
    }
  }, [token])

  return (
    <div className="w-full text-center flex flex-col items-center gap-5">
      {loading ? (
        <div className="flex flex-col items-center gap-4 py-6">
          {/* Skeleton/Loading spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Validando acesso rápido...</h2>
            <p className="text-xs text-slate-400 mt-1">Aguarde, estamos confirmando a sua sessão.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 w-full">
          {errorMsg ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 animate-pulse">
                <i className="ti ti-alert-triangle text-3xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Falha ao autenticar</h2>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Ocorreu um problema ao validar o seu link de acesso rápido.
                </p>
              </div>
              <div className="w-full">
                <Alert variant="error" message={errorMsg} />
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 animate-bounce">
                <i className="ti ti-circle-check text-3xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Acesso autorizado!</h2>
                <p className="text-sm text-slate-500 mt-1">Redirecionando para o seu painel...</p>
              </div>
            </>
          )}

          <a
            href="/login"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 h-11 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-[0.98] mt-2"
          >
            Voltar para o login
          </a>
        </div>
      )}
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="flex h-32 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <MagicLinkPageContent />
    </Suspense>
  )
}
