import { useEffect, useMemo, useRef, useState } from 'react'
import Badge from './Badge'
import Button from './Button'
import Card from './Card'
import Confetti from './Confetti'
import ProgressBar from './ProgressBar'
import { finraSections } from '../data'
import {
  answeredCount,
  buildResult,
  checkAnswer,
  createSession,
  goToQuestion,
  selectAnswer,
  toggleEliminate,
  toggleFlag,
  type QuizMode,
  type QuizSession,
} from '../lib/quiz'
import type { Question, QuizResult } from '../types'

interface QuizPlayerProps {
  questions: Question[]
  mode: QuizMode
  title: string
  /** Called once with the final result when the quiz is submitted. */
  onFinish: (result: QuizResult, session: QuizSession) => void
  onExit?: () => void
  /** Countdown limit in seconds; auto-submits at expiry. */
  timeLimitSec?: number
  /** Show the question-number navigator grid (exam style). */
  showNavigator?: boolean
  /** Fire confetti on the results screen when the score passes (70+). */
  celebrate?: boolean
}

function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function ChoiceRow({
  text,
  letter,
  state,
  onSelect,
  onEliminate,
}: {
  text: string
  letter: string
  state: 'idle' | 'selected' | 'correct' | 'wrong' | 'eliminated'
  onSelect: () => void
  onEliminate: () => void
}) {
  const styles: Record<typeof state, string> = {
    idle: 'border-ink-200 bg-paper-raised hover:border-ink-400',
    selected: 'border-ink-900 bg-ink-50 [box-shadow:inset_0_0_0_1px_var(--color-ink-900)]',
    correct: 'border-verdant-600 bg-verdant-50 [box-shadow:inset_0_0_0_1px_var(--color-verdant-600)]',
    wrong: 'border-signal-600 bg-signal-50 [box-shadow:inset_0_0_0_1px_var(--color-signal-600)]',
    eliminated: 'border-ink-100 bg-paper opacity-60',
  }
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${styles[state]}`}
    >
      <button
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold ${
            state === 'selected'
              ? 'bg-ink-900 text-paper'
              : state === 'correct'
                ? 'bg-verdant-600 text-white'
                : state === 'wrong'
                  ? 'bg-signal-600 text-white'
                  : 'bg-ink-100 text-ink-600'
          }`}
        >
          {letter}
        </span>
        <span
          className={`text-sm leading-snug text-ink-800 ${
            state === 'eliminated' ? 'line-through decoration-ink-400' : ''
          }`}
        >
          {text}
        </span>
      </button>
      <button
        onClick={onEliminate}
        title={state === 'eliminated' ? 'Restore choice' : 'Strike through'}
        aria-label={state === 'eliminated' ? 'Restore choice' : 'Strike through choice'}
        className="shrink-0 rounded px-1.5 py-0.5 text-xs text-ink-400 hover:bg-ink-100 hover:text-ink-700"
      >
        {state === 'eliminated' ? '↺' : 'S̶'}
      </button>
    </div>
  )
}

