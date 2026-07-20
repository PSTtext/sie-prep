import { allFlashcards } from '../data/flashcards'
import { isDue, todayISO } from '../lib/srs'
import { useProgress } from '../hooks/useProgress'
import { daysUntilExam, sectionDayChange, sectionReadiness } from '../lib/stats'
import type { FinraSectionId } from '../types'

const TICKERS: Record<FinraSectionId, string> = {
  1: 'MKT',
  2: 'PRD',
  3: 'TRD',
  4: 'REG',
}

function Entry({
  sym,
  value,
  change,
}: {
  sym: string
  value: string
  change?: number | null
}) {
  return (
    <span className="mx-6 inline-flex items-baseline gap-2 font-mono text-[12px]">
      <span className="font-bold text-cyan-600">{sym}</span>
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
      {change !== undefined && change !== null && (
        <span
          className={`font-semibold tabular-nums ${
            change >= 0 ? 'text-verdant-600' : 'text-signal-600'
          }`}
        >
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}
        </span>
      )}
    </span>
  )
}

/** Bloomberg-style scrolling tape: section readiness + key study stats.
    Content is rendered twice so the -50% keyframe loops seamlessly. */
export default function TickerTape() {
  const progress = useProgress()
  const per = sectionReadiness(progress)
  const chg = sectionDayChange(progress)
  const days = daysUntilExam(progress)
  const today = todayISO()
  const due = allFlashcards.filter((c) =>
    isDue(progress.flashcards[c.id], today),
  ).length

  const run = (
    <>
      {([1, 2, 3, 4] as FinraSectionId[]).map((id) => (
        <Entry
          key={id}
          sym={TICKERS[id]}
          value={per[id] !== null ? per[id]!.toFixed(1) : '--'}
          change={per[id] !== null ? chg[id] : undefined}
        />
      ))}
      <Entry sym="CARDS" value={due > 0 ? `${due} DUE` : 'CLEAR'} />
      <Entry sym="T-MINUS" value={days !== null ? `${days}D` : '--'} />
    </>
  )

  return (
    <div
      aria-hidden
      className="overflow-hidden border-b border-paper-edge bg-paper-raised/75 py-1.5 whitespace-nowrap backdrop-blur-md"
    >
      <div className="animate-ticker inline-flex w-max">
        <span className="inline-flex">{run}</span>
        <span className="inline-flex">{run}</span>
      </div>
    </div>
  )
}
