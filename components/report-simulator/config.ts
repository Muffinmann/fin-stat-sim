import type { ParamConfig, ParameterTab, Params, ScheduleConfig } from './types'

export const yearLabels = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
export const chartYearLabels = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5']

export const defaultParams: Params = {
  startingCash: 0,
  sharesOutstanding: 1500,
  taxRatePct: 35,
  interestRatePct: 0,
  standCost: 300,
  usefulLifeYears: 5,
  startingGoodwill: 1000,
  inventoryRatioPct: 0,
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

export const lineSeries = [
  { key: 'revenue', label: 'Revenue', color: '#0f766e' },
  { key: 'ebit', label: 'EBIT', color: '#f97316' },
  { key: 'netIncome', label: 'Net income', color: '#2563eb' },
  { key: 'endingCash', label: 'Ending cash', color: '#7c3aed' },
] as const

export const parameterTabs: { key: ParameterTab; label: string; description: string }[] = [
  { key: 'foundation', label: '基础', description: '股本、税率、折旧和营运资本' },
  { key: 'operations', label: '经营', description: '价格、销量和成本驱动项' },
  { key: 'financing', label: '融资计划', description: '扩张节奏与债股融资安排' },
]

export const parameterGroups: Record<Exclude<ParameterTab, 'financing'>, ParamConfig[]> = {
  foundation: [
    { key: 'startingCash', label: 'Starting cash', helper: '公司开业前就带着的现金' },
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
    { key: 'standCost', label: 'Stand cost', helper: '每新增一个摊位要投入多少 Capex' },
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
    { key: 'pricePerCup', label: 'Price per cup', helper: '每杯售价', step: '0.01' },
    {
      key: 'annualPriceGrowthPct',
      label: 'Annual price growth',
      helper: '提价能力',
      unit: '%',
      step: '0.1',
    },
    { key: 'cupsPerStand', label: 'Cups per stand', helper: '单摊首年销量' },
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

export const scheduleGroups: ScheduleConfig[] = [
  { key: 'annualStandAdds', label: 'Stand adds', helper: '每年扩张几个新摊位' },
  { key: 'annualDebtIssued', label: 'Debt issued', helper: '每年新增贷款' },
  { key: 'annualDebtRepaid', label: 'Debt repaid', helper: '每年归还本金' },
  { key: 'annualEquityIssued', label: 'Equity issued', helper: '每年增发股份融资' },
]
