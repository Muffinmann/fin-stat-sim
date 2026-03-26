import { chartYearLabels, lineSeries } from './config'
import { formatCurrency } from './format'
import type { YearEntry } from './types'

type ChartRange = {
  min: number
  max: number
}

const getChartRange = (values: number[]): ChartRange => {
  if (values.length === 0) {
    return { min: 0, max: 1 }
  }

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)

  if (rawMin === rawMax) {
    if (rawMin === 0) {
      return { min: -1, max: 1 }
    }

    const padding = Math.max(Math.abs(rawMin) * 0.15, 1)
    return {
      min: rawMin - padding,
      max: rawMax + padding,
    }
  }

  const span = rawMax - rawMin
  const padding = Math.max(span * 0.08, 1)

  return {
    min: rawMin - padding,
    max: rawMax + padding,
  }
}

const getValueY = (value: number, height: number, range: ChartRange) => {
  const span = range.max - range.min
  if (span <= 0) {
    return height / 2
  }

  return height - ((value - range.min) / span) * height
}

const getLinePath = (values: number[], width: number, height: number, range: ChartRange) => {
  if (values.length === 0) {
    return ''
  }

  const stepX = values.length === 1 ? 0 : width / (values.length - 1)
  return values
    .map((value, index) => {
      const x = stepX * index
      const y = getValueY(value, height, range)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export default function TrendCharts({ years }: { years: YearEntry[] }) {
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
      <div className="mb-4">
        <div className="text-sm font-semibold text-stone-900">核心指标趋势</div>
        <div className="mt-1 text-xs text-stone-500">横坐标为年份，纵坐标为各指标金额。</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {lineSeries.map((series) => {
          const values = years.map((year) => year[series.key as keyof YearEntry] as number)
          const range = getChartRange(values)
          const yTicks = [range.max, (range.max + range.min) / 2, range.min]
          const zeroLineY =
            range.min <= 0 && range.max >= 0 ? getValueY(0, plotHeight, range) : null

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
                  const y = getValueY(tickValue, plotHeight, range)
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

                {zeroLineY !== null ? (
                  <line
                    x1={yAxisWidth}
                    y1={topPadding + zeroLineY}
                    x2={chartWidth - rightPadding}
                    y2={topPadding + zeroLineY}
                    stroke="currentColor"
                    strokeOpacity="0.3"
                    strokeDasharray="4 4"
                  />
                ) : null}

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
                    d={getLinePath(values, plotWidth, plotHeight, range)}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {values.map((value, index) => {
                    const x = values.length === 1 ? 0 : (plotWidth / (values.length - 1)) * index
                    const y = getValueY(value, plotHeight, range)

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
