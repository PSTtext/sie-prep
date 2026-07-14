import type { CardSrsState, UserProgress } from '../types'

export type Rating = 'again' | 'hard' | 'good' | 'easy'

const MIN_EASE = 1.3
const START_EASE = 2.5

/** Local-time ISO date (YYYY-MM-DD), so "due today" matches the user's day. */
export function todayISO(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d + days)
  return todayISO(date)
}

export function initialSrsState(today = todayISO()): CardSrsState {
  return { dueDate: today, intervalDays: 0, ease: START_EASE, streak: 0 }
}

/**
 * SM-2-lite: Again resets to relearn today; Hard/Good/Easy grow the interval
 * by an ease factor that drifts with performance (clamped at 1.3).
 * First successes use fixed 1/3/4-day steps like Anki's graduation.
 */
export function rateCard(
  prev: CardSrsState | undefined,
  rating: Rating,
  today = todayISO(),
): CardSrsState {
  const s = prev ?? initialSrsState(today)

  if (rating === 'again') {
    return {
      dueDate: today,
      intervalDays: 0,
      ease: Math.max(MIN_EASE, s.ease - 0.2),
      streak: 0,
    }
  }

  const ease =
    rating === 'hard'
      ? Math.max(MIN_EASE, s.ease - 0.15)
      : rating === 'easy'
        ? s.ease + 0.15
        : s.ease

  let interval: number
  if (s.streak === 0) {
    interval = rating === 'hard' ? 1 : rating === 'good' ? 3 : 4
  } else {
    const factor = rating === 'hard' ? 1.2 : rating === 'easy' ? ease * 1.3 : ease
    interval = Math.max(s.intervalDays + 1, Math.round(s.intervalDays * factor))
  }
  interval = Math.min(interval, 365)

  return {
    dueDate: addDays(today, interval),
    intervalDays: interval,
    ease,
    streak: s.streak + 1,
  }
}

/** A card is due if it has never been rated or its due date has arrived. */
export function isDue(
  state: CardSrsState | undefined,
  today = todayISO(),
): boolean {
  return !state || state.dueDate <= today
}

export function dueCardIds(
  progress: UserProgress,
  allCardIds: string[],
  today = todayISO(),
): string[] {
  return allCardIds.filter((id) => isDue(progress.flashcards[id], today))
}
