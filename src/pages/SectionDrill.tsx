import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import QuizPlayer from '../components/QuizPlayer'
import { chapters, finraSections } from '../data'
import { allQuestions } from '../data/questions'
import { getProgress, recordQuizResult } from '../lib/progress'
import { shuffle } from '../lib/quiz'
import type { FinraSectionId } from '../types'

const DRILL_SIZE = 20

/**
 * Focused drill on one FINRA exam section: previously-missed questions come
 * first, the rest of the set is filled randomly from that section's bank.
 */
export default function SectionDrill() {
  const { section } = useParams()
  const navigate = useNavigate()
  const sectionId = Number(section) as FinraSectionId
  const fs = finraSections.find((f) => f.id === sectionId)

  const questions = useMemo(() => {
    if (!fs) return []
    const chapterIds = new Set(
      chapters.filter((c) => c.finraSection === fs.id).map((c) => c.id),
    )
    const pool = allQuestions.filter((q) => chapterIds.has(q.chapterId))
    const missedIds = new Set(Object.keys(getProgress().missedQuestions))
    const missed = shuffle(pool.filter((q) => missedIds.has(q.id)))
    const fresh = shuffle(pool.filter((q) => !missedIds.has(q.id)))
    return [...missed, ...fresh].slice(0, DRILL_SIZE)
  }, [fs])

  if (!fs || questions.length === 0) {
    return (
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">
          {fs ? 'No questions available for this section yet' : 'Section not found'}
        </h1>
        <Link to="/" className="text-brass-600 underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <QuizPlayer
      questions={questions}
      mode="practice"
      title={`Drill: ${fs.title}`}
      onFinish={(result) =>
        recordQuizResult(
          result,
          questions.map((q) => q.id),
          { kind: 'drill' },
        )
      }
      onExit={() => navigate('/')}
    />
  )
}
