import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import ContentBlocks from '../components/ContentBlocks'
import ProgressBar from '../components/ProgressBar'
import { getChapter } from '../data'
import { useProgress } from '../hooks/useProgress'
import { markSectionRead, setLastRead } from '../lib/progress'

export default function ChapterReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const chapter = getChapter(Number(id))
  const progress = useProgress()
  const [searchParams] = useSearchParams()
  const targetSectionId = searchParams.get('s')

  const initialIndex = useMemo(() => {
    if (!chapter) return 0
    if (progress.lastRead?.chapterId === chapter.id) {
      const i = chapter.sections.findIndex(
        (s) => s.id === progress.lastRead!.sectionId,
      )
      if (i >= 0) return i
    }
    const firstUnread = chapter.sections.findIndex(
      (s) => !progress.readSections[s.id],
    )
    return firstUnread >= 0 ? firstUnread : 0
    // Only on mount: we don't want reading state changes to yank the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id])

  const [index, setIndex] = useState(initialIndex)
  // Section list is collapsible so reading text can use the full width;
  // starts open on desktop, collapsed on narrow/portrait screens.
  const [navOpen, setNavOpen] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  )
  // Reset position when navigating to a different chapter (render-time adjust).
  const [prevChapterId, setPrevChapterId] = useState(chapter?.id)
  if (chapter && prevChapterId !== chapter.id) {
    setPrevChapterId(chapter.id)
    setIndex(initialIndex)
  }

  const goTo = useCallback(
    (i: number) => {
      if (!chapter) return
      const clamped = Math.max(0, Math.min(chapter.sections.length - 1, i))
      setIndex(clamped)
      setLastRead(chapter.id, chapter.sections[clamped].id)
      window.scrollTo({ top: 0 })
    },
    [chapter],
  )

  // Deep links from search/glossary: ?s=<sectionId> jumps to that section
  // (render-time adjust, same pattern as the chapter change above).
  const [prevTarget, setPrevTarget] = useState<string | null>(null)
  if (chapter && targetSectionId !== prevTarget) {
    setPrevTarget(targetSectionId)
    if (targetSectionId) {
      const i = chapter.sections.findIndex((s) => s.id === targetSectionId)
      if (i >= 0) setIndex(i)
    }
  }
  useEffect(() => {
    if (targetSectionId) window.scrollTo({ top: 0 })
  }, [targetSectionId])

  // Arrow-key navigation between sections.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight') goTo(index + 1)
      if (e.key === 'ArrowLeft') goTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, goTo])

  if (!chapter) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">
          Chapter not found
        </h1>
        <Link to="/chapters" className="text-brass-600 underline">
          Back to chapters
        </Link>
      </div>
    )
  }

  const section = chapter.sections[index]
  const isLast = index === chapter.sections.length - 1
  const readCount = chapter.sections.filter(
    (s) => progress.readSections[s.id],
  ).length
  const readPct = (readCount / chapter.sections.length) * 100

  const markComplete = () => {
    markSectionRead(chapter.id, section.id)
    if (!isLast) goTo(index + 1)
  }

  return (
    // Negative margins mirror the shell's responsive padding exactly.
    <div className="-mx-4 -mt-4 -mb-8 sm:-mx-6 lg:-mx-8 lg:-mt-6">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 border-b border-paper-edge bg-paper/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            to="/chapters"
            className="shrink-0 font-mono text-[11px] font-semibold tracking-[0.14em] text-brass-600 uppercase hover:underline"
          >
            ◂ Chapters
          </Link>
          <button
            onClick={() => setNavOpen((o) => !o)}
            aria-expanded={navOpen}
            className="shrink-0 rounded-md border border-paper-edge px-2 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-ink-600 uppercase transition-colors hover:bg-ink-50 hover:text-ink-900"
          >
            {navOpen ? '✕ Sections' : '☰ Sections'}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink-900">
              Ch {chapter.id}: {chapter.title}
            </div>
          </div>
          <div className="flex w-40 shrink-0 items-center gap-2">
            <ProgressBar value={readPct} label="chapter progress" />
            <span className="text-xs font-semibold whitespace-nowrap text-ink-500">
              {readCount}/{chapter.sections.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:gap-8 lg:px-8">
        {/* Section sidebar (collapsible; stacks above the text on mobile) */}
        {navOpen && (
          <aside className="w-full shrink-0 md:w-60">
            <nav className="flex flex-col gap-0.5 md:sticky md:top-20">
              {chapter.sections.map((s, i) => {
              const read = !!progress.readSections[s.id]
              const active = i === index
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    goTo(i)
                    // On narrow screens, collapse after picking so the
                    // text gets the full width back.
                    if (!window.matchMedia('(min-width: 768px)').matches) {
                      setNavOpen(false)
                    }
                  }}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'bg-ink-100 font-semibold text-ink-950'
                      : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                  }`}
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                      read
                        ? 'bg-verdant-500 text-white'
                        : 'bg-ink-100 text-ink-400 [box-shadow:inset_0_0_0_1px_var(--color-ink-200)]'
                    }`}
                  >
                    {read ? '✓' : i + 1}
                  </span>
                  <span>{s.title}</span>
                  <span className="sr-only">{read ? '(read)' : ''}</span>
                </button>
              )
              })}
            </nav>
          </aside>
        )}

        {/* Main column */}
        <article className="min-w-0 max-w-prose flex-1">
          <div className="text-xs font-semibold tracking-widest text-brass-600 uppercase">
            Section {index + 1} of {chapter.sections.length}
          </div>
          <h1 className="font-display mt-1 mb-2 text-2xl font-bold text-ink-950 sm:text-3xl">
            {section.title}
          </h1>

          <ContentBlocks blocks={section.blocks} />

          <div className="mt-10 flex items-center gap-3 border-t border-paper-edge pt-6">
            <Button
              variant="ghost"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
            >
              ← Previous
            </Button>
            {!isLast ? (
              <Button onClick={markComplete}>
                {progress.readSections[section.id]
                  ? 'Next Section →'
                  : 'Mark Complete & Continue →'}
              </Button>
            ) : (
              <Button onClick={markComplete} variant="secondary">
                {progress.readSections[section.id]
                  ? 'Chapter Complete ✓'
                  : 'Mark Chapter Complete'}
              </Button>
            )}
          </div>

          {isLast && (
            <Card className="mt-6 flex items-center justify-between bg-ink-950 p-6">
              <div>
                <div className="font-display text-lg font-bold text-paper">
                  Ready to test yourself?
                </div>
                <p className="text-sm text-ink-300">
                  Take the Chapter {chapter.id} unit test to lock it in.
                </p>
              </div>
              <Button size="lg" onClick={() => navigate(`/chapters/${chapter.id}/test`)}>
                Take Unit Test
              </Button>
            </Card>
          )}

          <p className="mt-6 text-xs text-ink-400">
            Tip: use ← and → arrow keys to move between sections.
          </p>
        </article>
      </div>
    </div>
  )
}
