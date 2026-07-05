"use client"

import { useConfigIdentidadeVisual, FONTS } from "@/features/configuracoes/hooks/useConfigIdentidadeVisual"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function IdentidadeVisualDesktop() {
  const {
    config,
    loading,
    saving,
    uploading,
    errorMsg,
    successMsg,
    logoUrl,
    colorPrimary,
    setColorPrimary,
    colorSecondary,
    setColorSecondary,
    fontFamily,
    setFontFamily,
    address,
    setAddress,
    neighborhood,
    setNeighborhood,
    city,
    setCity,
    state,
    setState,
    phone,
    setPhone,
    whatsapp,
    setWhatsapp,
    instagram,
    setInstagram,
    timezone,
    cancelHours,
    setCancelHours,
    requiresLogin,
    setRequiresLogin,
    minAdvance,
    setMinAdvance,
    maxAdvance,
    setMaxAdvance,
    interval,
    setInterval,
    handleLogoUpload,
    handleSubmit,
  } = useConfigIdentidadeVisual()

  if (loading && !config) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full animate-fade-in px-1 md:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Identidade Visual e Portal</h1>
        <p className="text-sm text-slate-500 mt-1">Configure o design do portal de agendamento online e suas regras de atendimento.</p>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Formulário de Configuração (Esquerda) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção Marca */}
            <Card>
              <CardHeader>
                <CardTitle>Marca e Cores</CardTitle>
                <CardDescription>Personalize o visual com sua logo e cores institucionais.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden relative shadow-sm">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Barbearia" className="h-full w-full object-contain p-1" />
                    ) : (
                      <i className="ti ti-camera text-2xl" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer">
                      <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]">
                        Enviar Logo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">PNG ou JPG recomendado (fundo transparente).</p>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Cores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cor Primária (Header/Buttons)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <Input
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cor Secundária (Destaques)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer"
                      />
                      <Input
                        value={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipografia */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Fonte de Texto</label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {FONTS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Seção Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Contato e Localização</CardTitle>
                <CardDescription>Estes dados serão mostrados no portal de agendamento público.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Endereço</label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ex: Av. Paulista, 1000" />
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Bairro</label>
                    <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex: Bela Vista" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Cidade</label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Paulo" />
                  </div>
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">UF</label>
                    <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="SP" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 11999999999" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                    <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ex: 11999999999" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Instagram (Usuário)</label>
                  <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Ex: barbeariacentral (sem @)" />
                </div>
              </CardContent>
            </Card>

            {/* Seção Agendamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Regras de Agendamento</CardTitle>
                <CardDescription>Determine a antecedência máxima, limites de cancelamento e intervalo entre cortes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Antecedência Mínima (Horas)</label>
                    <Input type="number" min="0" value={minAdvance} onChange={(e) => setMinAdvance(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Antecedência Máxima (Dias)</label>
                    <Input type="number" min="1" value={maxAdvance} onChange={(e) => setMaxAdvance(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Intervalo entre Cortes (Minutos)</label>
                    <Input type="number" min="0" step="5" value={interval} onChange={(e) => setInterval(e.target.value)} />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Política de Cancelamento (Horas antes)</label>
                    <Input type="number" min="0" value={cancelHours} onChange={(e) => setCancelHours(e.target.value)} />
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="req-login"
                    checked={requiresLogin}
                    onCheckedChange={(c) => setRequiresLogin(!!c)}
                  />
                  <label htmlFor="req-login" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                    Exigir login no portal público para agendar
                  </label>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full font-bold" disabled={saving}>
              {saving ? "Salvando Configurações..." : "Salvar Configurações"}
            </Button>
          </form>
        </div>

        {/* Mockup do Portal / Preview em Tempo Real (Direita) */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prévia em Tempo Real</span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/40">Portal Público</span>
            </div>

            {/* Celular Mockup */}
            <div className="relative mx-auto max-w-[340px] h-[640px] rounded-[40px] border-[10px] border-slate-900 bg-slate-50 shadow-2xl overflow-hidden flex flex-col font-sans">
              {/* Speaker & Camera Notch */}
              <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center items-center z-50">
                <div className="w-16 h-2.5 bg-black rounded-full" />
              </div>

              {/* Portal Content Scrollable */}
              <div
                className="flex-1 overflow-y-auto pt-6 pb-4"
                style={{
                  fontFamily: fontFamily === "Playfair Display" ? "Georgia, serif" : fontFamily,
                }}
              >
                {/* Header do Portal */}
                <div
                  className="p-6 text-center text-white transition-colors duration-200"
                  style={{ backgroundColor: colorPrimary }}
                >
                  <div className="h-12 w-12 rounded-full bg-white/20 mx-auto flex items-center justify-center overflow-hidden mb-3 border border-white/10">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <i className="ti ti-cut text-xl" />
                    )}
                  </div>
                  <h3 className="font-extrabold text-base leading-none">Barbearia Modelo</h3>
                  <p className="text-[10px] text-white/70 mt-1">{neighborhood || "Centro"} • {city || "São Paulo"}</p>
                </div>

                {/* Info Card */}
                <div className="p-4 bg-white border-b border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Contato</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{phone || "(11) 99999-9999"}</p>
                  <div className="flex gap-2 justify-center mt-3">
                    <span className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs border border-emerald-100">
                      <i className="ti ti-brand-whatsapp text-sm" />
                    </span>
                    <span className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs border border-indigo-100">
                      <i className="ti ti-brand-instagram text-sm" />
                    </span>
                  </div>
                </div>

                {/* Serviços Falsos */}
                <div className="p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Serviços Disponíveis</h4>

                  {[
                    { name: "Corte Degradê", desc: "Degradê moderno com acabamento na navalha.", time: 30, price: 45.0 },
                    { name: "Barba Completa", desc: "Toalha quente, barboterapia e alinhamento.", time: 20, price: 30.0 },
                  ].map((s, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                      <div className="min-w-0 pr-2">
                        <p className="font-extrabold text-xs text-slate-800 leading-tight">{s.name}</p>
                        <p className="text-[9px] text-slate-400 line-clamp-1 leading-normal mt-0.5">{s.desc}</p>
                        <span className="text-[9px] font-bold text-slate-500 mt-1 block">{s.time} min</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-extrabold text-slate-800">R$ {s.price.toFixed(2)}</span>
                        <button
                          type="button"
                          className="mt-1.5 h-6 px-2 text-[9px] font-bold rounded-lg text-white block transition-colors"
                          style={{ backgroundColor: colorSecondary }}
                        >
                          Escolher
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA Agendar */}
                <div className="p-4">
                  <button
                    type="button"
                    className="w-full h-10 text-xs font-bold rounded-xl text-white transition-colors flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: colorPrimary }}
                  >
                    Agendar Agora
                    <i className="ti ti-chevron-right text-xs" />
                  </button>
                </div>
              </div>

              {/* Footer Mockup */}
              <div className="bg-slate-100 py-3 text-center border-t border-slate-200 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                Powered by BarberCentral
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
