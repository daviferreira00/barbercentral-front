"use client"

import { useState } from "react"
import { QuickTutorialModal } from "./QuickTutorialModal"
import { BookOpen } from "lucide-react"

interface QuickTutorialButtonProps {
  moduleId: string
  label?: string
}

export function QuickTutorialButton({ moduleId, label = "Como usar" }: QuickTutorialButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
        title="Abrir guia explicativo deste módulo"
      >
        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>{label}</span>
      </button>

      <QuickTutorialModal
        moduleId={moduleId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

