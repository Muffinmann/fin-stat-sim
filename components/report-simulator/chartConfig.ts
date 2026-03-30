import { parameterGroups, scheduleGroups } from './config'
import { formatCurrency, formatPercent, formatPrice } from './format'
import type { ChartKey, DisplayableParamKey, Params, ScalarParamKey, YearEntry } from './types'

type Formatter = (value: number) => string

type BaselineItemDefinition = {
  id: string
  label: string
  paramKey?: DisplayableParamKey
  valueFormatter: Formatter
  deltaFormatter?: Formatter
  getCurrentValue: (params: Params, years: YearEntry[]) => number
  getBaselineValue: (baselineParams: Params, baselineYears: YearEntry[]) => number
}

type BridgeHighlightDefinition = {
  id: string
  label: string
  paramKey?: DisplayableParamKey
  valueFormatter: Formatter
  note: string
  getValue: (params: Params, years: YearEntry[]) => number
}

type SensitivityItemDefinition = {
  id: string
  label: string
  paramKey: ScalarParamKey
  valueFormatter: Formatter
  minusLabel: string
  plusLabel: string
  getScenarios: (params: Params) => { lower: Params; higher: Params }
}

const scalarParameterConfigs = Object.values(parameterGroups).flat()
const scheduleParameterConfigs = scheduleGroups

const scalarParameterConfigMap = Object.fromEntries(
  scalarParameterConfigs.map((config) => [config.key, config])
) as Record<ScalarParamKey, (typeof scalarParameterConfigs)[number]>

const scheduleParameterConfigMap = Object.fromEntries(
  scheduleParameterConfigs.map((config) => [config.key, config])
) as Record<(typeof scheduleParameterConfigs)[number]['key'], (typeof scheduleParameterConfigs)[number]>

const integerFormatter: Formatter = (value) => `${Math.round(value)}`
const yearFormatter: Formatter = (value) => `${Math.round(value)}y`

const defaultFormatterByParamKey: Record<ScalarParamKey, Formatter> = {
  startingCash: formatCurrency,
  sharesOutstanding: integerFormatter,
  taxRatePct: formatPercent,
  interestRatePct: formatPercent,
  standCost: formatCurrency,
  usefulLifeYears: yearFormatter,
  startingGoodwill: formatCurrency,
  inventoryRatioPct: (value) => `${value.toFixed(1)}% of COGS`,
  pricePerCup: formatPrice,
  annualPriceGrowthPct: formatPercent,
  cupsPerStand: integerFormatter,
  annualVolumeGrowthPct: formatPercent,
  ingredientCostPerCup: formatPrice,
  laborCostPerStand: formatCurrency,
}

const sensitivityStepByParamKey: Record<
  ScalarParamKey,
  { delta: number; min?: number; formatter?: (delta: number) => string }
> = {
  startingCash: { delta: 100 },
  sharesOutstanding: { delta: 100 },
  taxRatePct: { delta: 5, formatter: (delta) => `${delta} pts` },
  interestRatePct: { delta: 2, formatter: (delta) => `${delta} pts` },
  standCost: { delta: 50 },
  usefulLifeYears: { delta: 1, min: 1, formatter: (delta) => `${delta}y` },
  startingGoodwill: { delta: 100 },
  inventoryRatioPct: { delta: 5, formatter: (delta) => `${delta} pts` },
  pricePerCup: { delta: 0.1, formatter: (delta) => formatPrice(delta) },
  annualPriceGrowthPct: { delta: 2, formatter: (delta) => `${delta} pts` },
  cupsPerStand: { delta: 50 },
  annualVolumeGrowthPct: { delta: 2, formatter: (delta) => `${delta} pts` },
  ingredientCostPerCup: { delta: 0.05, formatter: (delta) => formatPrice(delta) },
  laborCostPerStand: { delta: 50 },
}

