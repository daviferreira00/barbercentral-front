"use client"

import { useState } from "react"
import { useApp } from "@/shared/context/AppContext"
import { TUTORIALS_DATA } from "../data/tutorials"
import { QuickTutorialModal } from "./QuickTutorialModal"
import { BookOpen, X, Sparkles } from "lucide-react"

interface FirstAccessCardProps {
  moduleId: string
}

export function FirstAccessCard({ moduleId }: FirstAccessCardProps) {
  const { onboarding, markTutorialSeen } = useApp()
  const [modalOpen, setModalOpen] = useState(false)

  const tutorial = TUTORIALS_DATA[moduleId]
  if (!tutorial) return null

  const seenList = onboarding?.seen_tutorials ?? []
  if (seenList.includes(moduleId)) {
    return null
  }

  const handleDismiss = async () => {
    await markTutorialSeen(moduleId)
  }

  return (
    <>
      <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Primeira vez nesta tela? Aprenda a usar em poucos passos!</span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/50">
                Guia Explicativo
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tutorial.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300 dark:text-indigo-200" />
            <span>Ver Passo a Passo</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Fechar card explicativo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <QuickTutorialModal
        moduleId={moduleId}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}

