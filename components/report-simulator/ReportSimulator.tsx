'use client'

import { useState } from 'react'

import { defaultParams } from './config'
import {
  balanceSheetRows,
  BalanceSheetTable,
  cashFlowRows,
  CashFlowTable,
  operatingSnapshotRows,
  OperatingSnapshotTable,
} from './FinancialTables'
import { formatCurrency, formatPrice } from './format'
import ParameterPanel from './ParameterPanel'
import { buildProjection, clampNumber } from './projection'
import {
  BaselineComparisonView,
  ProfitBridgeView,
  SensitivityView,
} from './ScenarioViews'
import { DataCard } from './ui'
import type { ParameterTab, Params, ScheduleParamKey } from './types'

const cloneParams = (params: Params): Params => ({
  ...params,
  annualStandAdds: [...params.annualStandAdds],
  annualDebtIssued: [...params.annualDebtIssued],
  annualDebtRepaid: [...params.annualDebtRepaid],
  annualEquityIssued: [...params.annualEquityIssued],
})

const buildTableMarkdown = (
  title: string,
  years: ReturnType<typeof buildProjection>,
  rows: Array<[string, (year: (typeof years)[number]) => string]>
) => {
  const lines = [
    `# ${title}`,
    '',
    `导出时间: ${new Date().toLocaleString('zh-CN', { hour12: false })}`,
    '',
    `| Item | ${years.map((year) => year.label).join(' | ')} |`,
    `| --- | ${years.map(() => '---').join(' | ')} |`,
  ]

  rows.forEach(([label, formatter]) => {
    lines.push(`| ${label} | ${years.map((year) => formatter(year)).join(' | ')} |`)
  })

  lines.push('')
  return lines.join('\n')
}

const downloadMarkdown = (filename: string, markdown: string) => {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function ReportSimulator() {
  const [params, setParams] = useState<Params>(() => cloneParams(defaultParams))
  const [baselineParams, setBaselineParams] = useState<Params>(() => cloneParams(defaultParams))
  const [activeTab, setActiveTab] = useState<ParameterTab>('foundation')
  const years = buildProjection(params)

  const updateValue = (name: keyof Params) => (value: number) => {
    setParams((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const updateArrayValue = (name: ScheduleParamKey) => (yearIndex: number, value: number) => {
    setParams((current) => ({
      ...current,
      [name]: current[name].map((item, index) => (index === yearIndex ? clampNumber(value) : item)),
    }))
  }

  const finalYear = years[years.length - 1]
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

  const resetToDefaults = () => {
    setParams(cloneParams(defaultParams))
  }

  const saveAsBaseline = () => {
    setBaselineParams(cloneParams(params))
  }

  const TableExportButton = ({
    label,
    filename,
    rows,
  }: {
    label: string
    filename: string
    rows: Array<[string, (year: (typeof years)[number]) => string]>
  }) => (
    <button
      type="button"
      aria-label={`导出 ${label} Markdown`}
      title={`导出 ${label} Markdown`}
      onClick={() => downloadMarkdown(filename, buildTableMarkdown(label, years, rows))}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:border-emerald-700 hover:text-emerald-700"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M10 3.5v8m0 0 3-3m-3 3-3-3M4.5 12.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(252,211,77,0.28),_transparent_28%),linear-gradient(135deg,_#fffef7,_#effcf6_55%,_#ffffff)] p-6 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
            Financial Sandbox
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            财报模拟器
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
        <ParameterPanel
          activeTab={activeTab}
          params={params}
          setActiveTab={setActiveTab}
          updateValue={updateValue}
          updateArrayValue={updateArrayValue}
          resetToDefaults={resetToDefaults}
          saveAsBaseline={saveAsBaseline}
        />

        <div className="space-y-8">
          <DataCard title="Version A · 基准 vs 当前">
            <BaselineComparisonView params={params} baselineParams={baselineParams} />
          </DataCard>

          <DataCard title="Version B · 经营到现金桥图">
            <ProfitBridgeView years={years} />
          </DataCard>

          <DataCard title="Version C · 参数敏感度">
            <SensitivityView params={params} />
          </DataCard>

          <DataCard
            title="Operating Snapshot"
            actions={
              <TableExportButton
                label="Operating Snapshot"
                filename={`operating-snapshot-${stamp}.md`}
                rows={operatingSnapshotRows}
              />
            }
          >
            <OperatingSnapshotTable years={years} />
          </DataCard>

          <DataCard
            title="Cash Flow"
            actions={
              <TableExportButton
                label="Cash Flow"
                filename={`cash-flow-${stamp}.md`}
                rows={cashFlowRows}
              />
            }
          >
            <CashFlowTable years={years} />
          </DataCard>

          <DataCard
            title="Balance Sheet"
            actions={
              <TableExportButton
                label="Balance Sheet"
                filename={`balance-sheet-${stamp}.md`}
                rows={balanceSheetRows}
              />
            }
          >
            <BalanceSheetTable years={years} />
          </DataCard>
        </div>
      </section>
    </div>
  )
}
