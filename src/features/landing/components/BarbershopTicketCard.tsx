"use client"

import { useState } from "react"
import { CheckCircle2, Star, Sparkles, MessageSquare, Clock, Scissors, Calendar } from "lucide-react"

export function BarbershopTicketCard() {
  const [activeTab, setActiveTab] = useState<"ticket" | "whatsapp" | "fidelidade">("ticket")

  return (
    <div className="relative w-full max-w-md mx-auto group">
      {/* Glow atmosférico dourado/âmbar atrás do card */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E4C56B]/30 via-[#C99E32]/20 to-indigo-500/20 blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 pointer-events-none" />

      {/* Floating Badge Superior: WhatsApp Enviado */}
      <div className="absolute -top-4 -right-2 z-20 flex items-center gap-2 rounded-full border border-emerald-500/40 bg-slate-950/90 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 shadow-xl backdrop-blur-md animate-bounce duration-1000">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-bold">WhatsApp enviado</span>
      </div>

      {/* Card Principal */}
      <div className="relative rounded-3xl border border-[#E4C56B]/30 bg-[#0B132B]/90 p-6 text-white shadow-2xl backdrop-blur-xl">
        {/* Header do Card com Miniatura de Agendamento */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E4C56B] to-[#996D19] text-slate-950 font-black shadow-md">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E4C56B]">Agendamento Confirmado</span>
              <h4 className="text-base font-black text-white">Lucas Silva</h4>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Hoje</span>
            <p className="text-xs font-black text-white">15:30</p>
          </div>
        </div>

        {/* Detalhes do Serviço & Profissional */}
        <div className="my-5 space-y-3">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-semibold">Serviço Selecionado</span>
              <span className="text-white font-extrabold text-sm">R$ 75,00</span>
            </div>
            <p className="text-sm font-extrabold text-white">Corte Degradê Navalhado + Barba</p>
            <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#E4C56B]" /> 50 min
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Barbeiro Marcos
              </span>
            </div>
          </div>

          {/* Mini Widget de Fidelidade */}
          <div className="rounded-2xl border border-[#E4C56B]/20 bg-[#E4C56B]/[0.06] p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E4C56B]/20 text-[#E4C56B]">
                <Star className="h-4 w-4 fill-[#E4C56B]" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E4C56B]">Cartão Fidelidade</span>
                <p className="text-xs font-black text-white">9 de 10 selos acumulados</p>
              </div>
            </div>
            <span className="rounded-lg bg-[#E4C56B] px-2 py-0.5 text-[10px] font-black text-slate-950">
              Quase lá!
            </span>
          </div>

          {/* Mini Balão de Notificação do WhatsApp */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs flex items-start gap-2.5">
            <MessageSquare className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-400">Lembrete Automático via WhatsApp:</p>
              <p className="text-[11px] text-slate-300 leading-snug">
                &ldquo;Olá Lucas! Seu corte na Barbearia Modelo é hoje às 15:30. Responda 1 para confirmar ou 2 para remarcar.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé do Card com Status */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Presença Confirmada</span>
          </div>
          <span className="text-[11px] font-mono text-[#E4C56B]">Fila KDS: #04</span>
        </div>
      </div>
    </div>
  )
}
