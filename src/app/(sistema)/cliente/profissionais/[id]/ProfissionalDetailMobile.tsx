"use client"

import Link from "next/link"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { StatusPill } from "@/components/mobile/StatusPill"
import { haptic } from "@/shared/lib/haptics"
import { useProfissionalDetail } from "@/features/profissionais/hooks/useProfissionalDetail"

export default function ProfissionalDetailMobile({ professionalId }: { professionalId: string }) {
  const {
    professional,
    services,
    links,
    unlinkedServices,
    loading,
    errorMsg,
    name,
    setName,
    bio,
    setBio,
    status,
    setStatus,
    saving,
    uploading,
    isLinkOpen,
    setIsLinkOpen,
    selectedServiceId,
    setSelectedServiceId,
    customPrice,
    setCustomPrice,
    customDuration,
    setCustomDuration,
    linking,
    handleUpdateProfile,
    handlePhotoUpload,
    handleLinkService,
    handleUnlinkService,
  } = useProfissionalDetail(professionalId)

  const labelCls = "mb-1.5 block text-[10px] font-extrabold uppercase tracking-widest text-slate-400"

  if (loading && !professional) {
    return <SkeletonList count={4} />
  }

  if (!professional) return null

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Topo */}
      <div className="flex items-center gap-3">
        <Link
          href="/cliente/profissionais"
          aria-label="Voltar"
          className="mobile-tap flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition active:scale-90"
        >
          <i className="ti ti-arrow-left" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold text-slate-800">{professional.name}</h1>
          <p className="text-xs font-semibold text-slate-400">Perfil e serviços do profissional.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Foto + status */}
      <div className="animate-card-enter flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
          {professional.photo_url ? (
            <img src={professional.photo_url} alt={professional.name} className="h-full w-full object-cover" />
          ) : (
            <i className="ti ti-user text-3xl" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <StatusPill
            label={professional.status === "active" ? "Ativo" : "Inativo"}
            tone={professional.status === "active" ? "success" : "danger"}
          />
          <label className="cursor-pointer">
            <span className="mobile-tap inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 transition active:scale-95">
              <i className="ti ti-camera mr-1.5" />
              {uploading ? "Enviando..." : "Alterar Foto"}
            </span>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
          </label>
          <p className="text-[10px] font-semibold text-slate-400">PNG, JPG até 5MB</p>
        </div>
      </div>

      {/* Dados básicos */}
      <form
        onSubmit={handleUpdateProfile}
        className="animate-card-enter flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
      >
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Dados básicos</h2>
        <div>
          <label className={labelCls}>Nome completo</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={saving}
            className="h-11 rounded-xl text-base"
          />
        </div>
        <div>
          <label className={labelCls}>Biografia</label>
          <textarea
            placeholder="Descrição profissional..."
            className="flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={saving}
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full rounded-xl text-sm font-semibold">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo (na agenda)</SelectItem>
              <SelectItem value="inactive">Inativo (oculto)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mobile-tap rounded-xl py-3 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>

      {/* Serviços vinculados */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Serviços realizados</h2>
        <button
          onClick={() => {
            haptic()
            setIsLinkOpen(true)
          }}
          className="mobile-tap rounded-xl px-3 py-2 text-[11px] font-extrabold text-white shadow-md transition active:scale-95"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <i className="ti ti-link mr-1" />
          Vincular
        </button>
      </div>

      {links.length === 0 ? (
        <EmptyState
          icon="ti-cut"
          title="Nenhum serviço vinculado"
          description="Vincule os serviços que este profissional atende."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {links.map((link, i) => {
            const originalSvc = services.find((s) => s.id === link.service_id)
            if (!originalSvc) return null

            const finalPrice =
              link.custom_price !== undefined && link.custom_price !== null ? link.custom_price : originalSvc.price
            const finalDuration =
              link.custom_duration !== undefined && link.custom_duration !== null
                ? link.custom_duration
                : originalSvc.duration_minutes
            const isCustom = link.custom_price !== undefined && link.custom_price !== null

            return (
              <div
                key={link.service_id}
                className="animate-card-enter rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                style={{ animationDelay: `${(i % 10) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-slate-800">{originalSvc.name}</p>
                    {isCustom && <StatusPill label="Preço customizado" tone="warning" />}
                  </div>
                  <button
                    onClick={() => handleUnlinkService(link.service_id)}
                    aria-label="Desvincular serviço"
                    className="mobile-tap flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition active:scale-90"
                  >
                    <i className="ti ti-unlink text-sm" />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                  <span className="font-semibold text-slate-500">
                    <i className="ti ti-clock mr-1 text-slate-400" />
                    {finalDuration} min
                  </span>
                  <span className="font-extrabold text-emerald-600">R$ {finalPrice.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sheet: vincular serviço */}
      <BottomSheet
        open={isLinkOpen}
        onClose={() => !linking && setIsLinkOpen(false)}
        title="Vincular Serviço"
        subtitle="Personalize preço e duração se necessário"
      >
        <form onSubmit={handleLinkService} className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Selecione o serviço</label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger className="h-11 w-full rounded-xl text-sm font-semibold">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {unlinkedServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} (R$ {s.price.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Preço custom (R$)</label>
              <Input
                type="number"
                step="0.01"
                placeholder="Opcional"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="h-11 rounded-xl text-base"
              />
            </div>
            <div>
              <label className={labelCls}>Duração custom (min)</label>
              <Input
                type="number"
                placeholder="Opcional"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="h-11 rounded-xl text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={linking || !selectedServiceId}
            className="mobile-tap rounded-xl py-3.5 text-sm font-extrabold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {linking ? "Salvando..." : "Vincular Serviço"}
          </button>
        </form>
      </BottomSheet>
    </div>
  )
}
