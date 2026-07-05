"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { ActionBar } from "@/components/mobile/ActionBar"
import { haptic } from "@/shared/lib/haptics"
import { useNovoProfissional } from "@/features/profissionais/hooks/useNovoProfissional"

export default function NovoProfissionalMobile() {
  const { name, setName, bio, setBio, status, setStatus, saving, saveError, handleSubmit } =
    useNovoProfissional()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-20 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/cliente/profissionais"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Novo Profissional</h1>
          <p className="text-xs font-semibold text-slate-400">Cadastrar novo membro na equipe.</p>
        </div>
      </div>

      <div className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Nome completo
          </label>
          <Input
            placeholder="Ex: Carlos Santos"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={saving}
            className="h-11 rounded-xl text-base"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Biografia / Especialidades
          </label>
          <textarea
            placeholder="Descreva as especialidades do profissional..."
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
            Status inicial
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                haptic()
                setStatus("active")
              }}
              className={`mobile-tap rounded-xl border py-3 text-xs font-extrabold transition active:scale-95 ${
                status === "active" ? "border-transparent text-white shadow-md" : "border-slate-200 bg-white text-slate-600"
              }`}
              style={status === "active" ? { backgroundColor: "var(--color-primary)" } : {}}
            >
              <i className="ti ti-check mr-1" />
              Ativo
            </button>
            <button
              type="button"
              onClick={() => {
                haptic()
                setStatus("inactive")
              }}
              className={`mobile-tap rounded-xl border py-3 text-xs font-extrabold transition active:scale-95 ${
                status === "inactive" ? "border-transparent bg-slate-700 text-white shadow-md" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <i className="ti ti-eye-off mr-1" />
              Inativo
            </button>
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-400">
            Ativo fica disponível na agenda; inativo fica fora de serviço.
          </p>
        </div>

        {saveError && <Alert variant="error" message={saveError} />}
      </div>

      <ActionBar>
        <button
          type="submit"
          disabled={saving}
          className="mobile-tap w-full rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {saving ? "Salvando..." : "Salvar e Continuar"}
        </button>
      </ActionBar>
    </form>
  )
}
