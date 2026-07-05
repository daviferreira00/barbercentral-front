"use client"

import { useServicosList } from "@/features/servicos/hooks/useServicosList"
import { Alert } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BottomSheet } from "@/components/mobile/BottomSheet"
import { EmptyState } from "@/components/mobile/EmptyState"
import { Fab } from "@/components/mobile/Fab"
import { FilterChips } from "@/components/mobile/FilterChips"
import { ListCard } from "@/components/mobile/ListCard"
import { SkeletonList } from "@/components/mobile/Skeleton"
import { haptic } from "@/shared/lib/haptics"

export default function ServicosMobile() {
  const {
    services,
    categories,
    loading,
    categoryFilter,
    setCategoryFilter,
    errorMsg,
    isCategoryOpen,
    setIsCategoryOpen,
    newCatName,
    setNewCatName,
    catSaving,
    catError,
    handleCreateCategory,
  } = useServicosList()

  const filterOptions = [
    { value: "", label: "Todos" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ]

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20">
      {/* Header com título e botão de criar categoria */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Serviços</h1>
          <p className="text-xs font-semibold text-slate-400">
            {loading ? "Carregando..." : `${services.length} serviço${services.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          aria-label="Nova Categoria"
          onClick={() => {
            haptic()
            setIsCategoryOpen(true)
          }}
          className="mobile-tap flex h-10 px-3 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 transition active:scale-95 shadow-sm"
        >
          <i className="ti ti-folder-plus text-base" />
          <span>Categoria</span>
        </button>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Categorias Filtros */}
      <FilterChips
        options={filterOptions}
        value={categoryFilter}
        onChange={setCategoryFilter}
      />

      {/* Listagem */}
      {loading ? (
        <SkeletonList count={6} />
      ) : services.length === 0 ? (
        <EmptyState
          icon="ti-cut"
          title="Nenhum serviço encontrado"
          description="Cadastre seu primeiro serviço clicando no botão + abaixo."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((s, i) => {
            const cat = categories.find((c) => c.id === s.category_id)
            return (
              <ListCard
                key={s.id}
                index={i}
                title={s.name}
                subtitle={cat ? cat.name : "Nenhuma"}
                pill={
                  s.active === 1
                    ? { label: "Ativo", tone: "success" }
                    : { label: "Pausado", tone: "neutral" }
                }
                footerLeft={
                  <span className="flex items-center gap-1">
                    <i className="ti ti-clock text-slate-400" />
                    {s.duration_minutes} minutos
                  </span>
                }
                footerRight={`R$ ${s.price.toFixed(2)}`}
                onClick={() => {
                  haptic()
                  window.location.href = `/cliente/servicos/${s.id}`
                }}
              />
            )
          })}
        </div>
      )}

      {/* Bottom Sheet para criar categoria */}
      <BottomSheet
        open={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        title="Nova Categoria de Serviços"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Nome da Categoria
            </label>
            <Input
              placeholder="Ex: Tratamento Facial, Manicure..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
              disabled={catSaving}
              className="h-11 rounded-xl"
            />
          </div>

          {catError && <Alert variant="error" message={catError} />}

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                haptic()
                setIsCategoryOpen(false)
              }}
              disabled={catSaving}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={catSaving || !newCatName}
              className="flex-1 h-11 rounded-xl font-bold text-white shadow-md transition active:scale-[0.98]"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {catSaving ? "Criando..." : "Criar Categoria"}
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* FAB para Novo Serviço */}
      <Fab icon="ti-plus" href="/cliente/servicos/novo" ariaLabel="Novo serviço" />
    </div>
  )
}
