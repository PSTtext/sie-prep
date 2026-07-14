import { getChapter } from '../data'
import type { FinraSectionId, Question, QuizResult } from '../types'

export type QuizMode = 'practice' | 'exam'

export interface QuestionState {
  /** Chosen answer index, or null if unanswered. */
  selected: number | null
  /** Practice mode: answer has been submitted and feedback shown. */
  checked: boolean
  flagged: boolean
  /** Choice indices the user has struck through. */
  eliminated: number[]
}

export interface QuizSession {
  mode: QuizMode
  questions: Question[]
  states: QuestionState[]
  currentIndex: number
  startedAt: number
}

export function createSession(
  questions: Question[],
  mode: QuizMode,
): QuizSession {
  return {
    mode,
    questions,
    states: questions.map(() => ({
      selected: null,
      checked: false,
      flagged: false,
      eliminated: [],
    })),
    currentIndex: 0,
    startedAt: Date.now(),
  }
}

function updateState(
  session: QuizSession,
  index: number,
  patch: Partial<QuestionState>,
): QuizSession {
  const states = session.states.slice()
  states[index] = { ...states[index], ...patch }
  return { ...session, states }
}

export function selectAnswer(
  session: QuizSession,
  index: number,
  choice: number,
): QuizSession {
  if (session.states[index].checked) return session
  return updateState(session, index, { selected: choice })
}

/** Practice mode: lock in the answer and reveal feedback. */
export function checkAnswer(session: QuizSession, index: number): QuizSession {
  if (session.states[index].selected === null) return session
  return updateState(session, index, { checked: true })
}

export function toggleFlag(session: QuizSession, index: number): QuizSession {
  return updateState(session, index, {
    flagged: !session.states[index].flagged,
  })
}

export function toggleEliminate(
  session: QuizSession,
  index: number,
  choice: number,
): QuizSession {
  const st = session.states[index]
  const eliminated = st.eliminated.includes(choice)
    ? st.eliminated.filter((c) => c !== choice)
    : [...st.eliminated, choice]
  return updateState(session, index, { eliminated })
}

export function goToQuestion(session: QuizSession, index: number): QuizSession {
  const clamped = Math.max(0, Math.min(session.questions.length - 1, index))
  return { ...session, currentIndex: clamped }
}

export function answeredCount(session: QuizSession): number {
  return session.states.filter((s) => s.selected !== null).length
}

export function isCorrect(session: QuizSession, index: number): boolean {
  return session.states[index].selected === session.questions[index].correctIndex
}

function sectionOf(q: Question): FinraSectionId {
  return getChapter(q.chapterId)?.finraSection ?? 1
}

/** Build the persistent QuizResult from a finished session. */
export function buildResult(session: QuizSession): QuizResult {
  const breakdown: QuizResult['sectionBreakdown'] = {
    1: { correct: 0, total: 0 },
    2: { correct: 0, total: 0 },
    3: { correct: 0, total: 0 },
    4: { correct: 0, total: 0 },
  }
  const missedQuestionIds: string[] = []
  let correctCount = 0

  session.questions.forEach((q, i) => {
    const sec = sectionOf(q)
    breakdown[sec].total += 1
    if (isCorrect(session, i)) {
      breakdown[sec].correct += 1
      correctCount += 1
    } else {
      missedQuestionIds.push(q.id)
    }
  })

  return {
    id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt: new Date().toISOString(),
    mode: session.mode,
    questionCount: session.questions.length,
    correctCount,
    timeSpentSec: Math.round((Date.now() - session.startedAt) / 1000),
    sectionBreakdown: breakdown,
    missedQuestionIds,
  }
}

/**
 * Pick `count` questions weighted by FINRA section percentages (16/44/31/9).
 * If a section lacks enough questions, the shortfall is filled from the
 * remaining pool so the requested count is met when possible.
 */
export function selectWeightedQuestions(
  pool: Question[],
  count: number,
  weights: { id: FinraSectionId; weightPct: number }[],
): Question[] {
  const bySection = new Map<FinraSectionId, Question[]>()
  for (const q of pool) {
    const sec = sectionOf(q)
    bySection.set(sec, [...(bySection.get(sec) ?? []), q])
  }

  const chosen: Question[] = []
  const leftovers: Question[] = []
  for (const w of weights) {
    const target = Math.round((w.weightPct / 100) * count)
    const avail = shuffle(bySection.get(w.id) ?? [])
    chosen.push(...avail.slice(0, target))
    leftovers.push(...avail.slice(target))
  }
  // Fill any shortfall (rounding or thin sections) from unused questions.
  const shortfall = count - chosen.length
  if (shortfall > 0) chosen.push(...shuffle(leftovers).slice(0, shortfall))
  return shuffle(chosen.slice(0, count))
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle<T>(items: T[]): T[] {
  const arr = items.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
