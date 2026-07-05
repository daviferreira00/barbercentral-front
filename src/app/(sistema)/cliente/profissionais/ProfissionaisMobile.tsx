"use client"

import { useRouter } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { FilterChips } from "@/components/mobile/FilterChips"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { StatusPill } from "@/components/mobile/StatusPill"
import { haptic } from "@/shared/lib/haptics"
import { useProfissionaisList } from "@/features/profissionais/hooks/useProfissionaisList"

export default function ProfissionaisMobile() {
  const router = useRouter()
  const { professionals, loading, statusFilter, setStatusFilter, errorMsg } = useProfissionaisList()

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800">Profissionais</h1>
        <p className="text-xs font-semibold text-slate-400">Equipe da barbearia e disponibilidade.</p>
      </div>

      <FilterChips
        options={[
          { value: "active", label: "Ativos" },
          { value: "inactive", label: "Inativos" },
          { value: "", label: "Todos" },
        ]}
        value={statusFilter}
        onChange={setStatusFilter}
      />

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {loading ? (
        <SkeletonList count={5} />
      ) : professionals.length === 0 ? (
        <EmptyState
          icon="ti-users"
          title="Nenhum profissional encontrado"
          description="Ajuste o filtro ou cadastre um novo no botão +."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {professionals.map((p, i) => (
            <div
              key={p.id}
              onClick={() => {
                haptic()
                router.push(`/cliente/profissionais/${p.id}`)
              }}
              className="animate-card-enter mobile-tap flex cursor-pointer gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-transform active:scale-[0.98]"
              style={{ animationDelay: `${(i % 10) * 40}ms` }}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/60 bg-slate-100 text-slate-400">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <i className="ti ti-user text-2xl" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-extrabold text-slate-800">{p.name}</h3>
                  <StatusPill
                    label={p.status === "active" ? "Ativo" : "Inativo"}
                    tone={p.status === "active" ? "success" : "danger"}
                  />
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs font-medium leading-relaxed text-slate-400">
                  {p.bio || "Nenhuma biografia informada."}
                </p>
                <div className="mt-2 flex items-center gap-3 border-t border-slate-100 pt-2">
                  <span className="text-[11px] font-extrabold" style={{ color: "var(--color-primary)" }}>
                    Editar perfil <i className="ti ti-chevron-right" />
                  </span>
                  <a
                    href={`/cliente/configuracoes/agenda?professional_id=${p.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mobile-tap ml-auto rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600 transition active:scale-95"
                  >
                    <i className="ti ti-calendar-time mr-1" />
                    Grade
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Fab icon="ti-plus" href="/cliente/profissionais/novo" ariaLabel="Novo profissional" />
    </div>
  )
}
