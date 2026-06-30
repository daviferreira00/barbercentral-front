"use client"

import { Button } from "@/components/ui/button"

export default function BarbeariaNaoEncontradaPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in">
        <div className="h-16 w-16 bg-red-50 text-red-600 border border-red-100 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
          <i className="ti ti-shield-alert" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-slate-800">Página Indisponível</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            A barbearia que você tentou acessar não foi encontrada, está desativada ou com pagamentos pendentes na plataforma.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-500 font-semibold leading-relaxed">
          Slug consultado: <code className="font-mono text-slate-800 bg-slate-200/50 px-1.5 py-0.5 rounded">{params.slug}</code>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider">É o dono do estabelecimento?</p>
          <a href="/login" className="block">
            <Button className="w-full font-bold">
              Entrar no Painel Administrativo
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
