'use client'

import { ChangeEvent, useState } from 'react'

type YearEntry = {
  label: string
  stands: number
  newStands: number
  cupsPerStand: number
  cupsSold: number
  pricePerCup: number
  revenue: number
  cogs: number
  laborCost: number
  depreciation: number
  ebit: number
  ebitMargin: number
  interestExpense: number
  ebt: number
  taxes: number
  netIncome: number
  eps: number
  revenueGrowth: number | null
  beginningCash: number
  changeInInventory: number
  cfo: number
  capex: number
  cfi: number
  equityIssued: number
  debtIssued: number
  debtRepaid: number
  cff: number
  endingCash: number
  inventory: number
  fixedAssets: number
  goodwill: number
  totalAssets: number
  debt: number
  totalLiabilities: number
  shareholdersEquity: number
  bookValuePerShare: number
}

type Params = {
  startingCash: number
  sharesOutstanding: number
  taxRatePct: number
  interestRatePct: number
  standCost: number
  usefulLifeYears: number
  startingGoodwill: number
  inventoryRatioPct: number
  pricePerCup: number
  annualPriceGrowthPct: number
  cupsPerStand: number
  annualVolumeGrowthPct: number
  ingredientCostPerCup: number
  laborCostPerStand: number
  annualStandAdds: number[]
  annualDebtIssued: number[]
  annualDebtRepaid: number[]
  annualEquityIssued: number[]
}

type ScalarParamKey = Exclude<
  keyof Params,
  'annualStandAdds' | 'annualDebtIssued' | 'annualDebtRepaid' | 'annualEquityIssued'
>

type ScheduleParamKey =
  | 'annualStandAdds'
  | 'annualDebtIssued'
  | 'annualDebtRepaid'
  | 'annualEquityIssued'

type ParamConfig = {
  key: ScalarParamKey
  label: string
  helper?: string
  unit?: string
  step?: string
}

type ScheduleConfig = {
  key: ScheduleParamKey
  label: string
  helper?: string
  step?: string
}

type ParameterTab = 'foundation' | 'operations' | 'financing'

const yearLabels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
const chartYearLabels = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5']

