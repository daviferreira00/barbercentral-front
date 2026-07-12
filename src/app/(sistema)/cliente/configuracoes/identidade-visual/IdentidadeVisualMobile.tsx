"use client"

import { useState } from "react"
import Link from "next/link"
import { useConfigIdentidadeVisual, FONTS } from "@/features/configuracoes/hooks/useConfigIdentidadeVisual"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert } from "@/components/ui/alert"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ActionBar } from "@/components/mobile/ActionBar"
import { FilterChips } from "@/components/mobile/FilterChips"
import { haptic } from "@/shared/lib/haptics"

export default function IdentidadeVisualMobile() {
  const {
    config,
    loading,
    saving,
    uploading,
    errorMsg,
    successMsg,
    logoUrl,
    logoCentral,
    colorPrimary,
    setColorPrimary,
    colorSecondary,
    setColorSecondary,
    colorButton,
    setColorButton,
    backgroundType,
    setBackgroundType,
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
    kdsPin,
    setKdsPin,
    blockLunchEnabled,
    setBlockLunchEnabled,
    blockLunchStart,
    setBlockLunchStart,
    blockLunchEnd,
    setBlockLunchEnd,
    whatsappVerificationEnabled,
    setWhatsappVerificationEnabled,
    handleLogoUpload,
    handleSubmit,
  } = useConfigIdentidadeVisual()

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")

  if (loading && !config) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Estilo do background do simulador do portal
  const previewBgStyle = backgroundType === "solid_primary" ? { backgroundColor: colorPrimary }
    : backgroundType === "solid_light" ? { backgroundColor: "#f8fafc", color: "#1e293b" }
    : backgroundType === "solid_dark" ? { backgroundColor: "#0f172a", color: "#f8fafc" }
    : { backgroundImage: `linear-gradient(to top right, ${colorPrimary}, ${colorSecondary})` }

  const isDarkBg = backgroundType === "solid_dark" || backgroundType === "solid_primary" || backgroundType === "gradient"

  return (
    <div className="flex flex-col gap-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/cliente"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90 shadow-sm"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Identidade Visual</h1>
          <p className="text-xs font-semibold text-slate-400">Design do portal e regras de agendamento.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}
      {successMsg && <Alert variant="success" message={successMsg} />}

      {/* Segmented Control */}
      <FilterChips
        options={[
          { value: "form", label: "Configurações" },
          { value: "preview", label: "Prévia do Portal" }
        ]}
        value={activeTab}
        onChange={(val) => { haptic(); setActiveTab(val as any) }}
      />

      {/* TAB 1: FORMULÁRIO */}
      {activeTab === "form" && (
        <form onSubmit={(e) => { haptic(); handleSubmit(e) }} className="flex flex-col gap-4">
          
          {/* Seção Marca */}
          <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Marca e Cores</h2>
            
            {/* Logos Header & Central */}
            <div className="grid grid-cols-2 gap-4">
              {/* Logo do Cabeçalho */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Logo Cabeçalho</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden relative shadow-sm shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <i className="ti ti-camera text-lg" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-250 bg-white px-2.5 text-[10px] font-extrabold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]">
                      Alterar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "header")}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Logo Central */}
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Logo Central</label>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden relative shadow-sm shrink-0">
                    {logoCentral ? (
                      <img src={logoCentral} alt="Logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <i className="ti ti-camera text-lg" />
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <span className="inline-flex h-8 items-center justify-center rounded-xl border border-slate-250 bg-white px-2.5 text-[10px] font-extrabold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]">
                      Alterar
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, "central")}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Colors */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Primária
                </label>
                <div className="flex flex-col gap-1 items-center">
                  <input
                    type="color"
                    value={colorPrimary}
                    onChange={(e) => setColorPrimary(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">{colorPrimary}</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Secundária
                </label>
                <div className="flex flex-col gap-1 items-center">
                  <input
                    type="color"
                    value={colorSecondary}
                    onChange={(e) => setColorSecondary(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">{colorSecondary}</span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                  Botões
                </label>
                <div className="flex flex-col gap-1 items-center">
                  <input
                    type="color"
                    value={colorButton}
                    onChange={(e) => setColorButton(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">{colorButton}</span>
                </div>
              </div>
            </div>

            {/* Font */}
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Fonte de Texto
              </label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="h-11 rounded-xl text-base w-full">
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
          </div>

          {/* Plano de Fundo */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Plano de Fundo</h2>
            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Tipo de Fundo do Portal
              </label>
              <Select value={backgroundType} onValueChange={setBackgroundType}>
                <SelectTrigger className="h-11 rounded-xl text-base w-full">
                  <SelectValue placeholder="Selecione o tipo de fundo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Gradiente (Cor Primária & Secundária)</SelectItem>
                  <SelectItem value="solid_primary">Sólido (Cor Primária)</SelectItem>
                  <SelectItem value="solid_dark">Sólido Escuro (Padrão)</SelectItem>
                  <SelectItem value="solid_light">Sólido Claro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seção Contato */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Contato e Endereço</h2>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Endereço
                </label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua/Av" className="h-11 rounded-xl text-base" />
              </div>
              <div className="col-span-1">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Bairro
                </label>
                <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Bairro" className="h-11 rounded-xl text-base" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Cidade
                </label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Cidade" className="h-11 rounded-xl text-base" />
              </div>
              <div className="col-span-1">
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  UF
                </label>
                <Input value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="SP" className="h-11 rounded-xl text-base text-center" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Telefone
                </label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="h-11 rounded-xl text-base" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  WhatsApp
                </label>
                <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" className="h-11 rounded-xl text-base" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Instagram
              </label>
              <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="usuario (sem @)" className="h-11 rounded-xl text-base" />
            </div>
          </div>

          {/* Seção Regras */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Regras da Agenda</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Mín. Antecedência (h)
                </label>
                <Input type="number" min="0" value={minAdvance} onChange={(e) => setMinAdvance(e.target.value)} className="h-11 rounded-xl text-base" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Máx. Antecedência (dias)
                </label>
                <Input type="number" min="1" value={maxAdvance} onChange={(e) => setMaxAdvance(e.target.value)} className="h-11 rounded-xl text-base" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Intervalo (minutos)
                </label>
                <Input type="number" min="0" step="5" value={interval} onChange={(e) => setInterval(e.target.value)} className="h-11 rounded-xl text-base" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Cancelamento Limite (h)
                </label>
                <Input type="number" min="0" value={cancelHours} onChange={(e) => setCancelHours(e.target.value)} className="h-11 rounded-xl text-base" />
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center gap-3.5 py-1">
              <Checkbox
                id="req-login"
                checked={requiresLogin}
                onCheckedChange={(c) => { haptic(); setRequiresLogin(!!c) }}
                className="h-5 w-5 rounded-lg"
              />
              <label htmlFor="req-login" className="text-sm font-extrabold text-slate-700 cursor-pointer select-none">
                Exigir login no portal para agendar
              </label>
            </div>

            <hr className="border-slate-100" />

            <div className="flex items-center gap-3.5 py-1">
              <Checkbox
                id="whatsapp-verification"
                checked={whatsappVerificationEnabled}
                onCheckedChange={(c) => { haptic(); setWhatsappVerificationEnabled(!!c) }}
                className="h-5 w-5 rounded-lg"
              />
              <label htmlFor="whatsapp-verification" className="text-sm font-extrabold text-slate-700 cursor-pointer select-none">
                Exigir código enviado por WhatsApp para agendar
              </label>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-4">
              <div className="flex items-center gap-3.5 py-1">
                <Checkbox
                  id="block-lunch"
                  checked={blockLunchEnabled}
                  onCheckedChange={(c) => { haptic(); setBlockLunchEnabled(!!c) }}
                  className="h-5 w-5 rounded-lg"
                />
                <label htmlFor="block-lunch" className="text-sm font-extrabold text-slate-700 cursor-pointer select-none">
                  Bloquear horário de almoço diariamente
                </label>
              </div>

              {blockLunchEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-8 animate-fade-in">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Início Almoço
                    </label>
                    <Input
                      type="time"
                      value={blockLunchStart}
                      onChange={(e) => setBlockLunchStart(e.target.value)}
                      required
                      className="h-11 rounded-xl text-base"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Fim Almoço
                    </label>
                    <Input
                      type="time"
                      value={blockLunchEnd}
                      onChange={(e) => setBlockLunchEnd(e.target.value)}
                      required
                      className="h-11 rounded-xl text-base"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seção Segurança & KDS */}
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b pb-2">Segurança & KDS</h2>
            
            <div className="space-y-1.5">
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                PIN de Segurança KDS
              </label>
              <Input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                placeholder="Sem PIN (Desprotegido)"
                value={kdsPin}
                onChange={(e) => setKdsPin(e.target.value.replace(/\D/g, ""))}
                className="h-11 rounded-xl text-base"
              />
              <span className="text-[10px] text-slate-400 font-semibold leading-normal block">
                O PIN será exigido na tela do KDS para poder realizar ações rápidas.
              </span>
            </div>
          </div>

          <ActionBar>
            <button
              type="submit"
              disabled={saving}
              className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {saving ? "Salvando..." : "Salvar Configurações"}
            </button>
          </ActionBar>
        </form>
      )}

      {/* TAB 2: PRÉVIA DO PORTAL */}
      {activeTab === "preview" && (
        <div className="flex flex-col items-center justify-center py-2 animate-card-enter">
          {/* Celular Mockup */}
          <div className="relative w-full max-w-[315px] h-[550px] rounded-[36px] border-[8px] border-slate-900 bg-slate-50 shadow-lg overflow-hidden flex flex-col font-sans">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center items-center z-50">
              <div className="w-14 h-2 bg-black rounded-full" />
            </div>

            {/* Content */}
            <div
              className="flex-grow overflow-y-auto pt-5 pb-4"
              style={{
                fontFamily: fontFamily === "Playfair Display" ? "Georgia, serif" : fontFamily,
                ...previewBgStyle
              }}
            >
              {/* Header do Portal com fundo escurecido translúcido sobre o background geral */}
              <div
                className="p-5 text-center text-white border-b border-white/10 bg-black/20 backdrop-blur-sm"
              >
                <div className="h-11 w-11 rounded-full bg-white/20 mx-auto flex items-center justify-center overflow-hidden mb-2.5 border border-white/10">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                  ) : (
                    <i className="ti ti-cut text-lg" />
                  )}
                </div>
                <h3 className="font-extrabold text-sm leading-none">Barbearia Modelo</h3>
                <p className="text-[9px] text-white/70 mt-1">{neighborhood || "Centro"} • {city || "São Paulo"}</p>
              </div>

              {/* Info Card */}
              <div className={`p-3 text-center border-b ${isDarkBg ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Contato</p>
                <p className="text-xs font-bold mt-0.5">{phone || "(11) 99999-9999"}</p>
                <div className="flex gap-2 justify-center mt-2.5">
                  <span className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] border ${isDarkBg ? 'bg-white/10 border-white/10 text-white' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                    <i className="ti ti-brand-whatsapp text-xs" />
                  </span>
                  <span className={`h-6.5 w-6.5 rounded-full flex items-center justify-center text-[10px] border ${isDarkBg ? 'bg-white/10 border-white/10 text-white' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                    <i className="ti ti-brand-instagram text-xs" />
                  </span>
                </div>
              </div>

              {/* Serviços Falsos */}
              <div className="p-3 space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Serviços</h4>

                {[
                  { name: "Corte Degradê", desc: "Degradê moderno com acabamento na navalha.", time: 30, price: 45.0 },
                  { name: "Barba Completa", desc: "Toalha quente, barboterapia e alinhamento.", time: 20, price: 30.0 },
                ].map((s, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl flex justify-between items-center shadow-sm border ${isDarkBg ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-[11px] leading-tight">{s.name}</p>
                      <p className="text-[9px] text-slate-400 line-clamp-1 leading-normal mt-0.5">{s.desc}</p>
                      <span className="text-[9px] font-bold text-slate-500 mt-1 block">{s.time} min</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-extrabold">R$ {s.price.toFixed(2)}</span>
                      <button
                        type="button"
                        className="mt-1 h-5 px-1.5 text-[8px] font-bold rounded-lg text-white block transition-colors"
                        style={{ backgroundColor: colorButton }}
                      >
                        Escolher
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Agendar */}
              <div className="p-3">
                <button
                  type="button"
                  className="w-full h-9 text-[10px] font-bold rounded-xl text-white transition-colors flex items-center justify-center gap-1"
                  style={{ backgroundColor: colorButton }}
                >
                  Agendar Agora
                  <i className="ti ti-chevron-right text-[10px]" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-100 py-2.5 text-center border-t border-slate-200 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
              Powered by BarberCentral
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
