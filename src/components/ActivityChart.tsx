import { useState } from 'react'
import EmptyState from './EmptyState'
import type { FinraSectionId } from '../types'
import type { DayActivity } from '../lib/stats'

interface ActivityChartProps {
  /** Trailing daily activity, oldest first (every day present). */
  days: DayActivity[]
}

const SECTION_IDS: FinraSectionId[] = [1, 2, 3, 4]

/** Fixed categorical order — never reassigned when a series is empty. */
const SERIES: Record<FinraSectionId, { label: string; color: string }> = {
  1: { label: 'MKT Markets', color: 'var(--color-chart-1)' },
  2: { label: 'PRD Products', color: 'var(--color-chart-2)' },
  3: { label: 'TRD Trading', color: 'var(--color-chart-3)' },
  4: { label: 'REG Regulatory', color: 'var(--color-chart-4)' },
}

const PLOT_H = 132

function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * 30-day study volume: stacked daily bars of questions answered per FINRA
 * section. Segments are separated by hairline surface gaps; hover (or the
 * latest active day) shows the per-section breakdown below the plot.
 */
export default function ActivityChart({ days }: ActivityChartProps) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...days.map((d) => d.total))
  const total = days.reduce((n, d) => n + d.total, 0)

  if (total === 0) {
    return <EmptyState label="no activity yet" />
  }

  let lastActive = -1
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].total > 0) {
      lastActive = i
      break
    }
  }
  const detailIdx = hover ?? lastActive
  const detail = detailIdx >= 0 ? days[detailIdx] : null

  return (
    <div>
      <div
        role="img"
        aria-label={`Study volume, last ${days.length} days: ${total} questions answered; busiest day ${max}.`}
        className="flex items-end gap-[3px] border-b border-paper-edge pb-px"
        style={{ height: PLOT_H }}
        onMouseLeave={() => setHover(null)}
      >
        {days.map((d, i) => (
          <div
            key={d.date}
            onMouseEnter={() => setHover(i)}
            className={`flex h-full min-w-0 flex-1 flex-col-reverse justify-start transition-opacity ${
              hover !== null && hover !== i ? 'opacity-45' : ''
            }`}
            title={`${shortDate(d.date)}: ${d.total} question${d.total === 1 ? '' : 's'}`}
          >
            {d.total === 0 ? (
              <div className="h-[2px] w-full bg-ink-200" />
            ) : (
              SECTION_IDS.map((id) => {
                const v = d.bySection[id]
                if (v === 0) return null
                return (
                  <div
                    key={id}
                    className="w-full"
                    style={{
                      height: `${(v / max) * 100}%`,
                      backgroundColor: SERIES[id].color,
                      // 2px surface gap between stacked segments
                      boxShadow: '0 -2px 0 0 var(--color-paper-raised)',
                    }}
                  />
                )
              })
            )}
          </div>
        ))}
      </div>

      {/* X axis: first / mid / last date */}
      <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400 tabular-nums">
        <span>{shortDate(days[0].date)}</span>
        <span>{shortDate(days[Math.floor(days.length / 2)].date)}</span>
        <span>{shortDate(days[days.length - 1].date)}</span>
      </div>

      {/* Legend — fixed order, color chip + text token */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {SECTION_IDS.map((id) => (
          <span
            key={id}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-ink-500 uppercase"
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2"
              style={{ backgroundColor: SERIES[id].color }}
            />
            {SERIES[id].label}
          </span>
        ))}
      </div>

      {/* Hover / latest-day readout */}
      {detail && (
        <div className="mt-2 border-t border-paper-edge pt-2 font-mono text-[11px] text-ink-600 tabular-nums">
          <span className="font-semibold text-ink-900">
            {shortDate(detail.date)}
          </span>
          <span className="ml-2">{detail.total} answered</span>
          {SECTION_IDS.filter((id) => detail.bySection[id] > 0).map((id) => (
            <span key={id} className="ml-3 whitespace-nowrap">
              <span style={{ color: SERIES[id].color }}>■</span>{' '}
              {detail.bySection[id]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
