import {
  createEmptyProgress,
  type QuizResult,
  type UserProgress,
} from '../types'
import { rateCard, type Rating } from './srs'

const STORAGE_KEY = 'sie-prep-progress-v1'

function load(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createEmptyProgress()
    const parsed = JSON.parse(raw) as UserProgress
    if (parsed.version !== 1) return createEmptyProgress()
    // Merge over defaults so new fields added later are always present.
    return { ...createEmptyProgress(), ...parsed }
  } catch {
    return createEmptyProgress()
  }
}

let cache: UserProgress = load()
const listeners = new Set<() => void>()

export function getProgress(): UserProgress {
  return cache
}

export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function updateProgress(
  mutate: (draft: UserProgress) => UserProgress,
): void {
  cache = mutate(cache)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch {
    // Storage full/unavailable: state still updates in memory.
  }
  listeners.forEach((l) => l())
}

export function resetProgress(): void {
  updateProgress(() => createEmptyProgress())
}

// --- Convenience mutations ---

export function setExamDate(isoDate: string | undefined): void {
  updateProgress((p) => ({ ...p, examDate: isoDate }))
}

export function markSectionRead(
  chapterId: number,
  sectionId: string,
  read = true,
): void {
  updateProgress((p) => ({
    ...p,
    readSections: { ...p.readSections, [sectionId]: read },
    lastRead: { chapterId, sectionId },
  }))
}

export function setLastRead(chapterId: number, sectionId: string): void {
  updateProgress((p) => ({ ...p, lastRead: { chapterId, sectionId } }))
}

/** Apply an SRS rating to a flashcard and persist the new schedule. */
export function rateFlashcard(cardId: string, rating: Rating): void {
  updateProgress((p) => ({
    ...p,
    flashcards: {
      ...p.flashcards,
      [cardId]: rateCard(p.flashcards[cardId], rating),
    },
  }))
}

/**
 * Persist a finished quiz: store the attempt (under the chapter for unit
 * tests, in examHistory for practice exams) and update the missed-question
 * bank — misses enter/reset, questions answered correctly twice in a row
 * leave the bank.
 */
export function recordQuizResult(
  result: QuizResult,
  allQuestionIds: string[],
  target:
    | { kind: 'unit'; chapterId: number }
    | { kind: 'exam' }
    | { kind: 'drill' },
): void {
  updateProgress((p) => {
    const missed = new Set(result.missedQuestionIds)
    const bank = { ...p.missedQuestions }
    for (const qid of allQuestionIds) {
      if (missed.has(qid)) {
        const prev = bank[qid]
        bank[qid] = {
          questionId: qid,
          missCount: (prev?.missCount ?? 0) + 1,
          correctStreak: 0,
          lastMissedAt: result.completedAt,
        }
      } else if (bank[qid]) {
        const streak = bank[qid].correctStreak + 1
        if (streak >= 2) delete bank[qid]
        else bank[qid] = { ...bank[qid], correctStreak: streak }
      }
    }

    const next: UserProgress = { ...p, missedQuestions: bank }
    if (target.kind === 'unit') {
      const rec = p.chapterTests[target.chapterId] ?? {
        attempts: [],
        bestScorePct: 0,
      }
      const scorePct = (result.correctCount / result.questionCount) * 100
      next.chapterTests = {
        ...p.chapterTests,
        [target.chapterId]: {
          attempts: [...rec.attempts, result],
          bestScorePct: Math.max(rec.bestScorePct, scorePct),
        },
      }
    } else if (target.kind === 'exam') {
      next.examHistory = [...p.examHistory, result]
    }
    // 'drill' only updates the missed bank — no attempt history.
    return next
  })
}
