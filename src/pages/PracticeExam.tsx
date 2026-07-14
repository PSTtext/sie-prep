import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import QuizPlayer from '../components/QuizPlayer'
import { finraSections } from '../data'
import { allQuestions } from '../data/questions'
import { recordQuizResult } from '../lib/progress'
import { selectWeightedQuestions } from '../lib/quiz'
import type { Question } from '../types'

const COUNTS = [25, 50, 75] as const
/** Real SIE: 75 questions in 105 minutes = 84s per question. */
const SEC_PER_QUESTION = 84

export default function PracticeExam() {
  const navigate = useNavigate()
  const [count, setCount] = useState<(typeof COUNTS)[number]>(75)
  const [timed, setTimed] = useState(true)
  const [questions, setQuestions] = useState<Question[] | null>(null)

  if (questions) {
    return (
      <QuizPlayer
        questions={questions}
        mode="exam"
        title={`Practice Exam — ${questions.length} questions`}
        timeLimitSec={timed ? questions.length * SEC_PER_QUESTION : undefined}
        showNavigator
        celebrate
        onFinish={(result) =>
          recordQuizResult(
            result,
            questions.map((q) => q.id),
            { kind: 'exam' },
          )
        }
        onExit={() => navigate('/')}
      />
    )
  }

  const start = () => {
    const selected = selectWeightedQuestions(allQuestions, count, finraSections)
    if (selected.length > 0) setQuestions(selected)
  }
  const shortBank = allQuestions.length < count

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="t-label text-brass-600">Simulation</div>
        <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
          Practice Exam
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Weighted like the real SIE: 16% capital markets, 44% products &amp;
          risks, 31% trading &amp; accounts, 9% regulatory framework.
        </p>
      </header>

      <Card className="p-6">
        <div className="mb-6">
          <div className="mb-2 text-sm font-semibold text-ink-900">
            Questions
          </div>
          <div className="flex gap-2">
            {COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`flex-1 rounded-lg border px-4 py-3 text-center transition-colors ${
                  count === c
                    ? 'border-ink-900 bg-ink-50 font-bold text-ink-950 [box-shadow:inset_0_0_0_1px_var(--color-ink-900)]'
                    : 'border-ink-200 text-ink-600 hover:border-ink-400'
                }`}
              >
                <div className="font-display text-xl">{c}</div>
                <div className="text-xs">
                  {c === 75 ? 'full exam' : `${(c * SEC_PER_QUESTION) / 60} min`}
                </div>
              </button>
            ))}
          </div>
          {count === 75 && (
            <p className="mt-2 text-xs text-ink-500">
              Matches the real SIE: 75 scored questions, 105 minutes.
            </p>
          )}
        </div>

        <label className="mb-6 flex cursor-pointer items-center justify-between rounded-lg border border-ink-200 px-4 py-3">
          <span>
            <span className="block text-sm font-semibold text-ink-900">
              Timed
            </span>
            <span className="text-sm text-ink-600">
              {timed
                ? `Countdown of ${(count * SEC_PER_QUESTION) / 60} minutes with auto-submit`
                : 'No time limit'}
            </span>
          </span>
          <input
            type="checkbox"
            checked={timed}
            onChange={(e) => setTimed(e.target.checked)}
            className="h-5 w-5 accent-brass-600"
          />
        </label>

        {shortBank && (
          <div className="mb-4 rounded-lg bg-brass-50 px-4 py-3 text-sm text-brass-700">
            The question bank currently has {allQuestions.length} question(s),
            so this exam will run shorter than {count} until more chapters'
            questions are added (Phase 7).
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button size="lg" onClick={start} disabled={allQuestions.length === 0}>
            Start Exam
          </Button>
          <Badge tone="neutral">{allQuestions.length} questions in bank</Badge>
        </div>
      </Card>
    </div>
  )
}
