"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { http } from "@/shared/lib/http"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

interface ClientConfig {
  client_id: string
  logo_url?: string
  logo_central?: string
  color_primary: string
  color_secondary: string
  color_button?: string
  background_type?: string
  font_family: string
}

export default function LayoutConfigPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [config, setConfig] = useState<ClientConfig | null>(null)

  // Layout fields
  const [logoHeader, setLogoHeader] = useState("")
  const [logoCentral, setLogoCentral] = useState("")
  const [colorPrimary, setColorPrimary] = useState("#7C3AED")
  const [colorSecondary, setColorSecondary] = useState("#EC4899")
  const [colorButton, setColorButton] = useState("#7C3AED")
  const [bgType, setBgType] = useState("gradient")
  const [fontFamily, setFontFamily] = useState("Inter")

  const fileInputHeaderRef = useRef<HTMLInputElement>(null)
  const fileInputCentralRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConfig()
  }, [clientId])

  const loadConfig = async () => {
    setLoading(true)
    const res = await http.get<ClientConfig>(`/admin/clients/${clientId}/config`)
    setLoading(false)

    if (res.error) {
      setErrorMsg(res.error.message)
      return
    }

    if (res.data) {
      setConfig(res.data)
      setLogoHeader(res.data.logo_url || "")
      setLogoCentral(res.data.logo_central || "")
      setColorPrimary(res.data.color_primary || "#7C3AED")
      setColorSecondary(res.data.color_secondary || "#EC4899")
      setColorButton(res.data.color_button || res.data.color_primary || "#7C3AED")
      setBgType(res.data.background_type || "gradient")
      setFontFamily(res.data.font_family || "Inter")
    }
  }

  const handleUpload = async (file: File, type: "header" | "central") => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      if (type === "header") {
        setLogoHeader(base64String)
      } else {
        setLogoCentral(base64String)
      }
    }
    reader.onerror = () => {
      alert("Erro ao ler o arquivo de imagem")
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setSaving(true)
    const res = await http.put<ClientConfig>(`/admin/clients/${clientId}/config`, {
      ...config,
      logo_url: logoHeader || null,
      logo_central: logoCentral || null,
      color_primary: colorPrimary,
      color_secondary: colorSecondary,
      color_button: colorButton,
      background_type: bgType,
      font_family: fontFamily,
    })
    setSaving(false)

    if (res.error) {
      alert(res.error.message)
      return
    }
    
    router.push(`/admin/clientes/${clientId}`)
  }

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="flex items-center gap-4 border-b pb-4">
        <Link href={`/admin/clientes/${clientId}`} className="text-slate-400 hover:text-slate-600 transition">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurar Layout</h1>
          <p className="text-sm text-slate-500 mt-0.5">Personalize a identidade visual da barbearia</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* LOGOTIPOS */}
        <Card className="shadow-sm border-slate-100">
          <CardContent className="pt-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2 mb-6">Logotipos</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Logo do Cabeçalho (Header)</label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="URL da logo ou faça upload" 
                    value={logoHeader} 
                    onChange={e => setLogoHeader(e.target.value)} 
                    className="flex-1"
                  />
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputHeaderRef}
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0], "header")
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputHeaderRef.current?.click()}
                  >
                    Upload
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Logo Central (Telas de Jogo/Principal)</label>
                <div className="flex gap-3">
                  <Input 
                    placeholder="URL da logo ou faça upload" 
                    value={logoCentral} 
                    onChange={e => setLogoCentral(e.target.value)} 
                    className="flex-1"
                  />
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputCentralRef}
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleUpload(e.target.files[0], "central")
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputCentralRef.current?.click()}
                  >
                    Upload
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PALETA DE CORES */}
        <Card className="shadow-sm border-slate-100">
          <CardContent className="pt-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2 mb-6">Paleta de Cores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Cor Primária</label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                    <input 
                      type="color" 
                      value={colorPrimary} 
                      onChange={e => setColorPrimary(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={colorPrimary} 
                    onChange={e => setColorPrimary(e.target.value)} 
                    className="font-mono uppercase text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Cor Secundária</label>
                <div className="flex gap-3 items-center">
                  <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                    <input 
                      type="color" 
                      value={colorSecondary} 
                      onChange={e => setColorSecondary(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={colorSecondary} 
                    onChange={e => setColorSecondary(e.target.value)} 
                    className="font-mono uppercase text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Cor dos Botões</label>
                <div className="flex gap-3 items-center max-w-[280px]">
                  <div className="relative w-10 h-10 rounded border overflow-hidden shrink-0">
                    <input 
                      type="color" 
                      value={colorButton} 
                      onChange={e => setColorButton(e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <Input 
                    value={colorButton} 
                    onChange={e => setColorButton(e.target.value)} 
                    className="font-mono uppercase text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PLANO DE FUNDO E FONTE */}
        <Card className="shadow-sm border-slate-100">
          <CardContent className="pt-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b pb-2 mb-6">Plano de Fundo e Fonte</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Fundo</label>
                <Select value={bgType} onValueChange={setBgType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de fundo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient">Gradiente (Primária & Secundária)</SelectItem>
                    <SelectItem value="solid_primary">Sólido (Cor Primária)</SelectItem>
                    <SelectItem value="solid_dark">Sólido Escuro (Padrão)</SelectItem>
                    <SelectItem value="solid_light">Sólido Claro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipografia (Fonte)</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a fonte principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter (Padrão e Moderna)</SelectItem>
                    <SelectItem value="Roboto">Roboto (Clássica)</SelectItem>
                    <SelectItem value="Poppins">Poppins (Arredondada)</SelectItem>
                    <SelectItem value="Outfit">Outfit (Geométrica)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => router.push(`/admin/clientes/${clientId}`)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="gap-2 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Layout
          </Button>
        </div>

      </form>
    </div>
  )
}
