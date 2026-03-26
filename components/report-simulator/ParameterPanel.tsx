import { parameterGroups, parameterTabs, scheduleGroups, yearLabels } from './config'
import { clampNumber } from './projection'
import { ParameterRow, ScheduleRow } from './ui'
import type { ParameterTab, Params, ScheduleParamKey } from './types'

type Props = {
  activeTab: ParameterTab
  params: Params
  setActiveTab: (tab: ParameterTab) => void
  updateValue: (name: keyof Params) => (value: number) => void
  updateArrayValue: (name: ScheduleParamKey) => (yearIndex: number, value: number) => void
}

export default function ParameterPanel({
  activeTab,
  params,
  setActiveTab,
  updateValue,
  updateArrayValue,
}: Props) {
  const activeTabMeta = parameterTabs.find((tab) => tab.key === activeTab) ?? parameterTabs[0]

  return (
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
            <p className="mt-1 text-xs leading-5 text-stone-500">{activeTabMeta.description}</p>
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
  )
}
