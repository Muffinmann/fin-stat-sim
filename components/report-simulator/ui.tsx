import type { ChangeEvent, ReactNode } from 'react'

export const NumberInput = ({
  value,
  onChange,
  step = '1',
}: {
  value: number
  onChange: (value: number) => void
  step?: string
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value)
    onChange(Number.isNaN(nextValue) ? 0 : nextValue)
  }

  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={handleChange}
      className="w-full min-w-0 rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900 outline-none transition focus:border-emerald-600 focus:bg-white"
    />
  )
}

export const ParameterRow = ({
  label,
  helper,
  unit,
  value,
  onChange,
  step,
}: {
  label: string
  helper?: string
  unit?: string
  value: number
  onChange: (value: number) => void
  step?: string
}) => (
  <tr className="border-b border-stone-200 last:border-0">
    <td className="py-2.5 pr-3 align-top">
      <div className="min-w-0">
        <div className="text-xs font-medium text-stone-900">{label}</div>
        <div className="mt-0.5 text-[11px] leading-4 text-stone-500">{helper ?? '-'}</div>
      </div>
    </td>
    <td className="py-2.5 pr-3 align-top">
      <NumberInput value={value} onChange={onChange} step={step} />
    </td>
    <td className="py-2.5 align-top text-[11px] text-stone-500">{unit ?? '-'}</td>
  </tr>
)

export const ScheduleRow = ({
  label,
  helper,
  values,
  onChange,
  step,
}: {
  label: string
  helper?: string
  values: number[]
  onChange: (yearIndex: number, value: number) => void
  step?: string
}) => (
  <tr className="border-b border-stone-200 last:border-0">
    <td className="py-2.5 pr-3 align-top">
      <div className="min-w-0">
        <div className="text-xs font-medium text-stone-900">{label}</div>
        <div className="mt-0.5 text-[11px] leading-4 text-stone-500">{helper ?? '-'}</div>
      </div>
    </td>
    {values.map((value, yearIndex) => (
      <td key={`${label}-${yearIndex}`} className="py-2.5 pr-2">
        <NumberInput
          value={value}
          onChange={(nextValue) => onChange(yearIndex, nextValue)}
          step={step}
        />
      </td>
    ))}
  </tr>
)

export const DataCard = ({
  title,
  actions,
  children,
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
}) => (
  <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
    <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
      <h4 className="text-lg font-semibold text-stone-900">{title}</h4>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
    <div className="p-5">{children}</div>
  </section>
)
