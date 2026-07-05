"use client"

import { useServicosList } from "@/features/servicos/hooks/useServicosList"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function ServicosDesktop() {
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

  return (
    <div className="space-y-6 w-full animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Serviços da Barbearia</h1>
          <p className="text-sm text-slate-500 mt-1">Defina os cortes, barbas, tratamentos e valores oferecidos aos clientes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsCategoryOpen(true)} className="flex items-center gap-1.5 border border-slate-200 bg-white">
            <i className="ti ti-folder-plus text-base" />
            Nova Categoria
          </Button>
          <a href="/cliente/servicos/novo">
            <Button className="flex items-center gap-2 font-semibold">
              <i className="ti ti-plus text-base" />
              Novo Serviço
            </Button>
          </a>
        </div>
      </div>

      {errorMsg && <Alert variant="error" message={errorMsg} />}

      {/* Categorias Filtros */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter("")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
            categoryFilter === ""
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
              categoryFilter === cat.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Tabela de Serviços */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs font-bold mt-2">Carregando serviços...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
              <i className="ti ti-cut text-5xl" />
              <span className="font-semibold text-slate-500">Nenhum serviço cadastrado nesta categoria.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y border-slate-100 text-xs font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="p-4 pl-6">Nome do Serviço</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Duração</th>
                    <th className="p-4">Preço</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {services.map((s) => {
                    const cat = categories.find((c) => c.id === s.category_id)
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/30">
                        <td className="p-4 pl-6 font-bold text-slate-800">
                          <a href={`/cliente/servicos/${s.id}`} className="hover:text-primary hover:underline">
                            {s.name}
                          </a>
                        </td>
                        <td className="p-4 text-slate-500">{cat ? cat.name : "Nenhuma"}</td>
                        <td className="p-4">{s.duration_minutes} minutos</td>
                        <td className="p-4">R$ {s.price.toFixed(2)}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${
                              s.active === 1
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {s.active === 1 ? "Ativo" : "Pausado"}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <a href={`/cliente/servicos/${s.id}`}>
                            <Button variant="ghost" size="sm" className="text-primary">
                              <i className="ti ti-edit text-base mr-1" />
                              Editar
                            </Button>
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Categoria */}
      <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Categoria de Serviços</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Categoria</label>
              <Input
                placeholder="Ex: Tratamento Facial, Manicure..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                disabled={catSaving}
              />
            </div>

            {catError && <Alert variant="error" message={catError} />}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsCategoryOpen(false)} disabled={catSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={catSaving || !newCatName}>
                {catSaving ? "Criando..." : "Criar Categoria"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
