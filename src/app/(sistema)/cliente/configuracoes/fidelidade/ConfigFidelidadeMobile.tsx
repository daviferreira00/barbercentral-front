"use client"

import Link from "next/link"
import { useConfigFidelidade } from "@/features/configuracoes/hooks/useConfigFidelidade"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { Gift, Award, Star, Loader2 } from "lucide-react"

export default function ConfigFidelidadeMobile() {
  const {
    program,
    loading,
    saving,
    successMsg,
    errorMsg,
    name,
    setName,
    type,
    setType,
    stampsToReward,
    setStampsToReward,
    pointsPerReal,
    setPointsPerReal,
    rewardDescription,
    setRewardDescription,
    active,
    setActive,
    handleSave,
  } = useConfigFidelidade()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs font-semibold">Carregando dados...</span>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { haptic(); handleSave(e) }} className="flex flex-col gap-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/cliente"
            aria-label="Voltar"
            className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90 shadow-sm"
          >
            <i className="ti ti-arrow-left" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 flex items-center gap-1.5">
              Fidelidade
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Campanhas de fidelização de clientes.</p>
          </div>
        </div>
        <Award className="h-7 w-7 text-primary" />
      </div>

      {successMsg && <Alert variant="success" message={successMsg} />}
      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Toggle ativar programa */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <label className="text-sm font-extrabold text-slate-800 block">Ativar Fidelidade</label>
          <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block">Habilitar acúmulo de pontos/carimbos.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            haptic()
            setActive(!active)
          }}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            active ? "bg-primary" : "bg-slate-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
              active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <div className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Nome do Programa
          </label>
          <Input
            placeholder="Ex: Fidelidade Barber Club"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 rounded-xl text-base"
          />
        </div>

        {/* Tipo de Programa */}
        <div className="flex flex-col gap-2.5">
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Tipo de Acúmulo
          </label>
          <div className="flex flex-col gap-2">
            <div
              onClick={() => {
                haptic()
                setType("stamps")
              }}
              className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition active:scale-[0.99] ${
                type === "stamps"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-slate-150 bg-white"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${type === "stamps" ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-400"}`}>
                <Star className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold block text-slate-800">Cartão Fidelidade</span>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Ganhe 1 carimbo a cada atendimento finalizado.</span>
              </div>
            </div>

            <div
              onClick={() => {
                haptic()
                setType("points")
              }}
              className={`flex items-center space-x-3 p-3.5 rounded-xl border cursor-pointer transition active:scale-[0.99] ${
                type === "points"
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-slate-150 bg-white"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${type === "points" ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-400"}`}>
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold block text-slate-800">Acúmulo de Pontos</span>
                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">Pontos proporcionais ao valor gasto.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parâmetros do Acúmulo */}
        {type === "stamps" ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex flex-col gap-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              Carimbos necessários para prêmio
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={stampsToReward}
              onChange={(e) => setStampsToReward(e.target.value)}
              required
              className="h-10 rounded-xl bg-white border-slate-200 font-bold"
            />
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Geralmente 10 carimbos é o ideal.</span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Pontos por R$ 1,00 gasto
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={pointsPerReal}
                onChange={(e) => setPointsPerReal(e.target.value)}
                required
                className="h-10 rounded-xl bg-white border-slate-200 font-bold"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Pontos para resgate
              </label>
              <Input
                type="number"
                min="1"
                value={stampsToReward}
                onChange={(e) => setStampsToReward(e.target.value)}
                required
                className="h-10 rounded-xl bg-white border-slate-200 font-bold"
              />
            </div>
          </div>
        )}

        {/* Descrição do Prêmio */}
        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Descrição da Recompensa
          </label>
          <textarea
            placeholder="Ex: 1 Corte de Cabelo Grátis ou Creme Modelador de brinde!"
            value={rewardDescription}
            onChange={(e) => setRewardDescription(e.target.value)}
            required
            className="flex min-h-[90px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-shadow"
          />
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
  )
}
