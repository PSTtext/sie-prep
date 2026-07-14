import type { FinraSectionId } from './content'

/** Result of one completed quiz (unit test or practice exam). */
export interface QuizResult {
  /** Unique attempt id. */
  id: string
  /** ISO timestamp when the attempt was submitted. */
  completedAt: string
  mode: 'practice' | 'exam'
  questionCount: number
  correctCount: number
  /** Seconds spent, if timed. */
  timeSpentSec?: number
  /** Per-FINRA-section correct/total for readiness breakdowns. */
  sectionBreakdown: Record<FinraSectionId, { correct: number; total: number }>
  /** Question ids answered incorrectly in this attempt. */
  missedQuestionIds: string[]
}

export interface ChapterTestRecord {
  attempts: QuizResult[]
  /** Best percentage score (0-100) across attempts. */
  bestScorePct: number
}

/** SM-2-lite spaced-repetition state for one flashcard. */
export interface CardSrsState {
  /** ISO date the card is next due. */
  dueDate: string
  /** Current interval in days. */
  intervalDays: number
  /** Ease factor (SM-2 style, starts at 2.5). */
  ease: number
  /** Consecutive successful reviews. */
  streak: number
}

export interface MissedQuestionEntry {
  questionId: string
  /** Times missed. */
  missCount: number
  /** Consecutive correct answers since last miss; leaves bank at 2. */
  correctStreak: number
  /** ISO timestamp of the most recent miss. */
  lastMissedAt: string
}

export interface UserProgress {
  /** Schema version for future migrations. */
  version: 1
  /** ISO date of the user's scheduled exam, if set. */
  examDate?: string
  /** Section ids the user has marked read, e.g. { "1-2": true }. */
  readSections: Record<string, boolean>
  /** Last-read location for "continue where you left off". */
  lastRead?: { chapterId: number; sectionId: string }
  /** Unit-test history keyed by chapter id. */
  chapterTests: Record<number, ChapterTestRecord>
  /** Full practice-exam attempt history, newest last. */
  examHistory: QuizResult[]
  /** Missed-question review bank keyed by question id. */
  missedQuestions: Record<string, MissedQuestionEntry>
  /** Flashcard SRS state keyed by card id. */
  flashcards: Record<string, CardSrsState>
}

export function createEmptyProgress(): UserProgress {
  return {
    version: 1,
    readSections: {},
    chapterTests: {},
    examHistory: [],
    missedQuestions: {},
    flashcards: {},
  }
}
