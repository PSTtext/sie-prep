import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { search, type SearchHit } from '../lib/search'

const kindLabel: Record<SearchHit['kind'], string> = {
  section: 'SECTION',
  term: 'TERM',
  question: 'QUESTION',
}

const kindTone: Record<SearchHit['kind'], string> = {
  section: 'text-brass-600',
  term: 'text-verdant-600',
  question: 'text-ink-500',
}

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const hits = search(query)
  const clamped = Math.min(active, Math.max(0, hits.length - 1))

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [clamped])

  const select = (hit: SearchHit) => {
    onClose()
    navigate(hit.to)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(Math.min(clamped + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(Math.max(clamped - 1, 0))
    } else if (e.key === 'Enter' && hits[clamped]) {
      e.preventDefault()
      select(hits[clamped])
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative w-full max-w-xl border border-paper-edge bg-paper-raised shadow-2xl">
        <div className="flex items-center gap-3 border-b border-paper-edge px-4">
          <span aria-hidden className="font-mono text-brass-600">
            /
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search sections, key terms, questions…"
            aria-label="Search sections, key terms, questions"
            className="w-full bg-transparent py-3.5 font-mono text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <kbd className="shrink-0 border border-paper-edge px-1.5 py-0.5 font-mono text-[10px] text-ink-500">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
          {query.trim().length >= 2 && hits.length === 0 && (
            <div className="px-4 py-8 text-center font-mono text-xs tracking-[0.14em] text-ink-500 uppercase">
              No matches for “{query.trim()}”
            </div>
          )}
          {hits.map((hit, i) => (
            <button
              key={`${hit.kind}-${hit.to}-${hit.title}`}
              type="button"
              data-active={i === clamped}
              onClick={() => select(hit)}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-start gap-3 border-l-2 px-4 py-2.5 text-left transition-colors ${
                i === clamped
                  ? 'border-brass-500 bg-ink-50'
                  : 'border-transparent hover:bg-ink-50'
              }`}
            >
              <span
                className={`mt-0.5 w-16 shrink-0 font-mono text-[9px] font-bold tracking-[0.12em] ${kindTone[hit.kind]}`}
              >
                {kindLabel[hit.kind]}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-ink-900">
                  {hit.title}
                </span>
                <span className="block truncate text-xs text-ink-500">
                  {hit.sub}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t border-paper-edge px-4 py-2 font-mono text-[10px] tracking-[0.1em] text-ink-400 uppercase">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span className="ml-auto">Ctrl+K anytime</span>
        </div>
      </div>
    </div>
  )
}
