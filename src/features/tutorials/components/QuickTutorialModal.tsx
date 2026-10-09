"use client"

import { TUTORIALS_DATA, type TutorialModule } from "../data/tutorials"
import { useApp } from "@/shared/context/AppContext"
import {
  X,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react"

interface QuickTutorialModalProps {
  moduleId: string
  isOpen: boolean
  onClose: () => void
}

export function QuickTutorialModal({ moduleId, isOpen, onClose }: QuickTutorialModalProps) {
  const { markTutorialSeen } = useApp()
  const tutorial: TutorialModule | undefined = TUTORIALS_DATA[moduleId]

  if (!isOpen || !tutorial) return null

  const handleGotIt = async () => {
    await markTutorialSeen(moduleId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header (Fixo) */}
        <div className="shrink-0 p-5 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{tutorial.title}</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50">
                  {tutorial.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">{tutorial.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0 cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Rolável e com min-h-0) */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Guia Passo a Passo Explicativo</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {tutorial.steps.length} passos simples
            </span>
          </div>

          <div className="space-y-3">
            {tutorial.steps.map((step) => (
              <div
                key={step.number}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-start gap-3.5 group hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {step.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{step.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                  {step.tip && (
                    <div className="mt-2.5 p-2 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5">
                      <span>💡</span>
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer (Fixo no rodapé) */}
        <div className="shrink-0 p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          {tutorial.actionRoute ? (
            <a
              href={tutorial.actionRoute}
              onClick={onClose}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
            >
              <span>{tutorial.actionLabel || "Acessar funcionalidade"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={handleGotIt}
            className="ml-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Entendi! Marcar como visto</span>
          </button>
        </div>
      </div>
    </div>

  )
}

