"use client"

import { Button } from "@/components/ui/button"

export default function BarbeariaBloqueadaPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-sans p-6 text-center animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white border border-slate-100 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="h-16 w-16 bg-red-100 text-red-650 border border-red-200 rounded-full flex items-center justify-center text-3xl mx-auto shadow-sm">
          <i className="ti ti-shield-lock" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-800">Barbearia Suspensa</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Esta barbearia está temporariamente indisponível para novos agendamentos online por decisão administrativa.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs text-slate-500 font-semibold leading-relaxed">
          Identificador: <code className="font-mono text-slate-800 bg-slate-200/50 px-1.5 py-0.5 rounded">{params.slug}</code>
        </div>

        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-bold mb-4 uppercase tracking-wider">Deseja falar com o suporte?</p>
          <a href="/login" className="block">
            <Button className="w-full font-bold">
              Acessar Painel
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
