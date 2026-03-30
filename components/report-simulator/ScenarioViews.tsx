import {
  baselineItemDefinitions,
  bridgeHighlightDefinitions,
  sensitivityItemDefinitions,
} from './chartConfig'
import { formatCurrency } from './format'
import { buildProjection } from './projection'
import type { Params, YearEntry } from './types'

const bridgeSteps = [
  {
    label: 'Revenue',
    value: (year: YearEntry) => year.revenue,
    tone: 'bg-emerald-500',
    note: '价格、销量、扩张',
  },
  {
    label: 'COGS',
    value: (year: YearEntry) => -year.cogs,
    tone: 'bg-rose-400',
    note: '原料成本',
  },
  {
    label: 'Labor',
    value: (year: YearEntry) => -year.laborCost,
    tone: 'bg-rose-500',
    note: '人工成本',
  },
  {
    label: 'Depreciation',
    value: (year: YearEntry) => -year.depreciation,
    tone: 'bg-amber-500',
    note: '折旧年限',
  },
  {
    label: 'Interest',
    value: (year: YearEntry) => -year.interestExpense,
    tone: 'bg-fuchsia-500',
    note: '债务与利率',
  },
  {
    label: 'Taxes',
    value: (year: YearEntry) => -year.taxes,
    tone: 'bg-sky-500',
    note: '税率',
  },
  {
    label: 'Net income',
    value: (year: YearEntry) => year.netIncome,
    tone: 'bg-stone-900',
    note: '利润落点',
  },
  {
    label: 'CFO',
    value: (year: YearEntry) => year.cfo,
    tone: 'bg-teal-600',
    note: '利润 + 非现金项 - 营运资本',
  },
  {
    label: 'Ending cash',
    value: (year: YearEntry) => year.endingCash,
    tone: 'bg-indigo-600',
    note: '最终现金余额',
  },
] as const

const getDeltaTone = (delta: number) => {
  if (delta > 0) {
    return 'text-emerald-700'
  }
  if (delta < 0) {
    return 'text-rose-700'
  }
  return 'text-stone-500'
}

const formatSignedCurrency = (value: number) => `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`
const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    aria-label="从图表移除"
    onClick={onClick}
    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-transparent bg-white/90 text-stone-400 opacity-0 shadow-sm transition group-hover:opacity-100 hover:border-rose-200 hover:text-rose-600"
  >
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="m5.5 5.5 9 9m0-9-9 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  </button>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">
    {message}
  </div>
)

