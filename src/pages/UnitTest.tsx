import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import QuizPlayer from '../components/QuizPlayer'
import { getChapter } from '../data'
import { questionsForChapter } from '../data/questions'
import { recordQuizResult } from '../lib/progress'
import { shuffle, type QuizMode } from '../lib/quiz'
import type { Question } from '../types'

export default function UnitTest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const chapter = getChapter(Number(id))
  const [mode, setMode] = useState<QuizMode>('practice')
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null)

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

  const available = questionsForChapter(chapter.id)

  if (quizQuestions) {
    return (
      <QuizPlayer
        questions={quizQuestions}
        mode={mode}
        title={`Ch ${chapter.id} Unit Test`}
        onFinish={(result) =>
          recordQuizResult(
            result,
            quizQuestions.map((q) => q.id),
            { kind: 'unit', chapterId: chapter.id },
          )
        }
        onExit={() => navigate(`/chapters/${chapter.id}`)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <div className="text-xs font-semibold tracking-widest text-brass-600 uppercase">
          Unit Test
        </div>
        <h1 className="font-display mt-1 text-2xl font-bold text-ink-950 sm:text-3xl">
          Chapter {chapter.id}: {chapter.title}
        </h1>
      </header>

      <Card className="p-6">
        {available.length === 0 ? (
          <p className="text-ink-600">
            No questions are loaded for this chapter yet.{' '}
            <Link to={`/chapters/${chapter.id}`} className="text-brass-600 underline">
              Back to the chapter
            </Link>
          </p>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <Badge tone="neutral">{available.length} questions</Badge>
              <Badge tone={mode === 'practice' ? 'success' : 'ink'}>
                {mode === 'practice' ? 'Practice mode' : 'Exam mode'}
              </Badge>
            </div>

            <div className="mb-6 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-4 has-checked:border-brass-600 has-checked:bg-brass-50">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'practice'}
                  onChange={() => setMode('practice')}
                  className="mt-1 accent-brass-600"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    Practice mode
                  </span>
                  <span className="text-sm text-ink-600">
                    Immediate feedback and explanation after each answer.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-200 p-4 has-checked:border-ink-900 has-checked:bg-ink-50">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'exam'}
                  onChange={() => setMode('exam')}
                  className="mt-1 accent-ink-900"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">
                    Exam mode
                  </span>
                  <span className="text-sm text-ink-600">
                    No feedback until you submit — like the real thing.
                  </span>
                </span>
              </label>
            </div>

            <Button size="lg" onClick={() => setQuizQuestions(shuffle(available))}>
              Start Unit Test
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
