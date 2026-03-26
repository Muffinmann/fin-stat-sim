import { formatCurrency, formatNumber, formatPercent, formatPrice } from './format'
import type { YearEntry } from './types'

type RowFormatter = (year: YearEntry) => string

const renderTable = (years: YearEntry[], rows: Array<[string, RowFormatter]>) => (
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
        {rows.map(([label, formatter]) => (
          <tr key={label} className="border-b border-stone-200 last:border-0">
            <td className="py-2 pr-4 font-medium text-stone-900">{label}</td>
            {years.map((year) => (
              <td key={`${label}-${year.label}`} className="py-2 pr-4 text-stone-700">
                {formatter(year)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export function CashFlowTable({ years }: { years: YearEntry[] }) {
  return renderTable(years, [
    ['Net income', (year) => formatCurrency(year.netIncome)],
    ['Depreciation', (year) => formatCurrency(year.depreciation)],
    ['Change in inventory', (year) => formatCurrency(year.changeInInventory)],
    ['CFO', (year) => formatCurrency(year.cfo)],
    ['Capex', (year) => formatCurrency(-year.capex)],
    ['CFI', (year) => formatCurrency(year.cfi)],
    ['Equity issued', (year) => formatCurrency(year.equityIssued)],
    ['Debt issued', (year) => formatCurrency(year.debtIssued)],
    ['Debt repaid', (year) => formatCurrency(-year.debtRepaid)],
    ['CFF', (year) => formatCurrency(year.cff)],
    ['Beginning cash', (year) => formatCurrency(year.beginningCash)],
    ['Change in cash', (year) => formatCurrency(year.cfo + year.cfi + year.cff)],
    ['Ending cash', (year) => formatCurrency(year.endingCash)],
  ])
}

export function BalanceSheetTable({ years }: { years: YearEntry[] }) {
  return renderTable(years, [
    ['Cash', (year) => formatCurrency(year.endingCash)],
    ['Inventory', (year) => formatCurrency(year.inventory)],
    ['Fixed assets', (year) => formatCurrency(year.fixedAssets)],
    ['Goodwill', (year) => formatCurrency(year.goodwill)],
    ['Total assets', (year) => formatCurrency(year.totalAssets)],
    ['Debt', (year) => formatCurrency(year.debt)],
    ['Total liabilities', (year) => formatCurrency(year.totalLiabilities)],
    ['Shareholders equity', (year) => formatCurrency(year.shareholdersEquity)],
    ['Book value per share', (year) => formatPrice(year.bookValuePerShare)],
  ])
}

export function OperatingSnapshotTable({ years }: { years: YearEntry[] }) {
  return (
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
                  {(formatter as RowFormatter)(year)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