const formatSignedCurrency = (value: number) => `${value >= 0 ? '+' : '-'}${formatCurrency(Math.abs(value))}`
const formatSignedPercentPoint = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value)} pts`

const formatSignedStep = (
  value: number,
  config: { formatter?: (delta: number) => string }
) => {
  if (config.formatter) {
    const base = config.formatter(Math.abs(value))
    return `${value >= 0 ? '+' : '-'}${base}`
  }

  return formatSignedCurrency(value)
}

const getParamValue = (params: Params, key: ScalarParamKey) => params[key]

export const baselineItemDefinitions: BaselineItemDefinition[] = [
  {
    id: 'metric-revenue',
    label: 'Year 5 Revenue',
    valueFormatter: formatCurrency,
    deltaFormatter: formatSignedCurrency,
    getCurrentValue: (_params, years) => years.at(-1)?.revenue ?? 0,
    getBaselineValue: (_params, years) => years.at(-1)?.revenue ?? 0,
  },
  {
    id: 'metric-ebit',
    label: 'Year 5 EBIT',
    valueFormatter: formatCurrency,
    deltaFormatter: formatSignedCurrency,
    getCurrentValue: (_params, years) => years.at(-1)?.ebit ?? 0,
    getBaselineValue: (_params, years) => years.at(-1)?.ebit ?? 0,
  },
  {
    id: 'metric-netIncome',
    label: 'Year 5 Net income',
    valueFormatter: formatCurrency,
    deltaFormatter: formatSignedCurrency,
    getCurrentValue: (_params, years) => years.at(-1)?.netIncome ?? 0,
    getBaselineValue: (_params, years) => years.at(-1)?.netIncome ?? 0,
  },
  {
    id: 'metric-endingCash',
    label: 'Year 5 Ending cash',
    valueFormatter: formatCurrency,
    deltaFormatter: formatSignedCurrency,
    getCurrentValue: (_params, years) => years.at(-1)?.endingCash ?? 0,
    getBaselineValue: (_params, years) => years.at(-1)?.endingCash ?? 0,
  },
  {
    id: 'metric-eps',
    label: 'Year 5 EPS',
    valueFormatter: formatPrice,
    deltaFormatter: (value) => `${value >= 0 ? '+' : '-'}${formatPrice(Math.abs(value))}`,
    getCurrentValue: (_params, years) => years.at(-1)?.eps ?? 0,
    getBaselineValue: (_params, years) => years.at(-1)?.eps ?? 0,
  },
  ...scalarParameterConfigs.map((config) => ({
    id: `param-${config.key}`,
    label: config.label,
    paramKey: config.key,
    valueFormatter: defaultFormatterByParamKey[config.key],
    deltaFormatter:
      config.key === 'taxRatePct' ||
      config.key === 'interestRatePct' ||
      config.key === 'annualPriceGrowthPct' ||
      config.key === 'annualVolumeGrowthPct' ||
      config.key === 'inventoryRatioPct'
        ? formatSignedPercentPoint
        : config.key === 'usefulLifeYears'
          ? (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(Math.round(value))}y`
          : formatSignedCurrency,
    getCurrentValue: (params: Params) => getParamValue(params, config.key),
    getBaselineValue: (baselineParams: Params) => getParamValue(baselineParams, config.key),
  })),
  ...scheduleParameterConfigs.map((config) => ({
    id: `schedule-${config.key}`,
    label: `${config.label} (Year 5)`,
    paramKey: config.key,
    valueFormatter:
      config.key === 'annualStandAdds' ? integerFormatter : formatCurrency,
    deltaFormatter:
      config.key === 'annualStandAdds'
        ? (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(Math.round(value))}`
        : formatSignedCurrency,
    getCurrentValue: (params: Params) => params[config.key].at(-1) ?? 0,
    getBaselineValue: (baselineParams: Params) => baselineParams[config.key].at(-1) ?? 0,
  })),
]

export const bridgeHighlightDefinitions: BridgeHighlightDefinition[] = [
  {
    id: 'step-revenue',
    label: 'Revenue',
    valueFormatter: formatCurrency,
    note: '价格、销量、扩张',
    getValue: (_params, years) => years.at(-1)?.revenue ?? 0,
  },
  {
    id: 'step-cogs',
    label: 'COGS',
    valueFormatter: formatCurrency,
    note: '原料成本',
    getValue: (_params, years) => Math.abs(years.at(-1)?.cogs ?? 0),
  },
  {
    id: 'step-labor',
    label: 'Labor',
    valueFormatter: formatCurrency,
    note: '人工成本',
    getValue: (_params, years) => Math.abs(years.at(-1)?.laborCost ?? 0),
  },
  ...scalarParameterConfigs.map((config) => ({
    id: `param-${config.key}`,
    label: config.label,
    paramKey: config.key,
    valueFormatter: defaultFormatterByParamKey[config.key],
    note: scalarParameterConfigMap[config.key]?.helper ?? '当前参数值',
    getValue: (params: Params) => getParamValue(params, config.key),
  })),
  ...scheduleParameterConfigs.map((config) => ({
    id: `schedule-${config.key}`,
    label: `${config.label} (Year 5)`,
    paramKey: config.key,
    valueFormatter:
      config.key === 'annualStandAdds' ? integerFormatter : formatCurrency,
    note: `${scheduleParameterConfigMap[config.key]?.helper ?? '融资计划'}，取 Year 5 数值`,
    getValue: (params: Params) => params[config.key].at(-1) ?? 0,
  })),
]

export const sensitivityItemDefinitions: SensitivityItemDefinition[] = scalarParameterConfigs.map(
  (config) => {
    const stepConfig = sensitivityStepByParamKey[config.key]

    return {
      id: `param-${config.key}`,
      label: config.label,
      paramKey: config.key,
      valueFormatter: defaultFormatterByParamKey[config.key],
      minusLabel: formatSignedStep(-stepConfig.delta, stepConfig),
      plusLabel: formatSignedStep(stepConfig.delta, stepConfig),
      getScenarios: (params: Params) => ({
        lower: {
          ...params,
          [config.key]: Math.max(stepConfig.min ?? 0, params[config.key] - stepConfig.delta),
        },
        higher: {
          ...params,
          [config.key]: params[config.key] + stepConfig.delta,
        },
      }),
    }
  }
)

const chartParamItemIds: Record<ChartKey, Set<string>> = {
  baseline: new Set(baselineItemDefinitions.filter((item) => item.paramKey).map((item) => item.id)),
  bridge: new Set(bridgeHighlightDefinitions.filter((item) => item.paramKey).map((item) => item.id)),
  sensitivity: new Set(sensitivityItemDefinitions.map((item) => item.id)),
}

export const defaultChartSelections: Record<ChartKey, string[]> = {
  baseline: ['metric-revenue', 'metric-ebit', 'metric-netIncome', 'metric-endingCash', 'metric-eps'],
  bridge: ['step-revenue', 'step-cogs', 'step-labor'],
  sensitivity: ['param-taxRatePct', 'param-interestRatePct', 'param-usefulLifeYears'],
}

export const chartLabels: Record<ChartKey, string> = {
  baseline: '基准 vs 当前',
  bridge: '经营到现金桥图',
  sensitivity: '参数敏感度',
}

export const chartItemPool = {
  baseline: baselineItemDefinitions,
  bridge: bridgeHighlightDefinitions,
  sensitivity: sensitivityItemDefinitions,
} as const

export const getChartItemIdForParam = (chart: ChartKey, paramKey: DisplayableParamKey) => {
  const itemId = scalarParameterConfigMap[paramKey as ScalarParamKey]
    ? `param-${paramKey}`
    : `schedule-${paramKey}`
  return chartParamItemIds[chart].has(itemId) ? itemId : null
}

export const getAddableChartsForParam = (paramKey: DisplayableParamKey) => {
  const itemId = scalarParameterConfigMap[paramKey as ScalarParamKey]
    ? `param-${paramKey}`
    : `schedule-${paramKey}`

  return (Object.keys(chartParamItemIds) as ChartKey[]).filter((chart) =>
    chartParamItemIds[chart].has(itemId)
  )
}

export const getChartPoolItems = (chart: ChartKey) => chartItemPool[chart]
