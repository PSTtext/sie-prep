import { createEmptyProgress, type UserProgress } from '../types'
import { getProgress, updateProgress } from './progress'

/** Download the user's full progress as a JSON backup file. */
export function exportProgressFile(): void {
  const blob = new Blob([JSON.stringify(getProgress(), null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sie-prep-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export type ImportResult = { ok: true } | { ok: false; error: string }

/** Restore progress from an exported backup, replacing current progress. */
export async function importProgressFile(file: File): Promise<ImportResult> {
  let parsed: Partial<UserProgress>
  try {
    parsed = JSON.parse(await file.text()) as Partial<UserProgress>
  } catch {
    return { ok: false, error: 'That file is not readable JSON.' }
  }
  if (
    parsed === null ||
    typeof parsed !== 'object' ||
    parsed.version !== 1 ||
    typeof parsed.readSections !== 'object' ||
    !Array.isArray(parsed.examHistory)
  ) {
    return { ok: false, error: 'That file is not a valid SIE/PREP backup.' }
  }
  updateProgress(() => ({ ...createEmptyProgress(), ...parsed }))
  return { ok: true }
}
