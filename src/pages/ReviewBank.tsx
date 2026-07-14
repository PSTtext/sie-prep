import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import QuizPlayer from '../components/QuizPlayer'
import { chapters } from '../data'
import { getQuestion } from '../data/questions'
import { useProgress } from '../hooks/useProgress'
import { recordQuizResult } from '../lib/progress'
import { shuffle } from '../lib/quiz'
import type { Question } from '../types'

export default function ReviewBank() {
  const progress = useProgress()
  const [drillQuestions, setDrillQuestions] = useState<Question[] | null>(null)
  const entries = Object.values(progress.missedQuestions)

  if (drillQuestions) {
    return (
      <QuizPlayer
        questions={drillQuestions}
        mode="practice"
        title="Drill: My Misses"
        onFinish={(result) =>
          recordQuizResult(
            result,
            drillQuestions.map((q) => q.id),
            { kind: 'drill' },
          )
        }
        onExit={() => setDrillQuestions(null)}
      />
    )
  }

  const bankQuestions = entries
    .map((e) => getQuestion(e.questionId))
    .filter((q): q is Question => q !== undefined)

  const startDrill = () => {
    if (bankQuestions.length > 0) setDrillQuestions(shuffle(bankQuestions))
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="t-label text-brass-600">Misses</div>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink-950">
            Review Bank
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Questions you've missed. Answer one correctly twice in a row and it
            leaves the bank.
          </p>
        </div>
        {entries.length > 0 && (
          <Button size="lg" onClick={startDrill}>
            Drill my misses ({bankQuestions.length})
          </Button>
        )}
      </header>

      {entries.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <div
            className="font-mono text-xs tracking-[0.3em] text-ink-500 uppercase"
            aria-hidden
          >
            ── no data ──
          </div>
          <div className="font-display text-xl font-bold text-ink-900">
            Review bank empty
          </div>
          <p className="max-w-sm text-sm text-ink-600">
            Missed questions from unit tests and practice exams collect here
            automatically. Clear them by answering correctly twice in a row.
          </p>
          <Link to="/exam">
            <Button variant="ghost">Take a practice exam</Button>
          </Link>
        </Card>
      ) : (
        chapters
          .map((ch) => ({
            ch,
            items: entries.filter(
              (e) => getQuestion(e.questionId)?.chapterId === ch.id,
            ),
          }))
          .filter(({ items }) => items.length > 0)
          .map(({ ch, items }) => (
            <section key={ch.id} className="mb-6">
              <h2 className="font-display mb-3 text-xl font-bold text-ink-900">
                Ch {ch.id}: {ch.title}
                <span className="ml-2 align-middle">
                  <Badge tone="neutral">{items.length}</Badge>
                </span>
              </h2>
              <div className="space-y-3">
                {items.map((e) => {
                  const q = getQuestion(e.questionId)
                  if (!q) return null
                  return (
                    <Card key={e.questionId} className="p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge tone="danger">
                          Missed ×{e.missCount}
                        </Badge>
                        {e.correctStreak > 0 && (
                          <Badge tone="success">
                            {e.correctStreak}/2 correct to clear
                          </Badge>
                        )}
                        <Badge tone="neutral">{q.difficulty}</Badge>
                      </div>
                      <p className="mb-2 font-medium text-ink-900">
                        {q.question}
                      </p>
                      <p className="text-sm text-ink-600">
                        <span className="font-semibold text-verdant-700">
                          Answer: {String.fromCharCode(65 + q.correctIndex)}.{' '}
                          {q.choices[q.correctIndex]}
                        </span>{' '}
                        — {q.explanation}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))
      )}
    </div>
  )
}
