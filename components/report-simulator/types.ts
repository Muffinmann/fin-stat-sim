export type YearEntry = {
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
  perShareGrowth: number | null
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

export type Params = {
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

export type ScalarParamKey = Exclude<
  keyof Params,
  'annualStandAdds' | 'annualDebtIssued' | 'annualDebtRepaid' | 'annualEquityIssued'
>

export type ScheduleParamKey =
  | 'annualStandAdds'
  | 'annualDebtIssued'
  | 'annualDebtRepaid'
  | 'annualEquityIssued'

export type ParamConfig = {
  key: ScalarParamKey
  label: string
  helper?: string
  unit?: string
  step?: string
}

export type ScheduleConfig = {
  key: ScheduleParamKey
  label: string
  helper?: string
  step?: string
}

export type ParameterTab = 'foundation' | 'operations' | 'financing'
