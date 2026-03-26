import { defaultParams } from './config'
import { formatCurrency, formatPercent, formatPrice } from './format'
import { buildProjection } from './projection'
import type { Params, YearEntry } from './types'

const metricCards = [
  {
    key: 'revenue',
    label: 'Year 5 Revenue',
    formatter: (value: number) => formatCurrency(value),
  },
  {
    key: 'ebit',
    label: 'Year 5 EBIT',
    formatter: (value: number) => formatCurrency(value),
  },
  {
    key: 'netIncome',
    label: 'Year 5 Net income',
    formatter: (value: number) => formatCurrency(value),
  },
  {
    key: 'endingCash',
    label: 'Year 5 Ending cash',
    formatter: (value: number) => formatCurrency(value),
  },
  {
    key: 'eps',
    label: 'Year 5 EPS',
    formatter: (value: number) => formatPrice(value),
  },
] as const

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

const sensitivityDefinitions = [
  {
    label: 'Tax rate',
    valueLabel: (params: Params) => formatPercent(params.taxRatePct),
    minusLabel: '-5 pts',
    plusLabel: '+5 pts',
    getScenarios: (params: Params) => ({
      lower: { ...params, taxRatePct: Math.max(0, params.taxRatePct - 5) },
      higher: { ...params, taxRatePct: params.taxRatePct + 5 },
    }),
  },
  {
    label: 'Interest rate',
    valueLabel: (params: Params) => formatPercent(params.interestRatePct),
    minusLabel: '-2 pts',
    plusLabel: '+2 pts',
    getScenarios: (params: Params) => ({
      lower: { ...params, interestRatePct: Math.max(0, params.interestRatePct - 2) },
      higher: { ...params, interestRatePct: params.interestRatePct + 2 },
    }),
  },
  {
    label: 'Useful life',
    valueLabel: (params: Params) => `${params.usefulLifeYears}y`,
    minusLabel: '-1y',
    plusLabel: '+1y',
    getScenarios: (params: Params) => ({
      lower: { ...params, usefulLifeYears: Math.max(1, params.usefulLifeYears - 1) },
      higher: { ...params, usefulLifeYears: params.usefulLifeYears + 1 },
    }),
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

export function BaselineComparisonView({ params }: { params: Params }) {
  const baseFinalYear = buildProjection(defaultParams).at(-1)
  const currentFinalYear = buildProjection(params).at(-1)

  if (!baseFinalYear || !currentFinalYear) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {metricCards.map((metric) => {
        const currentValue = currentFinalYear[metric.key]
        const baseValue = baseFinalYear[metric.key]
        const delta = currentValue - baseValue
        const deltaPct = baseValue === 0 ? null : (delta / baseValue) * 100

        return (
          <div
            key={metric.key}
            className="rounded-[1.5rem] border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-4"
          >
            <div className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
              {metric.label}
            </div>
            <div className="mt-3 text-2xl font-semibold text-stone-950">
              {metric.formatter(currentValue)}
            </div>
            <div className="mt-2 text-xs text-stone-500">
              基准 {metric.formatter(baseValue)}
            </div>
            <div className={`mt-3 text-sm font-medium ${getDeltaTone(delta)}`}>
              {formatSignedCurrency(delta)}
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

export function ProfitBridgeView({ years }: { years: YearEntry[] }) {
  const finalYear = years.at(-1)

  if (!finalYear) {
    return null
  }

  const values = bridgeSteps.map((step) => step.value(finalYear))
  const maxMagnitude = Math.max(...values.map((value) => Math.abs(value)), 1)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {bridgeSteps.slice(0, 3).map((step) => (
          <div key={step.label} className="rounded-2xl bg-stone-100 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.16em] text-stone-500">{step.label}</div>
            <div className="mt-2 text-lg font-semibold text-stone-950">
              {formatCurrency(Math.abs(step.value(finalYear)))}
            </div>
            <div className="mt-1 text-xs text-stone-500">{step.note}</div>
          </div>
        ))}
      </div>

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

export function SensitivityView({ params }: { params: Params }) {
  const baseFinalYear = buildProjection(params).at(-1)

  if (!baseFinalYear) {
    return null
  }

  const rows = sensitivityDefinitions.map((definition) => {
    const scenarios = definition.getScenarios(params)
    const lowerFinalYear = buildProjection(scenarios.lower).at(-1)
    const higherFinalYear = buildProjection(scenarios.higher).at(-1)
    const lowerDelta = (lowerFinalYear?.netIncome ?? 0) - baseFinalYear.netIncome
    const higherDelta = (higherFinalYear?.netIncome ?? 0) - baseFinalYear.netIncome
    return {
      ...definition,
      currentLabel: definition.valueLabel(params),
      lowerDelta,
      higherDelta,
    }
  })

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
          <div key={row.label} className="rounded-[1.5rem] border border-stone-200 bg-white p-4">
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
