import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { glossary } from '../lib/glossary'

function letterOf(term: string): string {
  const c = term[0]?.toUpperCase() ?? '#'
  return c >= 'A' && c <= 'Z' ? c : '#'
}

export default function Glossary() {
  const [filter, setFilter] = useState('')

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const entries = q
      ? glossary.filter(
          (g) =>
            g.term.toLowerCase().includes(q) ||
            g.definition.toLowerCase().includes(q),
        )
      : glossary
    const byLetter = new Map<string, typeof entries>()
    for (const e of entries) {
      const l = letterOf(e.term)
      byLetter.set(l, [...(byLetter.get(l) ?? []), e])
    }
    return [...byLetter.entries()]
  }, [filter])

  const letters = groups.map(([l]) => l)

  return (
    <div>
      <header className="mb-6">
        <div className="t-label text-brass-600">Reference</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          Glossary
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Every key term from the study material — {glossary.length} entries.
          Each links back to the section that teaches it.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter terms…"
          aria-label="Filter glossary terms"
          className="w-full max-w-xs border border-paper-edge bg-paper-raised px-3 py-2 font-mono text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-brass-600 sm:w-64"
        />
        <nav aria-label="Jump to letter" className="flex flex-wrap gap-1">
          {letters.map((l) => (
            <a
              key={l}
              href={`#gloss-${l}`}
              className="border border-paper-edge px-2 py-1 font-mono text-[11px] font-semibold text-ink-600 hover:border-ink-400 hover:text-ink-950"
            >
              {l}
            </a>
          ))}
        </nav>
      </div>

      {groups.length === 0 && (
        <Card className="p-10 text-center font-mono text-xs tracking-[0.14em] text-ink-500 uppercase">
          No terms match “{filter.trim()}”
        </Card>
      )}

      {groups.map(([letter, entries]) => (
        <section key={letter} id={`gloss-${letter}`} className="mb-6">
          <h2 className="font-display mb-2 border-b border-paper-edge pb-1 text-xl font-bold text-ink-900">
            {letter}
          </h2>
          <div className="space-y-2">
            {entries.map((e) => (
              <Card
                key={`${e.term}-${e.sectionId}`}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <div className="w-56 shrink-0 font-semibold text-ink-950">
                  {e.term}
                </div>
                <div className="min-w-0 flex-1 text-sm leading-relaxed text-ink-700">
                  {e.definition}
                  <Link
                    to={`/chapters/${e.chapterId}?s=${e.sectionId}`}
                    className="ml-2 font-mono text-[11px] whitespace-nowrap text-brass-600 hover:underline"
                  >
                    Ch {e.chapterId} · {e.sectionTitle} →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
