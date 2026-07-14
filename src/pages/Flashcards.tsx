import { useEffect, useMemo, useRef, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import { chapters } from '../data'
import { allFlashcards } from '../data/flashcards'
import { useProgress } from '../hooks/useProgress'
import { rateFlashcard } from '../lib/progress'
import { shuffle } from '../lib/quiz'
import { isDue, todayISO, type Rating } from '../lib/srs'
import type { Flashcard } from '../types'

const ratingButtons: {
  rating: Rating
  label: string
  hint: string
  className: string
}[] = [
  {
    rating: 'again',
    label: 'Again',
    hint: 'today',
    className: 'bg-signal-600 text-white hover:bg-signal-700',
  },
  {
    rating: 'hard',
    label: 'Hard',
    hint: 'soon',
    className: 'bg-brass-600 text-white hover:bg-brass-700',
  },
  {
    rating: 'good',
    label: 'Good',
    hint: 'days',
    className: 'bg-verdant-600 text-white hover:bg-verdant-700',
  },
  {
    rating: 'easy',
    label: 'Easy',
    hint: 'longer',
    className: 'bg-ink-900 text-paper hover:bg-ink-800',
  },
]

/** One study run over a fixed starting queue; remounts when the filter changes. */
function ReviewSession({ cards }: { cards: Flashcard[] }) {
  const [queue, setQueue] = useState(() => shuffle(cards))
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const card = queue[0]

  // Keyboard: Space flips, 1-4 rate (Again/Hard/Good/Easy) once flipped.
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    keyHandlerRef.current = (e: KeyboardEvent) => {
      if (!card || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLButtonElement
      )
        return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) {
        rate(ratingButtons[Number(e.key) - 1].rating)
      }
    }
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => keyHandlerRef.current(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  if (!card) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <div className="text-4xl" aria-hidden>
          🎉
        </div>
        <div className="font-display text-xl font-bold text-ink-900">
          All caught up
        </div>
        <p className="max-w-sm text-sm text-ink-600">
          {reviewed > 0
            ? `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Cards you rated come back on their new schedule.`
            : 'No cards are due right now. Come back tomorrow, or pick another chapter.'}
        </p>
      </Card>
    )
  }

  const chapter = chapters.find((c) => c.id === card.chapterId)

  function rate(rating: Rating) {
    rateFlashcard(card.id, rating)
    setReviewed((n) => n + 1)
    setFlipped(false)
    // "Again" cards stay due today, so cycle them to the back of this session.
    setQueue((q) => (rating === 'again' ? [...q.slice(1), q[0]] : q.slice(1)))
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm text-ink-500">
        <span>
          {queue.length} card{queue.length === 1 ? '' : 's'} remaining
        </span>
        <Badge tone="neutral">
          Ch {card.chapterId}: {chapter?.title}
        </Badge>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="block w-full [perspective:1200px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass-600"
        aria-label={flipped ? 'Show question' : 'Show answer'}
      >
        <div
          className="relative min-h-64 w-full transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          <Card className="absolute inset-0 flex items-center justify-center p-8 [backface-visibility:hidden]">
            <div className="text-center">
              <div className="mb-3 text-xs font-semibold tracking-widest text-ink-500 uppercase">
                Question
              </div>
              <div className="font-display text-xl leading-snug font-bold text-ink-900">
                {card.front}
              </div>
              <div className="mt-6 text-xs text-ink-400">Click to flip</div>
            </div>
          </Card>
          <Card
            className="absolute inset-0 flex items-center justify-center border-l-4 border-brass-600 p-8 [backface-visibility:hidden]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="text-center">
              <div className="mb-3 text-xs font-semibold tracking-widest text-brass-600 uppercase">
                Answer
              </div>
              <div className="text-lg leading-relaxed text-ink-800">
                {card.back}
              </div>
            </div>
          </Card>
        </div>
      </button>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {ratingButtons.map(({ rating, label, hint, className }) => (
          <button
            key={rating}
            type="button"
            disabled={!flipped}
            onClick={() => rate(rating)}
            className={`flex flex-col items-center rounded-lg px-3 py-2.5 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass-600 disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
          >
            <span className="text-sm">{label}</span>
            <span className="text-xs font-normal opacity-80">{hint}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-ink-400">
        {flipped ? (
          <>
            Keyboard: <kbd>1</kbd> Again · <kbd>2</kbd> Hard · <kbd>3</kbd>{' '}
            Good · <kbd>4</kbd> Easy
          </>
        ) : (
          <>
            Flip the card to rate it (<kbd>Space</kbd> flips).
          </>
        )}
      </p>
    </div>
  )
}

export default function Flashcards() {
  const progress = useProgress()
  const [chapterFilter, setChapterFilter] = useState<number | 'all'>('all')
  const today = todayISO()

  const dueCards = useMemo(
    () =>
      allFlashcards.filter(
        (c) =>
          (chapterFilter === 'all' || c.chapterId === chapterFilter) &&
          isDue(progress.flashcards[c.id], today),
      ),
    // Rebuild only when the filter changes — mid-session ratings shouldn't
    // reshuffle the running queue (ReviewSession owns its own copy).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chapterFilter],
  )

  const totalDue = allFlashcards.filter((c) =>
    isDue(progress.flashcards[c.id], today),
  ).length

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="t-label text-brass-600">Recall</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          Flashcards
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Spaced repetition for the facts the exam makes you memorize.{' '}
          <span className="font-semibold text-ink-800">
            {totalDue} due today
          </span>{' '}
          of {allFlashcards.length} cards.
        </p>
      </header>

      <div className="mb-5">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <span className="font-semibold">Chapter</span>
          <select
            value={chapterFilter}
            onChange={(e) =>
              setChapterFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value),
              )
            }
            className="rounded-lg border border-ink-200 bg-paper-raised px-3 py-1.5 text-sm text-ink-800 focus:outline-2 focus:outline-brass-600"
          >
            <option value="all">All chapters</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                Ch {ch.id}: {ch.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ReviewSession
        key={chapterFilter === 'all' ? 'all' : `ch-${chapterFilter}`}
        cards={dueCards}
      />

      {dueCards.length === 0 && chapterFilter !== 'all' && (
        <div className="mt-4 text-center">
          <Button variant="ghost" onClick={() => setChapterFilter('all')}>
            Show all chapters
          </Button>
        </div>
      )}
    </div>
  )
}
