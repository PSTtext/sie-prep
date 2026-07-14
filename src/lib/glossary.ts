import { chapters } from '../data'
import type { ContentBlock } from '../types'

export interface GlossaryEntry {
  term: string
  definition: string
  chapterId: number
  chapterTitle: string
  sectionId: string
  sectionTitle: string
}

type KeyTermBlock = Extract<ContentBlock, { type: 'keyTerm' }>

/** Every key term across all chapters, alphabetized. */
export const glossary: GlossaryEntry[] = chapters
  .flatMap((ch) =>
    ch.sections.flatMap((s) =>
      s.blocks
        .filter((b): b is KeyTermBlock => b.type === 'keyTerm')
        .map((b) => ({
          term: b.term,
          definition: b.definition,
          chapterId: ch.id,
          chapterTitle: ch.title,
          sectionId: s.id,
          sectionTitle: s.title,
        })),
    ),
  )
  .sort((a, b) => a.term.localeCompare(b.term))
