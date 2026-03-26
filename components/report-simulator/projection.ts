import { yearLabels } from './config'
import { roundMoney } from './format'
import type { Params, YearEntry } from './types'

export const clampNumber = (value: number, min = 0) => {
  if (Number.isNaN(value)) {
    return min
  }
  return Math.max(min, value)
}

export const buildProjection = (params: Params) => {
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
