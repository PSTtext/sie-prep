import { useSyncExternalStore } from 'react'
import { getProgress, subscribeProgress } from '../lib/progress'
import type { UserProgress } from '../types'

/** Reactive view of the localStorage-backed UserProgress store. */
export function useProgress(): UserProgress {
  return useSyncExternalStore(subscribeProgress, getProgress)
}
