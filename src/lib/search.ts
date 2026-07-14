import { chapters } from '../data'
import { allQuestions } from '../data/questions'
import { glossary } from './glossary'

export interface SearchHit {
  kind: 'section' | 'term' | 'question'
  title: string
  sub: string
  /** Router path to navigate to on select. */
  to: string
}

interface IndexEntry extends SearchHit {
  /** Lowercased title for primary matching. */
  primary: string
  /** Lowercased supporting text for secondary matching. */
  secondary: string
}

const kindRank: Record<SearchHit['kind'], number> = {
  section: 0,
  term: 1,
  question: 2,
}

let index: IndexEntry[] | null = null

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = []

  for (const ch of chapters) {
    for (const s of ch.sections) {
      entries.push({
        kind: 'section',
        title: s.title,
        sub: `Ch ${ch.id} · ${ch.title}`,
        to: `/chapters/${ch.id}?s=${s.id}`,
        primary: s.title.toLowerCase(),
        secondary: ch.title.toLowerCase(),
      })
    }
  }

  for (const g of glossary) {
    entries.push({
      kind: 'term',
      title: g.term,
      sub: g.definition,
      to: `/chapters/${g.chapterId}?s=${g.sectionId}`,
      primary: g.term.toLowerCase(),
      secondary: g.definition.toLowerCase(),
    })
  }

  for (const q of allQuestions) {
    entries.push({
      kind: 'question',
      title: q.question,
      sub: `Ch ${q.chapterId} practice question`,
      to: `/chapters/${q.chapterId}?s=${q.sectionTag}`,
      primary: q.question.toLowerCase(),
      secondary: q.explanation.toLowerCase(),
    })
  }

  return entries
}

/**
 * Rank matches: title prefix beats title substring beats supporting-text
 * substring; ties break sections before terms before questions.
 */
export function search(query: string, limit = 15): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  index ??= buildIndex()

  const scored: { score: number; entry: IndexEntry }[] = []
  for (const entry of index) {
    let score: number
    if (entry.primary.startsWith(q)) score = 0
    else if (entry.primary.includes(q)) score = 1
    else if (entry.secondary.includes(q)) score = 2
    else continue
    scored.push({ score, entry })
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      kindRank[a.entry.kind] - kindRank[b.entry.kind] ||
      a.entry.title.length - b.entry.title.length,
  )
  return scored.slice(0, limit).map((s) => s.entry)
}
