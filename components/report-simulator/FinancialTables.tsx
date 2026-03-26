import {
  formatAccountingCurrency,
  formatAccountingPrice,
  formatNumber,
  formatPercent,
} from './format'
import FormulaInfo from './FormulaInfo'
import { rowFormulas } from './formulas'
import type { YearEntry } from './types'

type RowFormatter = (year: YearEntry) => string

const emphasizedRows = new Set([
  'Revenue',
  'EBIT',
  'Net income',
  'CFO',
  'Ending cash',
  'Total assets',
  'Shareholders equity',
  'Book value per share',
  'EPS',
])

const getRowClassName = (label: string) =>
  emphasizedRows.has(label)
    ? 'border-b border-stone-300 bg-stone-100/90 last:border-0'
    : 'border-b border-stone-200 last:border-0'

const renderLabelCell = (label: string) => (
  <span className="inline-flex items-start">
    <span>{label}</span>
    {rowFormulas[label] ? <FormulaInfo label={label} formula={rowFormulas[label]} /> : null}
  </span>
)

const renderTable = (years: YearEntry[], rows: Array<[string, RowFormatter]>) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[980px] table-fixed text-left text-sm tabular-nums">
      <thead>
        <tr className="border-b border-stone-200 text-stone-500">
          <th className="w-44 py-2 pr-4">Item</th>
          {years.map((year) => (
            <th key={year.label} className="w-32 py-2 pr-4">
              {year.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, formatter]) => (
          <tr key={label} className={getRowClassName(label)}>
            <td className="w-44 py-2 pr-4 font-medium text-stone-900">{renderLabelCell(label)}</td>
            {years.map((year) => (
              <td key={`${label}-${year.label}`} className="w-32 py-2 pr-4 text-stone-700">
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
    ['Net income', (year) => formatAccountingCurrency(year.netIncome)],
    ['Depreciation', (year) => formatAccountingCurrency(year.depreciation)],
    ['Change in inventory', (year) => formatAccountingCurrency(year.changeInInventory)],
    ['CFO', (year) => formatAccountingCurrency(year.cfo)],
    ['Capex', (year) => formatAccountingCurrency(-year.capex)],
    ['CFI', (year) => formatAccountingCurrency(year.cfi)],
    ['Equity issued', (year) => formatAccountingCurrency(year.equityIssued)],
    ['Debt issued', (year) => formatAccountingCurrency(year.debtIssued)],
    ['Debt repaid', (year) => formatAccountingCurrency(-year.debtRepaid)],
    ['CFF', (year) => formatAccountingCurrency(year.cff)],
    ['Beginning cash', (year) => formatAccountingCurrency(year.beginningCash)],
    ['Change in cash', (year) => formatAccountingCurrency(year.cfo + year.cfi + year.cff)],
    ['Ending cash', (year) => formatAccountingCurrency(year.endingCash)],
  ])
}

export function BalanceSheetTable({ years }: { years: YearEntry[] }) {
  return renderTable(years, [
    ['Cash', (year) => formatAccountingCurrency(year.endingCash)],
    ['Inventory', (year) => formatAccountingCurrency(year.inventory)],
    ['Fixed assets', (year) => formatAccountingCurrency(year.fixedAssets)],
    ['Goodwill', (year) => formatAccountingCurrency(year.goodwill)],
    ['Total assets', (year) => formatAccountingCurrency(year.totalAssets)],
    ['Debt', (year) => formatAccountingCurrency(year.debt)],
    ['Total liabilities', (year) => formatAccountingCurrency(year.totalLiabilities)],
    ['Shareholders equity', (year) => formatAccountingCurrency(year.shareholdersEquity)],
    ['Book value per share', (year) => formatAccountingPrice(year.bookValuePerShare)],
  ])
}

export function OperatingSnapshotTable({ years }: { years: YearEntry[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] table-fixed text-left text-sm tabular-nums">
        <thead>
          <tr className="border-b border-stone-200 text-stone-500">
            <th className="w-44 py-2 pr-4">Item</th>
            {years.map((year) => (
              <th key={year.label} className="w-32 py-2 pr-4">
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
            ['Price per cup', (year: YearEntry) => formatAccountingPrice(year.pricePerCup)],
            ['Revenue', (year: YearEntry) => formatAccountingCurrency(year.revenue)],
            ['COGS', (year: YearEntry) => formatAccountingCurrency(year.cogs)],
            ['Labor cost', (year: YearEntry) => formatAccountingCurrency(year.laborCost)],
            ['Depreciation', (year: YearEntry) => formatAccountingCurrency(year.depreciation)],
            ['EBIT', (year: YearEntry) => formatAccountingCurrency(year.ebit)],
            ['EBIT margin', (year: YearEntry) => formatPercent(year.ebitMargin)],
            ['Interest expense', (year: YearEntry) => formatAccountingCurrency(year.interestExpense)],
            ['EBT', (year: YearEntry) => formatAccountingCurrency(year.ebt)],
            ['Taxes', (year: YearEntry) => formatAccountingCurrency(year.taxes)],
            ['Net income', (year: YearEntry) => formatAccountingCurrency(year.netIncome)],
            ['EPS', (year: YearEntry) => formatAccountingPrice(year.eps)],
            [
              'Revenue growth',
              (year: YearEntry) =>
                year.revenueGrowth === null ? '-' : formatPercent(year.revenueGrowth),
            ],
          ].map(([label, formatter]) => (
            <tr key={label as string} className={getRowClassName(label as string)}>
              <td className="w-44 py-2 pr-4 font-medium text-stone-900">
                {renderLabelCell(label as string)}
              </td>
              {years.map((year) => (
                <td
                  key={`${label as string}-${year.label}`}
                  className="w-32 py-2 pr-4 text-stone-700"
                >
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