export function BaselineComparisonView({
  params,
  baselineParams,
  selectedItems,
  onRemoveItem,
}: {
  params: Params
  baselineParams: Params
  selectedItems: string[]
  onRemoveItem: (itemId: string) => void
}) {
  const baselineYears = buildProjection(baselineParams)
  const currentYears = buildProjection(params)
  const selectedDefinitions = selectedItems.flatMap((itemId) => {
    const match = baselineItemDefinitions.find((item) => item.id === itemId)
    return match ? [match] : []
  })

  if (selectedDefinitions.length === 0) {
    return <EmptyState message="还没有展示项。去参数面板悬浮某一行，点击左侧加号加入这张图。" />
  }

  if (!baselineYears.at(-1) || !currentYears.at(-1)) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {selectedDefinitions.map((item) => {
        const currentValue = item.getCurrentValue(params, currentYears)
        const baselineValue = item.getBaselineValue(baselineParams, baselineYears)
        const delta = currentValue - baselineValue
        const deltaPct = baselineValue === 0 ? null : (delta / baselineValue) * 100

        return (
          <div
            key={item.id}
            className="group relative rounded-[1.5rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-4"
          >
            <RemoveButton onClick={() => onRemoveItem(item.id)} />
            <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500">{item.label}</div>
            <div className="mt-3 text-2xl font-semibold text-stone-950">
              {item.valueFormatter(currentValue)}
            </div>
            <div className="mt-2 text-xs text-stone-500">基准 {item.valueFormatter(baselineValue)}</div>
            <div className={`mt-3 text-sm font-medium ${getDeltaTone(delta)}`}>
              {(item.deltaFormatter ?? formatSignedCurrency)(delta)}
            </div>
            <div className="mt-1 text-xs text-stone-500">
              {deltaPct === null ? '基准为 0，无法计算变化率' : formatSignedPercent(deltaPct)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ProfitBridgeView({
  params,
  years,
  selectedHighlights,
  onRemoveItem,
}: {
  params: Params
  years: YearEntry[]
  selectedHighlights: string[]
  onRemoveItem: (itemId: string) => void
}) {
  const finalYear = years.at(-1)
  const selectedDefinitions = selectedHighlights.flatMap((itemId) => {
    const match = bridgeHighlightDefinitions.find((item) => item.id === itemId)
    return match ? [match] : []
  })

  if (!finalYear) {
    return null
  }

  const values = bridgeSteps.map((step) => step.value(finalYear))
  const maxMagnitude = Math.max(...values.map((value) => Math.abs(value)), 1)

  return (
    <div className="space-y-4">
      {selectedDefinitions.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-3">
          {selectedDefinitions.map((item) => (
            <div key={item.id} className="group relative rounded-2xl bg-stone-100 px-4 py-3">
              <RemoveButton onClick={() => onRemoveItem(item.id)} />
              <div className="text-xs uppercase tracking-[0.16em] text-stone-500">{item.label}</div>
              <div className="mt-2 text-lg font-semibold text-stone-950">
                {item.valueFormatter(item.getValue(params, years))}
              </div>
              <div className="mt-1 text-xs text-stone-500">{item.note}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState message="顶部摘要项已清空。你可以从参数面板重新添加到这张图。" />
      )}

      <div className="space-y-3 rounded-[1.75rem] border border-stone-200 bg-white p-4">
        {bridgeSteps.map((step) => {
          const rawValue = step.value(finalYear)
          const widthPct = (Math.abs(rawValue) / maxMagnitude) * 100
          const alignClass = rawValue >= 0 ? 'justify-start' : 'justify-end'

          return (
            <div key={step.label} className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_120px] md:items-center">
              <div>
                <div className="text-sm font-medium text-stone-900">{step.label}</div>
                <div className="text-xs text-stone-500">{step.note}</div>
              </div>
              <div className="flex h-10 items-center rounded-full bg-stone-100 px-2">
                <div className={`flex w-full ${alignClass}`}>
                  <div
                    className={`h-6 rounded-full ${step.tone}`}
                    style={{ width: `${Math.max(widthPct, 6)}%` }}
                  />
                </div>
              </div>
              <div className={`text-right text-sm font-semibold ${getDeltaTone(rawValue)}`}>
                {rawValue >= 0 ? formatCurrency(rawValue) : `-${formatCurrency(Math.abs(rawValue))}`}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SensitivityView({
  params,
  selectedItems,
  onRemoveItem,
}: {
  params: Params
  selectedItems: string[]
  onRemoveItem: (itemId: string) => void
}) {
  const baseFinalYear = buildProjection(params).at(-1)
  const selectedDefinitions = selectedItems.flatMap((itemId) => {
    const match = sensitivityItemDefinitions.find((item) => item.id === itemId)
    return match ? [match] : []
  })

  if (!baseFinalYear) {
    return null
  }

  const rows = selectedDefinitions.map((definition) => {
    const scenarios = definition.getScenarios(params)
    const lowerFinalYear = buildProjection(scenarios.lower).at(-1)
    const higherFinalYear = buildProjection(scenarios.higher).at(-1)

    return {
      ...definition,
      currentLabel: definition.valueFormatter(params[definition.paramKey]),
      lowerDelta: (lowerFinalYear?.netIncome ?? 0) - baseFinalYear.netIncome,
      higherDelta: (higherFinalYear?.netIncome ?? 0) - baseFinalYear.netIncome,
    }
  })

  if (rows.length === 0) {
    return <EmptyState message="还没有敏感度项。去参数面板把你关心的参数加进来。" />
  }

  const maxDelta = Math.max(
    ...rows.flatMap((row) => [Math.abs(row.lowerDelta), Math.abs(row.higherDelta)]),
    1,
  )

  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const lowerWidth = (Math.abs(row.lowerDelta) / maxDelta) * 100
        const higherWidth = (Math.abs(row.higherDelta) / maxDelta) * 100

        return (
          <div
            key={row.id}
            className="group relative rounded-[1.5rem] border border-stone-200 bg-white p-4"
          >
            <RemoveButton onClick={() => onRemoveItem(row.id)} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-semibold text-stone-950">{row.label}</div>
                <div className="mt-1 text-xs text-stone-500">当前参数 {row.currentLabel}</div>
              </div>
              <div className="text-xs text-stone-500">指标：Year 5 Net income</div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{row.minusLabel}</span>
                  <span className={getDeltaTone(row.lowerDelta)}>{formatSignedCurrency(row.lowerDelta)}</span>
                </div>
                <div className="mt-3 flex h-8 items-center rounded-full bg-stone-200/70 px-2">
                  <div className="flex w-full justify-end">
                    <div
                      className="h-4 rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(lowerWidth, 4)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-stone-50 p-3">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{row.plusLabel}</span>
                  <span className={getDeltaTone(row.higherDelta)}>{formatSignedCurrency(row.higherDelta)}</span>
                </div>
                <div className="mt-3 flex h-8 items-center rounded-full bg-stone-200/70 px-2">
                  <div className="flex w-full justify-start">
                    <div
                      className="h-4 rounded-full bg-rose-500"
                      style={{ width: `${Math.max(higherWidth, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
