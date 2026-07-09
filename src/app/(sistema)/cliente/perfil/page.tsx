"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/shared/context/AppContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { http } from "@/shared/lib/http"

export default function PerfilPage() {
  const { user, refreshSession } = useApp()

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Image states
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  
  // Status states
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Populate form with current user details
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null)
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to 3MB
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("A foto selecionada deve ter no máximo 3MB.")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Nome e e-mail são obrigatórios.")
      return
    }

    if (password) {
      if (password.length < 8) {
        setErrorMsg("A nova senha deve ter no mínimo 8 caracteres.")
        return
      }
      if (password !== confirmPassword) {
        setErrorMsg("A confirmação da nova senha não confere.")
        return
      }
    }

    setLoading(true)
    
    // Constrói payload de envio
    const payload: any = {
      name: name.trim(),
      email: email.trim(),
    }
    if (password) {
      payload.password = password
    }
    if (photoBase64) {
      payload.photo_base64 = photoBase64
    } else if (user?.photo_url) {
      // Se não enviou base64 mas já tinha foto, mantém a atual enviando a URL existente
      payload.photo_base64 = user.photo_url
    }

    const res = await http.put<{ token: string }>("/auth/profile", payload)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message || "Ocorreu um erro ao atualizar o perfil.")
    } else {
      setSuccessMsg("Perfil atualizado com sucesso!")
      setPassword("")
      setConfirmPassword("")
      
      // Atualiza os dados de usuário na sessão global (carrega o novo JWT)
      await refreshSession()
      
      // Limpa a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMsg(null)
      }, 3000)
    }
  }

  // Define qual imagem de perfil exibir
  const getAvatarSource = () => {
    if (photoBase64) return photoBase64
    if (user?.photo_url) {
      // Resolve caso a URL da imagem seja relativa ao backend
      if (user.photo_url.startsWith("/uploads")) {
        // Se a url for "/uploads/filename.png"
        return `http://localhost:8080${user.photo_url}`
      }
      return user.photo_url
    }
    return null
  }

  const avatarSrc = getAvatarSource()
  const userInitials = name ? name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() : "U"

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Título da tela */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <i className="ti ti-user-cog text-slate-400" />
          Meu Perfil
        </h1>
        <p className="text-sm font-medium text-slate-400">
          Gerencie suas informações de conta, e-mail de acesso, senha e foto de perfil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Lado Esquerdo: Foto de Perfil */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col items-center space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-center w-full">
            Foto de Perfil
          </h2>

          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-slate-200/80 shadow-inner flex items-center justify-center bg-slate-50 transition hover:border-slate-300">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-full h-full object-cover select-none"
              />
            ) : (
              <span className="text-3xl font-black text-slate-400 select-none">
                {userInitials}
              </span>
            )}
            
            {/* Overlay para alterar foto no hover */}
            <label
              htmlFor="profile-photo-file"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 cursor-pointer transition-opacity duration-200 select-none"
            >
              <i className="ti ti-camera text-white text-xl" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Alterar</span>
            </label>
          </div>

          <input
            type="file"
            id="profile-photo-file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handlePhotoUploadChange}
          />

          <label
            htmlFor="profile-photo-file"
            className="px-4 py-1.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition cursor-pointer select-none"
          >
            Escolher Foto
          </label>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Formatos suportados: PNG, JPG, JPEG ou WEBP.<br />
            Tamanho máximo: 3MB.
          </p>
        </div>

        {/* Lado Direito: Formulário de Dados */}
        <div className="md:col-span-2 space-y-6">
          {/* Card: Dados Básicos */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <i className="ti ti-id text-slate-400 text-base" />
                Dados Principais
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                  <Input
                    placeholder="Ex: Pedro de Souza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail de Acesso</label>
                  <Input
                    type="email"
                    placeholder="Ex: pedro@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Segurança */}
          <Card className="border border-slate-200 shadow-sm rounded-2xl">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <i className="ti ti-shield text-slate-400 text-base" />
                Redefinir Senha
              </h2>
              <p className="text-xs text-slate-400">
                Deixe os campos abaixo em branco se não desejar alterar sua senha de acesso atual.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nova Senha</label>
                  <Input
                    type="password"
                    placeholder="Nova senha (mínimo 8 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Confirmar Nova Senha</label>
                  <Input
                    type="password"
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback & Botão Salvar */}
          <div className="flex flex-col gap-3">
            {errorMsg && (
              <div className="text-sm font-semibold text-red-650 bg-red-50 border border-red-150 p-3 rounded-xl flex items-center gap-2">
                <i className="ti ti-alert-circle text-lg" />
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="text-sm font-semibold text-emerald-650 bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-center gap-2">
                <i className="ti ti-circle-check text-lg" />
                {successMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="font-bold bg-slate-900 text-white hover:bg-slate-800 px-6 h-10 shadow-sm"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
