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
  const chartWidth = 860
  const chartHeight = 320
  const yAxisWidth = 72
  const topPadding = 16
  const rightPadding = 24
  const bottomAxisHeight = 52
  const plotWidth = chartWidth - yAxisWidth - rightPadding
  const plotHeight = chartHeight - topPadding - bottomAxisHeight

  const seriesWithValues = lineSeries.map((series) => ({
    ...series,
    values: years.map((year) => year[series.key as keyof YearEntry] as number),
  }))

  const allValues = seriesWithValues.flatMap((series) => series.values)
  const range = getChartRange(allValues)
  const yTicks = [range.max, range.max - (range.max - range.min) / 2, range.min]
  const zeroLineY = range.min <= 0 && range.max >= 0 ? getValueY(0, plotHeight, range) : null

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-gradient-to-br from-white via-emerald-50 to-amber-50 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-stone-900">核心指标趋势</div>
          <div className="mt-1 text-xs text-stone-500">
            四个核心指标合并在一张图里，共享年份与金额坐标。
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600">
          {seriesWithValues.map((series) => (
            <div key={series.key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: series.color }} />
              <span>{series.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="h-auto w-full text-stone-700"
        role="img"
        aria-label="Combined five-year trend chart for core metrics"
      >
        {yTicks.map((tickValue, index) => {
          const y = getValueY(tickValue, plotHeight, range)
          return (
            <g key={`tick-${index}`}>
              <line
                x1={yAxisWidth}
                y1={topPadding + y}
                x2={chartWidth - rightPadding}
                y2={topPadding + y}
                stroke="currentColor"
                strokeOpacity="0.12"
              />
              <text
                x={yAxisWidth - 10}
                y={topPadding + y + 4}
                textAnchor="end"
                fontSize="11"
                fill="currentColor"
                opacity="0.72"
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
            strokeOpacity="0.28"
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

        {years.map((year, index) => {
          const x = years.length === 1 ? yAxisWidth : yAxisWidth + (plotWidth / (years.length - 1)) * index

          return (
            <g key={year.label}>
              <line
                x1={x}
                y1={topPadding}
                x2={x}
                y2={topPadding + plotHeight}
                stroke="currentColor"
                strokeOpacity="0.08"
              />
              <text
                x={x}
                y={topPadding + plotHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="currentColor"
                opacity="0.75"
              >
                {chartYearLabels[index] ?? year.label}
              </text>
            </g>
          )
        })}

        <g transform={`translate(${yAxisWidth}, ${topPadding})`}>
          {seriesWithValues.map((series) => (
            <g key={series.key}>
              <path
                d={getLinePath(series.values, plotWidth, plotHeight, range)}
                fill="none"
                stroke={series.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {series.values.map((value, index) => {
                const x = series.values.length === 1 ? 0 : (plotWidth / (series.values.length - 1)) * index
                const y = getValueY(value, plotHeight, range)

                return (
                  <g key={`${series.key}-${years[index].label}`}>
                    <circle cx={x} cy={y} r="4" fill={series.color} stroke="white" strokeWidth="1.5" />
                  </g>
                )
              })}
            </g>
          ))}
        </g>

        <text
          x={chartWidth / 2}
          y={chartHeight - 10}
          textAnchor="middle"
          fontSize="11"
          fill="currentColor"
          opacity="0.75"
        >
          X-axis: Year
        </text>
      </svg>
    </div>
  )
}
