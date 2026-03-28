'use client'

import { useState } from 'react'

import { defaultParams } from './config'
import { BalanceSheetTable, CashFlowTable, OperatingSnapshotTable } from './FinancialTables'
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

export default function ReportSimulator() {
  const [params, setParams] = useState<Params>(defaultParams)
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
        <ParameterPanel
          activeTab={activeTab}
          params={params}
          setActiveTab={setActiveTab}
          updateValue={updateValue}
          updateArrayValue={updateArrayValue}
        />

        <div className="space-y-8">
          <DataCard title="Version A · 基准 vs 当前">
            <BaselineComparisonView params={params} />
          </DataCard>

          <DataCard title="Version B · 经营到现金桥图">
            <ProfitBridgeView years={years} />
          </DataCard>

          <DataCard title="Version C · 参数敏感度">
            <SensitivityView params={params} />
          </DataCard>

          <DataCard title="Operating Snapshot">
            <OperatingSnapshotTable years={years} />
          </DataCard>

          <DataCard title="Cash Flow">
            <CashFlowTable years={years} />
          </DataCard>

          <DataCard title="Balance Sheet">
            <BalanceSheetTable years={years} />
          </DataCard>
        </div>
      </section>
    </div>
  )
}
