import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import Card from '../components/Card'
import ProgressBar from '../components/ProgressBar'
import { chapters, finraSections } from '../data'
import { useProgress } from '../hooks/useProgress'
import { chapterReadFraction } from '../lib/stats'

export default function Chapters() {
  const progress = useProgress()
  return (
    <div>
      <header className="mb-6">
        <div className="t-label text-brass-600">Index</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          Chapters
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Fourteen chapters covering the full FINRA SIE content outline.
        </p>
      </header>
      {finraSections.map((fs) => (
        <Card
          key={fs.id}
          title={`Part ${fs.id} — ${fs.title}`}
          titleRight={<Badge tone="brass">{fs.weightPct}% of exam</Badge>}
          className="mb-4"
        >
          {chapters
            .filter((c) => c.finraSection === fs.id)
            .map((ch) => {
              const pct = chapterReadFraction(progress, ch) * 100
              return (
                <Link
                  key={ch.id}
                  to={`/chapters/${ch.id}`}
                  className="flex items-center gap-4 border-b border-paper-edge px-4 py-3 transition-colors last:border-b-0 hover:bg-ink-50"
                >
                  <span className="w-12 shrink-0 font-mono text-xs text-ink-500 tabular-nums">
                    CH{String(ch.id).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink-950">
                      {ch.title}
                    </span>
                    <span className="block truncate text-xs text-ink-500">
                      {ch.summary}
                    </span>
                  </span>
                  <span className="hidden w-28 shrink-0 sm:block">
                    <ProgressBar value={pct} label={`${ch.title} reading`} />
                  </span>
                  <span className="w-11 shrink-0 text-right font-mono text-xs text-ink-600 tabular-nums">
                    {Math.round(pct)}%
                  </span>
                </Link>
              )
            })}
        </Card>
      ))}
    </div>
  )
}
