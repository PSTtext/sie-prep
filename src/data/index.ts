import type { Chapter, ChapterSection, ContentBlock, FinraSection } from '../types'
import outlineJson from './outline.json'

interface Outline {
  finraSections: FinraSection[]
  chapters: Chapter[]
}

interface ChapterContentFile {
  chapterId: number
  sections: { id: string; blocks: ContentBlock[] }[]
}

// Reading content lives in per-chapter files; merge blocks into the outline.
const contentModules = import.meta.glob<{ default: ChapterContentFile }>(
  './chapters/ch*.json',
  { eager: true },
)
const contentBySection = new Map<string, ContentBlock[]>()
for (const m of Object.values(contentModules)) {
  for (const s of m.default.sections) contentBySection.set(s.id, s.blocks)
}

const outline = outlineJson as Outline

export const finraSections = outline.finraSections
export const chapters: Chapter[] = outline.chapters.map((ch) => ({
  ...ch,
  sections: ch.sections.map(
    (s): ChapterSection => ({
      ...s,
      blocks: contentBySection.get(s.id) ?? s.blocks,
    }),
  ),
}))

export function getChapter(id: number): Chapter | undefined {
  return chapters.find((c) => c.id === id)
}
