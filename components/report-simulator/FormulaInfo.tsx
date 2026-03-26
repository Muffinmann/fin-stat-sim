'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  label: string
  formula: string
}

export default function FormulaInfo({ label, formula }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  return (
    <span ref={containerRef} className="relative ml-1 inline-flex align-middle">
      <button
        type="button"
        aria-label={`Show formula for ${label}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-4 w-4 -translate-y-[1px] items-center justify-center rounded-full border border-stone-400 bg-white text-[9px] font-semibold leading-none text-stone-500 transition hover:border-stone-700 hover:text-stone-800"
      >
        ?
      </button>
      {open ? (
        <span className="absolute left-0 top-6 z-20 w-72 rounded-md border border-stone-400 bg-[#fffdf8] p-3 text-[11px] leading-5 text-stone-700 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)]">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Calculation Note
          </span>
          <span className="mt-1 block font-semibold text-stone-900">{label}</span>
          <span className="mt-2 block border-l-2 border-stone-300 pl-3 font-mono text-[11px] text-stone-800">
            {formula}
          </span>
        </span>
      ) : null}
    </span>
  )
}