const defaultParams: Params = {
  startingCash: 0,
  sharesOutstanding: 1500,
  taxRatePct: 35,
  interestRatePct: 10,
  standCost: 300,
  usefulLifeYears: 5,
  startingGoodwill: 1000,
  inventoryRatioPct: 12,
  pricePerCup: 1,
  annualPriceGrowthPct: 5,
  cupsPerStand: 800,
  annualVolumeGrowthPct: 5,
  ingredientCostPerCup: 0.25,
  laborCostPerStand: 530,
  annualStandAdds: [1, 1, 1, 1, 3],
  annualDebtIssued: [250, 0, 0, 0, 0],
  annualDebtRepaid: [0, 0, 0, 0, 0],
  annualEquityIssued: [500, 0, 0, 0, 0],
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const lineSeries = [
  { key: 'revenue', label: 'Revenue', color: '#0f766e' },
  { key: 'ebit', label: 'EBIT', color: '#f97316' },
  { key: 'netIncome', label: 'Net income', color: '#2563eb' },
  { key: 'endingCash', label: 'Ending cash', color: '#7c3aed' },
] as const

const parameterTabs: { key: ParameterTab; label: string; description: string }[] = [
  { key: 'foundation', label: '基础', description: '股本、税率、折旧和营运资本' },
  { key: 'operations', label: '经营', description: '价格、销量和成本驱动项' },
  { key: 'financing', label: '融资计划', description: '扩张节奏与债股融资安排' },
]

const parameterGroups: Record<Exclude<ParameterTab, 'financing'>, ParamConfig[]> = {
  foundation: [
    {
      key: 'startingCash',
      label: 'Starting cash',
      helper: '公司开业前就带着的现金',
    },
    {
      key: 'sharesOutstanding',
      label: 'Shares outstanding',
      helper: '总股本，用来计算 EPS 与每股净资产',
    },
    {
      key: 'taxRatePct',
      label: 'Tax rate',
      helper: '税率影响净利润与经营现金流',
      unit: '%',
      step: '0.1',
    },
    {
      key: 'interestRatePct',
      label: 'Interest rate',
      helper: '贷款利率只影响利息，不影响 EBIT',
      unit: '%',
      step: '0.1',
    },
    {
      key: 'standCost',
      label: 'Stand cost',
      helper: '每新增一个摊位要投入多少 Capex',
    },
    {
      key: 'usefulLifeYears',
      label: 'Useful life',
      helper: '固定资产折旧年限',
      unit: 'years',
    },
    {
      key: 'startingGoodwill',
      label: 'Goodwill',
      helper: '如果你高价收购一个品牌，多出来的部分记在这里',
    },
    {
      key: 'inventoryRatioPct',
      label: 'Inventory ratio',
      helper: '每年留存多少原材料，决定库存与营运资本占用',
      unit: '% of COGS',
      step: '0.1',
    },
  ],
  operations: [
    {
      key: 'pricePerCup',
      label: 'Price per cup',
      helper: '每杯售价',
      step: '0.01',
    },
    {
      key: 'annualPriceGrowthPct',
      label: 'Annual price growth',
      helper: '提价能力',
      unit: '%',
      step: '0.1',
    },
    {
      key: 'cupsPerStand',
      label: 'Cups per stand',
      helper: '单摊首年销量',
    },
    {
      key: 'annualVolumeGrowthPct',
      label: 'Annual volume growth',
      helper: '单摊销量增长',
      unit: '%',
      step: '0.1',
    },
    {
      key: 'ingredientCostPerCup',
      label: 'Ingredient cost per cup',
      helper: '柠檬、糖、杯子等原料成本',
      step: '0.01',
    },
    {
      key: 'laborCostPerStand',
      label: 'Labor cost per stand',
      helper: '每个摊位一年的人工成本',
    },
  ],
}

const scheduleGroups: ScheduleConfig[] = [
  {
    key: 'annualStandAdds',
    label: 'Stand adds',
    helper: '每年扩张几个新摊位',
  },
  {
    key: 'annualDebtIssued',
    label: 'Debt issued',
    helper: '每年新增贷款',
  },
  {
    key: 'annualDebtRepaid',
    label: 'Debt repaid',
    helper: '每年归还本金',
  },
  {
    key: 'annualEquityIssued',
    label: 'Equity issued',
    helper: '每年增发股份融资',
  },
]

const clampNumber = (value: number, min = 0) => {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.max(min, value)
}

const roundMoney = (value: number) => Math.round(value * 100) / 100

const formatCurrency = (value: number) => currencyFormatter.format(Math.round(value))
const formatPrice = (value: number) => priceFormatter.format(value)
const formatPercent = (value: number) => `${percentFormatter.format(value)}%`
const formatNumber = (value: number) => decimalFormatter.format(value)

const buildProjection = (params: Params) => {
  const years: YearEntry[] = []
  const depreciationBuckets: { amount: number; year: number }[] = []

  let stands = 0
  let beginningCash = params.startingCash
  let beginningDebt = 0
  let beginningInventory = 0
  let fixedAssets = 0
  let nolCarryforward = 0

  for (let yearIndex = 0; yearIndex < yearLabels.length; yearIndex += 1) {
    const newStands = clampNumber(params.annualStandAdds[yearIndex] ?? 0)
    const debtIssued = clampNumber(params.annualDebtIssued[yearIndex] ?? 0)
    const equityIssued = clampNumber(params.annualEquityIssued[yearIndex] ?? 0)
    const scheduledRepayment = clampNumber(params.annualDebtRepaid[yearIndex] ?? 0)

    stands += newStands

    const pricePerCup =
      params.pricePerCup * Math.pow(1 + params.annualPriceGrowthPct / 100, yearIndex)
    const cupsPerStand =
      params.cupsPerStand * Math.pow(1 + params.annualVolumeGrowthPct / 100, yearIndex)
    const cupsSold = stands * cupsPerStand
    const revenue = cupsSold * pricePerCup
    const cogs = cupsSold * params.ingredientCostPerCup
    const laborCost = stands * params.laborCostPerStand

    const capex = newStands * params.standCost
    if (capex > 0) {
      depreciationBuckets.push({ amount: capex, year: yearIndex })
    }

    const depreciation = depreciationBuckets.reduce((sum, bucket) => {
      const age = yearIndex - bucket.year
      if (age >= params.usefulLifeYears) {
        return sum
      }
      return sum + bucket.amount / params.usefulLifeYears
    }, 0)

    fixedAssets = Math.max(0, fixedAssets + capex - depreciation)

    const inventory = cogs * (params.inventoryRatioPct / 100)
    const changeInInventory = inventory - beginningInventory

    const provisionalEndingDebt = Math.max(0, beginningDebt + debtIssued - scheduledRepayment)
    const averageDebt = (beginningDebt + provisionalEndingDebt) / 2
    const interestExpense = averageDebt * (params.interestRatePct / 100)

    const ebit = revenue - cogs - laborCost - depreciation
    const ebt = ebit - interestExpense

    let taxableIncome = 0
    let endingCarryforward = nolCarryforward

    if (ebt >= 0) {
      const nolUsed = Math.min(nolCarryforward, ebt)
      taxableIncome = ebt - nolUsed
      endingCarryforward = nolCarryforward - nolUsed
    } else {
      endingCarryforward = nolCarryforward + Math.abs(ebt)
    }

    const taxes = taxableIncome * (params.taxRatePct / 100)
    const netIncome = ebt - taxes

    const cfo = netIncome + depreciation - changeInInventory
    const cfi = -capex
    const debtRepaid = scheduledRepayment
    const cff = equityIssued + debtIssued - debtRepaid
    const endingCash = beginningCash + cfo + cfi + cff

    const debt = provisionalEndingDebt
    const goodwill = params.startingGoodwill
    const totalAssets = endingCash + inventory + fixedAssets + goodwill
    const totalLiabilities = debt
    const shareholdersEquity = totalAssets - totalLiabilities

    const lastYearRevenue = years[yearIndex - 1]?.revenue
    const revenueGrowth =
      lastYearRevenue && lastYearRevenue > 0
        ? ((revenue - lastYearRevenue) / lastYearRevenue) * 100
        : null

    years.push({
      label: yearLabels[yearIndex],
      stands,
      newStands,
      cupsPerStand,
      cupsSold,
      pricePerCup,
      revenue: roundMoney(revenue),
      cogs: roundMoney(cogs),
      laborCost: roundMoney(laborCost),
      depreciation: roundMoney(depreciation),
      ebit: roundMoney(ebit),
      ebitMargin: revenue === 0 ? 0 : (ebit / revenue) * 100,
      interestExpense: roundMoney(interestExpense),
      ebt: roundMoney(ebt),
      taxes: roundMoney(taxes),
      netIncome: roundMoney(netIncome),
      eps: params.sharesOutstanding === 0 ? 0 : roundMoney(netIncome / params.sharesOutstanding),
      revenueGrowth,
      beginningCash: roundMoney(beginningCash),
      changeInInventory: roundMoney(changeInInventory),
      cfo: roundMoney(cfo),
      capex: roundMoney(capex),
      cfi: roundMoney(cfi),
      equityIssued: roundMoney(equityIssued),
      debtIssued: roundMoney(debtIssued),
      debtRepaid: roundMoney(debtRepaid),
      cff: roundMoney(cff),
      endingCash: roundMoney(endingCash),
      inventory: roundMoney(inventory),
      fixedAssets: roundMoney(fixedAssets),
      goodwill: roundMoney(goodwill),
      totalAssets: roundMoney(totalAssets),
      debt: roundMoney(debt),
      totalLiabilities: roundMoney(totalLiabilities),
      shareholdersEquity: roundMoney(shareholdersEquity),
      bookValuePerShare:
        params.sharesOutstanding === 0
          ? 0
          : roundMoney(shareholdersEquity / params.sharesOutstanding),
    })

    beginningCash = endingCash
    beginningDebt = debt
    beginningInventory = inventory
    nolCarryforward = endingCarryforward
  }

  return years
}

const getLinePath = (values: number[], width: number, height: number, maxValue: number) => {
  if (values.length === 0) {
    return ''
  }

  const stepX = values.length === 1 ? 0 : width / (values.length - 1)
  return values
    .map((value, index) => {
      const x = stepX * index
      const y = height - (value / maxValue) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

const getValueY = (value: number, height: number, maxValue: number) => {
  if (maxValue <= 0) {
    return height
  }
  return height - (value / maxValue) * height
}

const NumberInput = ({
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

const ParameterRow = ({
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

const ScheduleRow = ({
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

const DataCard = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
    <div className="border-b border-stone-200 px-5 py-4">
      <h4 className="text-lg font-semibold text-stone-900">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
  </section>
)

const Chart = ({ years }: { years: YearEntry[] }) => {
  const chartWidth = 340
  const chartHeight = 210
  const yAxisWidth = 56
  const topPadding = 10
  const rightPadding = 14
  const bottomAxisHeight = 48
  const plotWidth = chartWidth - yAxisWidth - rightPadding
  const plotHeight = chartHeight - topPadding - bottomAxisHeight

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-emerald-50 to-amber-50 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-stone-900">核心指标趋势</div>
          <div className="mt-1 text-xs text-stone-500">
            横坐标为年份，纵坐标为各指标金额。
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {lineSeries.map((series) => {
          const values = years.map((year) => year[series.key as keyof YearEntry] as number)
          const maxValue = Math.max(1, ...values)
          const yTicks = [maxValue, maxValue / 2, 0]

          return (
            <div
              key={series.key}
              className="rounded-[1.5rem] bg-white/85 p-4 ring-1 ring-stone-200"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: series.color }}
                  />
                  <div className="text-sm font-semibold text-stone-900">{series.label}</div>
                </div>
                <div className="text-[11px] text-stone-500">Y-axis: USD</div>
              </div>

              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="h-auto w-full text-stone-700"
                role="img"
                aria-label={`${series.label} five-year trend chart`}
              >
                {yTicks.map((tickValue, index) => {
                  const y = getValueY(tickValue, plotHeight, maxValue)
                  return (
                    <g key={`${series.key}-tick-${index}`}>
                      <line
                        x1={yAxisWidth}
                        y1={topPadding + y}
                        x2={chartWidth - rightPadding}
                        y2={topPadding + y}
                        stroke="currentColor"
                        strokeOpacity="0.12"
                      />
                      <text
                        x={yAxisWidth - 8}
                        y={topPadding + y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="currentColor"
                        opacity="0.7"
                      >
                        {formatCurrency(tickValue)}
                      </text>
                    </g>
                  )
                })}

                <line
                  x1={yAxisWidth}
                  y1={topPadding}
                  x2={yAxisWidth}
                  y2={topPadding + plotHeight}
                  stroke="currentColor"
                  strokeOpacity="0.2"
                />
                <line
                  x1={yAxisWidth}
                  y1={topPadding + plotHeight}
                  x2={chartWidth - rightPadding}
                  y2={topPadding + plotHeight}
                  stroke="currentColor"
                  strokeOpacity="0.2"
                />

                <g transform={`translate(${yAxisWidth}, ${topPadding})`}>
                  <path
                    d={getLinePath(values, plotWidth, plotHeight, maxValue)}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {values.map((value, index) => {
                    const x = values.length === 1 ? 0 : (plotWidth / (values.length - 1)) * index
                    const y = getValueY(value, plotHeight, maxValue)

                    return (
                      <g key={`${series.key}-point-${years[index].label}`}>
                        <circle cx={x} cy={y} r="3.5" fill={series.color} />
                        <line
                          x1={x}
                          y1={plotHeight}
                          x2={x}
                          y2={plotHeight + 6}
                          stroke="currentColor"
                          strokeOpacity="0.2"
                        />
                        <text
                          x={x}
                          y={plotHeight + 18}
                          textAnchor="middle"
                          fontSize="10"
                          fill="currentColor"
                          opacity="0.75"
                        >
                          {chartYearLabels[index] ?? years[index].label}
                        </text>
                      </g>
                    )
                  })}
                </g>

                <text
                  x={chartWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="currentColor"
                  opacity="0.75"
                >
                  X-axis: Year
                </text>
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ReportSimulator = () => {
  const [params, setParams] = useState<Params>(defaultParams)
  const [activeTab, setActiveTab] = useState<ParameterTab>('foundation')
  const years = buildProjection(params)

  const updateValue = (name: keyof Params) => (value: number) => {
    setParams((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const updateArrayValue =
    (name: 'annualStandAdds' | 'annualDebtIssued' | 'annualDebtRepaid' | 'annualEquityIssued') =>
    (yearIndex: number, value: number) => {
      setParams((current) => ({
        ...current,
        [name]: current[name].map((item, index) =>
          index === yearIndex ? clampNumber(value) : item
        ),
      }))
    }

  const finalYear = years[years.length - 1]
  const activeTabMeta = parameterTabs.find((tab) => tab.key === activeTab) ?? parameterTabs[0]

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.28),_transparent_28%),linear-gradient(135deg,_#fffef7,_#effcf6_55%,_#ffffff)] p-6 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
            Financial Sandbox
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            柠檬茶摊财报模拟器
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
            用同一组经营参数联动利润表、现金流量表和资产负债表。你可以把扩张、提价、融资和成本放在一张画布里看清楚。
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.6rem] bg-white/85 p-5 ring-1 ring-stone-200 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Year 5 revenue</div>
            <div className="mt-2 text-3xl font-semibold text-stone-950">
              {formatCurrency(finalYear.revenue)}
            </div>
          </div>
          <div className="rounded-[1.6rem] bg-white/85 p-5 ring-1 ring-stone-200 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Year 5 net income
            </div>
            <div className="mt-2 text-3xl font-semibold text-stone-950">
              {formatCurrency(finalYear.netIncome)}
            </div>
          </div>
          <div className="rounded-[1.6rem] bg-white/85 p-5 ring-1 ring-stone-200 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">
              Year 5 ending cash
            </div>
            <div className="mt-2 text-3xl font-semibold text-stone-950">
              {formatCurrency(finalYear.endingCash)}
            </div>
          </div>
          <div className="rounded-[1.6rem] bg-white/85 p-5 ring-1 ring-stone-200 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-500">Year 5 BVPS</div>
            <div className="mt-2 text-3xl font-semibold text-stone-950">
              {formatPrice(finalYear.bookValuePerShare)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.45)]">
            <div className="border-b border-stone-200 px-5 py-4">
              <h2 className="text-xl font-semibold text-stone-950">参数面板</h2>
              <p className="mt-1 text-sm leading-6 text-stone-600">
                左侧控制经营和融资假设，右侧即时查看图表和三张报表的连锁变化。
              </p>
            </div>

            <div className="border-b border-stone-200 px-5 pt-4">
              <div className="flex flex-wrap gap-2">
                {parameterTabs.map((tab) => {
                  const isActive = tab.key === activeTab
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
              <div className="pb-4 pt-3">
                <h3 className="text-sm font-semibold text-stone-950">{activeTabMeta.label}</h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  {activeTabMeta.description}
                </p>
              </div>
            </div>

            <div className="p-5">
              {activeTab === 'financing' ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-stone-200 text-xs text-stone-500">
                        <th className="py-2 pr-3">项目</th>
                        {yearLabels.map((label) => (
                          <th key={label} className="py-2 pr-2">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleGroups.map((item) => (
                        <ScheduleRow
                          key={item.key}
                          label={item.label}
                          helper={item.helper}
                          step={item.step}
                          values={params[item.key]}
                          onChange={updateArrayValue(item.key)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-stone-200 text-xs text-stone-500">
                        <th className="py-2 pr-3">参数</th>
                        <th className="py-2 pr-3">输入</th>
                        <th className="py-2">单位</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameterGroups[activeTab].map((item) => (
                        <ParameterRow
                          key={item.key}
                          label={item.label}
                          helper={item.helper}
                          unit={item.unit}
                          step={item.step}
                          value={params[item.key]}
                          onChange={updateValue(item.key)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-3 text-[11px] leading-4 text-stone-500">
                {activeTab === 'financing'
                  ? '融资计划按年份录入，方便观察扩张和融资节奏对现金与负债的影响。'
                  : '切换上方 tab 可以查看不同类别的参数。'}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-8">
          <DataCard title="5 年趋势图">
            <Chart years={years} />
          </DataCard>

          <DataCard title="Cash Flow">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2 pr-4">Item</th>
                    {years.map((year) => (
                      <th key={year.label} className="py-2 pr-4">
                        {year.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Net income', (year: YearEntry) => formatCurrency(year.netIncome)],
                    ['Depreciation', (year: YearEntry) => formatCurrency(year.depreciation)],
                    [
                      'Change in inventory',
                      (year: YearEntry) => formatCurrency(year.changeInInventory),
                    ],
                    ['CFO', (year: YearEntry) => formatCurrency(year.cfo)],
                    ['Capex', (year: YearEntry) => formatCurrency(-year.capex)],
                    ['CFI', (year: YearEntry) => formatCurrency(year.cfi)],
                    ['Equity issued', (year: YearEntry) => formatCurrency(year.equityIssued)],
                    ['Debt issued', (year: YearEntry) => formatCurrency(year.debtIssued)],
                    ['Debt repaid', (year: YearEntry) => formatCurrency(-year.debtRepaid)],
                    ['CFF', (year: YearEntry) => formatCurrency(year.cff)],
                    ['Beginning cash', (year: YearEntry) => formatCurrency(year.beginningCash)],
                    [
                      'Change in cash',
                      (year: YearEntry) => formatCurrency(year.cfo + year.cfi + year.cff),
                    ],
                    ['Ending cash', (year: YearEntry) => formatCurrency(year.endingCash)],
                  ].map(([label, formatter]) => (
                    <tr key={label as string} className="border-b border-stone-200 last:border-0">
                      <td className="py-2 pr-4 font-medium text-stone-900">{label as string}</td>
                      {years.map((year) => (
                        <td key={`${label as string}-${year.label}`} className="py-2 pr-4 text-stone-700">
                          {(formatter as (year: YearEntry) => string)(year)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>

          <DataCard title="Balance Sheet">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2 pr-4">Item</th>
                    {years.map((year) => (
                      <th key={year.label} className="py-2 pr-4">
                        {year.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cash', (year: YearEntry) => formatCurrency(year.endingCash)],
                    ['Inventory', (year: YearEntry) => formatCurrency(year.inventory)],
                    ['Fixed assets', (year: YearEntry) => formatCurrency(year.fixedAssets)],
                    ['Goodwill', (year: YearEntry) => formatCurrency(year.goodwill)],
                    ['Total assets', (year: YearEntry) => formatCurrency(year.totalAssets)],
                    ['Debt', (year: YearEntry) => formatCurrency(year.debt)],
                    ['Total liabilities', (year: YearEntry) => formatCurrency(year.totalLiabilities)],
                    [
                      'Shareholders equity',
                      (year: YearEntry) => formatCurrency(year.shareholdersEquity),
                    ],
                    ['Book value per share', (year: YearEntry) => formatPrice(year.bookValuePerShare)],
                  ].map(([label, formatter]) => (
                    <tr key={label as string} className="border-b border-stone-200 last:border-0">
                      <td className="py-2 pr-4 font-medium text-stone-900">{label as string}</td>
                      {years.map((year) => (
                        <td key={`${label as string}-${year.label}`} className="py-2 pr-4 text-stone-700">
                          {(formatter as (year: YearEntry) => string)(year)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>

          <DataCard title="Operating Snapshot">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500">
                    <th className="py-2 pr-4">Item</th>
                    {years.map((year) => (
                      <th key={year.label} className="py-2 pr-4">
                        {year.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Stands', (year: YearEntry) => formatNumber(year.stands)],
                    ['Cups per stand', (year: YearEntry) => formatNumber(year.cupsPerStand)],
                    ['Cups sold', (year: YearEntry) => formatNumber(year.cupsSold)],
                    ['Price per cup', (year: YearEntry) => formatPrice(year.pricePerCup)],
                    ['Revenue', (year: YearEntry) => formatCurrency(year.revenue)],
                    ['COGS', (year: YearEntry) => formatCurrency(year.cogs)],
                    ['Labor cost', (year: YearEntry) => formatCurrency(year.laborCost)],
                    ['Depreciation', (year: YearEntry) => formatCurrency(year.depreciation)],
                    ['EBIT', (year: YearEntry) => formatCurrency(year.ebit)],
                    ['EBIT margin', (year: YearEntry) => formatPercent(year.ebitMargin)],
                    ['Interest expense', (year: YearEntry) => formatCurrency(year.interestExpense)],
                    ['EBT', (year: YearEntry) => formatCurrency(year.ebt)],
                    ['Taxes', (year: YearEntry) => formatCurrency(year.taxes)],
                    ['Net income', (year: YearEntry) => formatCurrency(year.netIncome)],
                    ['EPS', (year: YearEntry) => formatPrice(year.eps)],
                    [
                      'Revenue growth',
                      (year: YearEntry) =>
                        year.revenueGrowth === null ? '-' : formatPercent(year.revenueGrowth),
                    ],
                  ].map(([label, formatter]) => (
                    <tr key={label as string} className="border-b border-stone-200 last:border-0">
                      <td className="py-2 pr-4 font-medium text-stone-900">{label as string}</td>
                      {years.map((year) => (
                        <td key={`${label as string}-${year.label}`} className="py-2 pr-4 text-stone-700">
                          {(formatter as (year: YearEntry) => string)(year)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataCard>
        </div>
      </section>
    </div>
  )
}

export default ReportSimulator