function ResultsScreen({
  session,
  result,
  title,
  onExit,
  celebrate = false,
}: {
  session: QuizSession
  result: QuizResult
  title: string
  onExit?: () => void
  celebrate?: boolean
}) {
  const pct = (result.correctCount / result.questionCount) * 100
  const passed = pct >= 70
  return (
    <div>
      {celebrate && passed && <Confetti />}
      <header className="mb-6">
        <div className="t-label text-brass-600">Results</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          {title}
        </h1>
      </header>

      <Card className="mb-6 flex flex-wrap items-center gap-6 p-5 sm:gap-8 sm:p-6">
        <div>
          <div
            className={`font-display text-4xl font-bold sm:text-5xl ${passed ? 'text-verdant-600' : 'text-signal-600'}`}
          >
            {Math.round(pct)}%
          </div>
          <div className="mt-1 text-sm text-ink-600">
            {result.correctCount} of {result.questionCount} correct
          </div>
        </div>
        <Badge tone={passed ? 'success' : 'danger'}>
          {passed ? 'Passing (70+)' : 'Below passing (70)'}
        </Badge>
        {result.timeSpentSec !== undefined && (
          <div className="text-sm text-ink-600">
            <div>
              Time: {Math.floor(result.timeSpentSec / 60)}m{' '}
              {result.timeSpentSec % 60}s
            </div>
            <div className="text-xs text-ink-500">
              ~{Math.round(result.timeSpentSec / result.questionCount)}s per
              question
              {result.mode === 'exam' &&
                ' (the real SIE allows 84s per question)'}
            </div>
          </div>
        )}
        {result.mode === 'exam' && (
          <div className="text-sm text-ink-600">
            <div className="font-semibold text-ink-900">
              Estimated scaled score: {Math.round(pct)}
            </div>
            <div className="text-xs text-ink-500">
              vs. 70 required to pass
            </div>
          </div>
        )}
        {onExit && (
          <div className="ml-auto">
            <Button variant="secondary" onClick={onExit}>
              Done
            </Button>
          </div>
        )}
      </Card>

      <section className="mb-8">
        <h2 className="font-display mb-3 text-xl font-bold text-ink-900">
          By Exam Section
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {finraSections.map((fs) => {
            const b = result.sectionBreakdown[fs.id]
            if (b.total === 0) return null
            const sPct = (b.correct / b.total) * 100
            return (
              <Card key={fs.id} className="p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink-900">
                    {fs.id}. {fs.title}
                  </span>
                  <span className="text-ink-500">
                    {b.correct}/{b.total}
                  </span>
                </div>
                <ProgressBar
                  value={sPct}
                  tone={sPct >= 70 ? 'verdant' : 'signal'}
                  label={`${fs.title} score`}
                />
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display mb-3 text-xl font-bold text-ink-900">
          Question Review
        </h2>
        <div className="space-y-4">
          {session.questions.map((q, i) => {
            const st = session.states[i]
            const correct = st.selected === q.correctIndex
            return (
              <Card key={q.id} className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Badge tone={correct ? 'success' : 'danger'}>
                    {correct ? 'Correct' : 'Missed'}
                  </Badge>
                  <span className="text-xs text-ink-500">Question {i + 1}</span>
                  {st.flagged && <Badge tone="brass">Flagged</Badge>}
                </div>
                <p className="mb-3 font-medium text-ink-900">{q.question}</p>
                <div className="mb-3 space-y-1.5">
                  {q.choices.map((c, ci) => (
                    <div
                      key={ci}
                      className={`rounded px-3 py-1.5 text-sm ${
                        ci === q.correctIndex
                          ? 'bg-verdant-50 font-semibold text-verdant-700'
                          : ci === st.selected
                            ? 'bg-signal-50 text-signal-700 line-through'
                            : 'text-ink-600'
                      }`}
                    >
                      {String.fromCharCode(65 + ci)}. {c}
                    </div>
                  ))}
                </div>
                <p className="rounded-lg bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
                  <span className="font-bold">Why: </span>
                  {q.explanation}
                </p>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default function QuizPlayer({
  questions,
  mode,
  title,
  onFinish,
  onExit,
  timeLimitSec,
  showNavigator = false,
  celebrate = false,
}: QuizPlayerProps) {
  const [session, setSession] = useState<QuizSession>(() =>
    createSession(questions, mode),
  )
  const [result, setResult] = useState<QuizResult | null>(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const i = session.currentIndex
  const q = session.questions[i]
  const st = session.states[i]
  const isLast = i === session.questions.length - 1
  const answered = answeredCount(session)

  const finish = useMemo(
    () => () => {
      const r = buildResult(session)
      setResult(r)
      onFinish(r, session)
    },
    [session, onFinish],
  )

  // Countdown timer: tick every second, auto-submit at expiry. The finish
  // callback lives in a ref so the interval never captures a stale session.
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  }, [finish])
  const finished = result !== null
  useEffect(() => {
    if (!timeLimitSec || finished) return
    const t = setInterval(() => {
      setNow(Date.now())
      if ((Date.now() - session.startedAt) / 1000 >= timeLimitSec) {
        clearInterval(t)
        finishRef.current()
      }
    }, 1000)
    return () => clearInterval(t)
  }, [timeLimitSec, finished, session.startedAt])

  // Keyboard shortcuts: 1-4/A-D select, Enter checks/advances, F flags.
  // The handler lives in a ref so one listener always sees fresh state.
  const keyHandlerRef = useRef<(e: KeyboardEvent) => void>(() => {})
  useEffect(() => {
    keyHandlerRef.current = (e: KeyboardEvent) => {
      if (result || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      )
        return

      const key = e.key.toLowerCase()
      const choiceKeys: Record<string, number> = {
        '1': 0, '2': 1, '3': 2, '4': 3,
        a: 0, b: 1, c: 2, d: 3,
      }
      if (key in choiceKeys) {
        if (!(mode === 'practice' && st.checked)) {
          setSession(selectAnswer(session, i, choiceKeys[key]))
        }
      } else if (key === 'f') {
        setSession(toggleFlag(session, i))
      } else if (key === 'enter') {
        // Let focused buttons keep their native Enter behavior.
        if (target instanceof HTMLButtonElement) return
        if (mode === 'practice' && !st.checked) {
          if (st.selected !== null) setSession(checkAnswer(session, i))
        } else if (!isLast) {
          setSession(goToQuestion(session, i + 1))
        } else {
          setConfirmSubmit(true)
        }
      }
    }
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => keyHandlerRef.current(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const remainingSec = timeLimitSec
    ? Math.max(0, timeLimitSec - Math.floor((now - session.startedAt) / 1000))
    : null

  if (result) {
    return (
      <ResultsScreen
        session={session}
        result={result}
        title={title}
        onExit={onExit}
        celebrate={celebrate}
      />
    )
  }

  const showFeedback = mode === 'practice' && st.checked
  const choiceState = (ci: number): Parameters<typeof ChoiceRow>[0]['state'] => {
    if (showFeedback) {
      if (ci === q.correctIndex) return 'correct'
      if (ci === st.selected) return 'wrong'
      return st.eliminated.includes(ci) ? 'eliminated' : 'idle'
    }
    if (st.eliminated.includes(ci)) return 'eliminated'
    return ci === st.selected ? 'selected' : 'idle'
  }

  return (
    <div className="mx-auto max-w-3xl">
      {remainingSec !== null && (
        <div
          className={`mb-4 flex items-center justify-between rounded-lg px-4 py-2.5 ${
            remainingSec <= 300
              ? 'bg-signal-50 text-signal-700'
              : 'bg-ink-950 text-paper'
          }`}
        >
          <span className="text-xs font-semibold tracking-widest uppercase">
            Time remaining
          </span>
          <span
            className="font-display text-xl font-bold tabular-nums"
            aria-live={remainingSec <= 300 ? 'polite' : 'off'}
          >
            {formatClock(remainingSec)}
          </span>
        </div>
      )}

      {showNavigator && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {session.questions.map((_, qi) => {
            const s = session.states[qi]
            const isCurrent = qi === i
            return (
              <button
                key={qi}
                onClick={() => setSession(goToQuestion(session, qi))}
                aria-label={`Question ${qi + 1}${s.selected !== null ? ', answered' : ', unanswered'}${s.flagged ? ', flagged' : ''}`}
                className={`h-8 w-8 rounded text-xs font-semibold transition-colors ${
                  isCurrent
                    ? 'bg-ink-950 text-paper ring-2 ring-brass-500 ring-offset-1'
                    : s.flagged
                      ? 'bg-brass-100 text-brass-700 [box-shadow:inset_0_0_0_1.5px_var(--color-brass-500)]'
                      : s.selected !== null
                        ? 'bg-ink-700 text-paper'
                        : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                }`}
              >
                {qi + 1}
              </button>
            )
          })}
        </div>
      )}

      <div className="mb-4 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-sm font-semibold text-ink-900">{title}</span>
            <span className="text-xs text-ink-500">
              {answered}/{session.questions.length} answered
            </span>
          </div>
          <ProgressBar
            value={(answered / session.questions.length) * 100}
            label="quiz progress"
          />
        </div>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="text-xs font-semibold tracking-widest text-ink-500 uppercase">
            Question {i + 1} of {session.questions.length}
          </div>
          <button
            onClick={() => setSession(toggleFlag(session, i))}
            className={`rounded-pill px-3 py-1 text-xs font-semibold transition-colors ${
              st.flagged
                ? 'bg-brass-100 text-brass-700'
                : 'bg-ink-100 text-ink-500 hover:text-ink-800'
            }`}
          >
            {st.flagged ? '⚑ Flagged' : '⚐ Flag'}
          </button>
        </div>

        <p className="mb-5 text-lg leading-relaxed font-medium text-ink-900">
          {q.question}
        </p>

        <div className="space-y-2">
          {q.choices.map((c, ci) => (
            <ChoiceRow
              key={ci}
              text={c}
              letter={String.fromCharCode(65 + ci)}
              state={choiceState(ci)}
              onSelect={() => setSession(selectAnswer(session, i, ci))}
              onEliminate={() => setSession(toggleEliminate(session, i, ci))}
            />
          ))}
        </div>

        {showFeedback && (
          <div
            className={`mt-5 rounded-lg px-4 py-3 text-sm leading-relaxed ${
              st.selected === q.correctIndex
                ? 'bg-verdant-50 text-verdant-700'
                : 'bg-signal-50 text-signal-700'
            }`}
          >
            <span className="font-bold">
              {st.selected === q.correctIndex ? 'Correct. ' : 'Not quite. '}
            </span>
            <span className="text-ink-700">{q.explanation}</span>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3 border-t border-paper-edge pt-5">
          <Button
            variant="ghost"
            onClick={() => setSession(goToQuestion(session, i - 1))}
            disabled={i === 0}
          >
            ← Back
          </Button>

          {mode === 'practice' && !st.checked && (
            <Button
              onClick={() => setSession(checkAnswer(session, i))}
              disabled={st.selected === null}
            >
              Check Answer
            </Button>
          )}

          {(mode === 'exam' || st.checked) &&
            (!isLast ? (
              <Button onClick={() => setSession(goToQuestion(session, i + 1))}>
                Next →
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmSubmit(true)}>
                Submit {mode === 'exam' ? 'Exam' : 'Test'}
              </Button>
            ))}

          {mode === 'exam' && !isLast && (
            <Button
              variant="ghost"
              className="ml-auto"
              onClick={() => setConfirmSubmit(true)}
            >
              Submit early
            </Button>
          )}
        </div>
      </Card>

      <p className="mt-3 hidden text-center text-xs text-ink-400 sm:block">
        Keyboard: <kbd>1</kbd>–<kbd>4</kbd> select · <kbd>Enter</kbd>{' '}
        {mode === 'practice' ? 'check / next' : 'next'} · <kbd>F</kbd> flag
      </p>

      {confirmSubmit && (
        <Card className="mt-4 flex items-center justify-between gap-4 border-l-4 border-brass-500 p-5">
          <div className="text-sm text-ink-800">
            {answered < session.questions.length
              ? `You have ${session.questions.length - answered} unanswered question(s). Submit anyway?`
              : 'Submit and see your results?'}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>
              Keep working
            </Button>
            <Button onClick={finish}>Submit</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
