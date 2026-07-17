import { chapters, finraSections } from '../data'
import type {
  Chapter,
  FinraSectionId,
  QuizResult,
  UserProgress,
} from '../types'

/** Fraction (0-1) of a chapter's sections marked read. */
export function chapterReadFraction(
  progress: UserProgress,
  chapter: Chapter,
): number {
  if (chapter.sections.length === 0) return 0
  const read = chapter.sections.filter(
    (s) => progress.readSections[s.id],
  ).length
  return read / chapter.sections.length
}

/**
 * Overall study progress (0-100), weighting each chapter by its share of the
 * FINRA exam: a chapter's weight = its section's weight split evenly across
 * that section's chapters.
 */
export function overallProgressPct(progress: UserProgress): number {
  let total = 0
  for (const fs of finraSections) {
    const chs = chapters.filter((c) => c.finraSection === fs.id)
    if (chs.length === 0) continue
    const perChapter = fs.weightPct / chs.length
    for (const ch of chs) total += perChapter * chapterReadFraction(progress, ch)
  }
  return total
}

/** All quiz results (unit tests + practice exams), oldest first. */
export function allQuizResults(progress: UserProgress): QuizResult[] {
  const unit = Object.values(progress.chapterTests).flatMap((r) => r.attempts)
  return [...unit, ...progress.examHistory].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  )
}

/**
 * Per-FINRA-section readiness (0-100 or null if no data): average accuracy in
 * that section over the last 3 quiz attempts that touched it.
 */
export function sectionReadiness(
  progress: UserProgress,
): Record<FinraSectionId, number | null> {
  return sectionReadinessFrom(allQuizResults(progress))
}

function sectionReadinessFrom(
  results: QuizResult[],
): Record<FinraSectionId, number | null> {
  const out: Record<FinraSectionId, number | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
  }
  for (const id of [1, 2, 3, 4] as FinraSectionId[]) {
    const touched = results
      .filter((r) => (r.sectionBreakdown[id]?.total ?? 0) > 0)
      .slice(-3)
    if (touched.length === 0) continue
    const correct = touched.reduce(
      (n, r) => n + r.sectionBreakdown[id].correct,
      0,
    )
    const total = touched.reduce((n, r) => n + r.sectionBreakdown[id].total, 0)
    out[id] = total > 0 ? (correct / total) * 100 : null
  }
  return out
}

/**
 * Overall readiness score (0-100 or null): section readiness weighted by exam
 * weight, over sections that have data.
 */
export function readinessScore(progress: UserProgress): number | null {
  const per = sectionReadiness(progress)
  let weighted = 0
  let weightSum = 0
  for (const fs of finraSections) {
    const v = per[fs.id]
    if (v === null) continue
    weighted += v * fs.weightPct
    weightSum += fs.weightPct
  }
  return weightSum > 0 ? weighted / weightSum : null
}

/**
 * Per-section day change: today's readiness minus readiness as of the start
 * of today (i.e. what today's attempts moved the number by). Null when there
 * is no basis for a change (no prior data or no activity today).
 */
export function sectionDayChange(
  progress: UserProgress,
): Record<FinraSectionId, number | null> {
  const all = allQuizResults(progress)
  const today = localISODate(new Date())
  const before = all.filter(
    (r) => localISODate(new Date(r.completedAt)) < today,
  )
  const cur = sectionReadinessFrom(all)
  const prev = sectionReadinessFrom(before)
  const out: Record<FinraSectionId, number | null> = {
    1: null,
    2: null,
    3: null,
    4: null,
  }
  for (const id of [1, 2, 3, 4] as FinraSectionId[]) {
    if (cur[id] !== null && prev[id] !== null) out[id] = cur[id]! - prev[id]!
  }
  return out
}

export type Strength = 'weak' | 'developing' | 'strong'

export function strengthOf(scorePct: number): Strength {
  if (scorePct < 70) return 'weak'
  if (scorePct < 85) return 'developing'
  return 'strong'
}

/** Best unit-test score (0-100) for a chapter, or null if never taken. */
export function bestChapterScore(
  progress: UserProgress,
  chapterId: number,
): number | null {
  const rec = progress.chapterTests[chapterId]
  return rec && rec.attempts.length > 0 ? rec.bestScorePct : null
}

/** Number of chapter sections not yet marked read. */
export function unreadSectionCount(progress: UserProgress): number {
  return chapters.reduce(
    (n, ch) => n + ch.sections.filter((s) => !progress.readSections[s.id]).length,
    0,
  )
}

/**
 * Suggested reading pace (sections per week) to finish all material by the
 * exam date, or null if no date is set, the date has passed, or reading is
 * already done.
 */
export function suggestedWeeklyPace(progress: UserProgress): number | null {
  const days = daysUntilExam(progress)
  if (days === null || days <= 0) return null
  const remaining = unreadSectionCount(progress)
  if (remaining === 0) return null
  return Math.ceil((remaining / days) * 7)
}

/** One day's question volume, split by FINRA section. */
export interface DayActivity {
  /** Local ISO date (yyyy-mm-dd). */
  date: string
  bySection: Record<FinraSectionId, number>
  total: number
}

function localISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Questions answered per day over the trailing `days` window (oldest first),
 * split by FINRA section. Every day is present, so charts get a full axis.
 */
export function dailyActivity(progress: UserProgress, days = 30): DayActivity[] {
  const byDate = new Map<string, Record<FinraSectionId, number>>()
  for (const r of allQuizResults(progress)) {
    const date = localISODate(new Date(r.completedAt))
    let rec = byDate.get(date)
    if (!rec) {
      rec = { 1: 0, 2: 0, 3: 0, 4: 0 }
      byDate.set(date, rec)
    }
    for (const id of [1, 2, 3, 4] as FinraSectionId[]) {
      rec[id] += r.sectionBreakdown[id]?.total ?? 0
    }
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const out: DayActivity[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = localISODate(d)
    const bySection = byDate.get(date) ?? { 1: 0, 2: 0, 3: 0, 4: 0 }
    out.push({
      date,
      bySection,
      total: bySection[1] + bySection[2] + bySection[3] + bySection[4],
    })
  }
  return out
}

/** Whole days from today until the exam date (negative if past). */
export function daysUntilExam(progress: UserProgress): number | null {
  if (!progress.examDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(progress.examDate + 'T00:00:00')
  return Math.round((exam.getTime() - today.getTime()) / 86_400_000)
}
